import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Instagram, 
  ArrowRight,
  Plus,
  Minus,
  HelpCircle,
  Clock,
  Car,
  Wifi
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

// Iconos personalizados
const TikTokIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.65-1.62-1.12-1.09 3.39-4.23 5.86-7.82 5.86a8.42 8.42 0 0 1-8.38-8.52c.04-4.66 3.9-8.41 8.58-8.38.07 2.05.05 4.1.05 6.15-.04 2.36-1.92 4.28-4.29 4.29-2.39.02-4.35-1.9-4.35-4.29 0-2.37 1.93-4.3 4.3-4.3 1.12-.03 2.19.46 2.97 1.29l2.97-2.97c-1.6-1.62-3.8-2.55-6.07-2.53C5.69.05.02 5.68.02 12.63c0 6.96 5.7 12.6 12.66 12.6 6.95-.01 12.6-5.69 12.6-12.64 0-.05 0-.1 0-.15h-4.06c-.03 1.63-.56 3.25-1.57 4.58-1.22 1.58-3.1 2.52-5.11 2.51-3.66.03-6.66-2.91-6.68-6.58-.02-3.66 2.94-6.64 6.6-6.66 1.34 0 2.63.39 3.73 1.12V.02h-3.26z"/>
  </svg>
);

const ContactPage = () => {
  // Estado para controlar qué pregunta está abierta
  const [openFaq, setOpenFaq] = useState(0);

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Nuestra Ubicación',
      details: 'Av. 23 de enero, Barinas',
      sub: 'Venezuela',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Phone,
      title: 'Llámanos',
      details: '+58 414 568 1706',
      sub: 'Atención 24/7',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: Mail,
      title: 'Escríbenos',
      details: 'hotelvaryna54@gmail.com',
      sub: 'Respuesta en < 24h',
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  const socialLinks = [
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/hotelindigobarinas/?hl=es',
      icon: Instagram,
      gradient: 'from-pink-500 via-red-500 to-yellow-500',
      label: 'Síguenos'
    },
    {
      name: 'TikTok',
      url: 'https://www.tiktok.com/@hotelindigobarinas?is_from_webapp=1&sender_device=pc',
      icon: TikTokIcon,
      gradient: 'from-black via-gray-900 to-slate-800',
      label: 'Ver Videos'
    },
    {
      name: 'WhatsApp',
      url: 'https://wa.me/+584145070100',
      icon: Phone,
      gradient: 'from-green-400 to-green-600',
      label: 'Chatear'
    }
  ];

  // Datos para las Preguntas Frecuentes
  const faqs = [
    {
      question: "¿Cuáles son los horarios de Check-in y Check-out?",
      answer: "Nuestro horario de Check-in comienza a las 3:00 PM y el Check-out es hasta las 12:00 PM. Si necesitas flexibilidad, contáctanos para verificar disponibilidad.",
      icon: Clock
    },
    {
      question: "¿Cuentan con estacionamiento privado?",
      answer: "Sí, ofrecemos estacionamiento privado gratuito y vigilado las 24 horas para la tranquilidad de todos nuestros huéspedes.",
      icon: Car
    },
    {
      question: "¿El Wi-Fi es gratuito en todo el hotel?",
      answer: "Absolutamente. Contamos con internet de alta velocidad por fibra óptica en todas las habitaciones y áreas comunes sin costo adicional.",
      icon: Wifi
    },
    {
      question: "¿Ofrecen servicios de traslado?",
      answer: "Sí, podemos coordinar taxis ejecutivos o traslados privados desde y hacia el aeropuerto bajo solicitud previa en recepción.",
      icon: MapPin
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navigation />

      {/* Hero Section Minimalista */}
      <div className="relative bg-slate-900 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
            <img 
                src="/assets/images/lobby.png" 
                alt="Fondo Contacto" 
                className="w-full h-full object-cover"
            />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-900" />
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
              Contáctanos
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto font-light">
              Estamos aquí para ayudarte a planificar tu estancia perfecta. Encuentra respuestas rápidas o comunícate con nosotros.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="flex-1 container mx-auto px-6 lg:px-12 py-16 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna Izquierda: Información y Redes */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* Tarjeta de Información de Contacto */}
            <div className="bg-white rounded-[2rem] shadow-xl p-8 border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Información Directa</h3>
              <div className="space-y-6">
                {contactInfo.map((item, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <div className={`w-12 h-12 ${item.color} rounded-2xl flex items-center justify-center shrink-0`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">{item.title}</p>
                      <p className="font-medium text-slate-900 leading-tight">{item.details}</p>
                      <p className="text-sm text-slate-400 mt-1">{item.sub}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Tarjetas de Redes Sociales */}
            <div className="bg-white rounded-[2rem] shadow-xl p-8 border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Síguenos</h3>
              <div className="grid grid-cols-1 gap-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group relative overflow-hidden rounded-xl p-4 flex items-center justify-between text-white shadow-lg transition-transform hover:-translate-y-1`}
                  >
                    {/* Background Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${social.gradient} opacity-90 group-hover:opacity-100 transition-opacity`} />
                    
                    <div className="relative flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <social.icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-bold">{social.name}</span>
                    </div>
                    
                    <div className="relative flex items-center text-xs font-medium bg-white/10 px-3 py-1 rounded-full">
                        {social.label} <ArrowRight className="w-3 h-3 ml-1" />
                    </div>
                  </a>
                ))}
              </div>
            </div>

          </div>

          {/* Columna Derecha: Preguntas Frecuentes (Sustituyendo al formulario) */}
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-8 md:p-12 h-full flex flex-col"
            >
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider mb-4">
                    <HelpCircle className="w-4 h-4" />
                    Centro de Ayuda
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
                    Preguntas Frecuentes
                </h2>
                <p className="text-slate-500 text-lg">
                    Resolvemos las dudas más comunes para que disfrutes tu estancia sin preocupaciones.
                </p>
              </div>

              {/* Acordeón de FAQs */}
              <div className="space-y-4 flex-1">
                {faqs.map((faq, index) => (
                    <motion.div 
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`border rounded-2xl overflow-hidden transition-all duration-300 ${openFaq === index ? 'border-indigo-200 bg-indigo-50/30 shadow-md' : 'border-slate-100 hover:border-slate-300'}`}
                    >
                        <button
                            onClick={() => setOpenFaq(openFaq === index ? null : index)}
                            className="w-full flex items-center justify-between p-6 text-left"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${openFaq === index ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                    <faq.icon className="w-5 h-5" />
                                </div>
                                <span className={`font-bold text-lg ${openFaq === index ? 'text-indigo-900' : 'text-slate-700'}`}>
                                    {faq.question}
                                </span>
                            </div>
                            <div className={`transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`}>
                                {openFaq === index ? (
                                    <Minus className="w-5 h-5 text-indigo-600" />
                                ) : (
                                    <Plus className="w-5 h-5 text-slate-400" />
                                )}
                            </div>
                        </button>
                        
                        <AnimatePresence>
                            {openFaq === index && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="px-6 pb-6 pl-20">
                                        <p className="text-slate-600 leading-relaxed">
                                            {faq.answer}
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
              </div>

              {/* Banner inferior de Ayuda Extra */}


            </motion.div>
          </div>
        </div>

        {/* Sección del Mapa (Full Width debajo) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100 p-2"
        >
          <div className="relative w-full h-96 rounded-[2rem] overflow-hidden">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3949.497534415273!2d-70.2319224!3d8.6268759!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e7b57976e6d7821%3A0x629399202568600f!2sAv.%2023%20de%20Enero%2C%20Barinas!5e0!3m2!1ses!2sve!4v1700000000000!5m2!1ses!2sve" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              className="grayscale hover:grayscale-0 transition-all duration-700"
            />
            {/* Overlay Informativo sobre el mapa */}
            <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/50 max-w-xs hidden sm:block">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 leading-none">Hotel Indigo</p>
                  <p className="text-xs text-slate-500">Barinas, Venezuela</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                Ubicados estratégicamente en la Av. 23 de Enero, cerca de los principales centros comerciales y financieros.
              </p>
            </div>
          </div>
        </motion.div>

      </div>

      <Footer />
    </div>
  );
};

export default ContactPage;