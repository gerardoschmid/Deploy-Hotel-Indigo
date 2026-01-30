import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UtensilsCrossed, X, Clock, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/axios';

// --- CONFIGURACIÓN DINÁMICA ---
const API_BASE_URL = 'https://hotel-reserva-test-production.up.railway.app';

const RestaurantSection = () => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDish, setSelectedDish] = useState(null);
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
      let platosData = Array.isArray(data) ? data : (data.platos || data.results || []);
      setDishes(platosData);
    } catch (error) {
      console.error('Error cargando platos:', error);
      setDishes([]);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (dish) => {
    if (!dish) return null;
    const path = dish.url_imagen_completa || dish.imagen || dish.url_imagen;
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const baseUrl = API_BASE_URL.replace(/\/+$/, '');
    const cleanPath = path.replace(/^\/+/, '');
    return `${baseUrl}/${cleanPath}`;
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDishes = dishes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(dishes.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    document.getElementById('restaurant-menu')?.scrollIntoView({ behavior: 'smooth' });
  };

  // --- COMPONENTE TARJETA ---
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
        <div className="h-48 sm:h-56 bg-slate-100 relative overflow-hidden flex-shrink-0">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={dish.nombre}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://placehold.co/600x400?text=Imagen+No+Disponible";
              }}
            />
          ) : (
            <div className="w-full h-full bg-slate-200 flex items-center justify-center">
              <UtensilsCrossed className="w-10 h-10 text-slate-300 opacity-50" />
            </div>
          )}
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 bg-white/90 backdrop-blur text-slate-800 text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm">
              {dish.categoria}
            </span>
          </div>
        </div>
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-2 gap-2">
            <h3 className="text-lg font-bold text-slate-900 line-clamp-1 group-hover:text-orange-600 transition-colors">{dish.nombre}</h3>
            <div className="flex items-center text-amber-400 flex-shrink-0">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="text-[11px] font-bold text-slate-600 ml-1">4.8</span>
            </div>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mb-4 line-clamp-2 leading-relaxed flex-1">
            {dish.descripcion || 'Una experiencia culinaria única preparada por nuestros chefs.'}
          </p>
          <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xl font-black text-slate-900">
              ${parseFloat(dish.precio || 0).toFixed(2)}
            </span>
            <span className="text-orange-600 font-bold text-xs">Ver más</span>
          </div>
        </div>
      </motion.div>
    );
  };

  // --- COMPONENTE MODAL (CORREGIDO RESPONSIVE) ---
  const DishModal = () => {
    if (!selectedDish) return null;
    const imageUrl = getImageUrl(selectedDish);

    return (
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
        onClick={() => setSelectedDish(null)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-[2rem] max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            onClick={() => setSelectedDish(null)} 
            className="absolute top-4 right-4 z-20 bg-white/90 hover:bg-white text-slate-900 p-2 rounded-full shadow-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col md:flex-row">
            {/* Imagen del Modal */}
            <div className="w-full md:w-1/2 h-64 md:h-auto bg-slate-100">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={selectedDish.nombre}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <UtensilsCrossed className="w-16 h-16 text-slate-300" />
                </div>
              )}
            </div>

            {/* Contenido del Modal */}
            <div className="p-6 sm:p-8 md:w-1/2 flex flex-col">
              <div className="mb-6 text-center md:text-left">
                <span className="text-orange-600 font-bold uppercase tracking-widest text-[10px] mb-2 block">{selectedDish.categoria}</span>
                <h3 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2 leading-tight">{selectedDish.nombre}</h3>
                <div className="text-2xl font-bold text-slate-900">${parseFloat(selectedDish.precio || 0).toFixed(2)}</div>
              </div>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6 text-center md:text-left">
                {selectedDish.descripcion || 'Disfruta de este delicioso plato preparado con los mejores ingredientes.'}
              </p>

              {selectedDish.ingredientes && (
                <div className="mb-6 text-center md:text-left">
                  <h4 className="font-bold text-slate-900 text-sm mb-3 uppercase tracking-tighter">Ingredientes</h4>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {selectedDish.ingredientes.split(',').map((ing, i) => (
                      <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold">
                        {ing.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* STATS: AQUÍ ESTABA EL ERROR DE DESBORDE */}
              <div className="mt-auto flex flex-col sm:flex-row gap-3">
                {selectedDish.tiempo_preparacion && (
                  <div className="flex-1 flex items-center gap-3 p-3 bg-orange-50 rounded-2xl border border-orange-100">
                    <div className="p-2 bg-white rounded-xl text-orange-500 shadow-sm flex-shrink-0"><Clock className="w-4 h-4"/></div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-orange-800 font-bold uppercase leading-none mb-1">Tiempo</p>
                      <p className="text-xs font-bold text-slate-700 truncate">{selectedDish.tiempo_preparacion} min</p>
                    </div>
                  </div>
                )}
                <div className="flex-1 flex items-center gap-3 p-3 bg-blue-50 rounded-2xl border border-blue-100">
                  <div className="p-2 bg-white rounded-xl text-blue-500 shadow-sm flex-shrink-0"><Star className="w-4 h-4"/></div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-blue-800 font-bold uppercase leading-none mb-1">Puntuaje</p>
                    <p className="text-xs font-bold text-slate-700 truncate">4.8 / 5.0</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  if (loading) return (
    <div className="py-32 flex flex-col items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-600"></div>
      <p className="mt-4 text-slate-400 text-xs font-bold uppercase tracking-widest">Cargando Menú...</p>
    </div>
  );

  return (
    <>
      <section id="restaurant-menu" className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Nuestra <span className="text-orange-600">Carta</span></h2>
            <p className="text-slate-500 text-sm sm:text-base">Sabores excepcionales seleccionados para ti.</p>
          </div>

          {dishes.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {currentDishes.map((dish) => (
                  <DishCard key={dish.id} dish={dish} />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center gap-2">
                  {/* Paginación simple adaptada */}
                  <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-3 bg-white rounded-full shadow-sm disabled:opacity-30"><ChevronLeft className="w-5 h-5"/></button>
                  <span className="text-sm font-bold text-slate-600 mx-4">Página {currentPage} de {totalPages}</span>
                  <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-3 bg-white rounded-full shadow-sm disabled:opacity-30"><ChevronRight className="w-5 h-5"/></button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
              <p className="text-slate-400">No hay platos disponibles por ahora.</p>
            </div>
          )}
        </div>
      </section>
      <AnimatePresence>{selectedDish && <DishModal />}</AnimatePresence>
    </>
  );
};

export default RestaurantSection;