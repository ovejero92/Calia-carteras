import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 404) console.error('Recurso no encontrado');
    else if (error.response?.status === 500) console.error('Error del servidor');
    else if (error.code === 'NETWORK_ERROR') console.error('Error de conexión');
    return Promise.reject(error);
  }
);

export default api;