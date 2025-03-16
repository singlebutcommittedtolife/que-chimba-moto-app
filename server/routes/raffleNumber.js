const express = require('express');
const router = express.Router();
const RaffleNumber = require("../models/RaffleNumber");


  
  // 🔍 Obtener todos los números de una rifa específica
  router.get('/ticket/generate-ticket', async (req, res) => {
    try {
      raffleId
      return await RaffleNumber.find({ raffleId }).populate("clientId ticketId transactionId");
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // 🎟️ Asignar un número de rifa a un ticket
  router.post('/ticket/generate-ticket', async (req, res) => {
    try {
      console.log("generate-ticket")
      const { raffleId, ticketId, clientId }= req.body;

      let number;
      let exists;

      // 🔄 1️⃣ Generar un número aleatorio hasta encontrar uno libre
      do {
        number = Math.floor(Math.random() * 1000) + 1; // ⚠️ Ajusta el 1000 según el rango de tu rifa
        exists = await RaffleNumber.findOne({ number, raffleId });
      } while (exists); // Si el número ya está vendido, genera otro

      // ✅ 2️⃣ Guardar el número disponible
      const raffleNumber = new RaffleNumber({ number, raffleId, ticketId, clientId });
      raffleNumber.save();
      res.status(201).json(raffleNumber);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });



  // 🔄 Actualizar el estado de un número de rifa (ejemplo: marcarlo como pagado)
  router.put('/raffleNumber', async (req, res) => {
    id, { status, transactionId }
    try {
      const raffleNumber = await RaffleNumber.findByIdAndUpdate(
        id, 
        { status, transactionId },
        { new: true }
      );
      if (!raffleNumber) {
        throw new Error("Número de rifa no encontrado");
      }
      res.status(201).json(raffleNumber);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });


// Exportamos la instancia de la clase
module.exports = router;