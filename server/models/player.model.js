const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
  },
  goals: { type: Number, default: 0 },
  yellow_cards: { type: Number, default: 0 },
  red_cards: { type: Number, default: 0 },
  blue_cards: { type: Number, default: 0 },
});

module.exports = mongoose.model('Player', PlayerSchema);
