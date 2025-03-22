const express = require('express');
const router = express.Router();
const TicketPurchase = require('../models/TicketPurchase');


// Obtener todas las compras de tickets
router.get('/', async (req, res) => {
    try {
      const ticketPurchases = await TicketPurchase.find();
      res.json(ticketPurchases);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  

// Crear una nueva compra de ticket
router.post('/', async (req, res) => {
    const { ticketNumber, raffleNumber, clientId, purchaseDate, purchaseStatus } = req.body;
    const ticketPurchase = new TicketPurchase({
      ticketNumber,
      raffleNumber,
      clientId,
      purchaseDate,
      purchaseStatus
    });
  
    try {
      const newTicketPurchase = await ticketPurchase.save();
      res.status(201).json(newTicketPurchase);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Eliminar una compra de ticket
router.delete('/:id', async (req, res) => {
    try {
      const ticketPurchase = await TicketPurchase.findByIdAndDelete(req.params.id);
      if (!ticketPurchase) return res.status(404).json({ message: 'Compra no encontrada' });
      res.json({ message: 'Compra eliminada con éxito' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Función para generar un número aleatorio de 4 dígitos
function generarNumeroAleatorio() {
  return Math.floor(1000 + Math.random() * 9000);
}


// Ruta para generar un ticket y guardarlo
router.post('/ticket/generate-ticket', async (req, res) => {
  try {
    const timestamp = Date.now();

    console.log("concat s "+req.body.clientId);
    let ticket = timestamp.toString() + req.body.clientId.toString();
    console.log("ticket ",ticket)

    // Crear y guardar la compra de ticket
    const newTicket = new TicketPurchase({
      ticketNumber:ticket,
      raffleId:req.body.raffleId,
      clientId: req.body.clientId, // Proporcionado en el cuerpo de la solicitud
      purchaseStatus: 'pendiente',
      purchaseDate: new Date()
    });
    console.log("newTicket ",newTicket)

    await newTicket.save();
    res.status(201).json(newTicket);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al generar el ticket', error });
  }
});
  
  module.exports = router;