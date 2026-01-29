import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, Users, Mail, User as UserIcon, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios'; // Importamos tu instancia de axios configurada
import './ReservationForm.css'; // Asegúrate de tener tus estilos aquí

const ReservationForm = ({ habitacionId, onReservationComplete }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [habitacionData, setHabitacionData] = useState(null);
  const [otpTimer, setOtpTimer] = useState(0);
  const [reservaId, setReservaId] = useState(null);

  // Datos del formulario
  const [formData, setFormData] = useState({
    fecha_checkin: '',
    fecha_checkout: '',
    huespedes: 1,
    codigo_otp: ''
  });

  const [errors, setErrors] = useState({});

  // 1. Cargar datos de la habitación desde la API real
  useEffect(() => {
    if (habitacionId) {
      fetchHabitacionData();
    }
  }, [habitacionId]);

  // Timer para OTP
  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const fetchHabitacionData = async () => {
    try {
      // Usamos api.get en lugar de fetch para aprovechar la config base
      const response = await api.get(`/api/habitaciones/habitaciones/${habitacionId}/`);
      setHabitacionData(response.data);
    } catch (error) {
      console.error('Error cargando habitación:', error);
      setErrors(prev => ({ ...prev, general: 'No se pudo cargar la información de la habitación.' }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpiar error al escribir
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateStep1 = () => {
    const newErrors = {};
    const today = new Date().toISOString().split('T')[0];

    if (!formData.fecha_checkin) newErrors.fecha_checkin = 'Fecha de entrada requerida';
    if (!formData.fecha_checkout) newErrors.fecha_checkout = 'Fecha de salida requerida';
    
    if (formData.fecha_checkin < today) newErrors.fecha_checkin = 'La fecha no puede ser en el pasado';

    if (formData.fecha_checkin && formData.fecha_checkout) {
      if (new Date(formData.fecha_checkin) >= new Date(formData.fecha_checkout)) {
        newErrors.fecha_checkout = 'La salida debe ser posterior a la entrada';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- ACCIÓN: CREAR RESERVA (Backend) ---
  const handleSubmitReservation = async () => {
    if (!validateStep1()) return;
    
    if (!user) {
      alert('Debes iniciar sesión para hacer una reserva');
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    try {
      const payload = {
        habitacion: habitacionId,
        fecha_checkin: formData.fecha_checkin,
        fecha_checkout: formData.fecha_checkout,
        huespedes: parseInt(formData.huespedes),
        // El usuario se toma del token en el backend
      };
      
      const response = await api.post('/api/reservas-habitacion/', payload);
      
      setReservaId(response.data.id);
      setCurrentStep(2);
      setOtpTimer(90); // 1:30 min para expirar
      
    } catch (error) {
      console.error('Error creando reserva:', error);
      const errorData = error.response?.data || {};
      
      // Mapear errores de Django a nuestro estado
      if (errorData.fecha_checkin) setErrors(prev => ({...prev, fecha_checkin: errorData.fecha_checkin[0]}));
      else if (errorData.non_field_errors) alert(errorData.non_field_errors[0]); // Error general (ej: habitación ocupada)
      else alert('Error al procesar la reserva. Intenta nuevamente.');
      
    } finally {
      setLoading(false);
    }
  };

  // --- ACCIÓN: VERIFICAR OTP (Backend) ---
  const handleVerifyOTP = async () => {
    if (!formData.codigo_otp || formData.codigo_otp.length !== 6) {
      setErrors({ codigo_otp: 'El código debe tener 6 dígitos' });
      return;
    }
    
    setLoading(true);
    
    try {
      // Endpoint asumido: /api/reservas-habitacion/{id}/verificar_otp/
      await api.post(`/api/reservas-habitacion/${reservaId}/verificar_otp/`, {
        codigo_otp: formData.codigo_otp
      });
      
      setCurrentStep(3);
      if (onReservationComplete) {
        onReservationComplete();
      }
      
    } catch (error) {
      console.error('Error OTP:', error);
      const msg = error.response?.data?.error || 'Código incorrecto o expirado.';
      setErrors({ codigo_otp: msg });
    } finally {
      setLoading(false);
    }
  };

  // --- ACCIÓN: REENVIAR OTP (Backend) ---
  const handleResendOTP = async () => {
    if (otpTimer > 0) return;
    
    setLoading(true);
    try {
      await api.post(`/api/reservas-habitacion/${reservaId}/reenviar_otp/`);
      setOtpTimer(90);
      alert('Se ha enviado un nuevo código a tu correo.');
    } catch (error) {
      console.error('Error reenvío:', error);
      alert('No se pudo reenviar el código.');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!habitacionData || !formData.fecha_checkin || !formData.fecha_checkout) return 0;
    
    const checkin = new Date(formData.fecha_checkin);
    const checkout = new Date(formData.fecha_checkout);
    const diffTime = Math.abs(checkout - checkin);
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    if (nights <= 0) return 0;
    
    return nights * parseFloat(habitacionData.precio_base || 0);
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-md w-full mx-auto border border-slate-100">
      {/* Barra de progreso */}
      <div className="flex border-b border-slate-100">
        {[1, 2, 3].map((step) => (
          <div 
            key={step}
            className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider transition-colors ${
              currentStep >= step ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400'
            }`}
          >
            {step === 1 && 'Reserva'}
            {step === 2 && 'Verificación'}
            {step === 3 && 'Listo'}
          </div>
        ))}
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {/* Paso 1: Formulario de datos */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Reservar Estancia</h2>
                  <p className="text-sm text-slate-500">Selecciona tus fechas ideales</p>
                </div>
              </div>
              
              {/* Resumen Habitación */}
              {habitacionData && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center">
                      <div>
                          <p className="text-xs font-bold text-slate-400 uppercase">Habitación</p>
                          <p className="font-bold text-slate-900 text-lg">#{habitacionData.numero_habitacion}</p>
                      </div>
                      <div className="text-right">
                          <p className="text-xs font-bold text-slate-400 uppercase">Precio/Noche</p>
                          <p className="font-bold text-blue-600 text-lg">${parseFloat(habitacionData.precio_base).toFixed(2)}</p>
                      </div>
                  </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 uppercase">Check-in</label>
                        <input
                        type="date"
                        name="fecha_checkin"
                        value={formData.fecha_checkin}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full px-3 py-2 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.fecha_checkin ? 'border-red-500' : 'border-slate-200'}`}
                        />
                        {errors.fecha_checkin && <p className="text-xs text-red-500">{errors.fecha_checkin}</p>}
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 uppercase">Check-out</label>
                        <input
                        type="date"
                        name="fecha_checkout"
                        value={formData.fecha_checkout}
                        onChange={handleInputChange}
                        min={formData.fecha_checkin || new Date().toISOString().split('T')[0]}
                        className={`w-full px-3 py-2 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.fecha_checkout ? 'border-red-500' : 'border-slate-200'}`}
                        />
                        {errors.fecha_checkout && <p className="text-xs text-red-500">{errors.fecha_checkout}</p>}
                    </div>
                </div>
                
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase">Huéspedes</label>
                    <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                        <select
                            name="huespedes"
                            value={formData.huespedes}
                            onChange={handleInputChange}
                            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                        >
                            {[1,2,3,4].map(num => (
                            <option key={num} value={num}>{num} {num === 1 ? 'Persona' : 'Personas'}</option>
                            ))}
                        </select>
                    </div>
                </div>
              </div>

              {/* Total estimado */}
              {calculateTotal() > 0 && (
                <div className="pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center text-lg font-bold text-slate-900">
                        <span>Total Estimado:</span>
                        <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-slate-400 text-right mt-1">Impuestos incluidos</p>
                </div>
              )}

              <button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSubmitReservation}
                disabled={loading || !user}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmar y Recibir Código'}
              </button>
              
              {!user && (
                  <p className="text-xs text-center text-red-500 font-medium">
                      <AlertTriangle className="w-3 h-3 inline mr-1"/> Debes iniciar sesión para reservar
                  </p>
              )}
            </motion.div>
          )}

          {/* Paso 2: Verificación OTP */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 text-center"
            >
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              
              <div>
                <h2 className="text-xl font-bold text-slate-900">Verificación de Correo</h2>
                <p className="text-sm text-slate-500 mt-2">
                    Hemos enviado un código de 6 dígitos a 
                    <br/><span className="font-medium text-slate-900">{user?.email}</span>
                </p>
              </div>
              
              <div className="space-y-4">
                <input
                  type="text"
                  name="codigo_otp"
                  value={formData.codigo_otp}
                  onChange={handleInputChange}
                  maxLength="6"
                  placeholder="000000"
                  className={`w-full text-center text-3xl font-bold tracking-[0.5em] py-3 border-b-2 bg-transparent focus:outline-none ${errors.codigo_otp ? 'border-red-500 text-red-600' : 'border-slate-300 text-slate-800 focus:border-blue-600'}`}
                />
                {errors.codigo_otp && <p className="text-sm text-red-500 font-medium">{errors.codigo_otp}</p>}
              </div>
              
              <button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                onClick={handleVerifyOTP}
                disabled={loading}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verificar Código'}
              </button>
              
              <div className="text-sm">
                {otpTimer > 0 ? (
                  <p className="text-slate-400 flex items-center justify-center gap-1">
                    <Clock className="w-4 h-4" /> Reenviar en {formatTimer(otpTimer)}
                  </p>
                ) : (
                  <button 
                    className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                    onClick={handleResendOTP}
                    disabled={loading}
                  >
                    ¿No recibiste el código? Reenviar
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* Paso 3: Confirmación */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8 space-y-6"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-bounce-slow">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              
              <div>
                <h2 className="text-2xl font-black text-slate-900">¡Reserva Exitosa!</h2>
                <p className="text-slate-500 mt-2 max-w-xs mx-auto">
                    Tu habitación ha sido reservada correctamente. Hemos enviado el comprobante a tu correo.
                </p>
              </div>
              
              <div className="flex flex-col gap-3 pt-4">
                <button 
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-all"
                  onClick={() => window.location.href = '/mis-reservas'}
                >
                  Ver Mis Reservas
                </button>
                <button 
                  className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold py-3 rounded-xl transition-all"
                  onClick={() => window.location.href = '/'}
                >
                  Volver al Inicio
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ReservationForm;