const mongoose = require('mongoose');

const teamCounterSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: 'teams' },
    nextTeamNumber: { type: Number, required: true, min: 0, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TeamCounter', teamCounterSchema);
