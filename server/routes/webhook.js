const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Transaction = require('../models/Transaction');
require('dotenv').config();


router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['x-event-checksum'];
  const secret = process.env.WOMPI_PRIVATE_EVENT_KEY;

  console.log(' Webhook recibido');
  console.log(' Signature:', signature);
  console.log(' Raw body:', req.body.toString('utf8'));

  try {
    const parsed = JSON.parse(req.body.toString('utf8'));
    const transaction = parsed.data?.transaction;
    const properties = parsed.signature?.properties || [];
    const timestamp = parsed.timestamp;

    //  Construir string para firma basada en propiedades
    const dataValues = properties.map((prop) => {
      const keys = prop.split('.');
      return keys.reduce((acc, key) => acc?.[key], parsed.data);
    });

    const localChecksum = generarChecksumWompi(dataValues, timestamp, secret);

    console.log(' Checksum local:', localChecksum);
    console.log(' Checksum recibido:', signature);

    if (localChecksum !== signature) {
      console.error(' Firma no válida');
      return res.status(401).json({ error: 'Firma no válida' });
    }

    if (parsed.event === 'transaction.updated') {
      const tx = transaction;
      console.log(' Transacción del evento:', tx);

      const updatedTransaction = await Transaction.findOneAndUpdate(
        { reference: tx.reference }, // Buscar por `reference` generado en frontend
        {
          $set: {
            status: tx.status,
            wompiTransactionId: tx.id,
            updatedAt: new Date(),
            updatedFromWebhook: true,
          },
        },
        { new: true }
      );

      if (!updatedTransaction) {
        // No existe, creamos nueva transacción
        console.warn(' Transacción no encontrada, creando nueva...');
        await Transaction.create({
          reference: tx.reference,
          wompiTransactionId: tx.id,
          amount: tx.amount_in_cents,
          currency: tx.currency,
          status: tx.status,
          createdAt: new Date(tx.created_at),
          createdFromWebhook: true,
        });
      } else {
        console.log(' Transacción actualizada desde webhook');
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error(' Error procesando webhook:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

//  Función para generar el checksum de Wompi
function generarChecksumWompi(dataValues, timestamp, secret) {
  const cadena = dataValues.join('') + timestamp + secret;
  console.log('🔐 Cadena para firmar:', cadena);
  const hash = crypto.createHash('sha256').update(cadena).digest('hex').toUpperCase();
  return hash;
}

module.exports = router;
