import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Phone, 
  Mail, 
  MapPin, 
  Facebook, 
  Instagram, 
  Twitter,
  ChevronDown,
  Calendar,
  User,
  LogIn,
  UserPlus,
  Shield,
  LogOut
} from 'lucide-react';
import { Button } from './ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleReserveClick = () => {
    navigate('/#reservar');
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Top Bar */}
      <div className="bg-slate-900 text-white py-2 text-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+58 414-1234567</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>info@hotelindigo.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Caracas, Venezuela</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <a href="#" className="hover:text-blue-400 transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  <Twitter className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/95 backdrop-blur-sm shadow-lg py-2' : 'bg-background py-4'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">H</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Hotel Indigo</h1>
                <p className="text-xs text-muted-foreground hidden md:block">Lujo y Comodidad</p>
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-8">
              <Link 
                to="/" 
                className="text-foreground hover:text-primary font-medium transition-colors"
              >
                Inicio
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 text-foreground hover:text-primary font-medium transition-colors">
                  Habitaciones
                  <ChevronDown className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <Link to="/#habitaciones">Todas las Habitaciones</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to="/#habitaciones">Suites de Lujo</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to="/#habitaciones">Habitaciones Estándar</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Link 
                to="/#servicios" 
                className="text-foreground hover:text-primary font-medium transition-colors"
              >
                Servicios
              </Link>
              <Link 
                to="/#galeria" 
                className="text-foreground hover:text-primary font-medium transition-colors"
              >
                Galería
              </Link>
              <Link 
                to="/#contacto" 
                className="text-foreground hover:text-primary font-medium transition-colors"
              >
                Contacto
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => window.open('http://localhost:8000/admin/', '_blank')}
                className="flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Panel Admin
              </Button>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {user.first_name || user.username}
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Mi Perfil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Mis Reservas
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => logout()} className="flex items-center gap-2">
                      <LogOut className="w-4 h-4" />
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Mi Cuenta
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to="/login" className="flex items-center gap-2">
                        <LogIn className="w-4 h-4" />
                        Iniciar Sesión
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/register" className="flex items-center gap-2">
                        <UserPlus className="w-4 h-4" />
                        Registrarse
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.open('http://localhost:8000/admin/', '_blank')} className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Panel Admin
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <Button
                onClick={handleReserveClick}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Reservar Ahora
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-background border-t">
            <div className="container mx-auto px-4 py-4 space-y-4">
              <Link 
                to="/" 
                className="block text-foreground hover:text-primary font-medium transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Inicio
              </Link>
              <Link 
                to="/#habitaciones" 
                className="block text-foreground hover:text-primary font-medium transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Habitaciones
              </Link>
              <Link 
                to="/#servicios" 
                className="block text-foreground hover:text-primary font-medium transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Servicios
              </Link>
              <Link 
                to="/#galeria" 
                className="block text-foreground hover:text-primary font-medium transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Galería
              </Link>
              <Link 
                to="/#contacto" 
                className="block text-foreground hover:text-primary font-medium transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Contacto
              </Link>
              
              <div className="border-t pt-4 space-y-3">
                <Button
                  variant="outline"
                  onClick={() => window.open('http://localhost:8000/admin/', '_blank')}
                  className="w-full flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Panel Admin
                </Button>
                {user ? (
                  <>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild className="w-full">
                        <Button variant="ghost" className="flex items-center gap-2 w-full justify-start">
                          <User className="w-4 h-4" />
                          {user.first_name || user.username}
                          <ChevronDown className="w-4 h-4 ml-auto" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-full">
                        <DropdownMenuItem asChild>
                          <Link to="/profile" className="flex items-center gap-2 w-full">
                            <User className="w-4 h-4" />
                            Mi Perfil
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/profile" className="flex items-center gap-2 w-full">
                            <Calendar className="w-4 h-4" />
                            Mis Reservas
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => logout()} className="flex items-center gap-2 w-full">
                          <LogOut className="w-4 h-4" />
                          Cerrar Sesión
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild className="w-full">
                      <Button variant="ghost" className="flex items-center gap-2 w-full justify-start">
                        <User className="w-4 h-4" />
                        Mi Cuenta
                        <ChevronDown className="w-4 h-4 ml-auto" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-full">
                      <DropdownMenuItem asChild>
                        <Link to="/login" className="flex items-center gap-2 w-full">
                          <LogIn className="w-4 h-4" />
                          Iniciar Sesión
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/register" className="flex items-center gap-2 w-full">
                          <UserPlus className="w-4 h-4" />
                          Registrarse
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.open('http://localhost:8000/admin/', '_blank')} className="flex items-center gap-2 w-full">
                        <Shield className="w-4 h-4" />
                        Panel Admin
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                <Button
                  onClick={handleReserveClick}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Reservar Ahora
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
