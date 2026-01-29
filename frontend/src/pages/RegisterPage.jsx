import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, AlertCircle, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react'; // <--- Agregamos ArrowLeft
import { motion } from 'framer-motion';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '', 
        first_name: '',
        last_name: ''
    });
    
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // --- LÓGICA DE VALIDACIÓN LOCAL (Formato) ---
    const validateForm = () => {
        const errors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/; 

        if (!nameRegex.test(formData.first_name)) errors.first_name = "El nombre solo puede contener letras.";
        if (!nameRegex.test(formData.last_name)) errors.last_name = "El apellido solo puede contener letras.";
        if (!emailRegex.test(formData.email)) errors.email = "Ingresa un correo válido (ej: usuario@dominio.com).";
        if (formData.password.length < 8) errors.password = "La contraseña debe tener al menos 8 caracteres.";
        if (formData.password !== formData.confirmPassword) errors.confirmPassword = "Las contraseñas no coinciden.";

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setFieldErrors({}); 
        
        if (!validateForm()) return;

        setIsLoading(true);

        const { confirmPassword, ...dataToSend } = formData;

        const result = await register(dataToSend);

        if (result.success) {
            setIsSuccess(true);
            setTimeout(() => navigate('/login'), 2000);
        } else {
            console.error('Error en registro:', result.error);
            
            let serverErrors = {};
            let generalMsg = '';

            if (typeof result.error === 'object') {
                if (result.error.email) {
                    const msg = Array.isArray(result.error.email) ? result.error.email[0] : result.error.email;
                    serverErrors.email = "Este correo electrónico ya está registrado.";
                }
                if (result.error.username) {
                    const msg = Array.isArray(result.error.username) ? result.error.username[0] : result.error.username;
                    serverErrors.username = "Este nombre de usuario ya está en uso.";
                }
                if (result.error.password) serverErrors.password = result.error.password[0];
                if (result.error.first_name) serverErrors.first_name = result.error.first_name[0];
                if (result.error.last_name) serverErrors.last_name = result.error.last_name[0];

                if (Object.keys(serverErrors).length === 0) {
                    generalMsg = result.error.detail || "Error al registrar. Intente nuevamente.";
                } else {
                    generalMsg = "Por favor corrige los errores marcados.";
                }
            } else {
                generalMsg = result.error || "Error de conexión con el servidor.";
            }
            
            setFieldErrors(serverErrors); 
            setError(generalMsg);         
        }
        setIsLoading(false);
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-sm"
                >
                    <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-900">¡Registro exitoso!</h2>
                    <p className="text-slate-500 mt-2">Redirigiéndote al login...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 p-8"
            >
                {/* --- BOTÓN NUEVO: VOLVER AL INICIO --- */}
                <div className="mb-6">
                    <Link 
                        to="/" 
                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Volver al inicio
                    </Link>
                </div>
                {/* -------------------------------------- */}

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                        <UserPlus className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">Crea tu cuenta</h1>
                    <p className="text-slate-500 mt-2">Únete a la experiencia de lujo en Hotel Indigo</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    {/* NOMBRE */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Nombre</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                name="first_name"
                                required
                                className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none ${fieldErrors.first_name ? 'border-red-500 focus:ring-red-200' : 'border-slate-200'}`}
                                placeholder="Juan"
                                onChange={handleChange}
                            />
                        </div>
                        {fieldErrors.first_name && <p className="text-xs text-red-500 mt-1">{fieldErrors.first_name}</p>}
                    </div>

                    {/* APELLIDO */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Apellido</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                name="last_name"
                                required
                                className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none ${fieldErrors.last_name ? 'border-red-500 focus:ring-red-200' : 'border-slate-200'}`}
                                placeholder="Pérez"
                                onChange={handleChange}
                            />
                        </div>
                        {fieldErrors.last_name && <p className="text-xs text-red-500 mt-1">{fieldErrors.last_name}</p>}
                    </div>

                    {/* USUARIO */}
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-slate-700">Nombre de Usuario</label>
                        <input
                            type="text"
                            name="username"
                            required
                            className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none ${fieldErrors.username ? 'border-red-500 focus:ring-red-200' : 'border-slate-200'}`}
                            placeholder="juanperez123"
                            onChange={handleChange}
                        />
                        {fieldErrors.username && <p className="text-xs text-red-500 mt-1">{fieldErrors.username}</p>}
                    </div>

                    {/* EMAIL */}
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-slate-700">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="email"
                                name="email"
                                required
                                className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none ${fieldErrors.email ? 'border-red-500 focus:ring-red-200' : 'border-slate-200'}`}
                                placeholder="juan@ejemplo.com"
                                onChange={handleChange}
                            />
                        </div>
                        {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
                    </div>

                    {/* CONTRASEÑA */}
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-slate-700">Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="password"
                                name="password"
                                required
                                className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none ${fieldErrors.password ? 'border-red-500 focus:ring-red-200' : 'border-slate-200'}`}
                                placeholder="••••••••"
                                onChange={handleChange}
                            />
                        </div>
                        {fieldErrors.password && <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>}
                    </div>

                    {/* CONFIRMAR CONTRASEÑA */}
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-slate-700">Confirmar Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="password"
                                name="confirmPassword"
                                required
                                className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none ${fieldErrors.confirmPassword ? 'border-red-500 focus:ring-red-200' : 'border-slate-200'}`}
                                placeholder="••••••••"
                                onChange={handleChange}
                            />
                        </div>
                        {fieldErrors.confirmPassword && <p className="text-xs text-red-500 mt-1">{fieldErrors.confirmPassword}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="md:col-span-2 w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 mt-4"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            'Crear Cuenta'
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center text-slate-600 text-sm">
                    ¿Ya tienes cuenta?{' '}
                    <Link to="/login" className="text-primary font-bold hover:underline">
                        Inicia sesión
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default RegisterPage;