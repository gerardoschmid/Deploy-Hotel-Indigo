import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { 
    Users, Bed, Wifi, Car, Coffee, Dumbbell, Check, Star, MapPin, 
    DollarSign, Search, Wind, Tv, Bell, Mail, Lock, 
    UtensilsCrossed, BedDouble, Clock, CheckCircle, Info, ChevronRight, AlertCircle, X, XCircle, Sparkles,
    Calendar 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { createReservation } from '../api/reservations';

const ReservationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // --- CONFIGURACIÓN ---
  const TAX_RATE = 0.16; 
  const SALON_BLOCK_HOURS = 6; 

  // --- ESTADOS GENERALES ---
  const [activeTab, setActiveTab] = useState('habitacion'); 

  // --- ESTADOS DE UI/MODALES ---
  const [alertModal, setAlertModal] = useState({ show: false, type: 'success', title: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- ESTADOS HABITACIÓN ---
  const [habitaciones, setHabitaciones] = useState([]);
  const [habitacionSeleccionada, setHabitacionSeleccionada] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // --- ESTADOS RESTAURANTE ---
  const [tables, setTables] = useState([]);
  const [existingReservations, setExistingReservations] = useState([]); 
  const [loadingTables, setLoadingTables] = useState(false);
  const [restaurantForm, setRestaurantForm] = useState({
    date: '',
    time: '',
    guests: 2,
    tableId: null,
    notes: ''
  });

  // --- ESTADOS SALÓN ---
  const [salones, setSalones] = useState([]);
  const [existingSalonReservations, setExistingSalonReservations] = useState([]);
  const [salonSeleccionado, setSalonSeleccionado] = useState(null);
  const [salonForm, setSalonForm] = useState({
    date: '',
    time: '',
    guests: 50, 
  });

  // --- ESTADOS VERIFICACIÓN CORREO ---
  const [mostrarModalCodigo, setMostrarModalCodigo] = useState(false);
  const [codigoIngresado, setCodigoIngresado] = useState('');
  const [enviandoCodigo, setEnviandoCodigo] = useState(false);
  const [serverSessionKey, setServerSessionKey] = useState(null);
  const [reservationType, setReservationType] = useState(null); 

  const [formData, setFormData] = useState({
    fecha_checkin: '',
    fecha_checkout: '',
    huespedes: 1
  });

  const [servicios, setServicios] = useState({
    aireAcondicionado: false,
    ventilador: false,
    tvPlasma: false,
    servicioAlCuarto: false
  });

  const showAlert = (type, title, message) => {
    setAlertModal({ show: true, type, title, message });
  };

  const closeAlert = () => {
    setAlertModal({ ...alertModal, show: false });
    if (alertModal.type === 'success') {
        navigate('/mis-reservas');
    }
  };

  // --- EFECTOS ---
  useEffect(() => {
    if (activeTab === 'habitacion') {
        fetchHabitaciones();
    } else if (activeTab === 'restaurante') {
        fetchTables();
    } else if (activeTab === 'salon') {
        fetchSalones();
    }
    
    if (location.state?.selectedRoom && activeTab === 'habitacion') {
      setHabitacionSeleccionada(location.state.selectedRoom);
      setMostrarFormulario(true);
    }
  }, [activeTab, location.state]);

  useEffect(() => {
    if (restaurantForm.date && activeTab === 'restaurante') {
        fetchDailyReservations(restaurantForm.date);
    }
  }, [restaurantForm.date, activeTab]);

  useEffect(() => {
    if (salonForm.date && activeTab === 'salon') {
        fetchDailySalonReservations(salonForm.date);
    }
  }, [salonForm.date, activeTab]);


  // --- API CALLS ---
  const fetchHabitaciones = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/habitaciones/habitaciones/');
      setHabitaciones(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error obteniendo habitaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTables = async () => {
    setLoadingTables(true);
    try {
      const res = await api.get('/api/mesas-restaurante/mesas/');
      setTables(res.data.results || res.data || []);
    } catch (err) {
      console.error("Error cargando mesas", err);
    } finally {
      setLoadingTables(false);
    }
  };

  const fetchSalones = async () => {
    try {
        setLoading(true);
        const response = await api.get('/api/salones-eventos/salones/');
        setSalones(response.data.results || response.data || []);
    } catch (error) {
        console.error('Error cargando salones:', error);
    } finally {
        setLoading(false);
    }
  };

  const fetchDailyReservations = async (date) => {
    try {
        const res = await api.get('/api/reservas-restaurante/reservas/');
        const allRes = res.data.results || res.data || [];
        const dayReservations = allRes.filter(r => r.fecha_reserva.startsWith(date));
        setExistingReservations(dayReservations);
    } catch (err) {
        console.error("Error buscando disponibilidad", err);
    }
  };

  const fetchDailySalonReservations = async (date) => {
    try {
        const res = await api.get('/api/reservas-salon/reservas/');
        const allRes = res.data.results || res.data || [];
        const dayReservations = allRes.filter(r => r.fecha_evento.startsWith(date) && r.estado !== 'cancelada');
        setExistingSalonReservations(dayReservations);
    } catch (err) {
        console.error("Error buscando disponibilidad salones", err);
    }
  };

  const getSalonStatus = (salonId) => {
    if (!salonForm.time || !salonForm.date) return { occupied: false };
    
    const [selHour, selMin] = salonForm.time.split(':').map(Number);
    const selectedStart = selHour * 60 + selMin;
    const selectedEnd = selectedStart + (SALON_BLOCK_HOURS * 60); 

    const conflict = existingSalonReservations.find(res => {
        const resSalonId = typeof res.salon === 'object' ? res.salon.id : res.salon;
        if (resSalonId !== salonId) return false;

        const resDate = new Date(res.fecha_evento);
        const resStart = resDate.getHours() * 60 + resDate.getMinutes();
        const resEnd = resStart + (SALON_BLOCK_HOURS * 60);

        return (selectedStart < resEnd && selectedEnd > resStart);
    });

    if (conflict) {
        const conflictDate = new Date(conflict.fecha_evento);
        conflictDate.setHours(conflictDate.getHours() + SALON_BLOCK_HOURS);
        const freeAt = conflictDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return { occupied: true, freeAt };
    }

    return { occupied: false };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'fecha_checkin') {
        if (formData.fecha_checkout && value >= formData.fecha_checkout) {
            setFormData(prev => ({ ...prev, [name]: value, fecha_checkout: '' }));
            return;
        }
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getMinCheckoutDate = () => {
      if (!formData.fecha_checkin) return new Date().toISOString().split('T')[0];
      const checkinDate = new Date(formData.fecha_checkin);
      checkinDate.setDate(checkinDate.getDate() + 1); 
      return checkinDate.toISOString().split('T')[0];
  };

  const getFeaturesList = () => {
      if (!habitacionSeleccionada?.caracteristicas) return [];
      return habitacionSeleccionada.caracteristicas.split(',').map(s => s.trim()).filter(Boolean);
  };

  const calculateNights = () => {
    if (!formData.fecha_checkin || !formData.fecha_checkout) return 0;
    const checkin = new Date(formData.fecha_checkin);
    const checkout = new Date(formData.fecha_checkout);
    const nights = Math.ceil((checkout - checkin) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
  };

  const calculateSubtotal = () => {
    if (!habitacionSeleccionada) return 0;
    const nights = calculateNights();
    return nights > 0 ? nights * parseFloat(habitacionSeleccionada.precio_base || 0) : 0;
  };

  const calculateTax = () => calculateSubtotal() * TAX_RATE;
  const calculateTotal = () => calculateSubtotal() + calculateTax();

  const requestVerificationCode = async (type, validationData = {}) => {
    setEnviandoCodigo(true);
    try {
        let endpoint = type === 'salon' 
            ? '/api/reservas-salon/solicitar-codigo/' 
            : '/api/reservas-habitacion/solicitar-codigo/';

        const response = await api.post(endpoint, validationData);
        if (response.data.session_key_manual) {
            setServerSessionKey(response.data.session_key_manual);
        }
        setReservationType(type);
        setEnviandoCodigo(false);
        setMostrarModalCodigo(true);
    } catch (error) {
        console.error('Error solicitando código:', error);
        const msg = error.response?.data?.error || error.response?.data?.detail || 'No disponible.';
        showAlert('error', 'No disponible', msg);
        setEnviandoCodigo(false);
    }
  };

  const handleStartRoomReservation = () => {
    if (!formData.fecha_checkin || !formData.fecha_checkout) {
      showAlert('error', 'Faltan datos', 'Selecciona las fechas.');
      return;
    }
    requestVerificationCode('room', { habitacion_id: habitacionSeleccionada.id, checkin: formData.fecha_checkin, checkout: formData.fecha_checkout });
  };

  const isTableOccupied = (tableId) => {
    if (!restaurantForm.time || !restaurantForm.date) return false;
    const [selHour, selMin] = restaurantForm.time.split(':').map(Number);
    const selectedStart = selHour * 60 + selMin;
    const selectedEnd = selectedStart + 120; 

    return existingReservations.some(res => {
        const resTableId = typeof res.mesa === 'object' ? res.mesa.id : res.mesa;
        if (resTableId !== tableId || res.estado === 'cancelada') return false;
        const resDate = new Date(res.fecha_reserva);
        const resStart = resDate.getHours() * 60 + resDate.getMinutes();
        const resEnd = resStart + 120;
        return (selectedStart < resEnd && selectedEnd > resStart);
    });
  };

  const handleStartTableReservation = (e) => {
    e.preventDefault();
    if (!user) { showAlert('error', 'Atención', 'Inicia sesión.'); return; }
    if (!restaurantForm.tableId) { showAlert('error', 'Falta selección', 'Selecciona una mesa.'); return; }
    if (isTableOccupied(restaurantForm.tableId)) {
        showAlert('error', 'Mesa Ocupada', 'Horario no disponible.');
        return;
    }
    requestVerificationCode('table', { mesa_id: restaurantForm.tableId, fecha: restaurantForm.date });
  };

  const handleStartSalonReservation = (e) => {
    e.preventDefault();
    if (!salonSeleccionado) { showAlert('error', 'Falta selección', 'Selecciona un salón.'); return; }
    if (!salonForm.date || !salonForm.time) { showAlert('error', 'Faltan datos', 'Selecciona fecha y hora.'); return; }
    
    const status = getSalonStatus(salonSeleccionado.id);
    if (status.occupied) {
        showAlert('error', 'Salón Ocupado', `Este salón estará disponible a las ${status.freeAt}.`);
        return;
    }

    requestVerificationCode('salon', { 
        salon_id: salonSeleccionado.id, 
        fecha_evento: `${salonForm.date}T${salonForm.time}` 
    });
  };

  const handleConfirmarReserva = async () => {
    if (!codigoIngresado || codigoIngresado.length < 6) {
        showAlert('error', 'Código incompleto', 'Ingresa el código completo.');
        return;
    }
    setLoading(true);
    try {
        if (reservationType === 'room') {
            const reservaData = {
                habitacion: habitacionSeleccionada.id,
                fecha_checkin: formData.fecha_checkin,
                fecha_checkout: formData.fecha_checkout,
                huespedes: formData.huespedes,
                servicios_adicionales: servicios,
                codigo_verificacion: codigoIngresado,
                session_key_manual: serverSessionKey 
            };
            await createReservation(reservaData);
            setMostrarModalCodigo(false);
            showAlert('success', '¡Habitación Reservada!', 'Confirmada.');
        } else if (reservationType === 'table') {
            await api.post('/api/reservas-restaurante/reservas/', {
                mesa: restaurantForm.tableId,
                fecha_reserva: `${restaurantForm.date}T${restaurantForm.time}:00`,
                cantidad_personas: parseInt(restaurantForm.guests),
                notas: restaurantForm.notes,
            });
            setMostrarModalCodigo(false);
            showAlert('success', '¡Mesa Reservada!', 'Te esperamos.');
        } else if (reservationType === 'salon') {
            await api.post('/api/reservas-salon/reservas/', {
                salon: salonSeleccionado.id,
                fecha_evento: `${salonForm.date}T${salonForm.time}:00`,
                cantidad_invitados: parseInt(salonForm.guests),
                codigo_verificacion: codigoIngresado,
                session_key_manual: serverSessionKey
            });
            setMostrarModalCodigo(false);
            showAlert('success', '¡Evento Reservado!', 'Salón apartado.');
        }
    } catch (error) {
        showAlert('error', 'Error', error.response?.data?.detail || 'Error procesando reserva.');
    } finally {
        setLoading(false);
    }
  };

  const filteredHabitaciones = habitaciones.filter(h => {
    const matchesSearch = h.numero_habitacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          h.categoria.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = filtroCategoria === 'todas' || h.categoria === filtroCategoria;
    return matchesSearch && matchesCategoria && h.estado === 'disponible';
  });

  const getCategoriaColor = (cat) => {
    switch (cat) {
      case 'estandar': return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'deluxe': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'suite': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'suite_presidencial': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAmenitiesIcon = (amenity) => {
      const icons = { 'wifi': Wifi, 'parking': Car, 'coffee': Coffee, 'gym': Dumbbell, 'bed': Bed };
      return icons[amenity] || Check;
  };

  const compatibleTables = tables.filter(t => t.capacidad >= restaurantForm.guests);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Inicia sesión para reservar</h2>
          <button onClick={() => navigate('/login')} className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors">Iniciar Sesión</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative">
      <Navigation />

      <div className="bg-slate-900 pt-24 pb-32 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="container mx-auto relative z-10 text-center">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-6">Reserva tu Experiencia</h1>
            <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">Ya sea una noche de descanso o una cena inolvidable, estamos listos para recibirte.</p>

            {!mostrarFormulario && (
                <div className="flex justify-center w-full px-4">
                    <div className="grid grid-cols-3 gap-1 bg-slate-800/50 backdrop-blur-sm p-1.5 rounded-2xl border border-slate-700/50 w-full max-w-lg relative">
                        {[
                            { id: 'habitacion', label: 'Estadía', icon: BedDouble },
                            { id: 'restaurante', label: 'Cena', icon: UtensilsCrossed },
                            { id: 'salon', label: 'Evento', icon: Calendar }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`relative z-10 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm sm:text-base transition-colors duration-200 ${
                                    activeTab === tab.id ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-blue-600 rounded-xl shadow-lg -z-10"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>

      <div className="flex-1 container mx-auto px-4 sm:px-6 -mt-20 mb-20 relative z-20">
        <AnimatePresence mode="wait">
            
            {activeTab === 'habitacion' && !mostrarFormulario && (
                <motion.div key="habitacion-list" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input type="text" placeholder="Buscar por número o categoría..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" />
                            </div>
                            <div className="md:w-64">
                                <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none">
                                    <option value="todas">Todas las categorías</option>
                                    <option value="estandar">Estándar</option>
                                    <option value="deluxe">Deluxe</option>
                                    <option value="suite">Suite</option>
                                    <option value="suite_presidencial">Suite Presidencial</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-slate-500 font-medium">Buscando habitaciones...</p>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredHabitaciones.map((habitacion, index) => (
                                <motion.div key={habitacion.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 group">
                                    <div className="relative h-48">
                                        {habitacion.imagen ? <img src={habitacion.imagen} alt="" className="absolute inset-0 w-full h-full object-cover"/> : <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80"></div>}
                                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors"></div>
                                        <div className="relative p-6 h-full flex flex-col justify-between">
                                            <div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium border bg-white/90 backdrop-blur-sm ${getCategoriaColor(habitacion.categoria)}`}>{habitacion.categoria.charAt(0).toUpperCase() + habitacion.categoria.slice(1)}</span>
                                                    <div className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400 fill-current"/><span className="text-white text-sm font-bold">4.8</span></div>
                                                </div>
                                                {/* CAMBIO AQUÍ: Usamos tipo_ocupacion en lugar de numero_habitacion */}
                                                <h3 className="text-2xl font-bold text-white mb-2 capitalize">Habitación {habitacion.tipo_ocupacion}</h3>
                                            </div>
                                            <div className="text-right"><p className="text-white/90 text-sm">Por noche</p><p className="text-3xl font-bold text-white">${parseFloat(habitacion.precio_base || 0).toFixed(2)}</p></div>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <div className="mb-4">
                                            <div className="flex items-center gap-2 mb-3"><Bed className="w-4 h-4 text-slate-600"/><span className="text-sm font-medium text-slate-700">Cama {habitacion.tamaño_cama}</span></div>
                                            <div className="flex flex-wrap gap-2">{['wifi', 'parking', 'coffee'].map((amenity, idx) => { const Icon = getAmenitiesIcon(amenity); return <div key={idx} className="flex items-center gap-1 text-xs text-slate-600"><Icon className="w-3 h-3"/><span>{amenity === 'wifi' ? 'WiFi' : amenity === 'parking' ? 'Parking' : 'Café'}</span></div> })}</div>
                                        </div>
                                        <button onClick={() => { setHabitacionSeleccionada(habitacion); setMostrarFormulario(true); }} className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium">Seleccionar Habitación</button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}

            {activeTab === 'habitacion' && mostrarFormulario && habitacionSeleccionada && (
                <motion.div key="habitacion-form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                        <div className="relative h-48 bg-primary">
                            {habitacionSeleccionada.imagen ? <img src={habitacionSeleccionada.imagen} alt="" className="absolute inset-0 w-full h-full object-cover"/> : <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80"></div>}
                            <div className="absolute inset-0 bg-black/50"></div>
                            <div className="relative p-6 h-full flex flex-col justify-end text-white">
                                {/* CAMBIO AQUÍ: Usamos tipo_ocupacion en el formulario también */}
                                <h2 className="text-3xl font-bold capitalize">Habitación {habitacionSeleccionada.tipo_ocupacion}</h2>
                                <p className="text-white/90">{habitacionSeleccionada.categoria} - Piso {habitacionSeleccionada.piso}</p>
                            </div>
                        </div>

                        <div className="p-8 grid md:grid-cols-2 gap-8">
                            <div className="space-y-5">
                                <h3 className="text-lg font-bold text-slate-900">Fechas de Estancia</h3>
                                <div><label className="text-sm font-bold text-slate-700">Check-in</label><input type="date" name="fecha_checkin" value={formData.fecha_checkin} onChange={handleInputChange} min={new Date().toISOString().split('T')[0]} className="w-full mt-1 p-3 bg-slate-50 border rounded-xl"/></div>
                                <div><label className="text-sm font-bold text-slate-700">Check-out</label><input type="date" name="fecha_checkout" value={formData.fecha_checkout} onChange={handleInputChange} min={getMinCheckoutDate()} disabled={!formData.fecha_checkin} className="w-full mt-1 p-3 bg-slate-50 border rounded-xl disabled:opacity-50"/></div>
                                <div><label className="text-sm font-bold text-slate-700">Huéspedes</label><select name="huespedes" value={formData.huespedes} onChange={handleInputChange} className="w-full mt-1 p-3 bg-slate-50 border rounded-xl">{[1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}</select></div>
                                
                                <div className="mt-6">
                                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-yellow-500" /> 
                                        Servicios Incluidos
                                    </h3>
                                    {getFeaturesList().length > 0 ? (
                                        <div className="grid grid-cols-1 gap-2">
                                            {getFeaturesList().map((feature, idx) => (
                                                <div key={idx} className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                                                    <div className="bg-white p-1 rounded-full shadow-sm">
                                                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                                                    </div>
                                                    <span className="text-sm font-medium text-emerald-900 capitalize">{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-slate-50 rounded-lg text-sm text-slate-500 italic text-center">
                                            Características estándar incluidas.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-xl space-y-4 h-fit sticky top-24">
                                <h3 className="text-lg font-bold text-slate-900">Resumen de Costos</h3>
                                <div className="space-y-2 pb-4 border-b border-slate-200">
                                    <div className="flex justify-between text-sm"><span>Precio/Noche</span><span className="font-bold">${parseFloat(habitacionSeleccionada.precio_base).toFixed(2)}</span></div>
                                    <div className="flex justify-between text-sm text-slate-600"><span>Estancia</span><span>{calculateNights()} noches</span></div>
                                    <div className="flex justify-between text-sm font-medium text-slate-900 pt-2"><span>Subtotal</span><span>${calculateSubtotal().toFixed(2)}</span></div>
                                    <div className="flex justify-between text-sm text-slate-500"><span>IVA (16%)</span><span>${calculateTax().toFixed(2)}</span></div>
                                </div>
                                <div className="flex justify-between items-end">
                                    <span className="text-slate-600 font-medium">Total a Pagar</span>
                                    <span className="text-3xl font-black text-primary">${calculateTotal().toFixed(2)}</span>
                                </div>
                                <div className="flex gap-3 pt-6">
                                    <button onClick={() => setMostrarFormulario(false)} className="flex-1 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-colors">Volver</button>
                                    <button onClick={handleStartRoomReservation} disabled={enviandoCodigo || !formData.fecha_checkin || !formData.fecha_checkout} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/20">{enviandoCodigo ? 'Procesando...' : 'Reservar'}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {activeTab === 'restaurante' && (
                <motion.div key="restaurante-main" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 p-6 sticky top-24">
                            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2"><UtensilsCrossed className="w-5 h-5 text-orange-500" /> Datos de la Cena</h2>
                            <form onSubmit={handleStartTableReservation} className="space-y-5">
                                <div><label className="block text-sm font-bold text-slate-700 mb-2">Fecha</label><input type="date" required min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={restaurantForm.date} onChange={(e) => setRestaurantForm({...restaurantForm, date: e.target.value, tableId: null})} /></div>
                                <div><label className="block text-sm font-bold text-slate-700 mb-2">Hora (Bloqueo 2h)</label><input type="time" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={restaurantForm.time} onChange={(e) => setRestaurantForm({...restaurantForm, time: e.target.value, tableId: null})} /></div>
                                <div><label className="block text-sm font-bold text-slate-700 mb-2">Comensales</label><select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={restaurantForm.guests} onChange={(e) => setRestaurantForm({...restaurantForm, guests: parseInt(e.target.value), tableId: null})}>{[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} Personas</option>)}</select></div>
                                <div><label className="block text-sm font-bold text-slate-700 mb-2">Notas</label><textarea rows="2" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none" value={restaurantForm.notes} onChange={(e) => setRestaurantForm({...restaurantForm, notes: e.target.value})} placeholder="Alergias o pedidos especiales..." /></div>
                                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100"><p className="text-sm text-orange-800 font-medium mb-1">Mesa Seleccionada:</p>{restaurantForm.tableId ? (<p className="text-lg font-bold text-orange-900">Mesa {tables.find(t => t.id === restaurantForm.tableId)?.numero_mesa}</p>) : (<p className="text-sm text-orange-600/70 italic">Selecciona una mesa --&gt;</p>)}</div>
                                <button type="submit" className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all ${restaurantForm.tableId && restaurantForm.date && restaurantForm.time ? 'bg-orange-600 hover:bg-orange-700' : 'bg-slate-300 cursor-not-allowed'}`} disabled={!restaurantForm.tableId || enviandoCodigo}>{enviandoCodigo ? 'Validando...' : 'Reservar Mesa'}</button>
                            </form>
                        </div>
                    </div>
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 p-8 h-full">
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Disponibilidad</h2>
                            <p className="text-slate-500 mb-8">{restaurantForm.date && restaurantForm.time ? "Mesas libres para el horario seleccionado." : "Selecciona fecha y hora para ver disponibilidad."}</p>
                            {loadingTables ? <div className="text-center py-20">Cargando mesas...</div> : (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {compatibleTables.map(table => {
                                        const occupied = isTableOccupied(table.id);
                                        return (
                                            <motion.div key={table.id} whileHover={!occupied ? { scale: 1.02 } : {}} whileTap={!occupied ? { scale: 0.98 } : {}} onClick={() => !occupied && setRestaurantForm({...restaurantForm, tableId: table.id})} className={`rounded-2xl border-2 overflow-hidden transition-all relative cursor-pointer text-center p-4 ${occupied ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed' : restaurantForm.tableId === table.id ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200' : 'border-slate-100 hover:border-orange-300 bg-white'}`}>
                                                {occupied && <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-200/50 backdrop-blur-[1px]"><span className="bg-slate-800 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Ocupada</span></div>}
                                                <div className="h-32 bg-slate-200 relative mb-4 rounded-xl overflow-hidden">
                                                    {table.imagen_url ? <img src={table.imagen_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-slate-100"><UtensilsCrossed className="w-8 h-8 text-slate-300" /></div>}
                                                </div>
                                                <p className="font-bold text-slate-900">Mesa {table.numero_mesa}</p>
                                                <p className="text-xs text-slate-500">Capacidad: {table.capacidad}</p>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}

            {activeTab === 'salon' && (
                <motion.div key="salon-main" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 p-6 sticky top-24">
                            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2"><Calendar className="w-5 h-5 text-purple-600" /> Datos del Evento</h2>
                            <form onSubmit={handleStartSalonReservation} className="space-y-5">
                                <div><label className="block text-sm font-bold text-slate-700 mb-2">Fecha del Evento</label><input type="date" required min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={salonForm.date} onChange={(e) => setSalonForm({...salonForm, date: e.target.value, salonId: null})} /></div>
                                <div><label className="block text-sm font-bold text-slate-700 mb-2">Hora de Inicio (Bloqueo 6h)</label><input type="time" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={salonForm.time} onChange={(e) => setSalonForm({...salonForm, time: e.target.value, salonId: null})} /></div>
                                <div><label className="block text-sm font-bold text-slate-700 mb-2">Invitados</label><input type="number" required min="1" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={salonForm.guests} onChange={(e) => setSalonForm({...salonForm, guests: parseInt(e.target.value)})} /></div>
                                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                                    <p className="text-sm text-purple-800 font-medium mb-1">Salón Seleccionado:</p>
                                    {salonSeleccionado ? (<p className="text-lg font-bold text-purple-900">{salonSeleccionado.nombre}</p>) : (<p className="text-sm text-purple-600/70 italic">Selecciona un salón --&gt;</p>)}
                                </div>
                                <button type="submit" className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all ${salonSeleccionado && salonForm.date && salonForm.time ? 'bg-purple-600 hover:bg-purple-700' : 'bg-slate-300 cursor-not-allowed'}`} disabled={!salonSeleccionado || enviandoCodigo}>{enviandoCodigo ? 'Validando...' : 'Reservar Salón'}</button>
                            </form>
                        </div>
                    </div>
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 p-8 h-full">
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Salones Disponibles</h2>
                            <p className="text-slate-500 mb-8">{salonForm.date && salonForm.time ? "Verifica si el salón está disponible por 6 horas." : "Selecciona fecha y hora para ver disponibilidad."}</p>
                            <div className="space-y-4">
                                {salones.map(salon => {
                                    const status = getSalonStatus(salon.id);
                                    return (
                                        <motion.div key={salon.id} whileHover={!status.occupied ? { scale: 1.01 } : {}} onClick={() => !status.occupied && setSalonSeleccionado(salon)} className={`flex flex-col md:flex-row gap-6 bg-white p-5 rounded-2xl border-2 transition-all cursor-pointer relative ${status.occupied ? 'bg-slate-50 border-slate-200 opacity-70 grayscale-[0.5]' : salonSeleccionado?.id === salon.id ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-100' : 'border-slate-100 hover:border-purple-200 hover:bg-slate-50'}`}>
                                            {status.occupied && (
                                                <div className="absolute top-4 right-4 bg-red-100 text-red-700 px-4 py-1.5 rounded-full text-xs font-black flex items-center gap-2 z-10 border border-red-200 shadow-sm">
                                                    <AlertCircle className="w-4 h-4" /> OCUPADO - LIBRE A LAS {status.freeAt}
                                                </div>
                                            )}
                                            <div className="w-full md:w-48 h-32 rounded-xl bg-slate-200 overflow-hidden flex-shrink-0">
                                                {salon.imagen_url ? <img src={salon.imagen_url} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><Calendar className="w-8 h-8" /></div>}
                                            </div>
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="font-bold text-xl text-slate-900">{salon.nombre}</h3>
                                                        <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Capacidad: {salon.capacidad}</span>
                                                    </div>
                                                    <p className="text-slate-500 text-sm line-clamp-2 italic">"{salon.descripcion || 'Espacio ideal para tus eventos.'}"</p>
                                                </div>
                                                <div className="flex gap-4 mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                    <span className="flex items-center gap-1"><Users className="w-3 h-3"/> Eventos</span>
                                                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> Zona Exclusiva</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                                {salones.length === 0 && !loading && <div className="text-center py-20 text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl">No hay salones disponibles.</div>}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        <AnimatePresence>
            {alertModal.show && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm relative">
                        <button onClick={closeAlert} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                        <div className="flex items-start gap-4">
                            {alertModal.type === 'error' ? <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0"><XCircle className="w-6 h-6 text-red-600" /></div> : <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0"><CheckCircle className="w-6 h-6 text-green-600" /></div>}
                            <div><h3 className={`text-lg font-bold ${alertModal.type === 'error' ? 'text-red-700' : 'text-green-700'} mb-1`}>{alertModal.title}</h3><p className="text-slate-600 text-sm leading-relaxed">{alertModal.message}</p></div>
                        </div>
                        <div className="mt-6 flex justify-end"><button onClick={closeAlert} className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${alertModal.type === 'error' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>Entendido</button></div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>

        <AnimatePresence>
            {mostrarModalCodigo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"><Mail className="w-8 h-8 text-blue-600" /></div>
                            <h3 className="text-2xl font-bold text-gray-900">Verifica tu Correo</h3>
                            <p className="text-gray-500 mt-2">Hemos enviado un código a: <span className="font-semibold text-gray-800">{user.email}</span></p>
                        </div>
                        <div className="space-y-4">
                            <input type="text" value={codigoIngresado} onChange={(e) => setCodigoIngresado(e.target.value)} placeholder="000000" className="w-full p-3 border border-gray-300 rounded-xl text-center text-2xl tracking-widest font-mono" />
                            <button onClick={handleConfirmarReserva} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl">{loading ? 'Verificando...' : 'Confirmar Reserva'}</button>
                            <button onClick={() => setMostrarModalCodigo(false)} className="w-full text-gray-500 py-2">Cancelar</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
      </div>
      <Footer />
    </div>
  );
};

export default ReservationPage;