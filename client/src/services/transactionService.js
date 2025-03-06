import axios from 'axios';

var API_URL = 'https://que-chimba-moto-app-production.up.railway.app/';

export const createTransaction = async ( transaction) => {
  try {
    const response = await axios.post(API_URL.concat("create-transaction"), transaction );

    return response.data; // Devuelve los datos de la transacción
  } catch (error) {
    console.error('Error en createTransaction:', error.response?.data || error.message);
    throw error.response?.data || error.message; // Lanza el error para manejarlo en el frontend
  }
};


export const updateTransaction = async (transactionReference, updatedTransaction) => { 
   try {
    const response = await axios.put(API_URL.concat("update-transaction/").concat(transactionReference),
       updatedTransaction);

    return response.data; // Devuelve los datos de la transacción
  } catch (error) {
    console.error('Error en updateTransaction:', error.response?.data || error.message);
    throw error.response?.data || error.message; // Lanza el error para manejarlo en el frontend
  }
};


export const validateTransactionOnServer = async (transactionId) => {
  try {
    console.log("validateTransactionOnServer 1"+transactionId)
    const response = await axios.post(`${API_URL}/status/${transactionId}`);
    return response.data;
  } catch (error) {
    console.error("Error al validar la transacción en Wompi:", error);
    throw error;
  }
};
