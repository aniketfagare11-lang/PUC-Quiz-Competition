
const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
  {
    teamNumber: {
      type: Number,
      required: true,
      unique: true,
      min: 1,
    },
    collegeName: {
      type: String,
      required: true,
      trim: true,
    },
    member1Name: {
      type: String,
      required: true,
      trim: true,
    },
    member2Name: {
      type: String,
      required: true,
      trim: true,
    },
    registrationKey: {
      type: String,
      sparse: true,
      select: false,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

teamSchema.index({ registrationKey: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Team', teamSchema);
