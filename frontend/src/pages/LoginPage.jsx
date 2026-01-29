import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPage = ({ adminMode = false }) => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const title = adminMode ? 'Panel Administrativo' : 'Bienvenido de nuevo';
    const subtitle = adminMode ? 'Acceso reservado para personal capacitado' : 'Ingresa tus credenciales para acceder';

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await login(credentials);

            if (result.success) {
                // Mapeo dinámico de roles basado en los diferentes formatos que puede devolver el backend
                const userRole = result.role || (result.user && result.user.rol) || '';
                const isStaff = result.is_staff || (result.user && result.user.is_staff) || false;

                // Definición de roles con acceso administrativo
                const esAdmin = 
                    isStaff === true || 
                    isStaff === "true" ||
                    ['ADMINISTRADOR', 'admin', 'RECEPCIONISTA'].includes(userRole);

                if (esAdmin) {
                    navigate('/admin/dashboard', { replace: true });
                } else {
                    if (adminMode) {
                        setError('No tienes permisos de acceso administrativo.');
                        setIsLoading(false);
                        return;
                    }
                    navigate('/', { replace: true });
                }
            } else {
                const errorMsg = typeof result.error === 'object'
                    ? (result.error.detail || JSON.stringify(result.error))
                    : result.error;
                setError(errorMsg || 'Credenciales inválidas');
            }
        } catch (err) {
            setError('Error de conexión al intentar iniciar sesión.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8 relative"
            >
                <div className="mb-6">
                    <Link 
                        to="/" 
                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Volver al inicio
                    </Link>
                </div>

                <div className="text-center mb-8">
                    <div className={`inline-flex items-center justify-center w-16 h-16 ${adminMode ? 'bg-slate-100' : 'bg-primary/10'} rounded-full mb-4`}>
                        <LogIn className={`w-8 h-8 ${adminMode ? 'text-slate-900' : 'text-primary'}`} />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
                    <p className="text-slate-500 mt-2">{subtitle}</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Usuario o Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                name="username"
                                required
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="usuario o correo"
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="password"
                                name="password"
                                required
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="••••••••"
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end mt-1">
                        <Link to="/forgot-password" size="sm" className="text-xs font-bold text-primary hover:underline transition-all">
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full ${adminMode ? 'bg-slate-900 hover:bg-slate-800' : 'bg-primary hover:bg-primary/90'} text-white font-semibold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98]`}
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            'Ingresar al Sistema'
                        )}
                    </button>
                </form>

                {!adminMode && (
                    <div className="mt-8 text-center text-slate-600 text-sm">
                        ¿No tienes una cuenta?{' '}
                        <Link to="/register" className="text-primary font-bold hover:underline">
                            Regístrate aquí
                        </Link>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default LoginPage;