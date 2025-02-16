import axios from 'axios';

const API_URL = 'https://que-chimba-moto-app-production.up.railway.app'; // URL base de la API de clientes

// Obetener el listado de raffles
export const getRaffles = async () => {
    try {
      const response = await axios.get(API_URL.concat('/raffles'));
      return response.data;
    } catch (error) {
      console.error("Error al obtener la lista de rifas:", error);
      throw error;
    }
  };

  // Obetener la rifa activa
export const getActiveRaffle = async () => {
    try {
      const response = await axios.get(API_URL.concat('/raffles/:statusRaffle'));
      return response.data;
    } catch (error) {
      console.error("Error al obtener la rifa activa:", error);
      throw error;
    }
  };