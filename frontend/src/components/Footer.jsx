import React from 'react';
import { Link } from 'react-router-dom';
import {
  Instagram,
  MapPin,
  Phone, // Usaremos este mismo icono para el WhatsApp
  Mail,
  Wifi,
  Car,
  Coffee,
  Shield,
  Award,
  Star,
  ChevronRight,
  Globe
} from 'lucide-react';
import { Badge } from './ui/badge';

// --- ICONOS PERSONALIZADOS (Solo TikTok) ---
const TikTokIcon = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);
// -------------------------------------------------

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { title: 'Sobre Nosotros', href: '#about' },
    { title: 'Habitaciones', href: '#habitaciones' },
    { title: 'Servicios Elite', href: '#servicios' },
    { title: 'Galería Visual', href: '#galeria' },
    { title: 'Contacto VIP', href: '#contacto' }
  ];

  const contactInfo = [
    { icon: MapPin, text: 'Av. 23 de enero, Barinas' },
    { icon: Phone, text: '+58 414 568 1706' },
    { icon: Mail, text: 'hotelvaryna54@gmail.com' }
  ];

  // Configuración de Redes Sociales
  const socialLinks = [
    { 
      icon: Instagram, 
      href: 'https://www.instagram.com/hotelindigobarinas/?hl=es', 
      color: 'hover:bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]' 
    },
    { 
      icon: TikTokIcon, 
      href: 'https://www.tiktok.com/@hotelindigobarinas?is_from_webapp=1&sender_device=pc', 
      color: 'hover:bg-black hover:text-white border-white/20' 
    },
    { 
      // CAMBIO: Ahora usamos el icono 'Phone' pero mantenemos el color verde
      icon: Phone, 
      href: 'https://wa.me/+584145070100', 
      color: 'hover:bg-[#25D366] hover:border-[#25D366]' 
    }
  ];

  return (
    <footer className="bg-slate-950 text-white relative overflow-hidden group">
      
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 lg:px-12 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-24">
          {/* Hotel Info */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <span className="text-white font-black text-3xl">I</span>
              </div>
              <div className="tracking-tighter">
                <h3 className="text-3xl font-black uppercase">Hotel Indigo</h3>
                <p className="text-blue-500 text-xs font-black tracking-[0.3em] uppercase">Barinas</p>
              </div>
            </div>

            <p className="text-slate-400 text-lg font-medium mb-10 leading-relaxed max-w-md">
              Redefiniendo el concepto de hospitalidad urbana y familiar en Venezuela.
              Sinfonía perfecta entre arquitectura moderna, confort supremo y un legado de servicio impecable.
            </p>

            {/* Awards & Rating */}
            <div className="flex items-center gap-8 mb-12">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                  ))}
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Luxury Certified</span>
              </div>
              <div className="h-10 w-[1px] bg-white/10" />
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 text-blue-500 opacity-60" />
                <span className="text-sm font-bold text-slate-300">Barinas</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex items-center gap-5">
              {socialLinks.map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center transition-all duration-300 ${social.color} hover:scale-110 active:scale-95 group/soc`}
                >
                  <social.icon className="w-5 h-5 text-slate-400 group-hover/soc:text-white group-hover/soc:scale-110 transition-all" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-12">
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-10 flex items-center gap-3">
                <span className="w-4 h-[2px] bg-blue-600" /> Navegación
              </h4>
              <ul className="space-y-6">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <Link
                      to={link.href}
                      className="text-slate-400 hover:text-white transition-all text-sm font-bold uppercase tracking-widest flex items-center group/link"
                    >
                      <ChevronRight className="w-0 h-3 group-hover/link:w-4 transition-all opacity-0 group-hover/link:opacity-100 text-blue-500" />
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-10 flex items-center gap-3">
                <span className="w-4 h-[2px] bg-blue-600" /> Contacto
              </h4>
              <ul className="space-y-8">
                {contactInfo.map((info, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <info.icon className="w-4 h-4 text-blue-500" />
                    </div>
                    <span className="text-sm font-medium text-slate-400 leading-tight pt-1">{info.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="bg-slate-950 border-t border-white/5 relative z-10">
        <div className="container mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">
              © {currentYear} Indigo Management Group. All Rights Reserved.
            </p>

            <div className="flex flex-wrap justify-center items-center gap-8 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <a href="#" className="hover:text-blue-500 transition-colors text-center md:text-left">
                Software Desarrollado por estudiantes Ingenieria en Informatica - UNELLEZ - VPDS 8vo Semestre
              </a>
              <div className="h-4 w-[1px] bg-white/5 mx-2 hidden md:block" />
              <div className="flex items-center gap-3 text-slate-400">
                <Globe className="w-3 h-3 text-blue-600" />
                <span>Venezuela</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                <Shield className="w-3 h-3 text-emerald-500" />
                <span className="text-emerald-500/80">INDIGO HOTEL</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Accents */}
      <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-y-1/2" />
    </footer>
  );
};

export default Footer;