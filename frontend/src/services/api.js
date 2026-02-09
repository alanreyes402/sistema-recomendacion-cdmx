import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Servicios de Vehículos
export const vehiculosAPI = {
  // Listar vehículos con filtros y paginación
  listar: async (params = {}) => {
    try {
      const response = await api.get('/api/vehiculos/', { params });
      return response.data;
    } catch (error) {
      console.error('Error al listar vehículos:', error);
      throw error;
    }
  },

  // Obtener un vehículo por ID
  obtenerPorId: async (id) => {
    try {
      const response = await api.get(`/api/vehiculos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener vehículo:', error);
      throw error;
    }
  },

  // Listar marcas
  listarMarcas: async () => {
    try {
      const response = await api.get('/api/vehiculos/marcas/listar');
      return response.data;
    } catch (error) {
      console.error('Error al listar marcas:', error);
      throw error;
    }
  },
};

// Servicios de Estadísticas
export const estadisticasAPI = {
  obtener: async () => {
    try {
      const response = await api.get('/api/estadisticas/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  },
};

export default api;