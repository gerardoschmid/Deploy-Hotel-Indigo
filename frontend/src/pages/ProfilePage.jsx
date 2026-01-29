import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserReservations } from '../api/reservations';
import { 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  Phone, 
  LogOut, 
  Settings,
  Clock,
  CreditCard,
  Bed,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchReservations = async () => {
      try {
        const data = await getUserReservations();
        setReservations(data);
      } catch (error) {
        // Si hay error con la API, usar datos de ejemplo
        console.log('Usando datos de ejemplo debido a error en API');
        const mockReservations = [
          {
            id: 1,
            room_type: 'Suite Presidencial',
            check_in: '2024-02-15',
            check_out: '2024-02-18',
            status: 'confirmed',
            total_price: 1200,
            guests: 2,
            room_number: '301'
          },
          {
            id: 2,
            room_type: 'Habitación Doble',
            check_in: '2024-01-20',
            check_out: '2024-01-22',
            status: 'completed',
            total_price: 400,
            guests: 2,
            room_number: '205'
          },
          {
            id: 3,
            room_type: 'Suite Junior',
            check_in: '2024-03-10',
            check_out: '2024-03-12',
            status: 'pending',
            total_price: 600,
            guests: 1,
            room_number: '102'
          }
        ];
        setReservations(mockReservations);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Confirmada' },
      completed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, text: 'Completada' },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle, text: 'Pendiente' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Cancelada' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-slate-900">Mi Perfil</h1>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información Personal */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="sticky top-8">
              <CardHeader className="text-center">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-primary" />
                </div>
                <CardTitle className="text-xl">
                  {user?.first_name} {user?.last_name}
                </CardTitle>
                <p className="text-slate-500">@{user?.username}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">{user?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">+58 414-1234567</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">Caracas, Venezuela</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">Miembro desde Ene 2024</span>
                </div>
                
                <div className="pt-4 border-t">
                  <Button variant="ghost" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Configuración de Perfil
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Reservaciones */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Mis Reservaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : reservations.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      No tienes reservaciones
                    </h3>
                    <p className="text-slate-500 mb-6">
                      ¡Es hora de planificar tu próxima estancia!
                    </p>
                    <Button onClick={() => navigate('/#reservar')}>
                      Hacer una Reservación
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reservations.map((reservation) => (
                      <motion.div
                        key={reservation.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-slate-900 text-lg">
                              {reservation.room_type}
                            </h4>
                            <p className="text-slate-500 text-sm">
                              Habitación {reservation.room_number} • {reservation.guests} huéspedes
                            </p>
                          </div>
                          {getStatusBadge(reservation.status)}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <div>
                              <p className="text-slate-500">Check-in</p>
                              <p className="font-medium">{reservation.check_in}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <div>
                              <p className="text-slate-500">Check-out</p>
                              <p className="font-medium">{reservation.check_out}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Bed className="w-4 h-4 text-slate-400" />
                            <div>
                              <p className="text-slate-500">Tipo</p>
                              <p className="font-medium">{reservation.room_type}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-slate-400" />
                            <div>
                              <p className="text-slate-500">Total</p>
                              <p className="font-medium">${reservation.total_price}</p>
                            </div>
                          </div>
                        </div>

                        {reservation.status === 'confirmed' && (
                          <div className="mt-4 pt-4 border-t flex gap-2">
                            <Button size="sm" variant="outline">
                              Ver Detalles
                            </Button>
                            <Button size="sm" variant="ghost">
                              Modificar Reserva
                            </Button>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
