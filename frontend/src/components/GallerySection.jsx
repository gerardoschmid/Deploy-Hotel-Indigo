import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Camera,
  Star,
  Sparkles
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

const GallerySection = () => {
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const galleryImages = [
    {
      id: 1,
      url: '/assets/images/lobby.png',
      title: 'Lobby Principal',
      category: 'Áreas Comunes',
      description: 'Elegante recepción con diseño contemporáneo',
      featured: true,
      size: 'large'
    },
    {
      id: 2,
      url: '/assets/images/restaurante.jpeg',
      title: 'Restaurante Gourmet',
      category: 'Gastronomía',
      description: 'Experiencias culinarias de clase mundial',
      featured: true,
      size: 'large'
    },
    {
      id: 3,
      url: '/assets/images/spa3.jpg',
      title: 'Spa & Wellness',
      category: 'Servicios',
      description: 'Santuario de relajación y bienestar',
      featured: false,
      size: 'medium'
    },
    {
      id: 4,
      url: '/assets/images/bar.jpeg',
      title: 'Bar & Lounge',
      category: 'Gastronomía',
      description: 'Cócteles artesanales en ambiente sofisticado',
      featured: false,
      size: 'medium'
    },
    {
      id: 5,
      url: '/assets/images/salon_eventos.webp',
      title: 'Salón de Eventos',
      category: 'Eventos',
      description: 'Espacios versátiles para celebraciones',
      featured: true,
      size: 'large'
    },
    {
      id: 6,
      url: '/assets/images/terraza.jpeg',
      title: 'Terraza Panorámica',
      category: 'Servicios',
      description: 'Vistas espectaculares de la ciudad',
      featured: false,
      size: 'medium'
    },
    {
      id: 7,
      url: '/assets/images/lobby2.jpg',
      title: 'Área de Descanso',
      category: 'Áreas Comunes',
      description: 'Espacios acogedores para relajarse',
      featured: false,
      size: 'small'
    },
    {
      id: 8,
      url: '/assets/images/fachada.jpg',
      title: 'Fachada Hotel',
      category: 'Exterior',
      description: 'Arquitectura moderna y elegante',
      featured: false,
      size: 'medium'
    },
    {
      id: 9,
      url: '/assets/images/hotel_fondo.jpeg',
      title: 'Vista Nocturna',
      category: 'Exterior',
      description: 'Iluminación espectacular al atardecer',
      featured: false,
      size: 'small'
    }
  ];

  const categories = ['Todas', 'Áreas Comunes', 'Gastronomía', 'Servicios', 'Eventos', 'Exterior'];

  const filteredImages = selectedCategory === 'Todas'
    ? galleryImages
    : galleryImages.filter(img => img.category === selectedCategory);

  const openLightbox = (image, index) => {
    setSelectedImage(image);
    setCurrentImageIndex(index);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const navigateImage = (direction) => {
    const newIndex = direction === 'next'
      ? (currentImageIndex + 1) % filteredImages.length
      : (currentImageIndex - 1 + filteredImages.length) % filteredImages.length;

    setCurrentImageIndex(newIndex);
    setSelectedImage(filteredImages[newIndex]);
  };

  return (
    <section id="galeria" className="py-32 bg-gradient-to-b from-white via-slate-50 to-white relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-indigo-50/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-blue-50/30 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <Badge className="mb-6 bg-indigo-500/10 text-indigo-600 border-indigo-200 px-4 py-1.5 rounded-full font-bold uppercase tracking-widest text-xs">
            <Camera className="w-3 h-3 mr-2 inline" />
            Galería Visual
          </Badge>
          <h2 className="text-5xl md:text-7xl font-black text-slate-950 mb-8 tracking-tight leading-[1.1]">
            Descubre Nuestro <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-blue-600">Espacio</span>
          </h2>
          <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
            Explora cada rincón de nuestro hotel a través de imágenes que capturan la esencia del lujo y la comodidad.
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-3 mb-16"
        >
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-2xl font-black uppercase tracking-widest text-[10px] px-6 py-3 transition-all duration-300 ${selectedCategory === category
                  ? 'bg-slate-950 text-white shadow-lg scale-105'
                  : 'border-2 border-slate-200 hover:border-slate-950 hover:bg-slate-950 hover:text-white'
                }`}
            >
              {category}
            </Button>
          ))}
        </motion.div>

        {/* Masonry Gallery Grid (Estilo Pinterest mantenido) */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {filteredImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="break-inside-avoid group cursor-pointer"
              onClick={() => openLightbox(image, index)}
            >
              {/* Alturas dinámicas mantenidas */}
              <div className={`relative overflow-hidden rounded-[2rem] shadow-lg hover:shadow-[0_30px_80px_rgba(0,0,0,0.15)] transition-all duration-500 ${image.size === 'large' ? 'h-[500px]' : image.size === 'medium' ? 'h-[350px]' : 'h-[250px]'
                }`}>
                <img
                  src={image.url}
                  alt={image.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500" />

                {image.featured && (
                  <div className="absolute top-6 left-6">
                    <Badge className="bg-yellow-500 text-white border-0 px-3 py-1.5 rounded-full font-bold uppercase tracking-widest text-[9px] shadow-lg">
                      <Star className="w-3 h-3 mr-1 inline fill-white" />
                      Destacado
                    </Badge>
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <Badge className="mb-3 bg-white/20 backdrop-blur-sm text-white border-white/30 px-3 py-1 rounded-full font-bold uppercase tracking-widest text-[9px]">
                    {image.category}
                  </Badge>
                  <h3 className="text-2xl font-black text-white mb-2 tracking-tight uppercase drop-shadow-lg">
                    {image.title}
                  </h3>
                  <p className="text-sm text-white/90 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    {image.description}
                  </p>
                </div>

                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 scale-75 group-hover:scale-100">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border-2 border-white/40">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal Optimizado para Móvil */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            // CAMBIO 1: En móvil p-0 (sin padding) para pantalla completa. En escritorio p-4.
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-0 md:p-4"
            onClick={closeLightbox}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              // CAMBIO 2: h-full en móvil para usar toda la altura. rounded-none en móvil.
              className="relative w-full h-full md:h-auto md:max-w-6xl flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Botón Cerrar */}
              <button
                onClick={closeLightbox}
                // CAMBIO 3: Posición fija en móvil para que siempre esté accesible
                className="absolute top-4 right-4 z-50 md:-top-12 md:right-0 bg-black/20 md:bg-transparent p-2 rounded-full text-white hover:text-slate-300 transition-colors"
              >
                <X className="w-8 h-8" />
              </button>

              <div className="relative w-full h-full md:h-auto md:rounded-3xl overflow-hidden flex items-center justify-center bg-black md:bg-transparent">
                {/* Imagen */}
                <img
                  src={selectedImage.url}
                  alt={selectedImage.title}
                  // CAMBIO 4: object-contain para que SIEMPRE se vea la foto entera sin recortes
                  // max-h-screen en móvil para usar todo el alto disponible
                  className="w-full h-full md:h-auto md:max-h-[85vh] object-contain"
                />

                {/* Overlay de Texto */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 md:p-8">
                  <Badge className="mb-2 md:mb-3 bg-white/20 backdrop-blur-sm text-white border-white/30 px-3 py-1.5 rounded-full font-bold uppercase tracking-widest text-[10px] md:text-xs">
                    {selectedImage.category}
                  </Badge>
                  <h3 className="text-xl md:text-3xl font-black text-white mb-1 md:mb-2 tracking-tight uppercase">
                    {selectedImage.title}
                  </h3>
                  <p className="text-sm md:text-lg text-white/90 font-medium line-clamp-2 md:line-clamp-none">
                    {selectedImage.description}
                  </p>
                </div>
              </div>

              {/* Botones de Navegación */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage('prev');
                }}
                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all z-10"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage('next');
                }}
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all z-10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              <div className="absolute bottom-6 md:-bottom-12 left-1/2 -translate-x-1/2 text-white/50 md:text-white font-bold text-xs md:text-base">
                {currentImageIndex + 1} / {filteredImages.length}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default GallerySection;