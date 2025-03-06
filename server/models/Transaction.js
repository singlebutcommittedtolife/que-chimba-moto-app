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
    unique: true,
    required: true
  },
  amount: {
    type: mongoose.Schema.Types.Decimal128,
    required: true
  },
  createdAt: {
    type: Date,
    required: false,
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
    required: false,
  },
  updatedAt: {
    type: Date,
    required: false,
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);
