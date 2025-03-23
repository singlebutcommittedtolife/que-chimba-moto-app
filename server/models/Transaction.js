// models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  reference: {
    type: String,
    unique: true,
    required: true
  },
  clientId: {
    type: String,
    required: false
  },
  ticketId: {
    type: String,
    required: false
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
    enum: ['CREATED','UPDATED', 'APPROVED', 'DECLINED', 'VOIDED','ERROR','PENDING'],
    required: true,
    default: 'CREATED'
  },
  wompiTransactionId: {
    type: String,
    required: false,
  },
  updatedAt: {
    type: Date,
    required: false,
  },
  createdFromWebhook:{
    type: Boolean,
    required: false,
  },
  updatedFromFrontend:{
    type: Boolean,
    required: false,
  },
  createdFromFrontend:{
    type: Boolean,
    required: false,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);
