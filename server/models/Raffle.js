// models/Raffle.js
const mongoose = require('mongoose');

const raffleSchema = new mongoose.Schema({
  nameRaffle: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: mongoose.Schema.Types.Decimal128,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  drawDate: {
    type: Date,
    required: true
  },
  totalNumberTickets: {
    type: Number,
    required: true
  },
  sellTickets: {
    type: Number,
    required: true,
    default: 0
  },
  statusRaffle: {
    type: String,
    enum: ['activa', 'finalizada', 'pendiente'],
    required: true,
    default: 'activa'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Raffle', raffleSchema);
