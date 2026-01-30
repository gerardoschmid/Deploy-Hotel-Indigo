import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Utensils,
  Star,
  Clock,
  ChevronRight,
  Sparkles,
  Wine,
  ChefHat
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

const TablesSection = () => {
  const navigate = useNavigate();

  return (
    <section id="mesas" className="py-16 md:py-24 bg-white relative overflow-hidden">
      {/* Elementos Decorativos de Fondo (Lujo) */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-orange-50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 opacity-60" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-blue-50 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 opacity-60" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          
          {/* LADO IZQUIERDO: Composición Visual */}
          <div className="w-full lg:w-1/2 relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative z-10 rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-[0_20px_50px_-15px_rgba(0,0,0,0.3)] border-4 md:border-8 border-white"
            >
              <img 
                src="https://plus.unsplash.com/premium_photo-1661883237884-263e8de8869b?q=80&w=1189&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                alt="Restaurante de Lujo" 
                className="w-full h-[350px] md:h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
            </motion.div>

            {/* Tarjeta Flotante de Info (Solo visible desde tablet hacia arriba para no estorbar en móvil) */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="absolute -bottom-6 -right-6 md:right-10 bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-2xl z-20 border border-slate-100 hidden sm:block"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 md:w-12 h-12 bg-orange-500 rounded-xl md:rounded-2xl flex items-center justify-center text-white">
                  <Star className="w-5 h-5 md:w-6 h-6 fill-current" />
                </div>
                <div>
                  <p className="text-xs md:text-sm font-black text-slate-900">Gastronomía 5 Estrellas</p>
                  <p className="text-[10px] md:text-xs text-slate-500 font-medium">Experiencia Gourmet Elite</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* LADO DERECHO: Texto de Invitación y Botón */}
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-6 bg-orange-100 text-orange-600 border-orange-200 px-4 py-1.5 rounded-full font-bold uppercase tracking-widest text-[9px] md:text-[10px]">
                Restaurante Indigo Elite
              </Badge>
              
              <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-slate-950 mb-6 md:mb-8 tracking-tight leading-[1.1]">
                Una velada <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">Inolvidable</span> te espera
              </h2>
              
              <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed mb-8 md:mb-10 max-w-xl mx-auto lg:mx-0">
                Disfrute de la perfecta armonía entre sabores exóticos y un ambiente de sofisticación absoluta.
              </p>

              {/* Beneficios rápidos: Ajustados para 2 columnas en móvil */}
              <div className="grid grid-cols-2 gap-4 md:gap-6 mb-10 md:mb-12 max-w-md mx-auto lg:mx-0">
                {[
                  { icon: Wine, label: "Vinos Selectos" },
                  { icon: ChefHat, label: "Chefs de Élite" },
                  { icon: Clock, label: "Servicio VIP" },
                  { icon: Sparkles, label: "Ambiente Único" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2 md:gap-3">
                    <div className="w-9 h-9 md:w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-900 border border-slate-100 flex-shrink-0">
                      <item.icon className="w-4 h-4 md:w-5 h-5" />
                    </div>
                    <span className="text-[11px] md:text-sm font-bold text-slate-700 uppercase tracking-tighter text-left">{item.label}</span>
                  </div>
                ))}
              </div>

              {/* BOTÓN DE ACCIÓN CORREGIDO (RESPONSIVE) */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex justify-center lg:justify-start"
              >
                <Button 
                  onClick={() => navigate('/reservar')}
                  className="
                    bg-slate-950 hover:bg-slate-800 text-white 
                    w-full sm:w-auto
                    px-6 md:px-10 
                    py-7 md:py-8 
                    rounded-xl md:rounded-2xl 
                    text-sm md:text-base
                    font-black uppercase tracking-[0.1em] md:tracking-[0.2em] 
                    shadow-2xl transition-all 
                    flex items-center justify-center gap-4 
                    group
                  "
                >
                  <span>Reservar una Mesa</span>
                  <div className="bg-orange-500 p-1 md:p-1.5 rounded-lg group-hover:translate-x-1.5 transition-transform flex-shrink-0">
                    <ChevronRight className="w-4 h-4 md:w-5 h-5 text-white" />
                  </div>
                </Button>
              </motion.div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default TablesSection;