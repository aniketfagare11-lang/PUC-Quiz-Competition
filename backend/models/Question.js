const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema(
  {
    key: { type: String, required: true }, // 'A' | 'B' | 'C' | 'D'
    text: { type: String, required: true },
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    round: { type: Number, required: true, default: 1 },
    type: { type: String, enum: ['mcq', 'text', 'image'], default: 'mcq' },
    order: { type: Number, required: true }, // 1..N (display number)
    questionText: { type: String, required: true },
    imageUrl: { type: String, default: '' }, // used by image/picture puzzles in Round 2
    options: [optionSchema],
    correctAnswer: { type: String, required: true }, // option key, e.g. 'A' (server-side only)
    marks: { type: Number, default: 1 },
    explanation: { type: String, default: '' }, // optional, never sent to client
  },
  { timestamps: true }
);

questionSchema.index({ round: 1, order: 1 });

module.exports = mongoose.model('Question', questionSchema);
