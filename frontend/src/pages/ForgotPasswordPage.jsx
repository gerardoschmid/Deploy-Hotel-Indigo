import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowLeft, Loader2, CheckCircle, KeyRound, ShieldCheck } from 'lucide-react';
import api from '../api/axios';

const ForgotPasswordPage = () => {
    const [step, setStep] = useState(1); // 1: Pedir Email, 2: Verificar y Cambiar
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({ code: '', newPassword: '', confirmPassword: '' });
    const [sessionKey, setSessionKey] = useState(null);

    const handleSendCode = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            // Este endpoint debe generar el OTP y enviarlo por EmailJS
            const response = await api.post('/api/usuarios/password-reset/solicitar/', { email });
            setSessionKey(response.data.session_key_manual);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.error || 'No se encontró una cuenta con ese correo.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        setLoading(true);
        try {
            await api.post('/api/usuarios/password-reset/confirmar/', {
                email,
                code: formData.code,
                new_password: formData.newPassword,
                session_key_manual: sessionKey
            });
            setStep(3); // Éxito
        } catch (err) {
            setError(err.response?.data?.detail || 'Código incorrecto o expirado.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8"
            >
                <div className="mb-6">
                    <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary transition-colors group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Volver al login
                    </Link>
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                                    <KeyRound className="w-8 h-8 text-primary" />
                                </div>
                                <h1 className="text-2xl font-bold text-slate-900">¿Olvidaste tu contraseña?</h1>
                                <p className="text-slate-500 mt-2">Ingresa tu correo para recibir un código de verificación.</p>
                            </div>

                            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center gap-2"><Lock className="w-4 h-4"/>{error}</div>}

                            <form onSubmit={handleSendCode} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Correo Electrónico</label>
                                    <div className="relative mt-1">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20" placeholder="ejemplo@correo.com" />
                                    </div>
                                </div>
                                <button disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enviar Código'}
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                                    <ShieldCheck className="w-8 h-8 text-blue-600" />
                                </div>
                                <h1 className="text-2xl font-bold text-slate-900">Verifica tu identidad</h1>
                                <p className="text-slate-500 mt-2">Enviamos un código a <span className="font-bold">{email}</span></p>
                            </div>

                            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">{error}</div>}

                            <form onSubmit={handleResetPassword} className="space-y-4">
                                <input type="text" maxLength="6" required placeholder="000000" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-primary/20" 
                                    onChange={(e) => setFormData({...formData, code: e.target.value})} />
                                
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Nueva Contraseña</label>
                                    <input type="password" required className="w-full p-3 mt-1 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20" 
                                        onChange={(e) => setFormData({...formData, newPassword: e.target.value})} />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-slate-700">Confirmar Contraseña</label>
                                    <input type="password" required className="w-full p-3 mt-1 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20" 
                                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} />
                                </div>

                                <button disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl shadow-lg transition-all">
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Restablecer Contraseña'}
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-slate-900">¡Contraseña Cambiada!</h2>
                            <p className="text-slate-500 mt-2 mb-8">Tu contraseña ha sido actualizada con éxito. Ya puedes iniciar sesión.</p>
                            <Link to="/login" className="block w-full bg-slate-900 text-white font-semibold py-3 rounded-xl transition-all">Ir al Login</Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default ForgotPasswordPage;