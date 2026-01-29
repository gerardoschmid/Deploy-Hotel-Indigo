import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wifi, Car, Coffee, Dumbbell, Bath, Wind, Tv, Utensils, ConciergeBell, Phone, Shield, Heart, CheckCircle, MapPin, ArrowRight, Star, Clock
} from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

const ServicesSection = () => {
  const [selectedService, setSelectedService] = useState(null);

  const services = [
    {
      id: 'accommodation',
      title: 'Alojamiento Premium',
      icon: Heart,
      description: 'Suites diseñadas para el descanso absoluto con tecnología de integración total y vistas espectaculares.',
      detailedDescription: 'Nuestras suites premium están meticulosamente diseñadas para ofrecer el máximo confort y lujo. Cada habitación cuenta con camas Queen y King Size de la más alta calidad, sistemas de climatización inteligente que se adaptan a sus preferencias, y un minibar equipado con productos selectos. El servicio de conserjería está disponible las 24 horas para atender cualquier necesidad, desde room service hasta arreglos especiales.',
      features: ['Camas King Size Premium', 'Climatización Inteligente', 'Smart Minibar', 'Servicio 24/7'],
      image: '/assets/images/lobby.png',
      color: 'bg-rose-500'
    },
    {
      id: 'restaurant',
      title: 'Gastronomía de Autor',
      icon: Utensils,
      description: 'Experiencias culinarias de clase mundial con ingredientes locales y técnicas globales en un ambiente sofisticado.',
      detailedDescription: 'Nuestro restaurante de autor combina lo mejor de la gastronomía local e internacional con ingredientes de la más alta calidad. Bajo la dirección de nuestro chef internacional, cada plato es una obra maestra que fusiona técnicas culinarias modernas con sabores tradicionales. Nuestra bodega cuenta con una selección exclusiva de vinos de las mejores regiones vinícolas del mundo. El cocktail bar premium ofrece creaciones únicas de mixología, y nuestro servicio de room service elite le permite disfrutar de esta experiencia gastronómica en la comodidad de su habitación.',
      features: ['Chef Internacional', 'Bodega de Vinos', 'Cocktail Bar Premium', 'Room Service Elite'],
      image: '/assets/images/restaurante.jpeg',
      color: 'bg-amber-500'
    },
    {
      id: 'wellness',
      title: 'Spa & Wellness',
      icon: Bath,
      description: 'Un santuario de serenidad para revitalizar cuerpo y mente en un entorno de paz y relajación total.',
      detailedDescription: 'Nuestro spa es un oasis de tranquilidad diseñado para rejuvenecer su cuerpo y mente. Ofrecemos una amplia gama de tratamientos holísticos que combinan técnicas ancestrales con terapias modernas. Los masajes terapéuticos son realizados por profesionales certificados que personalizan cada sesión según sus necesidades. Disfrute de nuestras instalaciones de sauna y steam room, perfectas para la desintoxicación y relajación profunda. Complementamos la experiencia con sesiones de yoga y meditación guiadas, creando un programa integral de bienestar que restaurará su equilibrio interior.',
      features: ['Tratamientos Holísticos', 'Masajes Terapéuticos', 'Sauna & Steam Room', 'Yoga & Meditación'],
      image: '/assets/images/spa3.jpg',
      color: 'bg-emerald-500'
    },
    {
      id: 'events',
      title: 'Salón de Eventos',
      icon: Shield,
      description: 'Espacios elegantes y versátiles para sus eventos corporativos, bodas y celebraciones especiales.',
      detailedDescription: 'Nuestro salón de eventos es el escenario perfecto para hacer realidad sus celebraciones más importantes. Con capacidad para hasta 200 personas, el espacio se adapta a eventos corporativos, bodas, conferencias y celebraciones privadas. Contamos con equipamiento audiovisual de última generación, incluyendo sistemas de sonido profesional, proyectores HD y conectividad de alta velocidad. Nuestro equipo de event planning trabajará con usted para diseñar cada detalle, desde la decoración hasta el catering personalizado, asegurando que su evento sea memorable y ejecutado a la perfección.',
      features: ['Capacidad 200 personas', 'Equipamiento A/V', 'Catering Personalizado', 'Event Planning'],
      image: '/assets/images/salon_eventos.webp',
      color: 'bg-blue-500'
    },
    {
      id: 'bar',
      title: 'Bar & Lounge',
      icon: ConciergeBell,
      description: 'Disfrute de cócteles artesanales y una selección premium de licores en un ambiente sofisticado.',
      detailedDescription: 'Nuestro bar & lounge es el destino ideal para disfrutar de momentos especiales en un ambiente elegante y relajado. Nuestros bartenders expertos en mixología crean cócteles artesanales únicos que combinan sabores innovadores con presentaciones espectaculares. La carta de vinos selectos incluye etiquetas de las mejores bodegas internacionales, cuidadosamente seleccionadas por nuestro sommelier. El ambiente se complementa con música selecta, creando la atmósfera perfecta para socializar o relajarse.',
      features: ['Mixología de Autor', 'Vinos Selectos', 'Whiskeys Premium', 'Ambiente Live Music'],
      image: '/assets/images/bar.jpeg',
      color: 'bg-indigo-500'
    },
    {
      id: 'terrace',
      title: 'Terraza Panorámica',
      icon: CheckCircle,
      description: 'Espacios al aire libre con vistas impresionantes, perfectos para relajarse y disfrutar del clima.',
      detailedDescription: 'Nuestra terraza panorámica ofrece un ambiente cálido, convirtiéndose en el lugar perfecto para disfrutar del aire libre con estilo. El espacio está diseñado con zonas de descanso cómodas y elegantes, ideales para relajarse mientras contempla el paisaje urbano. Contamos con servicio de bar completo en la terraza, donde puede disfrutar de bebidas refrescantes y cócteles especiales. La terraza también está disponible para eventos privados, desde cenas íntimas hasta celebraciones especiales, ofreciendo un escenario único que harán de su evento una experiencia inolvidable.',
      features: ['Vistas Panorámicas', 'Zona de Descanso', 'Servicio de Bar', 'Eventos Privados'],
      image: '/assets/images/terraza.jpeg',
      color: 'bg-purple-500'
    }
  ];

  const amenities = [
    { icon: Wifi, label: 'WiFi High-Speed', description: 'Conectividad sin límites' },
    { icon: Car, label: 'Valet Parking', description: 'Seguridad 24/7' },
    { icon: Coffee, label: 'Breakfast Elite', description: 'Buffet internacional' },
    { icon: Dumbbell, label: 'Fitness Center', description: 'Equipos Technogym' },
    { icon: Bath, label: 'Private Spa', description: 'Tratamientos Premium' },
    { icon: Wind, label: 'Eco-Climate', description: 'Control de aire inteligente' },
    { icon: Tv, label: 'Entertainment', description: 'Smart TV & Streaming' },
    { icon: Phone, label: 'Guest Service', description: 'Atención personalizada' }
  ];

  return (
    <section id="servicios" className="py-32 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-blue-50/50 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-indigo-50/50 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-24">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Badge className="mb-6 bg-blue-500/10 text-blue-600 border-blue-200 px-4 py-1.5 rounded-full font-bold uppercase tracking-widest text-xs">
              Nuestros Servicios
            </Badge>
            <h2 className="text-5xl md:text-7xl font-black text-slate-950 mb-8 tracking-tight leading-[1.1]">
              Elevamos cada <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-indigo-600">Experiencia</span>
            </h2>
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
              Un ecosistema de servicios de lujo diseñados para anticipar sus deseos y superar sus expectativas.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
          {services.map((service, index) => (
            <motion.div key={service.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: index * 0.1 }}>
              <Card className="h-full overflow-hidden border-0 bg-white hover:bg-white transition-all duration-500 rounded-[2.5rem] shadow-lg hover:shadow-[0_30px_80px_rgba(0,0,0,0.12)] flex flex-col group">
                <div className="relative h-72 overflow-hidden">
                  <img src={service.image} alt={service.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent transition-all duration-500" />
                  <div className={`absolute top-6 left-6 p-4 rounded-3xl ${service.color} text-white shadow-xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    <service.icon className="w-7 h-7" />
                  </div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-3xl font-black text-white mb-2 tracking-tight uppercase drop-shadow-lg">
                      {service.title}
                    </h3>
                  </div>
                </div>

                <CardContent className="p-8 flex-1 flex flex-col">
                  <p className="text-slate-600 font-medium mb-8 flex-1 leading-relaxed text-base">
                    {service.description}
                  </p>

                  <ul className="space-y-3 mb-8">
                    {service.features.map((feature, idx) => (
                      <motion.li key={idx} className="flex items-center gap-3" initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 * idx }}>
                        <div className={`w-2 h-2 rounded-full ${service.color}`} />
                        <span className="text-sm font-bold text-slate-700 tracking-wide uppercase">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="w-full rounded-2xl border-2 border-slate-200 font-black uppercase tracking-widest text-[10px] py-6 hover:bg-slate-950 hover:text-white transition-all duration-300 group-hover:border-slate-300">
                        Explorar Servicio
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </DialogTrigger>
                    
                    {/* SOLUCIÓN AL BUG VISUAL: Se añadió padding pr-12 al Header y se cambió Calificación por Puntaje */}
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 border-none rounded-[2rem] sm:rounded-[3rem] shadow-2xl">
                      <DialogHeader className="p-8 pb-0 pr-12 text-left">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-2xl ${service.color} text-white shadow-lg flex-shrink-0`}>
                            <service.icon className="w-6 h-6 sm:w-8 sm:h-8" />
                          </div>
                          <DialogTitle className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight uppercase leading-tight break-words">
                            {service.title}
                          </DialogTitle>
                        </div>
                      </DialogHeader>

                      <div className="p-8 pt-6 space-y-6">
                        <div className="relative h-48 sm:h-64 rounded-2xl overflow-hidden shadow-inner">
                          <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        </div>

                        <DialogDescription className="text-base text-slate-700 leading-relaxed font-medium text-justify">
                          {service.detailedDescription}
                        </DialogDescription>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl border border-orange-100">
                                <div className="p-2 bg-white rounded-full text-orange-500 shadow-sm flex-shrink-0"><Clock className="w-5 h-5"/></div>
                                <div>
                                    <p className="text-[10px] text-orange-800 font-bold uppercase leading-none mb-1">Disponibilidad</p>
                                    <p className="text-sm font-medium text-slate-700 leading-none">24 Horas</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100 overflow-hidden">
                                <div className="p-2 bg-white rounded-full text-blue-500 shadow-sm flex-shrink-0"><Star className="w-5 h-5"/></div>
                                <div className="min-w-0">
                                    <p className="text-[10px] text-blue-800 font-bold uppercase leading-none mb-1">Puntaje</p>
                                    <p className="text-sm font-medium text-slate-700 leading-none whitespace-nowrap">4.9 / 5.0</p>
                                </div>
                            </div>
                        </div>

                        <div>
                          <h4 className="text-lg font-black text-slate-950 mb-4 uppercase tracking-wide">Características</h4>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {service.features.map((feature, idx) => (
                              <li key={idx} className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-100">
                                <CheckCircle className={`w-4 h-4 flex-shrink-0 ${service.color.replace('bg-', 'text-')}`} />
                                <span className="text-xs font-bold text-slate-700 uppercase">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="bg-slate-950 rounded-[3rem] p-12 lg:p-20 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-blue-600/20 via-transparent to-indigo-600/20 pointer-events-none" />
          <div className="relative z-10">
            <h3 className="text-3xl lg:text-4xl font-black text-white text-center mb-16 tracking-tight">Estándares de <span className="text-orange-400">Excelencia</span> Incluidos</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-8">
              {amenities.map((amenity, index) => (
                <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 * index }} className="text-center group">
                  <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-[2rem] flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 transition-all duration-500 border border-white/10 group-hover:border-blue-500">
                    <amenity.icon className="w-10 h-10 text-white" />
                  </div>
                  <h4 className="font-black text-white mb-2 uppercase tracking-widest text-xs">{amenity.label}</h4>
                  <p className="text-xs text-slate-400 font-medium">{amenity.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;