const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Transaction = require('../models/Transaction');
require('dotenv').config();


// Ruta del Webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {

  const signature = req.headers['x-wompi-signature']; // Firma enviada por Wompi
  const secret = process.env.WOMPI_PRIVATE_EVENT_KEY; // Llave privada para validación
  console.log('🚨 Webhook recibido');
  console.log('Headers:', req.headers);
  console.log('🧪 Tipo de rawBody:', typeof rawBody); // Debería ser 'object' (Buffer)
  console.log('🧪 Es buffer?', Buffer.isBuffer(rawBody)); // Debería ser true
  console.log('secret ', secret)
  try {
    const rawBody = req.body; // Esto es un Buffer gracias a express.raw
    const isValid = verifySignature(rawBody, signature, secret); // Verificar firma

    if (!isValid) {
      console.error('Firma no válida para el webhook');
      return res.status(401).json({ error: 'Firma no válida' });
    }

    const event = JSON.parse(body).event; // Extraer el evento del payload
    const transactionData = JSON.parse(body).data;

    if (event === 'transaction.updated') {
      const transaction = transactionData.transaction;
      console.log('Transacción actualizada:', transaction);

      // Actualizar la base de datos con la transacción
      const updatedTransaction = await Transaction.findOneAndUpdate(
        { wompiTransactionId: transaction.id }, // Buscar por referencia de Wompi
        { status: transaction.status }, // Actualizar el estado del pago
        { new: true }
      );

      if (!updatedTransaction) {
        console.warn('No se encontró una transacción con esta referencia');
        return res.status(404).json({ error: 'Transacción no encontrada' });
      }

      console.log('Transacción actualizada en la base de datos:', updatedTransaction);
    }

    res.sendStatus(200); // Respuesta OK para Wompi
  } catch (error) {
    console.error('Error procesando el webhook:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Función para verificar la firma del webhook
function verifySignature(rawBody, signature, secret) {
  console.log('verifySignature')
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(rawBody);
  const calculatedSignature = hmac.digest('hex');
  return calculatedSignature === signature;
}

module.exports = router;
