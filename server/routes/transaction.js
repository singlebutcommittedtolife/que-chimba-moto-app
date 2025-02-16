const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Transaction = require('../models/Transaction');
require('dotenv').config();
const axios = require('axios'); // Para Node.js

// Obtener todas las transacciones
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find();
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obtener una transacción por ID
router.get('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transacción no encontrada' });
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Crear una nueva transacción
router.post('/', async (req, res) => {
  const { clientId, raffleId, ticketId, amount, datePurchase, paymentMethod, statusPayment, wompiReference } = req.body;
  const transaction = new Transaction({
    clientId,
    raffleId,
    ticketId,
    amount,
    datePurchase,
    paymentMethod,
    statusPayment,
    wompiReference
  });

  try {
    const newTransaction = await transaction.save();
    res.status(201).json(newTransaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


// Ruta para crear transacciones
router.post('/create-transaction', async (req, res) => {
  const { totalAmount, customerEmail, paymentToken } = req.body;

  // Validaciones iniciales
  if (!totalAmount || !customerEmail || !paymentToken) {
    return res.status(400).json({
      error: true,
      message: 'Faltan parámetros obligatorios: totalAmount, customerEmail o paymentToken',
    });
  }

  // Endpoint de Wompi
  const endpoint = 'https://sandbox.wompi.co/v1/transactions';

  try {
    // Crear transacción en Wompi
    const response = await axios.post(
      endpoint,
      {
        amount_in_cents: totalAmount * 100, // Monto en centavos
        currency: 'COP', // Moneda
        customer_email: customerEmail, // Correo del cliente
        payment_method: {
          type: 'CARD',
          token: paymentToken, // Token generado en el frontend
          installments: 1, // Número de cuotas
        },
        reference: `transaction-${Date.now()}`, // Referencia única
        acceptance_token: await getAcceptanceToken(), // Obtener el acceptance_token
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_WOMPI_PRIVATE_KEY}`, // Llave privada desde variables de entorno
        },
      }
    );

    // Responder al frontend con los datos de la transacción
    res.status(200).json({
      success: true,
      data: response.data.data, // Los datos específicos de la transacción
    });
  } catch (error) {
    console.error('Error al crear la transacción:', error.response?.data || error.message);
    res.status(500).json({
      error: true,
      message: error.response?.data || 'Error inesperado creando la transacción',
    });
  }
});

router.post('/create-transaction/status/:transactionId', async (req, res) => {
  try {
    const response = await axios.get(`https://sandbox.wompi.co/v1/transactions/${req.params.transactionId}`, {
      headers: {
        Authorization: `Bearer prv_test_7osNFnqf1xHMiLYHDjWTIeitDoXOvl1j`, // Llave privada de Wompi
      },
    });

    const transaction = response.data.data;

    // Validar el estado de la transacción
    if (transaction.status === "APPROVED") {
      console.log("Transacción validada en el servidor:", transaction);
      res.status(200).json({
        success: true,
        data: transaction, // Los datos específicos de la transacción
      });
    } else {
      res.status(400).json({
        success: false,
        data: transaction, // Los datos específicos de la transacción
      });
    }
  } catch (error) {
    console.error('Error al validar la transacción en Wompi', error.response?.data || error.message);
    res.status(500).json({
      error: true,
      message: error.response?.data || 'Error al validar la transacción en Wompi',
    });
  }
});



// Función para obtener el acceptance_token
const getAcceptanceToken = async () => {
  const merchantEndpoint = 'https://sandbox.wompi.co/v1/merchants';

  try {
    const response = await axios.get(merchantEndpoint, {
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_WOMPI_API_KEY}`, // Llave privada
      },
    });

    return response.data.data.presigned_acceptance.acceptance_token;
  } catch (error) {
    console.error('Error obteniendo el acceptance_token:', error.response?.data || error.message);
    throw new Error('No se pudo obtener el acceptance_token');
  }
};



// Ruta del Webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['x-wompi-signature']; // Firma enviada por Wompi
  const secret = process.env.REACT_APP_WOMPI_PRIVATE_EVENT_KEY; // Llave privada para validación

  try {
    const body = req.body; // Payload enviado por Wompi
    const isValid = verifySignature(body, signature, secret); // Verificar firma

    if (!isValid) {
      console.error('Firma no válida para el webhook');
      return res.status(401).send('Firma no válida');
    }

    const event = JSON.parse(body).event; // Extraer el evento del payload
    const transactionData = JSON.parse(body).data;

    if (event === 'transaction.updated') {
      const transaction = transactionData.transaction;
      console.log('Transacción actualizada:', transaction);

      // Actualizar la base de datos con la transacción
      const updatedTransaction = await Transaction.findOneAndUpdate(
        { wompiReference: transaction.id }, // Buscar por referencia de Wompi
        { statusPayment: transaction.status }, // Actualizar el estado del pago
        { new: true }
      );

      if (!updatedTransaction) {
        console.warn('No se encontró una transacción con esta referencia');
        return res.status(404).send('Transacción no encontrada');
      }

      console.log('Transacción actualizada en la base de datos:', updatedTransaction);
    }

    res.sendStatus(200); // Respuesta OK para Wompi
  } catch (error) {
    console.error('Error procesando el webhook:', error);
    res.status(500).send('Error interno del servidor');
  }
});

// Función para verificar la firma del webhook
function verifySignature(body, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(body, 'utf8');
  const calculatedSignature = hmac.digest('hex');
  return calculatedSignature === signature;
}

module.exports = router;
