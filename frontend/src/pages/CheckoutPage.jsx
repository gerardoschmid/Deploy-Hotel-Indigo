import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  CreditCard,
  MapPin,
  Clock,
  User,
  Phone,
  Mail,
  Home,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  DollarSign
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, total, isEmpty, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);

  // Form data para el pedido
  const [orderData, setOrderData] = useState({
    delivery_type: 'pickup', // pickup o delivery
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    delivery_address: '',
    notes: '',
    payment_method: 'cash' // cash o card
  });

  // Cargar datos del usuario si está logueado
  useEffect(() => {
    if (user) {
      setOrderData(prev => ({
        ...prev,
        customer_name: user.username || '',
        customer_email: user.email || ''
      }));
    }
  }, [user]);

  // Redirigir si el carrito está vacío
  useEffect(() => {
    if (isEmpty) {
      navigate('/menu-restaurante');
    }
  }, [isEmpty, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Preparar datos del pedido
      const orderItems = items.map(item => ({
        plato_id: item.id,
        nombre: item.nombre,
        precio: parseFloat(item.precio),
        cantidad: item.quantity,
        subtotal: parseFloat(item.precio) * item.quantity
      }));

      const orderPayload = {
        items: orderItems,
        total: total,
        delivery_type: orderData.delivery_type,
        customer_name: orderData.customer_name,
        customer_phone: orderData.customer_phone,
        customer_email: orderData.customer_email,
        delivery_address: orderData.delivery_address,
        notes: orderData.notes,
        payment_method: orderData.payment_method,
        estado: 'pendiente'
      };

      // Enviar pedido a la API
      const response = await api.post('/api/pedidos/pedidos/', orderPayload);
      
      if (response.status === 201) {
        setOrderId(response.data.id);
        setOrderPlaced(true);
        clearCart();
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error al realizar el pedido. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-slate-900 mb-4">¡Pedido Confirmado!</h1>
            <p className="text-lg text-slate-600 mb-6">
              Tu pedido #{orderId} ha sido recibido y está siendo preparado.
            </p>
            
            <div className="bg-slate-50 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-center gap-2 text-slate-700 mb-2">
                <Clock className="w-5 h-5" />
                <span className="font-medium">Tiempo estimado: 20-30 minutos</span>
              </div>
              <p className="text-slate-600">
                Te enviaremos una notificación cuando tu pedido esté listo.
              </p>
            </div>
            
            <div className="flex gap-4 justify-center">
              <Link
                to="/"
                className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium"
              >
                Volver al Inicio
              </Link>
              <Link
                to="/menu-restaurante"
                className="bg-slate-100 text-slate-700 px-6 py-3 rounded-lg hover:bg-slate-200 transition-colors font-medium"
              >
                Hacer Otro Pedido
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              to="/menu-restaurante"
              className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al Menú
            </Link>
            
            <h1 className="text-3xl font-bold text-slate-900">Realizar Pedido</h1>
            <p className="text-slate-600 mt-2">Revisa tu pedido y completa tus datos</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulario */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <h2 className="text-xl font-bold text-slate-900 mb-6">Información del Pedido</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Tipo de entrega */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">
                      Tipo de Entrega
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="relative">
                        <input
                          type="radio"
                          name="delivery_type"
                          value="pickup"
                          checked={orderData.delivery_type === 'pickup'}
                          onChange={(e) => setOrderData({ ...orderData, delivery_type: e.target.value })}
                          className="sr-only"
                        />
                        <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          orderData.delivery_type === 'pickup'
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}>
                          <div className="flex items-center gap-3">
                            <ShoppingCart className="w-5 h-5" />
                            <div>
                              <div className="font-medium">Recoger en Restaurante</div>
                              <div className="text-sm text-slate-500">Pasa a buscar tu pedido</div>
                            </div>
                          </div>
                        </div>
                      </label>

                      <label className="relative">
                        <input
                          type="radio"
                          name="delivery_type"
                          value="delivery"
                          checked={orderData.delivery_type === 'delivery'}
                          onChange={(e) => setOrderData({ ...orderData, delivery_type: e.target.value })}
                          className="sr-only"
                        />
                        <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          orderData.delivery_type === 'delivery'
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}>
                          <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5" />
                            <div>
                              <div className="font-medium">Delivery a Domicilio</div>
                              <div className="text-sm text-slate-500">Te lo llevamos donde estés</div>
                            </div>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Datos personales */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Nombre Completo *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                          type="text"
                          required
                          value={orderData.customer_name}
                          onChange={(e) => setOrderData({ ...orderData, customer_name: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="Juan Pérez"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Teléfono *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                          type="tel"
                          required
                          value={orderData.customer_phone}
                          onChange={(e) => setOrderData({ ...orderData, customer_phone: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="+1 234 567 890"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Correo Electrónico *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="email"
                        required
                        value={orderData.customer_email}
                        onChange={(e) => setOrderData({ ...orderData, customer_email: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="correo@ejemplo.com"
                      />
                    </div>
                  </div>

                  {/* Dirección de entrega (solo para delivery) */}
                  {orderData.delivery_type === 'delivery' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Dirección de Entrega *
                      </label>
                      <div className="relative">
                        <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                          type="text"
                          required={orderData.delivery_type === 'delivery'}
                          value={orderData.delivery_address}
                          onChange={(e) => setOrderData({ ...orderData, delivery_address: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="Calle Principal #123, Ciudad"
                        />
                      </div>
                    </div>
                  )}

                  {/* Notas */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Notas Adicionales
                    </label>
                    <textarea
                      value={orderData.notes}
                      onChange={(e) => setOrderData({ ...orderData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Instrucciones especiales, alergias, etc."
                    />
                  </div>

                  {/* Método de pago */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">
                      Método de Pago
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="relative">
                        <input
                          type="radio"
                          name="payment_method"
                          value="cash"
                          checked={orderData.payment_method === 'cash'}
                          onChange={(e) => setOrderData({ ...orderData, payment_method: e.target.value })}
                          className="sr-only"
                        />
                        <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          orderData.payment_method === 'cash'
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}>
                          <div className="flex items-center gap-3">
                            <DollarSign className="w-5 h-5" />
                            <div>
                              <div className="font-medium">Efectivo</div>
                              <div className="text-sm text-slate-500">Pagar al recibir</div>
                            </div>
                          </div>
                        </div>
                      </label>

                      <label className="relative">
                        <input
                          type="radio"
                          name="payment_method"
                          value="card"
                          checked={orderData.payment_method === 'card'}
                          onChange={(e) => setOrderData({ ...orderData, payment_method: e.target.value })}
                          className="sr-only"
                        />
                        <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          orderData.payment_method === 'card'
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}>
                          <div className="flex items-center gap-3">
                            <CreditCard className="w-5 h-5" />
                            <div>
                              <div className="font-medium">Tarjeta</div>
                              <div className="text-sm text-slate-500">Pagar con tarjeta</div>
                            </div>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Botón de submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Confirmar Pedido
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            </div>

            {/* Resumen del pedido */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-lg shadow-md p-6 sticky top-6"
              >
                <h2 className="text-xl font-bold text-slate-900 mb-4">Resumen del Pedido</h2>
                
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">{item.nombre}</div>
                        <div className="text-sm text-slate-500">x{item.quantity}</div>
                      </div>
                      <span className="font-medium text-orange-600">
                        ${(parseFloat(item.precio || 0) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Envío</span>
                    <span className="text-green-600">
                      {orderData.delivery_type === 'delivery' ? '$5.00' : 'Gratis'}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t">
                    <span>Total</span>
                    <span className="text-orange-600">
                      ${(total + (orderData.delivery_type === 'delivery' ? 5 : 0)).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2 text-orange-700 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>Tiempo estimado: 20-30 minutos</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
