/**
 * Configuración dinámica de la URL base para la API.
 * Corrige el error de duplicidad /api/api/ asegurando que la base sea solo el dominio raíz.
 */
const getApiBaseUrl = () => {
    // Detectamos el entorno de Vite (development o production)
    const isProduction = import.meta.env.MODE === 'production';

    if (isProduction) {
        /**
         * En producción, usamos la variable de entorno de Railway o el dominio raíz.
         * IMPORTANTE: No debe terminar en /api/ para evitar duplicados en las peticiones.
         */
        return import.meta.env.VITE_API_URL || 'https://deploy-hotel-indigo-production.up.railway.app/';
    }

    // URL para desarrollo local (Django corriendo en tu PC)
    return 'http://127.0.0.1:8000/';
};

// Exportamos la constante que usará axios.js
export const API_BASE_URL = getApiBaseUrl();

/**
 * Log de depuración para confirmar la conexión en la consola del navegador
 * (Solo se muestra si no estamos en producción)
 */
if (import.meta.env.MODE !== 'production') {
    console.log("🛠️ Modo:", import.meta.env.MODE);
    console.log("🔗 API Base URL configurada en:", API_BASE_URL);
}
