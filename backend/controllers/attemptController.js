const Attempt = require('../models/Attempt');
const Question = require('../models/Question');
const Team = require('../models/Team');
const { autoSubmitIfExpired, buildAttemptState, remainingSeconds } = require('../utils/attemptState');

function roundTimeLimit(round) {
  const fromEnv = Number(process.env[`ROUND${round}_TIME_LIMIT_SECONDS`]);
  return fromEnv > 0 ? fromEnv : 1200;
}

// POST /api/attempts/start  { round }  -> create or resume the team's attempt
exports.start = async (req, res, next) => {
  try {
    const teamNumber = req.team.teamNumber;
    const round = Number(req.body.round) || 1;
    if (![1, 2].includes(round)) {
      return res.status(400).json({ message: 'Invalid round' });
    }

    const team = await Team.findOne({ teamNumber });
    if (!team) return res.status(404).json({ message: 'Team not registered' });

    const participants = Array.isArray(req.team.participants) ? req.team.participants : [];
    if (participants.length !== 2 || participants.some((name) => !String(name || '').trim())) {
      return res.status(403).json({ message: 'Participant verification is required' });
    }

    let attempt = await Attempt.findOne({ team: team._id, round });

    if (attempt && attempt.status === 'submitted') {
      return res.status(409).json({ message: 'This round has already been submitted' });
    }

    if (attempt?.participants?.length) {
      const normalized = (names) => names.map((name) => String(name).trim().replace(/\s+/g, ' ').toLocaleLowerCase()).sort();
      if (JSON.stringify(normalized(attempt.participants)) !== JSON.stringify(normalized(participants))) {
        return res.status(403).json({ message: 'Participant names do not match this attempt' });
      }
    }

    if (round === 2) {
      const round1 = await Attempt.findOne({ team: team._id, round: 1 });
      const normalized = (names) => names.map((name) => String(name).trim().replace(/\s+/g, ' ').toLocaleLowerCase()).sort();
      if (!round1 || !round1.participants?.length) {
        return res.status(403).json({ message: 'Team has not started Round 1 yet.' });
      }
      if (JSON.stringify(normalized(round1.participants)) !== JSON.stringify(normalized(participants))) {
        return res.status(403).json({ message: 'Participant names do not match the Round 1 team.' });
      }
    }

    if (!attempt) {
      const questions = await Question.find({ round }).sort({ order: 1 });
      if (!questions.length) return res.status(400).json({ message: 'No questions available for this round' });
      try {
        attempt = await Attempt.create({
          team: team._id,
          teamNumber,
          round,
          participants,
          timeLimitSeconds: roundTimeLimit(round),
          answers: questions.map((q) => ({ question: q._id, selectedOption: '' })),
        });
      } catch (err) {
        // React StrictMode can mount Quiz twice in development. Both mounts may
        // observe no attempt and race to create it; the unique index picks one.
        // The losing request must resume that attempt, never look submitted.
        if (err.code !== 11000) throw err;
        attempt = await Attempt.findOne({ team: team._id, round });
        if (!attempt) throw err;
      }
    }

    if (attempt.status === 'submitted') {
      return res.status(409).json({ message: 'This round has already been submitted' });
    }

    await autoSubmitIfExpired(attempt);
    return res.json(await buildAttemptState(attempt));
  } catch (err) {
    return next(err);
  }
};

// GET /api/attempts/:id  -> current attempt state (resume after refresh)
exports.get = async (req, res, next) => {
  try {
    const attempt = await Attempt.findById(req.params.id);
    if (!attempt) return res.status(404).json({ message: 'Attempt not found' });
    if (attempt.teamNumber !== req.team.teamNumber) return res.status(403).json({ message: 'Forbidden' });

    await autoSubmitIfExpired(attempt);
    return res.json(await buildAttemptState(attempt));
  } catch (err) {
    return next(err);
  }
};

// PUT /api/attempts/:id/answer  { questionId, selectedOption }
exports.saveAnswer = async (req, res, next) => {
  try {
    const { questionId, selectedOption } = req.body;
    if (!questionId) return res.status(400).json({ message: 'questionId is required' });

    const attempt = await Attempt.findById(req.params.id);
    if (!attempt) return res.status(404).json({ message: 'Attempt not found' });
    if (attempt.teamNumber !== req.team.teamNumber) return res.status(403).json({ message: 'Forbidden' });
    if (attempt.status === 'submitted') return res.status(409).json({ message: 'Already submitted' });

    if (remainingSeconds(attempt) <= 0) {
      await autoSubmitIfExpired(attempt);
      return res.status(410).json({ message: 'Time has expired' });
    }

    const ans = attempt.answers.find((a) => String(a.question) === String(questionId));
    if (!ans) return res.status(400).json({ message: 'Question does not belong to this attempt' });

    ans.selectedOption = typeof selectedOption === 'string' ? selectedOption : '';
    ans.updatedAt = new Date();
    await attempt.save();
    return res.json({ ok: true, saved: true });
  } catch (err) {
    return next(err);
  }
};

// POST /api/attempts/:id/submit  -> score & close
exports.submit = async (req, res, next) => {
  try {
    const attempt = await Attempt.findById(req.params.id);
    if (!attempt) return res.status(404).json({ message: 'Attempt not found' });
    if (attempt.teamNumber !== req.team.teamNumber) return res.status(403).json({ message: 'Forbidden' });
    if (attempt.status === 'submitted') return res.json({ submitted: true, alreadySubmitted: true });

    const expired = remainingSeconds(attempt) <= 0;
    attempt.status = 'submitted';
    attempt.submissionType = expired ? 'auto' : 'manual';
    attempt.submittedAt = new Date();
    await require('../utils/scoring').scoreAttempt(attempt);
    await attempt.save();

    return res.json({ submitted: true, submissionType: attempt.submissionType });
  } catch (err) {
    return next(err);
  }
};
