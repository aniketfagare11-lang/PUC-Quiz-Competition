const Attempt = require('../models/Attempt');
const Question = require('../models/Question');
const QuizSetAllocator = require('../models/QuizSetAllocator');
const Team = require('../models/Team');
const { autoSubmitIfExpired, buildAttemptState, remainingSeconds } = require('../utils/attemptState');

function roundTimeLimit(round) {
  const fromEnv = Number(process.env[`ROUND${round}_TIME_LIMIT_SECONDS`]);
  return fromEnv > 0 ? fromEnv : 3000;
}

// GET /api/attempts/info -> briefing data without creating an attempt
exports.info = async (req, res, next) => {
  try {
    const team = await Team.findOne({ teamNumber: req.team.teamNumber }).select('_id');
    if (!team) return res.status(404).json({ message: 'Team not registered' });

    const attempt = await Attempt.findOne({ team: team._id, round: 1 })
      .select('questionOrder answers timeLimitSeconds set status');
    if (attempt) {
      const totalQuestions = attempt.questionOrder?.length || attempt.answers?.length || 0;
      return res.json({
        questionCount: totalQuestions,
        timeLimitSeconds: attempt.timeLimitSeconds || roundTimeLimit(1),
        set: attempt.set,
        status: attempt.status,
      });
    }

    const sets = ['A', 'B', 'C', 'D'];
    const counts = await Promise.all(
      sets.map((set) => Question.countDocuments({ round: 1, set }))
    );
    const questionCount = counts.every((count) => count === counts[0]) ? counts[0] : null;

    return res.json({
      questionCount,
      timeLimitSeconds: roundTimeLimit(1),
      set: null,
      status: null,
    });
  } catch (err) {
    return next(err);
  }
};

function shuffleQuestions(questions) {
  const shuffled = [...questions];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function randomSetOrder() {
  const sets = ['A', 'B', 'C', 'D'];
  for (let index = sets.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [sets[index], sets[swapIndex]] = [sets[swapIndex], sets[index]];
  }
  return sets;
}

async function allocateQuestionSet() {
  for (let retry = 0; retry < 3; retry += 1) {
    try {
      const allocator = await QuizSetAllocator.findOneAndUpdate(
        { key: 'round-1' },
        {
          $inc: { nextSlot: 1 },
          $setOnInsert: { setOrder: randomSetOrder() },
        },
        {
          new: true,
          upsert: retry === 0,
          setDefaultsOnInsert: true,
        }
      );

      if (!allocator) {
        continue;
      }

      const slot = allocator.nextSlot - 1;
      return allocator.setOrder[slot % allocator.setOrder.length];
    } catch (err) {
      if (err.code !== 11000 || retry === 2) {
        throw err;
      }
    }
  }

  throw new Error('Question-set allocator could not be initialized');
}

async function validateQuestionSets() {
  const sets = ['A', 'B', 'C', 'D'];
  const counts = await Promise.all(
    sets.map((set) => Question.countDocuments({ round: 1, set }))
  );
  const invalidSets = sets.filter((set, index) => counts[index] !== 50);

  if (invalidSets.length > 0) {
    const details = invalidSets
      .map((set) => `${set} has ${counts[sets.indexOf(set)]}`)
      .join(', ');
    const error = new Error(
      `Quiz cannot start because every Round 1 set must contain exactly 50 questions (${details})`
    );
    error.status = 400;
    throw error;
  }
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
      try {
        await validateQuestionSets();
      } catch (err) {
        if (err.status === 400) {
          return res.status(400).json({ message: err.message });
        }
        throw err;
      }

      const activeSet = await allocateQuestionSet();

      const questions = await Question.find({
        round: 1,
        set: activeSet,
      }).sort({ order: 1 });

      if (questions.length !== 50) {
        return res.status(400).json({
          message: `Set ${activeSet} must contain exactly 50 questions before the quiz can start`,
        });
      }
      const shuffledQuestions = shuffleQuestions(questions);

      try {
        attempt = await Attempt.create({
          team: team._id,
          teamNumber,
          round: 1,
          set: activeSet,
          participants,
          timeLimitSeconds: roundTimeLimit(1),
          questionOrder: shuffledQuestions.map((q) => q._id),
          answers: shuffledQuestions.map((q) => ({
            question: q._id,
            selectedOption: '',
          })),
        });
      } catch (err) {
        if (err.code !== 11000) throw err;

        for (let retry = 0; retry < 3 && !attempt; retry += 1) {
          attempt = await Attempt.findOne({ team: team._id, round: 1 });
          if (!attempt && retry < 2) {
            await new Promise((resolve) => setTimeout(resolve, 10));
          }
        }
        if (!attempt) {
          throw err;
        }
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

    if (selectedOption !== '' && !['A', 'B', 'C', 'D'].includes(selectedOption)) {
      return res.status(400).json({ message: 'selectedOption must be A, B, C, D, or empty' });
    }
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
