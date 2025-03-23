const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Asegúrate de que la función sea `async`
const sendEmail = async (to, subject, text, html) => {
  return new Promise((resolve, reject) => {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html,
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
