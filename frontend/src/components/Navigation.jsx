import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  Calendar, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Phone, 
  BedDouble, 
  Utensils, 
  PartyPopper,
  ChevronRight 
} from 'lucide-react';

const Navigation = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  // Cerramos el menú automáticamente si se redimensiona a pantalla grande
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  // Función para scroll suave a secciones
  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 overflow-hidden flex items-center justify-center">
                <img src="/images/logo_indigo.png" alt="Hotel Indigo Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-xl font-bold text-slate-900">Hotel Indigo</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isActive('/') ? 'bg-primary text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Home className="w-4 h-4" />
              Inicio
            </Link>

            <Link
              to="/reservar"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isActive('/reservar') || isActive('/reservar/') ? 'bg-primary text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Calendar className="w-4 h-4" />
              Reservar
            </Link>

            {user && (
              <Link
                to="/mis-reservas"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isActive('/mis-reservas') ? 'bg-primary text-white' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <Calendar className="w-4 h-4" />
                Mis Reservas
              </Link>
            )}

            <Link
              to="/contacto"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isActive('/contacto') ? 'bg-primary text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Phone className="w-4 h-4" />
              Contacto
            </Link>
          </div>

          {/* User Menu Desktop */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">{user.first_name} {user.last_name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
                <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                  {user.first_name?.[0]?.toUpperCase() || 'U'}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Salir
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium">Iniciar Sesión</Link>
                <Link to="/register" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">Registrarse</Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 relative z-[60]"
            >
              {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* --- Mobile Navigation (Overlay System) --- */}
      <div className={`
        md:hidden fixed inset-0 z-50 transition-all duration-300
        ${mobileMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'}
      `}>
        <div 
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
          onClick={() => setMobileMenuOpen(false)}
        />

        <div className={`
          absolute top-0 right-0 w-4/5 max-w-sm h-full bg-white shadow-2xl flex flex-col
          transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
          <div className="p-6 pt-20 flex-1 overflow-y-auto">
            {/* Links de Navegación Estándar */}
            <div className="space-y-4">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${isActive('/') ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Home className="w-5 h-5" />
                <span className="font-semibold">Inicio</span>
              </Link>

              {/* ÍNDICE RÁPIDO (Solo aparece si estamos en el Home) */}
              {isActive('/') && (
                <div className="ml-4 pl-4 border-l-2 border-slate-100 space-y-2 py-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Saltar a:</p>
                  <button onClick={() => scrollToSection('habitaciones')} className="flex items-center justify-between w-full p-2 text-slate-500 hover:text-primary transition-colors">
                    <div className="flex items-center gap-3">
                      <BedDouble className="w-4 h-4" />
                      <span className="text-sm font-medium">Habitaciones</span>
                    </div>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                  <button onClick={() => scrollToSection('mesas')} className="flex items-center justify-between w-full p-2 text-slate-500 hover:text-primary transition-colors">
                    <div className="flex items-center gap-3">
                      <Utensils className="w-4 h-4" />
                      <span className="text-sm font-medium">Restaurante</span>
                    </div>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                  <button onClick={() => scrollToSection('salones')} className="flex items-center justify-between w-full p-2 text-slate-500 hover:text-primary transition-colors">
                    <div className="flex items-center gap-3">
                      <PartyPopper className="w-4 h-4" />
                      <span className="text-sm font-medium">Salones</span>
                    </div>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              )}

              <Link
                to="/reservar"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${isActive('/reservar') || isActive('/reservar/') ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Calendar className="w-5 h-5" />
                <span className="font-semibold">Reservar</span>
              </Link>

              {user && (
                <Link
                  to="/mis-reservas"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${isActive('/mis-reservas') ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <Calendar className="w-5 h-5" />
                  <span className="font-semibold">Mis Reservas</span>
                </Link>
              )}

              <Link
                to="/contacto"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${isActive('/contacto') ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Phone className="w-5 h-5" />
                <span className="font-semibold">Contacto</span>
              </Link>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100">
              {user ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 px-2">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xl font-bold">
                      {user.first_name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{user.first_name} {user.last_name}</p>
                      <p className="text-sm text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-4 w-full px-4 py-3 text-red-600 bg-red-50 rounded-xl font-bold transition-all active:scale-95"
                  >
                    <LogOut className="w-5 h-5" />
                    Cerrar Sesión
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center py-3 border border-slate-200 font-bold text-slate-700 rounded-xl"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20"
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
