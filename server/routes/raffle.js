const express = require('express');
const router = express.Router();
const Raffle = require('../models/Raffle');

// Obtener todas las rifas
router.get('/raffles', async (req, res) => {
    try {
      const raffles = await Raffle.find();
      res.json(raffles);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Obtener una rifa por ID
  router.get('/raffles/:statusRaffle', async (req, res) => {
    try {
      const raffle = await Raffle.findOne({ status: req.params.statusRaffle });
      if (!raffle) return res.status(404).json({ message: 'Rifa no encontrada' });
      res.json(raffle);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Crear una nueva rifa
  router.post('/raffles', async (req, res) => {
    const { nameRaffle, description, price, startDate, endDate, drawDate, totalNumberTickets, sellTickets, statusRaffle } = req.body;
    const raffle = new Raffle({
      nameRaffle,
      description,
      price,
      startDate,
      endDate,
      drawDate,
      totalNumberTickets,
      sellTickets,
      statusRaffle
    });
  
    try {
      const newRaffle = await raffle.save();
      res.status(201).json(newRaffle);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Actualizar una rifa existente
  router.put('/raffles/:id', async (req, res) => {
    try {
      const updatedRaffle = await Raffle.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedRaffle) return res.status(404).json({ message: 'Rifa no encontrada' });
      res.json(updatedRaffle);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Eliminar una rifa
  router.delete('/raffles/:id', async (req, res) => {
    try {
      const raffle = await Raffle.findByIdAndDelete(req.params.id);
      if (!raffle) return res.status(404).json({ message: 'Rifa no encontrada' });
      res.json({ message: 'Rifa eliminada con éxito' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });


  // POST /api/raffles/reserve-safe
router.post("/reserve-safe", async (req, res) => {
  const { raffleId, quantity } = req.body;

  if (!raffleId || !quantity) {
    return res.status(400).json({ message: "Faltan datos: raffleId o quantity" });
  }

  try {
    // Operación atómica: solo actualiza si hay suficientes tiquetes disponibles
    const updatedRaffle = await Raffle.findOneAndUpdate(
      {
        _id: raffleId,
        $expr: {
          $lte: [{ $add: ["$sellTickets", quantity] }, "$totalTickets"]
        }
      },
      {
        $inc: { sellTickets: quantity }
      },
      {
        new: true
      }
    );

    if (!updatedRaffle) {
      return res.status(400).json({ message: "No hay suficientes tiquetes disponibles" });
    }

    res.status(200).json({
      message: `Se reservaron ${quantity} tiquetes exitosamente`,
      sellTickets: updatedRaffle.sellTickets,
      available: updatedRaffle.totalTickets - updatedRaffle.sellTickets
    });

  } catch (error) {
    console.error("Error al reservar tiquetes:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

  
  module.exports = router;