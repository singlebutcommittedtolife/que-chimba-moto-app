const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Transaction = require('../models/Transaction');
require('dotenv').config();


// Webhook Wompi
router.post('/webhook', express.json(), async (req, res) => {
  const secret = process.env.WOMPI_PRIVATE_EVENT_KEY;
  const wompiChecksum = req.headers['x-event-checksum'];

  console.log('🚨 Webhook recibido');
  console.log('🔑 Secreto:', secret);
  console.log('📬 Firma enviada por Wompi (x-event-checksum):', wompiChecksum);

  try {
    const parsed = req.body;
    const transaction = parsed.data?.transaction;
    const properties = parsed.signature?.properties;

    // Validación de firma basada en las propiedades específicas
    const dataToSign = properties
      .map((prop) => {
        const path = prop.split('.');
        return path.reduce((obj, key) => obj?.[key], parsed.data);
      })
      .join('');

    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(dataToSign);
    const localChecksum = hmac.digest('hex');

    console.log('🧮 Data firmada:', dataToSign);
    console.log('✅ Checksum local:', localChecksum);

    if (wompiChecksum !== localChecksum) {
      console.error('❌ Firma inválida: no coincide el checksum');
      return res.status(401).json({ error: 'Firma no válida' });
    }

    if (parsed.event === 'transaction.updated') {
      console.log('✅ Evento: transaction.updated');
      console.log('📦 Transacción:', transaction);

      const updatedTransaction = await Transaction.findOneAndUpdate(
        { wompiTransactionId: transaction.id },
        { status: transaction.status },
        { new: true }
      );

      if (!updatedTransaction) {
        console.warn('⚠️ No se encontró la transacción');
        return res.status(404).json({ error: 'Transacción no encontrada' });
      }

      console.log('✅ Transacción actualizada en DB:', updatedTransaction);

      // Aquí puedes enviar el correo si el status es "APPROVED"
      if (transaction.status === 'APPROVED') {
        // await enviarCorreo(transaction.customer_email, ...);
        console.log('📧 Correo de confirmación enviado');
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('💥 Error procesando el webhook:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;