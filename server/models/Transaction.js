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
  reference: {
    type: String,
    required: true
  },
  amount: {
    type: mongoose.Schema.Types.Decimal128,
    required: true
  },
  createdAt: {
    type: Date,
    required: false,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: ['tarjeta_credito', 'tarjeta_debito', 'paypal', 'transferencia'],
    required: false
  },
  status: {
    type: String,
    enum: ['creada', 'completado', 'fallido', 'reembolsado'],
    required: true,
    default: 'creada'
  },
  wompiTransactionId: {
    type: String,
    unique: true,
    required: false,
  },
  updatedAt: {
    type: Date,
    required: false,
    default: Date.now
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);
