import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UtensilsCrossed, X, Clock, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/axios';

// --- CONFIGURACIÓN DE LA URL DE IMÁGENES ---
// Forzamos la URL de tu backend en Railway para que el frontend sepa dónde buscar las fotos. 
// Ajusta esta URL si cambian de hosting o dominio.
const API_BASE_URL = 'https://hotel-reserva-test-production.up.railway.app';

const RestaurantSection = () => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDish, setSelectedDish] = useState(null);

  // --- PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; 

  useEffect(() => {
    fetchDishes();
  }, []);

  const fetchDishes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/platos/platos/disponibles/');
      
      const data = response.data;
      let platosData = [];
      
      if (Array.isArray(data)) {
          platosData = data;
      } else if (data.platos && Array.isArray(data.platos)) {
          platosData = data.platos;
      } else if (data.results && Array.isArray(data.results)) {
          platosData = data.results;
      }

      setDishes(platosData);

    } catch (error) {
      console.error('Error cargando platos:', error);
      setDishes([]);
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA DE URL DE IMAGEN (OPTIMIZADA PARA RAILWAY) ---
  const getImageUrl = (dish) => {
      if (!dish) return null;

      // Intentamos obtener la ruta de cualquier campo posible que devuelva tu API
      const path = dish.url_imagen_completa || dish.imagen || dish.url_imagen;
      
      if (!path) return null;

      // Si la ruta ya es una URL completa (empieza con http), la devolvemos tal cual
      if (path.startsWith('http')) return path;
      
      // Si es una ruta relativa, limpiamos slashes y pegamos el dominio de Railway
      const baseUrl = API_BASE_URL.replace(/\/+$/, ''); 
      const cleanPath = path.replace(/^\/+/, '');
      
      return `${baseUrl}/${cleanPath}`;
  };

  // --- CÁLCULOS PAGINACIÓN ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDishes = dishes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(dishes.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    const element = document.getElementById('restaurant-menu');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  // --- TARJETA DE PLATO ---
  const DishCard = ({ dish }) => {
    const imageUrl = getImageUrl(dish);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ y: -5 }}
        className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer h-full flex flex-col border border-slate-100"
        onClick={() => setSelectedDish(dish)}
      >
        <div className="h-56 bg-slate-100 relative overflow-hidden flex-shrink-0">
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt={dish.nombre}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                        // FIX: Si la imagen falla (404), ponemos un placeholder en lugar de borrar el HTML
                        e.target.onerror = null; 
                        e.target.src = "https://placehold.co/600x400?text=Imagen+No+Disponible";
                    }}
                />
            ) : (
                <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                    <UtensilsCrossed className="w-10 h-10 text-slate-300 opacity-50" />
                </div>
            )}
            
            <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-white/90 backdrop-blur text-slate-800 text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm">
                    {dish.categoria}
                </span>
            </div>
        </div>
        
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-2">
             <h3 className="text-xl font-bold text-slate-900 line-clamp-1 group-hover:text-orange-600 transition-colors">{dish.nombre}</h3>
             <div className="flex text-amber-400">
                 <Star className="w-4 h-4 fill-current" />
                 <span className="text-xs font-bold text-slate-600 ml-1">4.8</span>
             </div>
          </div>
          
          <p className="text-slate-500 text-sm mb-4 line-clamp-2 leading-relaxed flex-1">
            {dish.descripcion || 'Una experiencia culinaria única preparada por nuestros chefs.'}
          </p>
          
          <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-2xl font-black text-slate-900">
                ${parseFloat(dish.precio || 0).toFixed(2)}
            </span>
            <button className="text-orange-600 font-bold text-sm hover:text-orange-700 transition-colors">
                Ver Detalles →
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  // --- MODAL DETALLE ---
  const DishModal = () => {
    if (!selectedDish) return null;
    const imageUrl = getImageUrl(selectedDish);

    return (
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={() => setSelectedDish(null)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            onClick={() => setSelectedDish(null)} 
            className="absolute top-4 right-4 z-20 bg-black/20 hover:bg-black/40 text-white backdrop-blur-md p-2 rounded-full transition-all duration-200"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="grid md:grid-cols-2">
            <div className="h-64 md:h-auto relative bg-slate-100">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={selectedDish.nombre}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://placehold.co/600x400?text=Imagen+No+Disponible";
                        }}
                    />
                ) : (
                    <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                         <UtensilsCrossed className="w-16 h-16 text-slate-300 opacity-50" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent md:hidden" />
            </div>

            <div className="p-8 flex flex-col h-full">
                <div className="mb-6">
                    <span className="text-orange-600 font-bold uppercase tracking-wider text-xs mb-2 block">{selectedDish.categoria}</span>
                    <h3 className="text-4xl font-black text-slate-900 mb-2 leading-tight">{selectedDish.nombre}</h3>
                    <div className="text-3xl font-bold text-slate-900">${parseFloat(selectedDish.precio || 0).toFixed(2)}</div>
                </div>

                <div className="prose prose-slate mb-8">
                    <p className="text-slate-600 text-lg leading-relaxed">
                        {selectedDish.descripcion || 'Disfruta de este delicioso plato preparado con los mejores ingredientes de la temporada.'}
                    </p>
                </div>

                {selectedDish.ingredientes && (
                    <div className="mb-8">
                        <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                            Ingredientes Principales
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {selectedDish.ingredientes.split(',').map((ing, i) => (
                                <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">
                                    {ing.trim()}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-auto grid grid-cols-2 gap-4">
                    {selectedDish.tiempo_preparacion && (
                        <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl border border-orange-100">
                            <div className="p-2 bg-white rounded-full text-orange-500 shadow-sm"><Clock className="w-5 h-5"/></div>
                            <div>
                                <p className="text-xs text-orange-800 font-bold uppercase">Tiempo</p>
                                <p className="text-sm font-medium text-slate-700">{selectedDish.tiempo_preparacion} min</p>
                            </div>
                        </div>
                    )}
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                         <div className="p-2 bg-white rounded-full text-blue-500 shadow-sm"><Star className="w-5 h-5"/></div>
                         <div>
                             <p className="text-xs text-blue-800 font-bold uppercase">Puntuaje</p>
                             <p className="text-sm font-medium text-slate-700">4.8 / 5.0</p>
                         </div>
                    </div>
                </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  if (loading) {
    return (
      <section className="py-24 bg-slate-50 min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-600 mx-auto mb-6"></div>
          <p className="text-slate-400 font-medium tracking-wide uppercase text-sm">Cargando nuestra carta...</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="restaurant-menu" className="py-24 bg-slate-50">
        <div className="container mx-auto px-6 lg:px-12">
          
          {/* Header */}
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 mb-6 bg-white px-4 py-1.5 rounded-full border border-slate-200 shadow-sm"
            >
              <UtensilsCrossed className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-widest">Nuestra Carta</span>
            </motion.div>
            
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
              Sabores que <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">Despiertan</span> tus Sentidos
            </h2>
            <p className="text-lg text-slate-500 leading-relaxed">
              Explora una selección cuidada de platos locales e internacionales, preparados al momento para brindarte una experiencia inolvidable.
            </p>
          </div>

          {/* Grid */}
          {dishes.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                {currentDishes.map((dish) => (
                  <DishCard key={dish.id} dish={dish} />
                ))}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="mt-20 flex justify-center items-center gap-2">
                  <button
                    className="flex items-center justify-center w-12 h-12 rounded-full border border-slate-200 bg-white text-slate-600 hover:border-orange-500 hover:text-orange-600 transition-all disabled:opacity-50 disabled:hover:border-slate-200"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <div className="flex gap-2 mx-4">
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                        key={i + 1}
                        className={`w-12 h-12 rounded-full font-bold transition-all ${
                            currentPage === i + 1 
                            ? "bg-orange-600 text-white shadow-lg shadow-orange-600/30 scale-110" 
                            : "bg-white border border-slate-200 text-slate-500 hover:border-orange-400 hover:text-orange-600"
                        }`}
                        onClick={() => handlePageChange(i + 1)}
                        >
                        {i + 1}
                        </button>
                    ))}
                  </div>

                  <button
                    className="flex items-center justify-center w-12 h-12 rounded-full border border-slate-200 bg-white text-slate-600 hover:border-orange-500 hover:text-orange-600 transition-all disabled:opacity-50 disabled:hover:border-slate-200"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200">
              <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                 <UtensilsCrossed className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Menú no disponible</h3>
              <p className="text-slate-500 max-w-sm mx-auto">Estamos actualizando nuestra carta. Por favor vuelve a intentarlo más tarde.</p>
            </div>
          )}
        </div>
      </section>
      
      <AnimatePresence>
        {selectedDish && <DishModal />}
      </AnimatePresence>
    </>
  );
};

export default RestaurantSection;