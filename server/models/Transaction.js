// models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  clientId: {
    type: String,
    required: true
  },
  raffleId: {
    type: String,
    required: true
  },
  ticketId: {
    type: String,
    required: true
  },
  amount: {
    type: mongoose.Schema.Types.Decimal128,
    required: true
  },
  datePurchase: {
    type: Date,
    required: true,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: ['tarjeta_credito', 'tarjeta_debito', 'paypal', 'transferencia'],
    required: true
  },
  statusPayment: {
    type: String,
    enum: ['pendiente', 'completado', 'fallido', 'reembolsado'],
    required: true,
    default: 'pendiente'
  },
  wompiReference: {
    type: String,
    unique: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);
