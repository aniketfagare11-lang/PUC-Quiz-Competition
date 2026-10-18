const Question = require('../models/Question');
const { scoreAttempt } = require('./scoring');

/**
 * Strip the correctAnswer (and explanation) from a question before sending to the client.
 * This is the single chokepoint that prevents answer leakage.
 */
function publicQuestion(q) {
  return {
    _id: q._id,
    order: q.order,
    type: q.type,
    questionText: q.questionText,
    imageUrl: q.imageUrl,
    options: q.options.map((o) => ({ key: o.key, text: o.text })),
    marks: q.marks,
  };
}

/** Remaining seconds for an attempt, based on server time. */
function remainingSeconds(attempt, now = Date.now()) {
  const startedAt = new Date(attempt.startedAt).getTime();
  const endsAt = startedAt + (attempt.timeLimitSeconds || 0) * 1000;
  return Math.max(0, Math.floor((endsAt - now) / 1000));
}

/** If the deadline has passed and the attempt is still open, close and score it. */
async function autoSubmitIfExpired(attempt) {
  if (attempt.status !== 'in-progress') return attempt;
  if (remainingSeconds(attempt) <= 0) {
    attempt.status = 'submitted';
    attempt.submissionType = 'auto';
    attempt.submittedAt = new Date();
    await scoreAttempt(attempt);
    await attempt.save();
  }
  return attempt;
}

/**
 * Build the team-facing attempt payload. NEVER includes score or correct answers.
 */
async function buildAttemptState(attempt) {
  const questions = await Question.find({ round: attempt.round }).sort({ order: 1 });
  const answers = {};
  for (const a of attempt.answers) answers[String(a.question)] = a.selectedOption || '';

  return {
    attempt: {
      _id: attempt._id,
      teamNumber: attempt.teamNumber,
      round: attempt.round,
      status: attempt.status,
      submissionType: attempt.submissionType,
      startedAt: new Date(attempt.startedAt).getTime(),
      submittedAt: attempt.submittedAt ? new Date(attempt.submittedAt).getTime() : null,
      timeLimitSeconds: attempt.timeLimitSeconds,
    },
    questions: questions.map(publicQuestion),
    answers, // { questionId: 'A' | '' }
    serverTime: Date.now(),
    remainingSeconds: remainingSeconds(attempt),
  };
}

module.exports = { publicQuestion, remainingSeconds, autoSubmitIfExpired, buildAttemptState };
