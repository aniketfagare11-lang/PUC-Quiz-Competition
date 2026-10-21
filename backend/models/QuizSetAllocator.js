const mongoose = require('mongoose');

const quizSetAllocatorSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: 'round-1' },
    nextSlot: { type: Number, required: true, min: 0, default: 0 },
    setOrder: {
      type: [{ type: String, enum: ['A', 'B', 'C', 'D'] }],
      required: true,
      default: ['A', 'B', 'C', 'D'],
      validate: {
        validator: (sets) =>
          sets.length === 4 && new Set(sets).size === 4,
        message: 'Set allocation order must contain A, B, C, and D once each',
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('QuizSetAllocator', quizSetAllocatorSchema);
