const Question = require('../models/Question');

/**
 * Compute the score for an attempt by comparing stored answers to correct answers.
 * Scoring is always server-side so correct answers never reach the client.
 */
async function scoreAttempt(attempt) {
  const questions = await Question.find({ round: attempt.round }).lean();
  const byId = new Map(questions.map((q) => [String(q._id), q]));

  let score = 0;
  let answered = 0;
  let correct = 0;

  for (const a of attempt.answers) {
    const q = byId.get(String(a.question));
    if (!q) continue;
    if (a.selectedOption) answered += 1;
    if (a.selectedOption && a.selectedOption === q.correctAnswer) {
      score += q.marks || 0;
      correct += 1;
    }
  }

  attempt.score = score;
  attempt._stats = { answered, correct, total: questions.length };
  return attempt;
}

module.exports = { scoreAttempt };
