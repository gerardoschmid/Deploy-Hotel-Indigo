import axios from 'axios';
import { API_BASE_URL } from '../config/api';

/**
 * Configuración de instancia de Axios.
 * Se aumenta el timeout a 30 segundos para evitar errores de conexión lenta.
 */
const api = axios.create({
    baseURL: API_BASE_URL,
    // Obligatorio para enviar cookies y manejar sesiones correctamente
    withCredentials: true, 
    headers: {
        'Content-Type': 'application/json',
    },
    // Tiempo de espera aumentado a 30 segundos
    timeout: 30000, 
});

// Interceptor de Solicitud: Añade el token JWT si existe en el almacenamiento local
api.interceptors.request.use(
    (config) => {
        const token = window.localStorage.getItem('token'); 
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Asegura que el Content-Type sea json si no está definido
        if (!config.headers['Content-Type']) {
            config.headers['Content-Type'] = 'application/json';
        }
        
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor de Respuesta: Maneja el refresco automático de tokens (401)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // Si el servidor responde 401 (No autorizado) y no es un reintento
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (refreshToken) {
                    // Petición directa a axios para evitar bucles infinitos en el interceptor
                    const response = await axios.post(`${API_BASE_URL}api/token/refresh/`, {
                        refresh: refreshToken
                    }, { withCredentials: true });
                    
                    const { access } = response.data;
                    localStorage.setItem('token', access);
                    
                    // Actualiza la cabecera y reintenta la petición original
                    originalRequest.headers.Authorization = `Bearer ${access}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Si el refresco falla (token expirado o inválido), limpia sesión y redirige
                localStorage.clear();
                window.location.href = '/login';
            }
        }
        
        // Retorna el error original si no es un 401 o el refresco falló
        return Promise.reject(error);
    }
);

export default api;