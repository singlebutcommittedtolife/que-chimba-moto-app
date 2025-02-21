const express = require('express');
const sendEmail = require('../services/emailService'); // Asegúrate de que la ruta sea correcta
const router = express.Router();

router.post('/email/send', async (req, res) => {
  try {
    const { to, subject, text, html } = req.body;

    if (!to || !subject || (!text && !html)) {
      return res.status(400).json({ success: false, message: 'Faltan datos requeridos' });
    }

    // ✅ Llamar a la función correctamente con `await`
    const result = await sendEmail(to, subject, text, html);

    res.json(result);
  } catch (error) {
    console.error('Error en el endpoint de correo:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

module.exports = router;
