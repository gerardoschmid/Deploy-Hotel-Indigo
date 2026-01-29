import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import { 
    Calendar, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw, Eye, X, 
    UtensilsCrossed, BedDouble, Users, MapPin, PartyPopper 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';

const ReservationsPage = () => {
  const { user } = useAuth();
  
  // --- ESTADOS ---
  const [activeTab, setActiveTab] = useState('habitacion'); // 'habitacion' | 'restaurante' | 'salon'
  
  const [roomReservations, setRoomReservations] = useState([]);
  const [tableReservations, setTableReservations] = useState([]);
  const [salonReservations, setSalonReservations] = useState([]); 
  
  const [loading, setLoading] = useState(true);
  
  // Para el modal de detalles
  const [selectedItem, setSelectedItem] = useState(null); 
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (user?.id) {
        fetchAllReservations();
    }
  }, [user]);

  const fetchAllReservations = async () => {
    setLoading(true);
    try {
      // 1. Cargar Habitaciones (Este suele estar filtrado por el backend, pero mantenemos consistencia)
      try {
          const roomRes = await api.get('/api/reservas-habitacion/');
          const roomsData = roomRes.data.results || roomRes.data || [];
          roomsData.sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));
          setRoomReservations(roomsData);
      } catch (e) { console.error("Error habitaciones", e); }

      // 2. Cargar Mesas - FIX: Agregamos filtro por ID de usuario
      try {
          const tableRes = await api.get('/api/reservas-restaurante/reservas/', {
              params: { usuario: user.id }
          });
          const tablesData = tableRes.data.results || tableRes.data || [];
          tablesData.sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));
          setTableReservations(tablesData);
      } catch (e) { console.error("Error mesas", e); }

      // 3. Cargar Salones - FIX: Agregamos filtro por ID de usuario
      try {
          const salonRes = await api.get('/api/reservas-salon/reservas/', {
              params: { usuario: user.id }
          });
          const salonsData = salonRes.data.results || salonRes.data || [];
          salonsData.sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));
          setSalonReservations(salonsData);
      } catch (e) { console.error("Error salones", e); }

    } catch (error) {
      console.error('Error general:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- HELPERS ---
  const getStatusColor = (estado) => {
    switch (estado) {
      case 'confirmada': return 'bg-green-100 text-green-800 border-green-200';
      case 'pendiente': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'cancelada': return 'bg-red-100 text-red-800 border-red-200';
      case 'completada': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (estado) => {
    switch (estado) {
      case 'confirmada': return <CheckCircle className="w-4 h-4" />;
      case 'pendiente': return <Clock className="w-4 h-4" />;
      case 'cancelada': return <XCircle className="w-4 h-4" />;
      case 'completada': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatTime = (dateString) => {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const calculateNights = (checkin, checkout) => {
    if (!checkin || !checkout) return 0;
    const start = new Date(checkin);
    const end = new Date(checkout);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // --- CANCELACIÓN ---
  const handleCancelReservation = async (id, type) => {
    if (!window.confirm('¿Estás seguro de cancelar esta reserva?')) return;

    try {
        if (type === 'habitacion') {
            await api.patch(`/api/reservas-habitacion/${id}/`, { estado: 'cancelada' });
            setRoomReservations(prev => prev.map(r => r.id === id ? { ...r, estado: 'cancelada' } : r));
        } else if (type === 'restaurante') {
            await api.patch(`/api/reservas-restaurante/reservas/${id}/`, { estado: 'cancelada' });
            setTableReservations(prev => prev.map(r => r.id === id ? { ...r, estado: 'cancelada' } : r));
        } else if (type === 'salon') {
            await api.patch(`/api/reservas-salon/reservas/${id}/`, { estado: 'cancelada' });
            setSalonReservations(prev => prev.map(r => r.id === id ? { ...r, estado: 'cancelada' } : r));
        }
        setShowDetails(false);
    } catch (error) {
      console.error('Error cancelando reserva:', error);
      alert('Error al cancelar la reserva');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Cargando tus reservaciones...</p>
          </div>
        </div>
      </div>
    );
  }

  // Decidir qué lista mostrar
  let displayList = [];
  if (activeTab === 'habitacion') displayList = roomReservations;
  else if (activeTab === 'restaurante') displayList = tableReservations;
  else if (activeTab === 'salon') displayList = salonReservations;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header con Switch */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold text-slate-900 mb-1">Mis Reservaciones</h1>
                <p className="text-slate-600 text-sm">Gestiona tus estancias, cenas y eventos.</p>
            </div>

            {/* SWITCH ANIMADO RESPONSIVE */}
            <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm inline-flex relative w-full md:w-auto overflow-hidden">
                {[
                    { id: 'habitacion', icon: BedDouble, label: 'Habitaciones' },
                    { id: 'restaurante', icon: UtensilsCrossed, label: 'Restaurante' },
                    { id: 'salon', icon: PartyPopper, label: 'Eventos' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative z-10 flex-1 px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors duration-200 ${
                            activeTab === tab.id ? 'text-white' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activePill"
                                className="absolute inset-0 bg-slate-900 rounded-lg shadow-md -z-10"
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        )}
                        <tab.icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                ))}
            </div>

            <button onClick={fetchAllReservations} className="p-2 bg-white border border-slate-200 rounded-full hover:bg-slate-50 text-slate-600 transition-colors shadow-sm hidden md:block">
                <RefreshCw className="w-5 h-5" />
            </button>
        </div>

        {/* LISTA VACÍA */}
        {displayList.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white rounded-2xl shadow-sm border border-slate-200"
          >
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                {activeTab === 'habitacion' ? <Calendar className="w-10 h-10 text-slate-400" /> : activeTab === 'restaurante' ? <UtensilsCrossed className="w-10 h-10 text-slate-400" /> : <PartyPopper className="w-10 h-10 text-slate-400" />}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              No tienes reservaciones de {activeTab === 'habitacion' ? 'habitación' : activeTab === 'restaurante' ? 'mesa' : 'evento'}
            </h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              {activeTab === 'habitacion' ? 'Descubre nuestras habitaciones de lujo.' : activeTab === 'restaurante' ? 'Disfruta de la mejor gastronomía.' : 'Celebra tus momentos especiales con nosotros.'}
            </p>
            <button
              onClick={() => window.location.href = '/reservar'}
              className="bg-slate-900 text-white px-8 py-3 rounded-xl hover:bg-slate-800 transition-colors font-medium shadow-lg shadow-slate-900/20"
            >
              Reservar Ahora
            </button>
          </motion.div>
        ) : (
          
          /* GRID DE TARJETAS */
          <div className="space-y-4">
            {displayList.map((res, index) => (
              <motion.div
                key={res.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all cursor-pointer group"
                onClick={() => {
                    setSelectedItem({...res, type: activeTab}); 
                    setShowDetails(true);
                }}
              >
                <div className="p-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    {/* IZQUIERDA: Info Principal */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(res.estado)}`}>
                          {getStatusIcon(res.estado)}
                          {res.estado}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">#{res.codigo_confirmacion || res.codigo_reserva || res.codigo_evento || res.id}</span>
                      </div>
                      
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {activeTab === 'habitacion' 
                            ? `Habitación ${res.habitacion?.numero_habitacion || 'N/A'}`
                            : activeTab === 'restaurante'
                                ? `Mesa ${res.numero_mesa || res.mesa?.numero_mesa || 'N/A'}`
                                : `Evento: ${res.salon?.nombre || res.nombre_salon || 'Salón'}`
                        }
                        <span className="text-slate-400 font-normal ml-2 text-sm hidden sm:inline">
                            {activeTab === 'habitacion' 
                                ? `(${res.habitacion?.categoria?.replace('_', ' ') || 'Estándar'})`
                                : activeTab === 'restaurante'
                                    ? `(${res.cantidad_personas} Personas)`
                                    : `(${res.cantidad_invitados} Invitados)`
                            }
                        </span>
                      </h3>
                    </div>
                    
                    {/* CENTRO: Detalles Específicos */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-8 text-sm flex-[2]">
                        {activeTab === 'habitacion' ? (
                            <>
                                <div><p className="text-xs text-slate-500 mb-1">Entrada</p><div className="font-semibold text-slate-700 flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-400" />{formatDate(res.fecha_checkin)}</div></div>
                                <div><p className="text-xs text-slate-500 mb-1">Salida</p><div className="font-semibold text-slate-700 flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-400" />{formatDate(res.fecha_checkout)}</div></div>
                                <div><p className="text-xs text-slate-500 mb-1">Duración</p><div className="font-semibold text-slate-700 flex items-center gap-2"><Clock className="w-4 h-4 text-slate-400" />{calculateNights(res.fecha_checkin, res.fecha_checkout)} noches</div></div>
                                <div><p className="text-xs text-slate-500 mb-1">Total</p><div className="font-bold text-slate-900 text-base">${parseFloat(res.total || 0).toFixed(2)}</div></div>
                            </>
                        ) : activeTab === 'restaurante' ? (
                            <>
                                <div><p className="text-xs text-slate-500 mb-1">Fecha</p><div className="font-semibold text-slate-700 flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-400" />{formatDate(res.fecha_reserva)}</div></div>
                                <div><p className="text-xs text-slate-500 mb-1">Hora</p><div className="font-semibold text-slate-700 flex items-center gap-2"><Clock className="w-4 h-4 text-slate-400" />{formatTime(res.fecha_reserva)}</div></div>
                                <div><p className="text-xs text-slate-500 mb-1">Personas</p><div className="font-semibold text-slate-700 flex items-center gap-2"><Users className="w-4 h-4 text-slate-400" />{res.cantidad_personas}</div></div>
                                <div><p className="text-xs text-slate-500 mb-1">Tipo</p><div className="font-bold text-slate-900 text-base">Reserva</div></div>
                            </>
                        ) : (
                            <>
                                <div><p className="text-xs text-slate-500 mb-1">Fecha Evento</p><div className="font-semibold text-slate-700 flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-400" />{formatDate(res.fecha_evento)}</div></div>
                                <div><p className="text-xs text-slate-500 mb-1">Hora Inicio</p><div className="font-semibold text-slate-700 flex items-center gap-2"><Clock className="w-4 h-4 text-slate-400" />{formatTime(res.fecha_evento)}</div></div>
                                <div><p className="text-xs text-slate-500 mb-1">Invitados</p><div className="font-semibold text-slate-700 flex items-center gap-2"><Users className="w-4 h-4 text-slate-400" />{res.cantidad_invitados}</div></div>
                                <div><p className="text-xs text-slate-500 mb-1">Costo</p><div className="font-bold text-slate-900 text-base">${parseFloat(res.total_reserva || 0).toFixed(2)}</div></div>
                            </>
                        )}
                    </div>

                    {/* DERECHA: Icono */}
                    <div className="hidden md:flex items-center justify-end">
                        <button className="p-2 bg-slate-50 text-slate-400 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <Eye className="w-5 h-5" />
                        </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* MODAL DETALLES (Unificado) */}
        <AnimatePresence>
            {showDetails && selectedItem && (
            <div 
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                onClick={() => setShowDetails(false)} // Cierre al clic fuera
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]"
                    onClick={(e) => e.stopPropagation()} // Prevenir cierre
                >
                    <button onClick={() => setShowDetails(false)} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors z-10"><X className="w-5 h-5" /></button>

                    {/* Cabecera Dinámica */}
                    <div className="bg-slate-900 p-8 text-white relative flex-shrink-0">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        <div className="relative z-10">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 backdrop-blur-md mb-4 border border-white/20`}>
                                {getStatusIcon(selectedItem.estado)} {selectedItem.estado}
                            </span>
                            
                            {selectedItem.type === 'habitacion' ? (
                                <>
                                    <h2 className="text-3xl font-bold mb-1">Habitación {selectedItem.habitacion?.numero_habitacion}</h2>
                                    <p className="text-slate-300 capitalize">{selectedItem.habitacion?.categoria?.replace('_', ' ')}</p>
                                </>
                            ) : selectedItem.type === 'restaurante' ? (
                                <>
                                    <h2 className="text-3xl font-bold mb-1">Mesa {selectedItem.numero_mesa || selectedItem.mesa?.numero_mesa}</h2>
                                    <p className="text-slate-300">Reserva de Restaurante</p>
                                </>
                            ) : (
                                <>
                                    <h2 className="text-3xl font-bold mb-1">{selectedItem.salon?.nombre || selectedItem.nombre_salon || 'Salón de Eventos'}</h2>
                                    <p className="text-slate-300">Reserva de Evento</p>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="p-6 overflow-y-auto">
                        {/* Info Principal Grid */}
                        <div className="grid grid-cols-2 gap-6 mb-8">
                            {selectedItem.type === 'habitacion' ? (
                                <>
                                    <div className="bg-slate-50 p-4 rounded-xl"><p className="text-xs text-slate-500 uppercase font-bold mb-1">Check-in</p><p className="text-slate-900 font-medium">{formatDate(selectedItem.fecha_checkin)}</p></div>
                                    <div className="bg-slate-50 p-4 rounded-xl"><p className="text-xs text-slate-500 uppercase font-bold mb-1">Check-out</p><p className="text-slate-900 font-medium">{formatDate(selectedItem.fecha_checkout)}</p></div>
                                </>
                            ) : selectedItem.type === 'restaurante' ? (
                                <>
                                    <div className="bg-slate-50 p-4 rounded-xl"><p className="text-xs text-slate-500 uppercase font-bold mb-1">Fecha</p><p className="text-slate-900 font-medium">{formatDate(selectedItem.fecha_reserva)}</p></div>
                                    <div className="bg-slate-50 p-4 rounded-xl"><p className="text-xs text-slate-500 uppercase font-bold mb-1">Hora</p><p className="text-slate-900 font-medium">{formatTime(selectedItem.fecha_reserva)}</p></div>
                                </>
                            ) : (
                                <>
                                    <div className="bg-slate-50 p-4 rounded-xl"><p className="text-xs text-slate-500 uppercase font-bold mb-1">Fecha Evento</p><p className="text-slate-900 font-medium">{formatDate(selectedItem.fecha_evento)}</p></div>
                                    <div className="bg-slate-50 p-4 rounded-xl"><p className="text-xs text-slate-500 uppercase font-bold mb-1">Hora Inicio</p><p className="text-slate-900 font-medium">{formatTime(selectedItem.fecha_evento)}</p></div>
                                </>
                            )}
                        </div>

                        <div className="space-y-4 text-sm text-slate-600 mb-8">
                            <div className="flex justify-between border-b border-slate-100 pb-3">
                                <span>Código</span>
                                <span className="font-mono font-bold text-slate-900">{selectedItem.codigo_confirmacion || selectedItem.codigo_reserva || selectedItem.codigo_evento}</span>
                            </div>
                            
                            {selectedItem.type === 'habitacion' ? (
                                <div className="flex justify-between border-b border-slate-100 pb-3">
                                    <span>Total Pagado</span>
                                    <span className="font-bold text-lg text-blue-600">${parseFloat(selectedItem.total).toFixed(2)}</span>
                                </div>
                            ) : selectedItem.type === 'restaurante' ? (
                                <div className="flex justify-between border-b border-slate-100 pb-3">
                                    <span>Comensales</span>
                                    <span className="font-bold text-lg text-blue-600">{selectedItem.cantidad_personas}</span>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between border-b border-slate-100 pb-3">
                                        <span>Invitados</span>
                                        <span className="font-bold text-lg text-blue-600">{selectedItem.cantidad_invitados}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-100 pb-3">
                                        <span>Costo Total</span>
                                        <span className="font-bold text-lg text-blue-600">${parseFloat(selectedItem.total_reserva).toFixed(2)}</span>
                                    </div>
                                </>
                            )}

                            {selectedItem.notas && (
                                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-yellow-800 text-xs">
                                    <strong>Notas:</strong> {selectedItem.notas}
                                </div>
                            )}
                        </div>

                        {/* Botón Cancelar */}
                        {(selectedItem.estado === 'pendiente' || selectedItem.estado === 'confirmada') ? (
                            <div className="flex justify-center pt-2">
                                <button
                                    onClick={() => handleCancelReservation(selectedItem.id, selectedItem.type)}
                                    className="w-full sm:w-auto bg-red-50 text-red-600 px-8 py-3 rounded-xl hover:bg-red-100 transition-colors font-bold text-sm flex items-center justify-center gap-2"
                                >
                                    <XCircle className="w-4 h-4" /> Cancelar Reserva
                                </button>
                            </div>
                        ) : (
                            <div className="text-center text-xs text-slate-400 italic">
                                * Esta reserva no se puede cancelar ({selectedItem.estado}).
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
            )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default ReservationsPage;