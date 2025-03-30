const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Transaction = require('../models/Transaction');
require('dotenv').config();
const axios = require('axios');

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
    console.log('transaction 1******************',transaction);

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
      if (tx.status === 'APPROVED') {
      
        console.log("tx.reference",tx.reference)
       const assignedNumbers=await axios.get(`https://que-chimba-moto-app-production.up.railway.app/raffle-numbers/${tx.reference}`);
       
       console.log("assignedNumbers ", assignedNumbers)
       const raffleSafe={
        raffleId: assignedNumbers[0]?.raffleId,
        quantity: assignedNumbers.length
       }
       console.log("raffleSafe ", raffleSafe)

       await axios.post(`https://que-chimba-moto-app-production.up.railway.app/reserve-safe`,raffleSafe);

        console.log('transaction 2******************',transaction);
        try {
          const emailInfo=({
            to:transaction.customer_email,
            subject: "Confirmación de pago - Que Chimba Moto 🏍️",
            text: `Hola, tu pago ha sido procesado correctamente.`,
            html: `
            <h1>¡Hola, tu pago ha sido procesado correctamente!</h1>
      
            <strong><p>Detalles de la transacción en Que Chimba de Moto:</p></strong>
            <ul>
              <li><strong>📧 Email:</strong> ${transaction.customer_email}</li>
              <li><strong>🧾 Nº de Referencia:</strong> ${transaction?.reference}</li>
              <li><strong>💳 Método de pago:</strong> ${transaction?.payment_method?.type}</li>
              <li><strong>💰 Monto Total:</strong> ${(transaction.amount_in_cents / 100).toLocaleString("es-CO", { style: "currency", currency: "COP" })} COP</li>
              <li><strong>🕒 Fecha:</strong> ${new Date(transaction.created_at).toLocaleString("es-CO")}</li>
              <li><strong>🎟️ Tus boletas:</strong>
                <ul>
                  ${assignedNumbers.map((r) => `<li>🎫 ${r.number}</li>`).join("")}
                </ul>
              </li>
              </ul>
             <strong><p>Gracias por tu compra en <strong>Que Chimba de Moto</strong> 🏍️</p></strong>
          `,
          });


          await axios.post('https://que-chimba-moto-app-production.up.railway.app/email/send', emailInfo);
          console.log('Correo de confirmación enviado con éxito');
        } catch (emailError) {
          console.error('Error al enviar el correo de confirmación:', emailError);
        }
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
  const hash = crypto.createHash('sha256').update(cadena).digest('hex');
  return hash;
}

module.exports = router;
