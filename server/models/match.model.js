const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
  phase: {
    type: String,
    required: true,
    enum: ['regular', 'phase2'],
  },
  group: {
    type: String,
  },
  round: {
    type: String,
  },
  home_team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
  },
  away_team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
  },
  home_score: {
    type: Number,
    default: null,
  },
  away_score: {
    type: Number,
    default: null,
  },
  date: {
      type: Date,
  }
});

module.exports = mongoose.model('Match', MatchSchema);
