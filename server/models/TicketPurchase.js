// models/TicketPurchase.js
const mongoose = require('mongoose');

const ticketPurchaseSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    required: true,
    unique: true
  },
  raffleNumber: {
    type: String,
    required: true
  },
  clientId: {
    type: String,
    required: true
  },
  purchaseDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  purchaseStatus: {
    type: String,
    enum: ['pendiente', 'confirmado', 'ganador', 'cancelado'],
    required: true,
    default: 'pendiente'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TicketPurchase', ticketPurchaseSchema);
