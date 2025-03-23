const mongoose = require("mongoose");

const raffleNumberSchema = new mongoose.Schema({
  number: {
    type: Number,
    required: true,
    unique: true // Evita números duplicados en la rifa
  },
  raffleId: {
    type: String,
    required: true
  },
  ticketId: {
    type: String,
    required: true
  },
  clientId: {
    type: String,
    required: true
  },
  transactionId: {
    type: String,
    required: false // Si aún no se ha pagado, puede ser null
  },
  status: {
    type: String,
    enum: ["pending", "paid", "canceled"],
    default: "pending" // Inicialmente está "pendiente" hasta que se confirme el pago
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Exportar modelo
module.exports = mongoose.model("RaffleNumber", raffleNumberSchema);
