import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Plus,
  Minus,
  X,
  Trash2,
  CreditCard,
  Clock
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const CartWidget = () => {
  const { items, total, itemCount, isEmpty, removeFromCart, updateQuantity, clearCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  const handleCheckout = () => {
    // Aquí iríamos a la página de checkout/pedido
    setIsOpen(false);
    // Navegar a página de pedidos
    window.location.href = '/realizar-pedido';
  };

  return (
    <>
      {/* Botón del carrito */}
      <div className="fixed bottom-6 right-6 z-40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all relative"
        >
          <ShoppingCart className="w-6 h-6" />
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-white text-orange-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              {itemCount}
            </span>
          )}
        </motion.button>
      </div>

      {/* Modal del carrito */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
            />

            {/* Carrito */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="w-6 h-6" />
                    <h2 className="text-xl font-bold">Tu Pedido</h2>
                    {itemCount > 0 && (
                      <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full text-sm">
                        {itemCount} {itemCount === 1 ? 'plato' : 'platos'}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Contenido */}
              <div className="flex-1 overflow-y-auto">
                {isEmpty ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6">
                    <ShoppingCart className="w-16 h-16 text-slate-300 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-600 mb-2">Tu carrito está vacío</h3>
                    <p className="text-slate-500 mb-4">Agrega deliciosos platos de nuestro menú</p>
                    <Link
                      to="/menu-restaurante"
                      onClick={() => setIsOpen(false)}
                      className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      Ver Menú
                    </Link>
                  </div>
                ) : (
                  <div className="p-4 space-y-4">
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white border border-slate-200 rounded-lg p-4"
                      >
                        <div className="flex gap-4">
                          {/* Imagen */}
                          {item.url_imagen_completa && (
                            <img
                              src={item.url_imagen_completa}
                              alt={item.nombre}
                              className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80';
                              }}
                            />
                          )}

                          {/* Detalles */}
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900">{item.nombre}</h4>
                            <p className="text-sm text-slate-500 mb-2">{item.categoria_display}</p>
                            
                            {/* Controles de cantidad */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="p-1 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="p-1 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>

                              <div className="flex items-center gap-3">
                                <span className="font-bold text-orange-600">
                                  ${(parseFloat(item.precio || 0) * item.quantity).toFixed(2)}
                                </span>
                                <button
                                  onClick={() => removeFromCart(item.id)}
                                  className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {!isEmpty && (
                <div className="border-t border-slate-200 p-6 space-y-4">
                  {/* Resumen */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>Subtotal</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>Envío</span>
                      <span className="text-green-600">Gratis</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t">
                      <span>Total</span>
                      <span className="text-orange-600">${total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="space-y-2">
                    <button
                      onClick={handleCheckout}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all font-medium flex items-center justify-center gap-2"
                    >
                      <CreditCard className="w-5 h-5" />
                      Realizar Pedido
                    </button>
                    
                    <button
                      onClick={() => setIsOpen(false)}
                      className="w-full bg-slate-100 text-slate-700 py-3 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                    >
                      Seguir Comprando
                    </button>

                    <button
                      onClick={clearCart}
                      className="w-full text-red-500 py-2 text-sm hover:text-red-600 transition-colors"
                    >
                      Vaciar Carrito
                    </button>
                  </div>

                  {/* Info adicional */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 text-center">
                    <Clock className="w-3 h-3" />
                    <span>Tiempo estimado de preparación: 20-30 minutos</span>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default CartWidget;
