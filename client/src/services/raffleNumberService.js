import axios from 'axios';

const API_URL = 'https://que-chimba-moto-app-production.up.railway.app'; // URL base de la API de clientes

// Obetener el listado de raffles
export const createRaffleNumber = async (raffleNumber) => {
    try {
        const response = await axios.post(API_URL.concat("/raffleNumber"), raffleNumber);
        return response.data;
      } catch (error) {
        console.error("Error al asignar el número de rifa:", error);
        throw error;
      }
    };

// Actualizar el listado de raffles
export const updateRaffleNumberStatus = async (id, status, transactionId) => {
    try {
        const response = await axios.put(`${API_URL}/raffleNumber/${id}`, { status, transactionId });
        return response.data;
      } catch (error) {
        console.error("Error al actualizar el estado del número de rifa:", error);
        throw error;
      }
    }
  
  
export const getRaffleNumbers = async (raffleId)=> {
        try {
          const response = await axios.get(`${API_URL}/${raffleId}`);
          return response.data;
        } catch (error) {
          console.error("Error al obtener los números de la rifa:", error);
          throw error;
        }
    }
    
