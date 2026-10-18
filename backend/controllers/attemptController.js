const Attempt = require('../models/Attempt');
const Question = require('../models/Question');
const QuizConfig = require('../models/QuizConfig');
const Team = require('../models/Team');
const { autoSubmitIfExpired, buildAttemptState, remainingSeconds } = require('../utils/attemptState');

function roundTimeLimit(round) {
  const fromEnv = Number(process.env[`ROUND${round}_TIME_LIMIT_SECONDS`]);
  return fromEnv > 0 ? fromEnv : 1200;
}

// POST /api/attempts/start -> create or resume the team's single quiz attempt
exports.start = async (req, res, next) => {
  try {
    const teamNumber = req.team.teamNumber;
    const round = 1;

    const team = await Team.findOne({ teamNumber });
    if (!team) {
      return res.status(404).json({ message: 'Team not registered' });
    }

    const participants = Array.isArray(req.team.participants)
      ? req.team.participants
      : [];

    if (
      participants.length !== 2 ||
      participants.some((name) => !String(name || '').trim())
    ) {
      return res.status(403).json({
        message: 'Participant verification is required',
      });
    }

    let attempt = await Attempt.findOne({ team: team._id, round });

    const normalize = (names) =>
      names
        .map((name) =>
          String(name).trim().replace(/\s+/g, ' ').toLocaleLowerCase()
        )
        .sort();

    if (attempt?.status === 'submitted') {
      return res.status(409).json({
        message: 'This quiz has already been submitted',
      });
    }

    if (
      attempt?.participants?.length &&
      JSON.stringify(normalize(attempt.participants)) !==
        JSON.stringify(normalize(participants))
    ) {
      return res.status(403).json({
        message: 'Participant names do not match this attempt',
      });
    }

    if (!attempt) {
      const config = await QuizConfig.findOneAndUpdate(
        { key: 'quiz' },
        { $setOnInsert: { activeSet: 'A' } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      const activeSet = config.activeSet || 'A';

      const questions = await Question.find({
        round: 1,
        set: activeSet,
      }).sort({ order: 1 });

      if (!questions.length) {
        return res.status(400).json({
          message: `No questions available in Set ${activeSet}`,
        });
      }

      try {
        attempt = await Attempt.create({
          team: team._id,
          teamNumber,
          round: 1,
          set: activeSet,
          participants,
          timeLimitSeconds: roundTimeLimit(1),
          answers: questions.map((q) => ({
            question: q._id,
            selectedOption: '',
          })),
        });
      } catch (err) {
        if (err.code !== 11000) throw err;

        attempt = await Attempt.findOne({ team: team._id, round: 1 });
        if (!attempt) throw err;
      }
    }

    if (attempt.status === 'submitted') {
      return res.status(409).json({
        message: 'This quiz has already been submitted',
      });
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
