const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Transaction = require('../models/Transaction');
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
  // Endpoint de Wompi
  console.log("create-transaction ",req.body)
  try {
    const newTransaction = new Transaction (req.body);
    await newTransaction.save();
    res.status(201).json(newTransaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Ruta para crear transacciones
router.put("/update-transaction/:reference", async (req, res) => {
  try {
    const { reference } = req.params;
    console.log("req.body "+req.body)

    const updateData = req.body;
    console.log("updateData "+updateData)
    // Buscar y actualizar la transacción en la base de datos
    const updatedTransaction = await Transaction.findOneAndUpdate(
      { reference }, // Buscar por referencia
      { $set: updateData }, // Actualizar con los nuevos datos
      { new: true } // Devolver la transacción actualizada
    );

    if (!updatedTransaction) {
      return res.status(404).json({ error: "Transacción no encontrada" });
    }

    res.json({ message: "Transacción actualizada", transaction: updatedTransaction });
  } catch (error) {
    console.error("Error al actualizar la transacción:", error);
    res.status(500).json({ error: "Error al actualizar la transacción", details: error });
  }
});


router.post('/create-transaction/status/:transactionId', async (req, res) => {
  try {
    console.log("Hola create-transaction/status");

    console.log("test 1 "+req.params.transactionId);
    console.log("test 2 "+process.env.REACT_APP_WOMPI_PRIVATE_KEY);

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
  console.log("varibale ",process.env);

  const signature = req.headers['x-wompi-signature']; // Firma enviada por Wompi
  const secret = process.env.WOMPI_PRIVATE_EVENT_KEY; // Llave privada para validación
  console.log('🚨 Webhook recibido');
  console.log('Headers:', req.headers);
  console.log('Raw body:', req.body.toString());
  console.log('secret ', secret)
  try {
    const body = req.body; // Payload enviado por Wompi
    const isValid = verifySignature(body, signature, secret); // Verificar firma

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
        { wompiReference: transaction.id }, // Buscar por referencia de Wompi
        { statusPayment: transaction.status }, // Actualizar el estado del pago
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
function verifySignature(body, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(body, 'utf8');
  const calculatedSignature = hmac.digest('hex');
  return calculatedSignature === signature;
}

module.exports = router;
