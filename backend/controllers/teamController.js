const Team = require('../models/Team');
const TeamCounter = require('../models/TeamCounter');
const { signTeam } = require('../middleware/auth');

const normalizeName = (value) => String(value || '').trim().replace(/\s+/g, ' ');
const normalizeKey = (value) => normalizeName(value).toLocaleLowerCase();

async function allocateTeamNumber() {
  const highestTeam = await Team.findOne()
    .sort({ teamNumber: -1 })
    .select('teamNumber -_id')
    .lean();

  await TeamCounter.updateOne(
    { key: 'teams' },
    { $max: { nextTeamNumber: highestTeam?.teamNumber || 0 } },
    { upsert: true }
  );

  const counter = await TeamCounter.findOneAndUpdate(
    { key: 'teams' },
    { $inc: { nextTeamNumber: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return counter.nextTeamNumber;
}

// GET /api/teams/availability -> predefined teams available for event entry
exports.availability = async (req, res, next) => {
  try {
    const teams = await Team.find().sort({ teamNumber: 1 }).select('teamNumber -_id').lean();
    return res.json({ totalTeams: null, teams: teams.map((team) => ({ ...team, available: false })) });
  } catch (err) {
    return next(err);
  }
};

// Legacy endpoint retained for backwards compatibility. New events use /session.
exports.register = async (req, res, next) => {
  try {
    const collegeName = normalizeName(req.body.collegeName);
    const member1Name = normalizeName(req.body.member1Name);
    const member2Name = normalizeName(req.body.member2Name);

    if (!collegeName || !member1Name || !member2Name) {
      return res.status(400).json({
        message: 'College name and both participant names are required',
      });
    }

    if (
      collegeName.length > 120 ||
      member1Name.length > 60 ||
      member2Name.length > 60 ||
      member1Name.toLocaleLowerCase() === member2Name.toLocaleLowerCase()
    ) {
      return res.status(400).json({
        message: member1Name.toLocaleLowerCase() === member2Name.toLocaleLowerCase()
          ? 'Participant names must be different'
          : 'College or participant name exceeds the allowed length',
      });
    }

    const registrationKey = [collegeName, ...[member1Name, member2Name].sort()]
      .map(normalizeKey)
      .join('|');
    const duplicate = await Team.findOne({ registrationKey }).select('+registrationKey').lean();
    if (duplicate) {
      return res.status(409).json({ message: `This team is already registered as Team ${duplicate.teamNumber}` });
    }

    const sameCollegeTeams = await Team.find({ collegeName }).select('teamNumber member1Name member2Name').lean();
    const duplicateExisting = sameCollegeTeams.find((team) => {
      const names = [normalizeKey(team.member1Name), normalizeKey(team.member2Name)].sort();
      return names.join('|') === [normalizeKey(member1Name), normalizeKey(member2Name)].sort().join('|');
    });
    if (duplicateExisting) {
      return res.status(409).json({ message: `This team is already registered as Team ${duplicateExisting.teamNumber}` });
    }

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const teamNumber = await allocateTeamNumber();
      try {
        const team = await Team.create({
          teamNumber,
          collegeName,
          member1Name,
          member2Name,
          registrationKey,
        });

        return res.status(201).json({
          team: {
            teamNumber: team.teamNumber,
            collegeName: team.collegeName,
            member1Name: team.member1Name,
            member2Name: team.member2Name,
            registeredAt: team.registeredAt,
          },
          token: signTeam(teamNumber, [member1Name, member2Name]),
        });
      } catch (err) {
        if (err.code === 11000) {
          const sameRegistration = await Team.findOne({ registrationKey })
            .select('+registrationKey')
            .lean();
          if (sameRegistration) {
            return res.status(409).json({
              message: `This team is already registered as Team ${sameRegistration.teamNumber}`,
            });
          }
          continue;
        }
        throw err;
      }
    }

    return res.status(503).json({ message: 'Registration is busy. Please try again.' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message: 'Team number conflict. Please register again.',
      });
    }
    return next(err);
  }
};

// POST /api/teams/login  -> authenticate an already-registered team by member names
exports.login = async (req, res, next) => {
  try {
    const teamNumber = Number(req.body.teamNumber);
    const member1Name = (req.body.member1Name || '').trim();
    const member2Name = (req.body.member2Name || '').trim();

    if (!Number.isInteger(teamNumber) || teamNumber < 1) {
      return res.status(400).json({ message: 'Invalid team number' });
    }
    if (!member1Name || !member2Name) {
      return res.status(400).json({ message: 'Both member names are required' });
    }

    const team = await Team.findOne({ teamNumber });
    if (!team) {
      return res.status(404).json({ message: `Team ${teamNumber} is not registered` });
    }

    // Verify member names match (case-insensitive)
    const stored1 = team.member1Name.toLowerCase();
    const stored2 = team.member2Name.toLowerCase();
    const provided1 = member1Name.toLowerCase();
    const provided2 = member2Name.toLowerCase();

    const match1 = stored1 === provided1 && stored2 === provided2;
    const match2 = stored1 === provided2 && stored2 === provided1; // allow swapped order

    if (!match1 && !match2) {
      return res.status(401).json({ message: 'Member names do not match our records' });
    }

    return res.json({
      team: {
        teamNumber: team.teamNumber,
        member1Name: team.member1Name,
        member2Name: team.member2Name,
        registeredAt: team.registeredAt,
      },
      token: signTeam(teamNumber, [team.member1Name, team.member2Name]),
    });
  } catch (err) {
    return next(err);
  }
};

const normalizeParticipant = (name) => String(name || '').trim().replace(/\s+/g, ' ').toLocaleLowerCase();
const matchingParticipants = (left, right) => {
  const a = (left || []).map(normalizeParticipant).sort();
  const b = (right || []).map(normalizeParticipant).sort();
  return a.length === 2 && b.length === 2 && a[0] && a[0] === b[0] && a[1] === b[1];
};

// POST /api/teams/session { teamNumber, participants: [name1, name2], round }
// Verifies the event identity before issuing a short-lived team JWT.
exports.session = async (req, res, next) => {
  try {
    const teamNumber = Number(req.body.teamNumber);
    const round = Number(req.body.round);
    const participants = Array.isArray(req.body.participants)
      ? req.body.participants.map((name) => String(name || '').trim().replace(/\s+/g, ' '))
      : [];
    if (!Number.isInteger(teamNumber) || teamNumber < 1 || ![1, 2].includes(round)) {
      return res.status(400).json({ message: 'Invalid team or round' });
    }
    if (participants.length !== 2 || participants.some((name) => !name || name.length > 60)) {
      return res.status(400).json({ message: 'Enter both participant names' });
    }
    if (normalizeParticipant(participants[0]) === normalizeParticipant(participants[1])) {
      return res.status(400).json({ message: 'Participant names must be different' });
    }

    const team = await Team.findOne({ teamNumber });
    if (!team) return res.status(404).json({ message: `Team ${teamNumber} is not available` });

    const Attempt = require('../models/Attempt');
    const round1 = await Attempt.findOne({ team: team._id, round: 1 });
    const requestedAttempt = round === 1 ? round1 : await Attempt.findOne({ team: team._id, round: 2 });

    if (round === 1 && round1?.participants?.length && !matchingParticipants(round1.participants, participants)) {
      return res.status(403).json({ message: 'Participant names are locked for Team ' + teamNumber });
    }
    if (round === 2) {
      if (!round1 || !round1.participants?.length) {
        return res.status(403).json({ message: 'Team has not started Round 1 yet.' });
      }
      if (!matchingParticipants(round1.participants, participants)) {
        return res.status(403).json({ message: 'Participant names do not match the Round 1 team.' });
      }
      if (requestedAttempt?.status === 'submitted') {
        return res.status(409).json({ message: 'Round 2 has already been submitted.' });
      }
    }

    return res.json({
      team: { teamNumber, participants },
      token: signTeam(teamNumber, participants),
    });
  } catch (err) {
    return next(err);
  }
};

// GET /api/teams/me  -> current team (requires team token)
exports.me = async (req, res, next) => {
  try {
    const team = await Team.findOne({ teamNumber: req.team.teamNumber });
    if (!team) return res.status(404).json({ message: 'Team not found' });
    return res.json({ team });
  } catch (err) {
    return next(err);
  }
};
