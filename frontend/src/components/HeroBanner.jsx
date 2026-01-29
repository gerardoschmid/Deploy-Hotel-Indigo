import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Heart,
  Star,
  MapPin,
  Wifi,
  Car,
  Coffee,
  Dumbbell
} from 'lucide-react';

const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const slides = [
    {
      id: 1,
      image: '/assets/images/hotel.jpg',
      title: 'Experiencia de Lujo Inigualable',
      subtitle: 'Descubre el confort y elegancia que solo Hotel Indigo puede ofrecer',
      description: 'Habitaciones diseñadas con los más altos estándares de lujo y tecnología de punta.',
      features: ['Suite Presidencial', 'Vista Aveninda principal de la Ciudad', 'Servicio 24/7'],
      cta: 'Reservar Ahora',
      ctaLink: '#habitaciones'
    },
    {
      id: 2,
      image: '/assets/images/restaurante.jpg',
      title: 'Gastronomía de Autor',
      subtitle: 'Sabores únicos en nuestro restaurante galardonado',
      description: 'Disfruta de una experiencia culinaria excepcional con chefs de renombre mundial.',
      features: ['Restaurante', 'Vinos Premium', 'Menú Degustación'],
      cta: 'Ver Menú',
      ctaLink: '#servicios'
    },
    {
      id: 3,
      image: '/assets/images/camarosa.jpeg',
      title: 'Bienestar y Relax',
      subtitle: 'Spa & Wellness Center para renovar cuerpo y mente',
      description: 'Tratamientos exclusivos con productos naturales y terapias innovadoras.',
      features: ['Spa Premium', 'Gimnasio Moderno', 'Beuty Salon'],
      cta: 'Conocer Más',
      ctaLink: '#servicios'
    }
  ];

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isPlaying, slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const currentSlideData = slides[currentSlide];

  return (
    <div className="relative h-screen overflow-hidden bg-slate-950">
      {/* Background Video/Image */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <img
              src={currentSlideData.image}
              alt={currentSlideData.title}
              className="w-full h-full object-cover brightness-[0.7]"
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-transparent hidden md:block" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={`content-${currentSlide}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                {/* Badge */}


                {/* Title */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-8 leading-[1.1] tracking-tight">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/50">
                    {currentSlideData.title}
                  </span>
                </h1>

                {/* Subtitle */}
                <h2 className="text-lg md:text-xl text-blue-200/90 mb-6 font-medium tracking-wide">
                  {currentSlideData.subtitle}
                </h2>

                {/* Description */}
                <p className="text-base md:text-lg text-slate-300 mb-10 max-w-2xl leading-relaxed">
                  {currentSlideData.description}
                </p>

{/* Features - Se ocultan en móviles para limpiar la vista */}
<div className="hidden md:flex flex-wrap gap-4 mb-12">
  {currentSlideData.features.map((feature, index) => (
    <motion.div
      key={feature}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
      className="flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 text-white px-5 py-2.5 rounded-2xl hover:bg-white/10 transition-colors cursor-default group"
    >
      <div className="w-2 h-2 bg-blue-500 rounded-full group-hover:scale-150 transition-transform duration-300 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
      <span className="text-sm font-semibold tracking-wide whitespace-nowrap">{feature}</span>
    </motion.div>
  ))}
</div>

                {/* CTA Buttons */}
                {/**   <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="flex flex-col sm:flex-row gap-5"
                >
                  <a
                    href={currentSlideData.ctaLink}
                    className="inline-flex items-center justify-center gap-3 bg-blue-600 text-white px-10 py-5 rounded-2xl hover:bg-blue-500 transition-all transform hover:scale-105 hover:rotate-1 active:scale-95 shadow-[0_10px_30px_rgba(37,99,235,0.4)] font-bold text-lg"
                  >
                    {currentSlideData.cta}
                    <ChevronRight className="w-5 h-5 animate-pulse" />
                  </a>
                  
                </motion.div>*/}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Quick Info Bar - Redesigned */}
      <div className="absolute bottom-0 left-0 right-0 z-20 overflow-hidden">
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-2xl border-t border-white/10" />
        <div className="container mx-auto px-6 lg:px-12 py-10 relative">
<div className="grid grid-cols-4 gap-4 md:gap-12"> {/* Forzamos 4 columnas siempre */}
  {[
    { icon: MapPin, label: 'Ubicación', value: 'Barinas, Venezuela', color: 'text-blue-400' },
    { icon: Wifi, label: 'Conectividad', value: 'WiFi', color: 'text-emerald-400' },
    { icon: Car, label: 'Servicio', value: 'Valet Parking 24/7', color: 'text-amber-400' },
    { icon: Coffee, label: 'Gastronomía', value: 'Local e Internacional', color: 'text-rose-400' }
  ].map((info, idx) => (
    <motion.div
      key={idx}
      className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-5 group text-center md:text-left"
    >
      <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 ${info.color}`}>
        <info.icon className="w-5 h-5 md:w-6 md:h-6" />
      </div>
      {/* Ocultamos el texto en móvil con 'hidden md:block' */}
      <div className="hidden md:block">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{info.label}</p>
        <p className="text-sm font-bold text-white tracking-tight">{info.value}</p>
      </div>
    </motion.div>
  ))}
</div>
        </div>
      </div>

{/* Navigation Controls */}
<div className="absolute left-8 right-8 top-[45%] transform -translate-y-1/2 flex justify-between pointer-events-none z-30">
  <button
  onClick={prevSlide}
  className="pointer-events-auto bg-slate-900/20 backdrop-blur-sm text-white p-3 rounded-xl border border-white/5 opacity-40 hover:opacity-100 hover:bg-blue-600 transition-all hover:scale-110 active:scale-90 group hidden md:flex"
>
    {/* Reducimos w-8 h-8 a w-5 h-5 */}
    <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
  </button>

 <button
  onClick={nextSlide}
  className="pointer-events-auto bg-slate-900/20 backdrop-blur-sm text-white p-3 rounded-xl border border-white/5 opacity-40 hover:opacity-100 hover:bg-blue-600 transition-all hover:scale-110 active:scale-90 group hidden md:flex"
>
    {/* Reducimos w-8 h-8 a w-5 h-5 */}
    <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
  </button>
</div>

      {/* Slide Indicators */}
{/* Slide Indicators - Reposicionados abajo y centrados */}
{/* Slide Indicators - Arriba en móviles, abajo en escritorio */}
<div className="absolute top-12 md:top-auto md:bottom-40 left-1/2 transform -translate-x-1/2 flex gap-3 z-30">
  {slides.map((_, index) => (
    <button
      key={index}
      onClick={() => goToSlide(index)}
      className="group relative py-4 md:py-2" // Aumentamos el área táctil en móvil
    >
      <div className={`transition-all duration-500 rounded-full ${
        currentSlide === index
          ? 'w-12 md:w-10 h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]'
          : 'w-2 h-1 bg-white/20 hover:bg-white/50'
      }`} />
    </button>
  ))}
</div>

      {/* Media Controls */}
{/* Media Controls - Ahora ocultos en móviles */}
<div className="absolute top-8 right-8 hidden md:flex gap-3 z-10">
  {[
    { icon: isPlaying ? Pause : Play, onClick: () => setIsPlaying(!isPlaying) },
    { icon: Maximize2, onClick: toggleFullscreen },
  ].map((control, idx) => (
    <button
      key={idx}
      onClick={control.onClick}
      className="bg-slate-900/50 backdrop-blur-xl text-white p-3 rounded-xl border border-white/10 hover:bg-blue-600 transition-all hover:scale-110 active:scale-90"
    >
      <control.icon className="w-4 h-4" />
    </button>
  ))}
</div>    </div>
  );
};

export default HeroBanner;
