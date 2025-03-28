import axios from 'axios';

const API_URL = 'https://que-chimba-moto-app-production.up.railway.app/email/send';

export const sendMail = async (emailInfo) => {
  try {
    const response = await axios.post(API_URL, emailInfo);

    return response.data; // Devuelve los datos de la transacción
  } catch (error) {
    console.error('Error en enviar correo:', error.response?.data || error.message);
    throw error.response?.data || error.message; // Lanza el error para manejarlo en el frontend
  }
};


