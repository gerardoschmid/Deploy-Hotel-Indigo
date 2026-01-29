import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  Wifi,
  Car,
  Coffee,
  Dumbbell,
  Users,
  Bed,
  Bath,
  Square,
  Wind,
  Tv,
  Shield,
  Heart,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  ChevronLeft, // Icono para paginación anterior
  CheckCircle
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import Carousel from './ui/carousel';
import api from '../api/axios';


const RoomMarketplace = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState('all');
  const [roomType, setRoomType] = useState('all');
  const [sortBy, setSortBy] = useState('recommended');

  // --- ESTADOS DE PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Límite solicitado

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/habitaciones/habitaciones/');
      const backendRooms = response.data;

      // Mapear habitaciones del backend al formato del frontend
      const mappedRooms = backendRooms.map(room => ({
        id: room.id,
        name: `Habitación ${room.tipo_ocupacion}`,
        type: room.categoria,
        price: parseFloat(room.precio_base || 0),
        originalPrice: null,
        // Preferimos la imagen del backend si existe, sino usamos las locales
        images: room.imagen ? [room.imagen] : [
          '/assets/images/habitaciones/habitacion_king.jpeg',
          '/assets/images/habitaciones/habitacion_king.png',
          '/assets/images/habitaciones/habitacion_queen.jpeg',
          '/assets/images/habitaciones/habitacion2.jpg'
        ],
        rating: 4.8 + (Math.random() * 0.2),
        reviews: Math.floor(Math.random() * 100) + 50,
        size: room.metros_cuadrados || 45,
        beds: room.tipo_ocupacion === 'individual' ? 1 : room.tipo_ocupacion === 'doble' ? 2 : room.tipo_ocupacion === 'triple' ? 3 : 4,
        baths: 1,
        maxGuests: room.tipo_ocupacion === 'individual' ? 1 : room.tipo_ocupacion === 'doble' ? 2 : room.tipo_ocupacion === 'triple' ? 3 : 4,
        description: room.descripcion || 'Una experiencia de lujo inigualable en el corazón de Caracas.',
        features: room.caracteristicas ? room.caracteristicas.split(',').map(f => f.trim()) : ['Vista Panorámica', 'Climatización VIP'],
        amenities: ['WiFi 6', 'Aire Acondicionado', 'Smart TV 55"', 'Mini Bar', 'Caja Fuerte'],
        available: room.estado === 'disponible',
        popular: room.categoria === 'suite' || room.categoria === 'suite_presidencial',
        discount: room.categoria === 'estandar' ? 10 : 0,
        backendData: room
      }));

      setRooms(mappedRooms);
    } catch (error) {
      console.error('Error obteniendo habitaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = rooms.filter(room => {
      const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.features.some(f => f.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = roomType === 'all' || room.type === roomType;
      const matchesPrice = priceRange === 'all' ||
        (priceRange === 'budget' && room.price <= 150) ||
        (priceRange === 'medium' && room.price > 150 && room.price <= 300) ||
        (priceRange === 'luxury' && room.price > 300);

      return matchesSearch && matchesType && matchesPrice && room.available;
    });

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return b.popular - a.popular;
    });

    setFilteredRooms(filtered);
    setCurrentPage(1); // Resetear a página 1 al filtrar
  }, [rooms, searchTerm, priceRange, roomType, sortBy]);

  // --- LÓGICA DE PAGINACIÓN ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRooms = filteredRooms.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Opcional: Scrollear arriba al cambiar página
    const element = document.getElementById('habitaciones');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const handleReserveRoom = (room) => {
    navigate('/reservar', {
      state: {
        selectedRoom: room.backendData
      }
    });
  };

  const RoomCard = ({ room, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group h-full"
    >
      <Card className="h-full overflow-hidden border-0 bg-white/80 backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-all duration-500 rounded-3xl flex flex-col">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Carousel
            images={room.images}
            alt={room.name}
            className="w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {room.discount > 0 && (
              <Badge className="bg-rose-500 hover:bg-rose-600 text-white border-0 px-3 py-1 font-bold shadow-lg">
                -{room.discount}% OFF
              </Badge>
            )}
            {room.popular && (
              <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-0 px-3 py-1 font-bold shadow-lg">
                <Star className="w-3 h-3 mr-1 fill-white" /> Recomendado
              </Badge>
            )}
          </div>

          {!room.available && (
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center">
              <Badge variant="destructive" className="text-lg px-6 py-2 font-bold uppercase tracking-widest">
                No Disponible
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-6 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="capitalize text-[10px] font-bold tracking-widest border-blue-200 text-blue-600 bg-blue-50">
                  {room.type.replace('_', ' ')}
                </Badge>

              </div>
              <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{room.name}</h3>
            </div>
          </div>

          <p className="text-slate-500 text-sm mb-4 line-clamp-2 leading-relaxed">
            {room.description}
          </p>

          <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-6 text-sm">
            <div className="flex items-center gap-2 text-slate-500 font-medium">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                <Square className="w-4 h-4 text-blue-500" />
              </div>
              <span>{room.size}m²</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 font-medium">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <span>{room.maxGuests} Pers.</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 font-medium">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                <Bed className="w-4 h-4 text-blue-500" />
              </div>
              <span>{room.beds} Cama{room.beds > 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 font-medium">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                <Bath className="w-4 h-4 text-blue-500" />
              </div>
              <span>{room.baths} Baño{room.baths > 1 ? 's' : ''}</span>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Características</p>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {room.features.slice(0, 4).map((feature, idx) => (
                <span key={idx} className="inline-flex items-center text-[10px] font-bold text-slate-600 uppercase tracking-tighter">
                  <CheckCircle className="w-2.5 h-2.5 mr-1 text-emerald-500 shadow-sm" /> {feature}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Precio / Noche</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">${room.price}</span>
                {room.discount > 0 && (
                  <span className="text-sm text-slate-400 line-through">${(room.price / (1 - room.discount / 100)).toFixed(0)}</span>
                )}
              </div>
            </div>
            <Button
              className="rounded-2xl bg-slate-900 hover:bg-blue-600 text-white px-6 py-6 font-bold uppercase tracking-widest text-xs transition-all hover:shadow-[0_10px_20px_rgba(37,99,235,0.3)] group/btn"
              disabled={!room.available}
              onClick={() => handleReserveRoom(room)}
            >
              Reservar
              <ChevronRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <section id="habitaciones" className="py-32 bg-[#F8FAFC] relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 opacity-50" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-indigo-50 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 opacity-50" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-6 bg-blue-500/10 text-blue-600 border-blue-200 px-4 py-1.5 rounded-full font-bold uppercase tracking-widest text-xs">
              Portfolio de Habitaciones
            </Badge>
            <h2 className="text-5xl md:text-7xl font-black text-slate-950 mb-8 tracking-tight leading-[1.1]">
              Espacios Diseñados para la <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-indigo-600">Excelencia</span>
            </h2>
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
              Descubre una colección curada de habitaciones y suites, donde el diseño de vanguardia se une al confort absoluto.
            </p>
          </motion.div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-4 border-blue-100 rounded-full" />
              <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="mt-8 text-slate-400 font-bold uppercase tracking-widest text-sm animate-pulse">Consultando disponibilidad...</p>
          </div>
        ) : (
          <>
            {/* Filter Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[2rem] p-4 md:p-6 mb-16 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    placeholder="¿Qué habitación buscas?"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 bg-white/60 border-slate-100 focus:border-blue-500 focus:ring-blue-500/20 rounded-2xl py-6 transition-all font-medium"
                  />
                </div>

                <Select value={roomType} onValueChange={setRoomType}>
                  <SelectTrigger className="bg-white/60 border-slate-100 rounded-2xl py-6 font-medium focus:ring-blue-500/20">
                    <SelectValue placeholder="Tipo de Habitación" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-100">
                    <SelectItem value="all">Todas las Categorías</SelectItem>
                    <SelectItem value="estandar">Habitación Estándar</SelectItem>
                    <SelectItem value="deluxe">Luxury Deluxe</SelectItem>
                    <SelectItem value="suite">Executive Suite</SelectItem>
                    <SelectItem value="suite_presidencial">Royal Presidential</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger className="bg-white/60 border-slate-100 rounded-2xl py-6 font-medium focus:ring-blue-500/20">
                    <SelectValue placeholder="Presupuesto" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-100">
                    <SelectItem value="all">Cualquier Precio</SelectItem>
                    <SelectItem value="budget">Comfort ($0-$150)</SelectItem>
                    <SelectItem value="medium">Premium ($150-$300)</SelectItem>
                    <SelectItem value="luxury">Luxury Elite ($300+)</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-white/60 border-slate-100 rounded-2xl py-6 font-medium focus:ring-blue-500/20">
                    <SelectValue placeholder="Ordenar" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-100">
                    <SelectItem value="recommended">Destacados</SelectItem>
                    <SelectItem value="price-low">Precio: Ascendente</SelectItem>
                    <SelectItem value="price-high">Precio: Descendente</SelectItem>
                    
                  </SelectContent>
                </Select>
              </div>
            </motion.div>

            {/* Results Count Section */}
            <div className="mb-12 flex justify-between items-center px-4">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-blue-600 rounded-full" />
                <p className="text-slate-900 font-bold tracking-tight">
                  Disponibles <span className="bg-blue-600 text-white px-2.5 py-0.5 rounded-lg ml-1">{filteredRooms.length}</span>
                </p>
              </div>
            </div>

            {/* Room Grid - Paginada */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-14 px-2">
              {currentRooms.map((room, index) => (
                <RoomCard key={room.id} room={room} index={index} />
              ))}
            </div>

            {/* Paginación UI */}
            {totalPages > 1 && (
              <div className="mt-16 flex justify-center items-center gap-2">
                <Button
                  variant="outline"
                  className="rounded-xl w-10 h-10 p-0 border-slate-200 hover:border-blue-500 hover:text-blue-600"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i + 1}
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    className={`rounded-xl w-10 h-10 p-0 font-bold transition-all ${
                      currentPage === i + 1 
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30" 
                        : "border-slate-200 hover:border-blue-500 hover:text-blue-600"
                    }`}
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  className="rounded-xl w-10 h-10 p-0 border-slate-200 hover:border-blue-500 hover:text-blue-600"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            )}

            {filteredRooms.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-32 bg-white/40 rounded-[3rem] border-2 border-dashed border-slate-200"
              >
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">No se encontraron resultados</h3>
                <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto">
                  Ajusta tus filtros o busca una categoría diferente para encontrar tu habitación perfecta.
                </p>
                <Button
                  className="rounded-2xl bg-slate-900 hover:bg-blue-600 px-8 py-6 font-bold uppercase tracking-widest text-xs"
                  onClick={() => {
                    setSearchTerm('');
                    setRoomType('all');
                    setPriceRange('all');
                    setSortBy('recommended');
                  }}
                >
                  Reiniciar Filtros
                </Button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default RoomMarketplace;