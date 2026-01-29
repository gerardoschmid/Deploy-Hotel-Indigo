import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Al cargar la app, verificamos si hay un token guardado
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const storedUser = JSON.parse(localStorage.getItem('user'));
                if (storedUser) {
                    setUser(storedUser);
                    console.log('Usuario restaurado:', storedUser);
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
                // Limpiar datos corruptos
                localStorage.removeItem('token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    // Función de Login
const login = async (credentials) => {
    try {
        const response = await api.post('/api/token/', credentials);
        
        // Extraemos access y refresh (lo que Simple JWT envía por defecto)
        const { access, refresh } = response.data;
        
        // Creamos un objeto de usuario seguro. 
        // Si el backend no envía 'user', usamos el username que el usuario escribió.
        const userData = response.data.user || { 
            username: credentials.username,
            rol: 'admin' // O el rol por defecto que necesites
        };

        // Guardamos con los nombres que axios.js espera
        localStorage.setItem('token', access);
        localStorage.setItem('refresh_token', refresh);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setUser(userData);
        return { success: true, role: userData.rol };
    } catch (error) {
        console.error('Error en login:', error.response?.data);
        return { success: false, error: error.response?.data?.detail || 'Error de sesión' };
    }
};

    // Función de Registro
    const register = async (userData) => {
        try {
            console.log('Registrando usuario:', userData);
            
            const response = await api.post('/api/auth/register/', userData);
            return { success: true };
        } catch (error) {
            console.error('Error en registro:', error);
            return { success: false, error: error.response?.data || 'Error en el registro' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
