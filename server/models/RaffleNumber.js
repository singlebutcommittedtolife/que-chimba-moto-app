const mongoose = require("mongoose");

const raffleNumberSchema = new mongoose.Schema({
  number: {
    type: Number,
    required: true,
    unique: true // 🔥 Evita números duplicados en la rifa
  },
  raffleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Raffle",
    required: true
  },
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TicketPurchase",
    required: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: true
  },
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transaction",
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
