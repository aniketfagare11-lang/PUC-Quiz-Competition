const Team = require('../models/Team');
const Attempt = require('../models/Attempt');
const Question = require('../models/Question');
const QuizConfig = require('../models/QuizConfig');
const { scoreAttempt } = require('../utils/scoring');

// GET /api/admin/overview
exports.overview = async (req, res, next) => {
  try {
    const [registered, submitted, inProgress] = await Promise.all([
      Team.countDocuments(),
      Attempt.countDocuments({ round: 1, status: 'submitted' }),
      Attempt.countDocuments({ round: 1, status: 'in-progress' }),
    ]);
    return res.json({ registered, submitted, inProgress });
  } catch (err) {
    return next(err);
  }
};

// GET /api/admin/teams -> registered teams, their quiz attempt, and locked names

exports.teams = async (req, res, next) => {
  try {
    const teams = await Team.find()
      .sort({ teamNumber: 1 })
      .lean();

    const attempts = await Attempt.find({
      round: { $in: [1, 2] },
    }).lean();

    const byTeam = new Map();

    attempts.forEach((attempt) => {
      byTeam.set(
        `${attempt.teamNumber}-${attempt.round}`,
        attempt
      );
    });

    const rows = teams.map((team) => {
      const serialize = (attempt) =>
        attempt && {
          attemptId: attempt._id,
          set: attempt.set || null,
          status: attempt.status,
          submissionType: attempt.submissionType,
          startedAt: attempt.startedAt,
          submittedAt: attempt.submittedAt,
          score:
            attempt.status === 'submitted'
              ? attempt.score
              : null,
          answers: (attempt.answers || []).map((answer) => ({
            selectedOption: answer.selectedOption || '',
          })),
          totalQuestions: (attempt.answers || []).length,
          participants: attempt.participants || [],
        };

      const round1 = byTeam.get(`${team.teamNumber}-1`);
      const round2 = byTeam.get(`${team.teamNumber}-2`);

      return {
        teamNumber: team.teamNumber,
        collegeName: team.collegeName || '',
        registeredAt: team.registeredAt,
        participants: [
          team.member1Name || '',
          team.member2Name || '',
        ],
        round1: serialize(round1),
        round2: serialize(round2),
        quiz: serialize(round1),
      };
    });

    console.log(
  teams.slice(0, 3).map((team) => ({
    teamNumber: team.teamNumber,
    collegeName: team.collegeName,
    member1Name: team.member1Name,
    member2Name: team.member2Name,
  }))
);

    return res.json({ teams: rows });
  } catch (err) {
    return next(err);
  }
};


// GET /api/admin/rankings -> quiz results; the round filter remains accepted for legacy callers.
exports.rankings = async (req, res, next) => {
  try {
    const submitted = await Attempt.find({
      round: 1,
    })
      .sort({ status: 1, score: -1, submittedAt: 1, startedAt: 1 })
      .lean();

    const rankings = submitted.map((a, i) => ({
      rank: i + 1,
      teamNumber: a.teamNumber,
      set: a.set || null,
      participants: a.participants || [],
      score: a.status === 'submitted' ? a.score : null,
      status: a.status,
      submissionType: a.submissionType,
      answeredCount: (a.answers || []).filter((answer) => answer.selectedOption).length,
      totalQuestions: (a.answers || []).length,
      submittedAt: a.submittedAt,
      startedAt: a.startedAt,
      timeTakenSeconds:
        a.startedAt && a.submittedAt
          ? Math.round(
              (new Date(a.submittedAt) - new Date(a.startedAt)) / 1000
            )
          : null,
    }));

    return res.json({ rankings });
  } catch (err) {
    return next(err);
  }
};

// Legacy endpoint retained for older dashboard clients.
exports.combinedResults = async (req, res, next) => {
  try {
    const teams = await Team.find().sort({ teamNumber: 1 }).lean();
    const attempts = await Attempt.find({ round: { $in: [1, 2] } }).lean();
    const byTeam = new Map();
    attempts.forEach((a) => byTeam.set(`${a.teamNumber}-${a.round}`, a));
    const rows = teams.map((team) => {
      const round1 = byTeam.get(`${team.teamNumber}-1`);
      const round2 = byTeam.get(`${team.teamNumber}-2`);
      const round1Score = round1?.status === 'submitted' ? round1.score : null;
      const round2Score = round2?.status === 'submitted' ? round2.score : null;
      const round1Time =
  round1?.status === 'submitted' && round1.startedAt && round1.submittedAt
    ? Math.round((new Date(round1.submittedAt) - new Date(round1.startedAt)) / 1000)
    : null;

const round2Time =
  round2?.status === 'submitted' && round2.startedAt && round2.submittedAt
    ? Math.round((new Date(round2.submittedAt) - new Date(round2.startedAt)) / 1000)
    : null;

const totalTime =
  (round1Time || 0) + (round2Time || 0);

return {
  teamNumber: team.teamNumber,
  participants: round1?.participants || [],
  round1Score,
  round2Score,
  round1Time,
  round2Time,
  totalTime,
  total: (round1Score || 0) + (round2Score || 0),
  complete: round1Score !== null && round2Score !== null
};
    }).filter((row) => row.round1Score !== null || row.round2Score !== null);
    rows.sort((a, b) => b.total - a.total || a.teamNumber - b.teamNumber);
    return res.json({ results: rows.map((row, index) => ({ ...row, rank: index + 1 })) });
  } catch (err) { return next(err); }
};

// POST /api/admin/attempts/:id/force-submit
exports.forceSubmit = async (req, res, next) => {
  try {
    const attempt = await Attempt.findById(req.params.id);
    if (!attempt) return res.status(404).json({ message: 'Attempt not found' });
    if (attempt.status === 'submitted') return res.json({ submitted: true, alreadySubmitted: true });

    attempt.status = 'submitted';
    attempt.submissionType = 'forced';
    attempt.submittedAt = new Date();
    await scoreAttempt(attempt);
    await attempt.save();
    return res.json({ submitted: true });
  } catch (err) {
    return next(err);
  }
};

// DELETE /api/admin/teams/:teamNumber/reset  -> delete the team's attempt (keep registration)
exports.resetAttempt = async (req, res, next) => {
  try {
    const teamNumber = Number(req.params.teamNumber);
    const team = await Team.findOne({ teamNumber });
    if (!team) return res.status(404).json({ message: 'Team not found' });
    const result = await Attempt.deleteOne({ team: team._id, round: 1 });
    return res.json({ deleted: result.deletedCount });
  } catch (err) {
    return next(err);
  }
};

// GET /api/admin/questions?set=A|B|C|D
exports.questions = async (req, res, next) => {
  try {
    const setName = String(req.query.set || 'A').toUpperCase();

if (!['A', 'B', 'C', 'D'].includes(setName)) {
  return res.status(400).json({ message: 'Set must be A, B, C or D' });
}

const questions = await Question.find({ round: 1, set: setName })
  .sort({ order: 1 })
  .select('-correctAnswer -explanation')
  .lean();

return res.json({ questions });
  } catch (err) {
    return next(err);
  }
};


// POST /api/admin/questions
exports.createQuestion = async (req, res, next) => {
  try {
    const {
  set, order, type, questionText, imageUrl,
  options, correctAnswer, marks, explanation,
} = req.body;

const setName = String(set || 'A').toUpperCase();

if (!['A', 'B', 'C', 'D'].includes(setName)) {
  return res.status(400).json({ message: 'Set must be A, B, C or D' });
}

    if (!questionText?.trim()) {
      return res.status(400).json({ message: 'Question text is required' });
    }

    if (!Array.isArray(options) || options.length !== 4) {
      return res.status(400).json({ message: 'Exactly 4 options are required' });
    }

    const validKeys = ['A', 'B', 'C', 'D'];

    if (
      options.some(
        (option) =>
          !validKeys.includes(option.key) ||
          !option.text?.trim()
      )
    ) {
      return res.status(400).json({ message: 'All A, B, C and D options are required' });
    }

    if (!validKeys.includes(correctAnswer)) {
      return res.status(400).json({ message: 'Correct answer must be A, B, C or D' });
    }

    // Once a round has started, its questions are locked.
    const setStarted = await Attempt.exists({ round: 1, set: setName });

if (setStarted) {
  return res.status(409).json({
    message: `Set ${setName} is locked because a team has started it.`,
  });
}

    const question = await Question.create({
      round: 1,
set: setName,
      order: Number(order),
      type: type || 'mcq',
      questionText: questionText.trim(),
      imageUrl: imageUrl || '',
      options,
      correctAnswer,
      marks: Number(marks) || 1,
      explanation: explanation || '',
    });

    return res.status(201).json({
      question: {
        ...question.toObject(),
        correctAnswer: undefined,
        explanation: undefined,
      },
    });
  } catch (err) {
    return next(err);
  }
};


// PUT /api/admin/questions/:id
exports.updateQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const setStarted = await Attempt.exists({
  round: 1,
  set: question.set || 'A',
});

if (setStarted) {
  return res.status(409).json({
    message: `Set ${question.set || 'A'} is locked because a team has started it.`,
  });
}

    const {
      order,
      type,
      questionText,
      imageUrl,
      options,
      correctAnswer,
      marks,
      explanation,
    } = req.body;

    if (!questionText?.trim()) {
      return res.status(400).json({ message: 'Question text is required' });
    }

    if (!Array.isArray(options) || options.length !== 4) {
      return res.status(400).json({ message: 'Exactly 4 options are required' });
    }

    const validKeys = ['A', 'B', 'C', 'D'];

    if (
      options.some(
        (option) =>
          !validKeys.includes(option.key) ||
          !option.text?.trim()
      )
    ) {
      return res.status(400).json({ message: 'All A, B, C and D options are required' });
    }

    if (!validKeys.includes(correctAnswer)) {
      return res.status(400).json({ message: 'Correct answer must be A, B, C or D' });
    }

    question.order = Number(order);
    question.type = type || 'mcq';
    question.questionText = questionText.trim();
    question.imageUrl = imageUrl || '';
    question.options = options;
    question.correctAnswer = correctAnswer;
    question.marks = Number(marks) || 1;
    question.explanation = explanation || '';

    await question.save();

    return res.json({
      question: {
        ...question.toObject(),
        correctAnswer: undefined,
        explanation: undefined,
      },
    });
  } catch (err) {
    return next(err);
  }
};


// DELETE /api/admin/questions/:id
exports.deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const setStarted = await Attempt.exists({
  round: 1,
  set: question.set || 'A',
});

if (setStarted) {
  return res.status(409).json({
    message: `Set ${question.set || 'A'} is locked because a team has started it.`,
  });
}

    await Question.deleteOne({ _id: question._id });

    return res.json({ deleted: true });
  } catch (err) {
    return next(err);
  }
};

// GET /api/admin/active-set
exports.getActiveSet = async (req, res, next) => {
  try {
    const config = await QuizConfig.findOneAndUpdate(
      { key: 'quiz' },
      { $setOnInsert: { activeSet: 'A' } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.json({ activeSet: config.activeSet || 'A' });
  } catch (err) {
    return next(err);
  }
};

// PUT /api/admin/active-set  { activeSet: "A" | "B" | "C" | "D" }
exports.setActiveSet = async (req, res, next) => {
  try {
    const activeSet = String(req.body.activeSet || '').toUpperCase();

    if (!['A', 'B', 'C', 'D'].includes(activeSet)) {
      return res.status(400).json({
        message: 'Active set must be A, B, C or D',
      });
    }

    const config = await QuizConfig.findOneAndUpdate(
      { key: 'quiz' },
      { $set: { activeSet } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.json({
      message: `Active question set changed to ${config.activeSet}`,
      activeSet: config.activeSet,
    });
  } catch (err) {
    return next(err);
  }
};
