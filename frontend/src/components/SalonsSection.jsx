import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Star,
  Clock,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Sparkles,
  Heart,
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
  const itemsPerPage = 6;

  useEffect(() => {
    fetchSalons();
  }, []);

  const fetchSalons = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/salones-eventos/salones/');
      const backendSalons = response.data.results || response.data || [];

      const mappedSalons = backendSalons.map(salon => ({
        id: salon.id,
        name: salon.nombre || `Salón ${salon.id}`,
        description: salon.descripcion || 'Espacio elegante y versátil para tus eventos especiales.',
        images: salon.imagen_url ? [salon.imagen_url] : [
          'https://images.unsplash.com/photo-1519167758481-83f550649ee2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ],
        capacity: salon.capacidad || 100,
        rating: 4.9,
        reviews: 44,
        eventTypes: ['Bodas', 'Cumpleaños', 'Corporativos'],
        available: salon.estado === 'disponible',
      }));

      setSalons(mappedSalons);
    } catch (error) {
      console.error('Error obteniendo salones:', error);
      setSalons([]);
    } finally {
      setLoading(false);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSalons = salons.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(salons.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    document.getElementById('salones')?.scrollIntoView({ behavior: 'smooth' });
  };

  // --- COMPONENTE TARJETA ---
  const SalonCard = ({ salon, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group h-full"
    >
      <Card className="h-full overflow-hidden border-0 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 rounded-[2.5rem] flex flex-col">
        <div className="relative aspect-[16/10] overflow-hidden">
          <Carousel
            images={salon.images}
            alt={salon.name}
            className="w-full h-full group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute top-4 left-4">
            <Badge className="bg-indigo-600 text-white border-0 px-3 py-1 font-bold shadow-lg">
              <Star className="w-3 h-3 mr-1 fill-white" /> Exclusivo
            </Badge>
          </div>
        </div>

        <CardContent className="p-6 sm:p-8 flex-1 flex flex-col">
          <div className="mb-4">
            <Badge variant="outline" className="text-[10px] font-bold tracking-widest border-indigo-100 text-indigo-600 bg-indigo-50/50 mb-3">
              SALÓN DE EVENTOS
            </Badge>
            <h3 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight mb-2">
              {salon.name}
            </h3>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-current" />
              <span className="text-sm font-bold text-slate-700">{salon.rating}</span>
              <span className="text-slate-300">•</span>
              <span className="text-sm text-slate-500">{salon.reviews} reseñas</span>
            </div>
          </div>

          <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed italic">
            {salon.description}
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <Users className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <span className="text-xs font-bold text-slate-700 truncate">Hasta {salon.capacity} pers.</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <Clock className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <span className="text-xs font-bold text-slate-700 truncate">Horario Flexible</span>
            </div>
          </div>

          <div className="mb-8">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Ideal Para</p>
            <div className="flex flex-wrap gap-2">
              {salon.eventTypes.map((type, idx) => (
                <span key={idx} className="inline-flex items-center text-[9px] font-black text-slate-600 uppercase border border-slate-200 px-2 py-1 rounded-lg">
                  <CheckCircle className="w-3 h-3 mr-1 text-emerald-500" /> {type}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Cotización</p>
            <h4 className="text-xl font-black text-slate-900 mb-6">Personalizada</h4>
            
            <Button
              onClick={() => navigate('/reservar', { state: { activeTab: 'salon' } })}
              className="w-full bg-slate-900 hover:bg-indigo-600 text-white py-6 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all shadow-xl group/btn"
            >
              Reservar Salón
              <ChevronRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (loading) return (
    <div className="py-32 flex flex-col items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-600"></div>
      <p className="mt-4 text-slate-400 text-xs font-bold uppercase tracking-widest">Cargando Salones...</p>
    </div>
  );

  return (
    <section id="salones" className="py-20 md:py-32 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-indigo-50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 opacity-60" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-purple-50 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 opacity-60" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-20">
          <Badge className="mb-4 bg-indigo-100 text-indigo-600 border-indigo-200 px-4 py-1.5 rounded-full font-bold uppercase tracking-widest text-[10px]">
            Espacios Exclusivos
          </Badge>
          <h2 className="text-4xl md:text-6xl font-black text-slate-950 mb-6 tracking-tight leading-tight">
            Eventos <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Inolvidables</span>
          </h2>
          <p className="text-slate-500 font-medium text-lg">
            Desde bodas de ensueño hasta conferencias de alto nivel.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {currentSalons.map((salon, index) => (
            <SalonCard key={salon.id} salon={salon} index={index} />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-16 flex justify-center items-center gap-3">
            <Button
              variant="outline"
              className="rounded-xl w-12 h-12 p-0 border-slate-200"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <span className="text-sm font-bold text-slate-600 mx-4">Página {currentPage} de {totalPages}</span>
            <Button
              variant="outline"
              className="rounded-xl w-12 h-12 p-0 border-slate-200"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default SalonsSection;