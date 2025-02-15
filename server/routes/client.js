const express = require('express');
const router = express.Router();
const Client = require('../models/Client');

// Ruta para crear un nuevo cliente
router.post('/api/clients', async (req, res) => {
    try {
      const newClient = new Client(req.body);
      await newClient.save();
      res.status(201).json(newClient);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al crear el cliente', error });
    }
  });

  module.exports = router;