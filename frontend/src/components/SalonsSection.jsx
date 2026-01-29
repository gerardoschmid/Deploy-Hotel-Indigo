import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Calendar,
  MapPin,
  Star,
  Clock,
  Heart,
  ChevronRight,
  ChevronLeft, // Importado para la paginación
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import Carousel from './ui/carousel';
import api from '../api/axios';

const SalonsSection = () => {
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // --- ESTADOS DE PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Límite de 6 tarjetas

  useEffect(() => {
    fetchSalons();
  }, []);

  const fetchSalons = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/salones-eventos/salones/');
      const backendSalons = response.data.results || response.data || [];

      // Mapear salones del backend al formato del frontend
      const mappedSalons = backendSalons.map(salon => ({
        id: salon.id,
        name: salon.nombre || `Salón ${salon.id}`,
        description: salon.descripcion || 'Espacio elegante y versátil para tus eventos especiales.',
        image: salon.imagen_url || salon.imagen,
        images: salon.imagen_url ? [salon.imagen_url] : [
          'https://images.unsplash.com/photo-1519167758481-83f550649ee2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1469371670407-6139285d87f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ],
        capacity: salon.capacidad || Math.floor(Math.random() * 200) + 50,
        pricePerHour: 0, 
        rating: 4.9,
        reviews: Math.floor(Math.random() * 50) + 10,
        features: [
          'Aire Acondicionado',
          'Sistema de Sonido',
          'Iluminación Profesional',
          'Servicio de Catering'
        ],
        eventTypes: ['Bodas', 'Cumpleaños', 'Corporativos'],
        available: salon.estado === 'disponible',
        popular: true,
        discount: 0
      }));

      setSalons(mappedSalons);
    } catch (error) {
      console.error('Error obteniendo salones:', error);
      setSalons([]);
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA DE PAGINACIÓN ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSalons = salons.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(salons.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    const element = document.getElementById('salones');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const handleReserveSalon = (salon) => {
    alert(`Iniciando reserva para: ${salon.name}`);
  };

  const SalonCard = ({ salon, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group h-full"
    >
      <Card className="h-full overflow-hidden border-0 bg-white/80 backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-all duration-500 rounded-3xl flex flex-col">
        {/* Carousel de Imágenes */}
        <div className="relative aspect-[16/9] overflow-hidden">
          <Carousel
            images={salon.images}
            alt={salon.name}
            className="w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {salon.discount > 0 && (
              <Badge className="bg-rose-500 hover:bg-rose-600 text-white border-0 px-3 py-1 font-bold shadow-lg">
                -{salon.discount}% OFF
              </Badge>
            )}
            {salon.popular && (
              <Badge className="bg-indigo-500 hover:bg-indigo-600 text-white border-0 px-3 py-1 font-bold shadow-lg">
                <Star className="w-3 h-3 mr-1 fill-white" /> Exclusivo
              </Badge>
            )}
          </div>

          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
              <Heart className="w-4 h-4 text-rose-500 hover:fill-current transition-colors cursor-pointer" />
            </div>
          </div>
        </div>

        <CardContent className="p-6 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="capitalize text-[10px] font-bold tracking-widest border-indigo-200 text-indigo-600 bg-indigo-50">
                  Salón de Eventos
                </Badge>
              </div>
              <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                {salon.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-amber-400 fill-current" />
                  <span className="text-sm font-medium text-slate-600 ml-1">
                    {salon.rating.toFixed(1)}
                  </span>
                </div>
                <span className="text-slate-300">•</span>
                <span className="text-sm text-slate-500">
                  {salon.reviews} reseñas
                </span>
              </div>
            </div>
          </div>

          <p className="text-slate-500 text-sm mb-4 line-clamp-2 leading-relaxed">
            {salon.description}
          </p>

          <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-6 text-sm">
            <div className="flex items-center gap-2 text-slate-500 font-medium">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Users className="w-4 h-4 text-indigo-500" />
              </div>
              <span>Hasta {salon.capacity} pers.</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 font-medium">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Clock className="w-4 h-4 text-indigo-500" />
              </div>
              <span>Horario Flexible</span>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Ideal Para</p>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {salon.eventTypes.slice(0, 4).map((eventType, idx) => (
                <span key={idx} className="inline-flex items-center text-[10px] font-bold text-slate-600 uppercase tracking-tighter">
                  <CheckCircle className="w-2.5 h-2.5 mr-1 text-emerald-500 shadow-sm" /> {eventType}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Cotización</p>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-slate-900">Personalizada</span>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (loading) {
    return (
      <section className="py-32 bg-gradient-to-br from-indigo-50 to-purple-50 relative overflow-hidden">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-4 border-indigo-100 rounded-full" />
              <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="mt-8 text-slate-400 font-bold uppercase tracking-widest text-sm animate-pulse">
              Cargando salones de eventos...
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="salones" className="py-32 bg-gradient-to-br from-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-indigo-100 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 opacity-50" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-purple-100 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 opacity-50" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-6 bg-indigo-500/10 text-indigo-600 border-indigo-200 px-4 py-1.5 rounded-full font-bold uppercase tracking-widest text-xs">
              Salones de Eventos
            </Badge>
            <h2 className="text-5xl md:text-7xl font-black text-slate-950 mb-8 tracking-tight leading-[1.1]">
              Espacios <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Inolvidables</span> para tus Momentos
            </h2>
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
              Transforma tus eventos especiales en experiencias inolvidables en nuestros exclusivos salones.
            </p>
          </motion.div>
        </div>

        {/* Salons Grid con Paginación */}
        {salons.length > 0 ? (
          <>
            {/* Grid ajustado a 3 columnas para que 6 elementos queden perfectos (3x2) en PC */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-14 px-2">
              {currentSalons.map((salon, index) => (
                <SalonCard key={salon.id} salon={salon} index={index} />
              ))}
            </div>

            {/* Controles de Paginación */}
            {totalPages > 1 && (
              <div className="mt-16 flex justify-center items-center gap-2">
                <Button
                  variant="outline"
                  className="rounded-xl w-10 h-10 p-0 border-slate-200 hover:border-indigo-500 hover:text-indigo-600"
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
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30" 
                        : "border-slate-200 hover:border-indigo-500 hover:text-indigo-600"
                    }`}
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  className="rounded-xl w-10 h-10 p-0 border-slate-200 hover:border-indigo-500 hover:text-indigo-600"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-32 bg-white/40 rounded-[3rem] border-2 border-dashed border-slate-200"
          >
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-indigo-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Próximamente</h3>
            <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto">
              Estamos preparando nuestros salones exclusivos para tus eventos.
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default SalonsSection;