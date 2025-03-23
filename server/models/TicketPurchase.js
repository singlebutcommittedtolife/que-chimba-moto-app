// models/TicketPurchase.js
const mongoose = require('mongoose');

const ticketPurchaseSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true
  },
  raffleId: {
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
}, {
  timestamps: true
});

module.exports = mongoose.model('TicketPurchase', ticketPurchaseSchema);
