import axios from 'axios';

const API_URL = 'https://que-chimba-moto-app-production.up.railway.app/ticket'; // URL base de la API de clientes

// Crear un nuevo ticket purchase
export const generateTicket = async (ticketPurchaseData) => {
    try {
      const response = await axios.post(API_URL.concat('/generate-ticket'), ticketPurchaseData);
      return response.data;
    } catch (error) {
      console.error("Error al crear el ticket Purchase:", error);
      throw error;
    }
  };