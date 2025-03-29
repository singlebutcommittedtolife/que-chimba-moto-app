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
  
  module.exports = router;