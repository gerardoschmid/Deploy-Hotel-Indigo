import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UtensilsCrossed,
  Clock,
  DollarSign,
  Filter,
  Search,
  AlertCircle,
  Star,
  ChevronDown,
  Plus,
  ShoppingCart
} from 'lucide-react';

import api from '../api/axios';
import { useCart } from '../context/CartContext';

const RestaurantMenu = () => {
  const [menuData, setMenuData] = useState({});
  const [allDishes, setAllDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const { addToCart } = useCart();

  // Categorías disponibles
  const categories = [
    { value: 'all', label: 'Todos los Platos', icon: '🍽️' },
    { value: 'entrada', label: 'Entradas', icon: '🥗' },
    { value: 'principal', label: 'Platos Principales', icon: '🍖' },
    { value: 'postre', label: 'Postres', icon: '🍰' },
    { value: 'bebida', label: 'Bebidas', icon: '🥤' },
    { value: 'aperitivo', label: 'Aperitivos', icon: '🥟' },
    { value: 'ensalada', label: 'Ensaladas', icon: '🥬' },
    { value: 'sopa', label: 'Sopas', icon: '🍲' },
    { value: 'guarnicion', label: 'Guarniciones', icon: '🍟' }
  ];

  useEffect(() => {
    fetchMenuData();
  }, []);

  const fetchMenuData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/platos/platos/por_categoria/');
      setMenuData(response.data.categorias || {});
      
      // También obtener todos los platos para filtros
      const allResponse = await api.get('/api/platos/platos/disponibles/');
      setAllDishes(allResponse.data.platos || []);
    } catch (error) {
      console.error('Error cargando menú:', error);
      setMenuData({});
      setAllDishes([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredDishes = allDishes.filter(dish => {
    const matchesCategory = selectedCategory === 'all' || dish.categoria === selectedCategory;
    const matchesSearch = dish.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dish.descripcion && dish.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPrice = priceRange === 'all' ||
      (priceRange === 'low' && dish.precio < 10) ||
      (priceRange === 'medium' && dish.precio >= 10 && dish.precio < 25) ||
      (priceRange === 'high' && dish.precio >= 25);

    return matchesCategory && matchesSearch && matchesPrice;
  });

  const toggleCategory = (category) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const DishCard = ({ dish }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      {dish.url_imagen_completa && (
        <div className="h-48 bg-gradient-to-br from-orange-100 to-red-100 relative overflow-hidden">
          <img
            src={dish.url_imagen_completa}
            alt={dish.nombre}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
            }}
          />
          <div className="absolute top-2 right-2">
            <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold text-green-700">
              Disponible
            </span>
          </div>
        </div>
      )}
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-slate-900">{dish.nombre}</h3>
          <span className="text-xl font-bold text-orange-600">
            ${parseFloat(dish.precio || 0).toFixed(2)}
          </span>
        </div>
        
        {dish.descripcion && (
          <p className="text-slate-600 text-sm mb-3 line-clamp-2">{dish.descripcion}</p>
        )}
        
        <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{dish.tiempo_preparacion || 15} min</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            <span>{categories.find(cat => cat.value === dish.categoria)?.label}</span>
          </div>
        </div>
        
        {dish.lista_ingredientes && dish.lista_ingredientes.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-slate-500 mb-1">Ingredientes principales:</p>
            <div className="flex flex-wrap gap-1">
              {dish.lista_ingredientes.slice(0, 3).map((ingrediente, index) => (
                <span key={index} className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                  {ingrediente}
                </span>
              ))}
              {dish.lista_ingredientes.length > 3 && (
                <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                  +{dish.lista_ingredientes.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
        
        {dish.alergenos_detalle && dish.alergenos_detalle.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-1 text-xs text-amber-600 mb-1">
              <AlertCircle className="w-3 h-3" />
              <span>Alérgenos:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {dish.alergenos_detalle.map((alergeno, index) => (
                <span key={index} className="inline-block px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded">
                  {alergeno.nombre}
                </span>
              ))}
            </div>
          </div>
        )}
        
        <button 
          onClick={() => addToCart(dish, 1)}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 font-medium flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-4 h-4" />
          Agregar al Carrito
        </button>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Cargando menú del restaurante...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 mb-4"
          >
            <UtensilsCrossed className="w-12 h-12 text-orange-600" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Menú del Restaurante
            </h1>
          </motion.div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Descubre nuestras deliciosas preparaciones elaboradas con los ingredientes más frescos
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar platos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>

              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">Todos los precios</option>
                <option value="low">Menos de $10</option>
                <option value="medium">$10 - $25</option>
                <option value="high">$25 o más</option>
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-3 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                <Filter className="w-5 h-5" />
                <span className="hidden sm:inline">Más filtros</span>
                <ChevronDown className={`w-4 h-4 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Vista por Categorías (cuando no hay filtros) */}
        {selectedCategory === 'all' && searchTerm === '' && priceRange === 'all' ? (
          <div className="space-y-8">
            {Object.entries(menuData).map(([category, dishes]) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div 
                  className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
                  onClick={() => toggleCategory(category)}
                >
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold flex items-center gap-3">
                        <span className="text-3xl">
                          {categories.find(cat => cat.label === category)?.icon || '🍽️'}
                        </span>
                        {category}
                      </h2>
                      <div className="flex items-center gap-3">
                        <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                          {dishes.length} platos
                        </span>
                        <ChevronDown 
                          className={`w-6 h-6 transform transition-transform ${
                            expandedCategory === category ? 'rotate-180' : ''
                          }`} 
                        />
                      </div>
                    </div>
                  </div>
                  
                  {(expandedCategory === category || Object.keys(menuData).length === 1) && (
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {dishes.map((dish) => (
                          <DishCard key={dish.id} dish={dish} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Vista Filtrada */
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                {filteredDishes.length} platos encontrados
              </h2>
            </div>
            
            {filteredDishes.length === 0 ? (
              <div className="text-center py-12">
                <UtensilsCrossed className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-600 mb-2">No se encontraron platos</h3>
                <p className="text-slate-500">Intenta ajustar los filtros o busca con otros términos</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDishes.map((dish) => (
                  <DishCard key={dish.id} dish={dish} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sección Especial */}
        <div className="mt-16 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">¿Tienes alguna restricción alimentaria?</h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            Informa a nuestro personal sobre tus alergias o preferencias dietéticas. 
            Estaremos encantados de adaptar nuestros platos a tus necesidades.
          </p>
          <div className="flex justify-center gap-4">
            <button className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Contactar al Restaurante
            </button>
            <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-orange-600 transition-colors">
              Ver Información Nutricional
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantMenu;
