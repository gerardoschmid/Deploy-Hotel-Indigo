import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // <--- 1. Importamos useNavigate
import { useAuth } from '../context/AuthContext';
import { Home, Calendar, User, LogOut, Menu, X, Phone } from 'lucide-react';

const Navigation = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate(); // <--- 2. Inicializamos el hook
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();       // Cierra la sesión (borra tokens)
    navigate('/');  // <--- 3. Redirige forzosamente al Inicio (Home)
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
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isActive('/') ? 'bg-primary text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <Home className="w-4 h-4" />
              Inicio
            </Link>

            <Link
              to="/reservar"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isActive('/reservar') || isActive('/reservar/') ? 'bg-primary text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <Calendar className="w-4 h-4" />
              Reservar
            </Link>

            {user && (
              <Link
                to="/mis-reservas"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isActive('/mis-reservas') ? 'bg-primary text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                <Calendar className="w-4 h-4" />
                Mis Reservas
              </Link>
            )}

            <Link
              to="/contacto"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isActive('/contacto') ? 'bg-primary text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <Phone className="w-4 h-4" />
              Contacto
            </Link>
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
                <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center">
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
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <User className="w-4 h-4" />
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Registrase
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-4">
            <div className="space-y-2">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/') ? 'bg-primary text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
              >
                <Home className="w-5 h-5" />
                Inicio
              </Link>

              <Link
                to="/reservar"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/reservar') || isActive('/reservar/') ? 'bg-primary text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
              >
                <Calendar className="w-5 h-5" />
                Reservar
              </Link>

              {user && (
                <Link
                  to="/mis-reservas"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/mis-reservas') ? 'bg-primary text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                >
                  <Calendar className="w-5 h-5" />
                  Mis Reservas
                </Link>
              )}

              <Link
                to="/contacto"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/contacto') ? 'bg-primary text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
              >
                <Phone className="w-5 h-5" />
                Contacto
              </Link>

              <div className="border-t border-slate-200 pt-2 mt-2">
                {user ? (
                  <>
                    <div className="px-3 py-2">
                      <p className="font-medium text-slate-900">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-sm text-slate-500">{user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      Cerrar Sesión
                    </button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 w-full px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <User className="w-5 h-5" />
                      Iniciar Sesión
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full text-center bg-primary text-white px-3 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Registrarse
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;