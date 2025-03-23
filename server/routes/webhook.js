const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Transaction = require('../models/Transaction');
require('dotenv').config();


// Ruta del Webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {

  const signature = req.headers['x-event-checksum']; // Firma enviada por Wompi
  const secret = process.env.WOMPI_PRIVATE_EVENT_KEY; // Llave privada para validación
  console.log('🚨 Webhook recibido');
  console.log('📦 Raw body:', req.body.toString('utf8'));
  console.log('📫 Signature recibida:', signature);
  console.log('Headers:', req.headers);

  console.log('secret ', secret)
  try {

    const parsed = JSON.parse(req.body.toString('utf8'));
    const transaction = parsed.data?.transaction;
    const properties = [
      transaction.id,  // transaction.id
      transaction.status,               // transaction.status
      transaction.amount_in_cents                // transaction.amount_in_cents
    ];
    const isValid = generarChecksumWompi(properties, timestamp, secret); // Verificar firma

    if (!isValid) {
      console.error('Firma no válida para el webhook');
      return res.status(401).json({ error: 'Firma no válida' });
    }

    const event = JSON.parse(rawBody).event; // Extraer el evento del payload
    const transactionData = JSON.parse(rawBody).data;

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
function generarChecksumWompi(dataValues, timestamp, secret) {
  console.log("dataValues",dataValues);
  console.log("timestamp",timestamp);
  const cadena = dataValues.join('') + timestamp + secret;
  console.log("cadena",cadena);
  const hash = crypto.createHash('sha256').update(cadena).digest('hex').toUpperCase();
  return hash;
}

module.exports = router;
