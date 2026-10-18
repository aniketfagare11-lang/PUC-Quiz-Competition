const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    selectedOption: { type: String, default: '' }, // option key or '' if unanswered
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const attemptSchema = new mongoose.Schema(
  {
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    teamNumber: { type: Number, required: true },
    round: { type: Number, required: true, default: 1 },
    participants: {
      type: [{ type: String, trim: true }],
      default: undefined,
      validate: {
        validator: (names) => !names || names.length === 2,
        message: 'Exactly two participants are required',
      },
    },
    answers: [answerSchema],
    score: { type: Number, default: 0 }, // populated on submission; hidden from teams
    status: { type: String, enum: ['in-progress', 'submitted'], default: 'in-progress' },
    submissionType: { type: String, enum: ['manual', 'auto', 'forced'], default: 'manual' },
    startedAt: { type: Date, default: Date.now }, // timer anchor (server-authoritative)
    submittedAt: { type: Date },
    timeLimitSeconds: { type: Number, default: 1200 },
  },
  { timestamps: true }
);

// One attempt per team per round
attemptSchema.index({ team: 1, round: 1 }, { unique: true });

module.exports = mongoose.model('Attempt', attemptSchema);
