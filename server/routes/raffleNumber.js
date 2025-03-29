const express = require('express');
const router = express.Router();
const RaffleNumber = require("../models/RaffleNumber");
const Transaction = require("../models/Transaction");


  
  //  Obtener todos los números de una rifa específica
  router.get('/raffleNumber/:id', async (req, res) => {
    try {
      raffleId
      return await RaffleNumber.find({ raffleId }).populate("clientId ticketId transactionId");
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  function generarNumeroAleatorio() {
    return Math.floor(1000 + Math.random() * 9000);
  }

  //  Asignar un número de rifa a un ticket
  router.post('/raffleNumber', async (req, res) => {
    try {
      console.log("raffleNumber")
      const { raffleId, ticketId, clientId }= req.body;

      let number;
      let exists;

      //  1️⃣ Generar un número aleatorio hasta encontrar uno libre
      do {
        number = generarNumeroAleatorio(); // ⚠️ Ajusta el 1000 según el rango de tu rifa
        exists = await RaffleNumber.findOne({ number, raffleId });
      } while (exists); // Si el número ya está vendido, genera otro

      //  2️⃣ Guardar el número disponible
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

  // En routes/tickets.js (por ejemplo)

  router.get("/raffle-numbers/:reference", async (req, res) => {
    const { reference } = req.params;

    try {
      const transaction = await Transaction.findOne({ reference });

      if (!transaction) {
        return res.status(404).json({ message: "Transacción no encontrada" });
      }

      const raffleNumbers = await RaffleNumber.find({ ticketId: transaction.ticketId });

      res.json({ raffleNumbers });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener los raffle numbers" });
    }
  });

module.exports = router;


// Exportamos la instancia de la clase
module.exports = router;