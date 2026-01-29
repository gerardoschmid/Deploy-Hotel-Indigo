import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import { createReservation } from '../api/reservations';
import { Calendar, Clock, Users, CheckCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/axios';

const ReservationDetailPage = () => {
  const { habitacionId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [habitacion, setHabitacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [reservaId, setReservaId] = useState(null);

  const [formData, setFormData] = useState({
    fecha_checkin: '',
    fecha_checkout: '',
    huespedes: 1
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (habitacionId) {
      fetchHabitacion();
    }
  }, [habitacionId]);


  const fetchHabitacion = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/habitaciones/habitaciones/${habitacionId}/`);
      setHabitacion(response.data);
    } catch (error) {
      console.error('Error cargando habitación:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fecha_checkin) newErrors.fecha_checkin = 'Fecha de entrada requerida';
    if (!formData.fecha_checkout) newErrors.fecha_checkout = 'Fecha de salida requerida';
    
    if (formData.fecha_checkin && formData.fecha_checkout) {
      if (new Date(formData.fecha_checkin) >= new Date(formData.fecha_checkout)) {
        newErrors.fecha_checkout = 'La fecha de salida debe ser posterior a la entrada';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitReservation = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const reservaData = {
        habitacion: parseInt(habitacionId),
        fecha_checkin: formData.fecha_checkin,
        fecha_checkout: formData.fecha_checkout,
        huespedes: formData.huespedes,
      };
      
      const reservaResult = await createReservation(reservaData);
      setReservaId(reservaResult.id);
      setCurrentStep(3); // Ir directamente al paso final
      
    } catch (error) {
      console.error('Error creando reserva:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.non_field_errors?.[0] ||
                          error.response?.data?.habitacion?.[0] ||
                          'Error al crear la reserva. Por favor intente nuevamente.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  const calculateTotal = () => {
    if (!habitacion || !formData.fecha_checkin || !formData.fecha_checkout) return 0;
    
    const checkin = new Date(formData.fecha_checkin);
    const checkout = new Date(formData.fecha_checkout);
    const nights = Math.ceil((checkout - checkin) / (1000 * 60 * 60 * 24));
    
    return nights * parseFloat(habitacion.precio_base || 0);
  };

  const calculateNights = () => {
    if (!formData.fecha_checkin || !formData.fecha_checkout) return 0;
    
    const checkin = new Date(formData.fecha_checkin);
    const checkout = new Date(formData.fecha_checkout);
    return Math.ceil((checkout - checkin) / (1000 * 60 * 60 * 24));
  };


  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Inicia sesión para reservar</h2>
            <button
              onClick={() => navigate('/login')}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Cargando detalles...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!habitacion) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Habitación no encontrada</h2>
            <button
              onClick={() => navigate('/reservar')}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Volver a Reservar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/reservar')}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Reservar Habitación {habitacion.numero_habitacion}
              </h1>
              <p className="text-slate-600 mt-1">
                {habitacion.categoria.charAt(0).toUpperCase() + habitacion.categoria.slice(1)} - Piso {habitacion.piso}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulario */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              {/* Progress Bar */}
              <div className="flex items-center justify-between mb-8">
                {[1, 2].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      currentStep >= step ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {step}
                    </div>
                    {step < 2 && (
                      <div className={`flex-1 h-1 mx-4 ${
                        currentStep > step ? 'bg-primary' : 'bg-slate-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Formulario */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Detalles de la Reserva</h2>
                  
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Check-in *
                        </label>
                        <input
                          type="date"
                          name="fecha_checkin"
                          value={formData.fecha_checkin}
                          onChange={handleInputChange}
                          min={new Date().toISOString().split('T')[0]}
                          className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${
                            errors.fecha_checkin ? 'border-red-300' : 'border-slate-200'
                          }`}
                        />
                        {errors.fecha_checkin && (
                          <p className="text-red-600 text-sm mt-1">{errors.fecha_checkin}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Check-out *
                        </label>
                        <input
                          type="date"
                          name="fecha_checkout"
                          value={formData.fecha_checkout}
                          onChange={handleInputChange}
                          min={formData.fecha_checkin || new Date().toISOString().split('T')[0]}
                          className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${
                            errors.fecha_checkout ? 'border-red-300' : 'border-slate-200'
                          }`}
                        />
                        {errors.fecha_checkout && (
                          <p className="text-red-600 text-sm mt-1">{errors.fecha_checkout}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Número de Huéspedes
                      </label>
                      <select
                        name="huespedes"
                        value={formData.huespedes}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      >
                        {[1,2,3,4].map(num => (
                          <option key={num} value={num}>{num} {num === 1 ? 'Huésped' : 'Huéspedes'}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleSubmitReservation}
                    disabled={loading}
                    className="w-full bg-primary text-white py-4 rounded-xl hover:bg-primary/90 transition-colors font-medium mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Procesando...
                      </div>
                    ) : (
                      'Crear Reserva'
                    )}
                  </button>
                </motion.div>
              )}

              {/* Step 2: Confirmación */}
              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">¡Reserva Confirmada!</h2>
                  <div className="bg-slate-50 rounded-xl p-6 mb-6 text-left max-w-md mx-auto">
                    <h3 className="font-semibold text-slate-900 mb-4">Detalles de la Reserva</h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Habitación:</span>
                        <span className="font-medium text-slate-900">{habitacion.numero_habitacion}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-slate-600">Categoría:</span>
                        <span className="font-medium text-slate-900">
                          {habitacion.categoria.charAt(0).toUpperCase() + habitacion.categoria.slice(1)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-slate-600">Check-in:</span>
                        <span className="font-medium text-slate-900">
                          {new Date(formData.fecha_checkin).toLocaleDateString('es-ES', { 
                            weekday: 'short', 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-slate-600">Check-out:</span>
                        <span className="font-medium text-slate-900">
                          {new Date(formData.fecha_checkout).toLocaleDateString('es-ES', { 
                            weekday: 'short', 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-slate-600">Noches:</span>
                        <span className="font-medium text-slate-900">{calculateNights()}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-slate-600">Huéspedes:</span>
                        <span className="font-medium text-slate-900">{formData.huespedes}</span>
                      </div>
                      
                      <div className="border-t border-slate-200 pt-3 mt-3">
                        <div className="flex justify-between text-sm text-slate-500 mb-2">
                          <span>${parseFloat(habitacion.precio_base || 0).toFixed(2)} × {calculateNights()} noches</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold text-slate-900">Total a pagar:</span>
                          <span className="text-2xl font-bold text-primary">
                            ${calculateTotal().toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-slate-600 mb-8">
                    Tu reserva ha sido confirmada exitosamente. Hemos enviado los detalles completos a tu email.
                  </p>
                  
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => navigate('/mis-reservas')}
                      className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
                    >
                      Ver Mis Reservas
                    </button>
                    <button
                      onClick={() => navigate('/')}
                      className="bg-slate-100 text-slate-700 px-6 py-3 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                    >
                      Volver al Inicio
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Resumen */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Resumen de Reserva</h3>
              
              <div className="space-y-4">
                <div className="pb-4 border-b border-slate-100">
                  <h4 className="font-medium text-slate-900 mb-2">Habitación {habitacion.numero_habitacion}</h4>
                  <p className="text-sm text-slate-600">
                    {habitacion.categoria.charAt(0).toUpperCase() + habitacion.categoria.slice(1)} - Piso {habitacion.piso}
                  </p>
                  <p className="text-sm text-slate-600">Cama {habitacion.tamaño_cama}</p>
                </div>

                {formData.fecha_checkin && formData.fecha_checkout && (
                  <>
                    <div className="pb-4 border-b border-slate-100">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-600">Check-in:</span>
                        <span className="font-medium text-slate-900">
                          {new Date(formData.fecha_checkin).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-600">Check-out:</span>
                        <span className="font-medium text-slate-900">
                          {new Date(formData.fecha_checkout).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Noches:</span>
                        <span className="font-medium text-slate-900">{calculateNights()}</span>
                      </div>
                    </div>
                  </>
                )}

                <div className="pb-4 border-b border-slate-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Huéspedes:</span>
                    <span className="font-medium text-slate-900">{formData.huespedes}</span>
                  </div>
                </div>

                <div className="pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-600">Precio por noche:</span>
                    <span className="font-medium text-slate-900">
                      ${parseFloat(habitacion.precio_base || 0).toFixed(2)}
                    </span>
                  </div>
                  
                  {formData.fecha_checkin && formData.fecha_checkout && (
                    <div className="flex justify-between text-sm text-slate-500 mb-4">
                      <span>${parseFloat(habitacion.precio_base || 0).toFixed(2)} × {calculateNights()} noches</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                    <span className="text-lg font-semibold text-slate-900">Total a pagar:</span>
                    <span className="text-2xl font-bold text-primary">
                      ${calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationDetailPage;
