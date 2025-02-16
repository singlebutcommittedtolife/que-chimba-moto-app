import axios from 'axios';

const API_URL = 'https://que-chimba-moto-app-production.up.railway.app/create-transaction';

export const createTransaction = async ({ totalAmount, customerEmail, paymentToken }) => {
  try {
    const response = await axios.post(API_URL, {
      totalAmount,
      customerEmail,
      paymentToken,
    });

    return response.data; // Devuelve los datos de la transacción
  } catch (error) {
    console.error('Error en createTransaction:', error.response?.data || error.message);
    throw error.response?.data || error.message; // Lanza el error para manejarlo en el frontend
  }
};

export const validateTransactionOnServer = async (transactionId) => {
  try {
    const response = await axios.get(`${API_URL}/status/${transactionId}`);
    return response.data;
  } catch (error) {
    console.error("Error al validar la transacción en Wompi:", error);
    throw error;
  }
};
