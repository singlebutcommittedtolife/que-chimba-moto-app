import axios from 'axios';

const API_URL = 'https://que-chimba-moto-app-production.up.railway.app/clients'; // URL base de la API de clientes

// Crear un nuevo cliente
export const createClient = async (clientData) => {
    try {
      const response = await axios.post(API_URL, clientData);
      return response.data;
    } catch (error) {
      console.error("Error al crear el cliente:", error);
      throw error;
    }
  };