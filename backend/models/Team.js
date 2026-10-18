const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
  {
    // Predefined competition team number.
    teamNumber: { type: Number, required: true, unique: true, min: 1 },
    // Legacy fields retained for compatibility with existing documents. Participant
    // identity belongs to an Attempt, not to a predefined team.
    member1Name: { type: String, trim: true },
    member2Name: { type: String, trim: true },
    registeredAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Team', teamSchema);
