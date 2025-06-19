const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  pj: { type: Number, default: 0 }, // Partidos Jugados
  pg: { type: Number, default: 0 }, // Partidos Ganados
  pe: { type: Number, default: 0 }, // Partidos Empatados
  pp: { type: Number, default: 0 }, // Partidos Perdidos
  gf: { type: Number, default: 0 }, // Goles a Favor
  gc: { type: Number, default: 0 }, // Goles en Contra
  gd: { type: Number, default: 0 }, // Diferencia de Goles
  pts: { type: Number, default: 0 }, // Puntos
});

module.exports = mongoose.model('Team', TeamSchema);
