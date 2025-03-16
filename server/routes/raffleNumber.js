const express = require('express');
const router = express.Router();
const RaffleNumber = require("../models/RaffleNumber");

class RaffleNumberService {
  
  // 🔍 Obtener todos los números de una rifa específica
  async getRaffleNumbers(raffleId) {
    try {
      return await RaffleNumber.find({ raffleId }).populate("clientId ticketId transactionId");
    } catch (error) {
      throw new Error(`Error al obtener los números de la rifa: ${error.message}`);
    }
  }

  // 🎟️ Asignar un número de rifa a un ticket
  async createRaffleNumber({ raffleId, ticketId, clientId }) {
    try {
      let number;
      let exists;

      // 🔄 1️⃣ Generar un número aleatorio hasta encontrar uno libre
      do {
        number = Math.floor(Math.random() * 1000) + 1; // ⚠️ Ajusta el 1000 según el rango de tu rifa
        exists = await RaffleNumber.findOne({ number, raffleId });
      } while (exists); // Si el número ya está vendido, genera otro

      // ✅ 2️⃣ Guardar el número disponible
      const raffleNumber = new RaffleNumber({ number, raffleId, ticketId, clientId });
      return await raffleNumber.save();

    } catch (error) {
      throw new Error(`Error al asignar el número de rifa: ${error.message}`);
    }
  }



  // 🔄 Actualizar el estado de un número de rifa (ejemplo: marcarlo como pagado)
  async updateRaffleNumberStatus(id, { status, transactionId }) {
    try {
      const raffleNumber = await RaffleNumber.findByIdAndUpdate(
        id, 
        { status, transactionId },
        { new: true }
      );
      if (!raffleNumber) {
        throw new Error("Número de rifa no encontrado");
      }
      return raffleNumber;
    } catch (error) {
      throw new Error(`Error al actualizar el estado: ${error.message}`);
    }
  }
}

// Exportamos la instancia de la clase
module.exports = router;