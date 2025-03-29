// models/Raffle.js
const mongoose = require('mongoose');

const raffleSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  nameRaffle: {
    type: String,
    required: false
  },
  description: {
    type: String,
    required: false
  },
  price: {
    type: mongoose.Schema.Types.Decimal128,
    required: false
  },
  startDate: {
    type: Date,
    required: false
  },
  endDate: {
    type: Date,
    required: false
  },
  drawDate: {
    type: Date,
    required: false
  },
  totalNumberTickets: {
    type: Number,
    required: false
  },
  sellTickets: {
    type: Number,
    required: false,
    default: 0
  },
  statusRaffle: {
    type: String,
    enum: ['activa', 'finalizada', 'pendiente'],
    required: false,
    default: 'activa'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Raffle', raffleSchema);
