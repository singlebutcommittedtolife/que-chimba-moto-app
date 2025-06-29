const nodemailer = require('nodemailer');
require('dotenv').config();


const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey', // <- esto va así literal
    pass: process.env.SENDGRID_API_KEY,
  },
});

// ✅ Asegúrate de que la función sea `async`
const sendEmail = async (to, subject, text, html) => {
  
  console.log("🔑 API KEY (oculto parcialmente):", process.env.SENDGRID_API_KEY?.slice(0, 10) + "...");

  return new Promise((resolve, reject) => {
    const mailOptions = {
      from: `Que Chimba Moto 🏍️ <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      text,
      html,
      bcc: process.env.EMAIL_FROM, // te envías una copia oculta a ti mismo
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error enviando correo:', error);
        reject({ success: false, message: 'Error enviando el correo', error });
      } else {
        console.log('Correo enviado:', info.response);
        resolve({ success: true, message: 'Correo enviado con éxito' });
      }
    });
  });
};

module.exports = sendEmail;
