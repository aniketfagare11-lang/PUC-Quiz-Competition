const mongoose = require('mongoose');

const quizConfigSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: 'quiz' },
    activeSet: {
      type: String,
      enum: ['A', 'B', 'C', 'D'],
      default: 'A',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('QuizConfig', quizConfigSchema);