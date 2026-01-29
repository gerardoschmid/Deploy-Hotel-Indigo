import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import {
  Calendar,
  Users,
  MapPin,
  Clock,
  CreditCard,
  Shield,
  Check,
  ChevronRight,
  Star,
  Wifi,
  Car,
  Coffee,
  Bath,
  Wind,
  Tv,
  Bed,
  Search,
  Loader
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import api from '../api/axios';

const BookingSection = () => {
  const location = useLocation();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bookingData, setBookingData] = useState({
    checkin: '',
    checkout: '',
    guests: 1,
    roomType: '',
    specialRequests: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    paymentMethod: 'credit-card'
  });

  useEffect(() => {
    fetchAvailableRooms();

    // Si venimos de la página de habitaciones con una selección
    if (location.state?.selectedRoom) {
      const room = location.state.selectedRoom;
      setSelectedRoom(room);
      setBookingData(prev => ({
        ...prev,
        roomType: room.id.toString()
      }));
    }
  }, [location.state]);

  const fetchAvailableRooms = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/habitaciones/habitaciones/');
      const data = response.data;
      const availableRooms = data.filter(room => room.estado === 'disponible');
      setRooms(availableRooms);

      // Si no hay habitación seleccionada, elegir la primera por defecto
      if (!selectedRoom && availableRooms.length > 0) {
        // Pero solo si no vino por estado de location
        if (!location.state?.selectedRoom) {
          // setSelectedRoom(availableRooms[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setRooms([
        { id: 1, numero_habitacion: '101', categoria: 'suite', precio_base: 450, descripcion: 'Suite Presidencial con vista al mar', disponible: true },
        { id: 2, numero_habitacion: '201', categoria: 'deluxe', precio_base: 280, descripcion: 'Habitación Deluxe con balcón', disponible: true }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name, value) => {
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'roomType') {
      const room = rooms.find(r => r.id.toString() === value);
      setSelectedRoom(room);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!bookingData.checkin || !bookingData.checkout) {
        alert('Por favor selecciona las fechas de check-in y check-out');
        return;
      }

      const checkinDate = new Date(bookingData.checkin);
      const checkoutDate = new Date(bookingData.checkout);

      if (checkinDate >= checkoutDate) {
        alert('La fecha de check-out debe ser posterior a la de check-in');
        return;
      }

      const reservationData = {
        habitacion: selectedRoom?.id || rooms[0]?.id,
        fecha_inicio: bookingData.checkin,
        fecha_fin: bookingData.checkout,
        numero_huespedes: bookingData.guests,
        estado: 'pendiente',
        datos_cliente: {
          nombre: bookingData.firstName,
          apellido: bookingData.lastName,
          email: bookingData.email,
          telefono: bookingData.phone
        },
        solicitudes_especiales: bookingData.specialRequests,
        metodo_pago: bookingData.paymentMethod
      };

      const response = await api.post('/api/reservas-habitacion/reservas/', reservationData);

      if (response.status === 201 || response.status === 200) {
        alert('¡Reserva realizada con éxito! Te contactaremos pronto.');
        setBookingData({
          checkin: '',
          checkout: '',
          guests: 1,
          roomType: '',
          specialRequests: '',
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          paymentMethod: 'credit-card'
        });
        setSelectedRoom(null);
      }
    } catch (error) {
      console.error('Error submitting reservation:', error);
      alert('Error al procesar la reserva. Por favor intenta más tarde.');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateTotal = () => {
    if (!bookingData.checkin || !bookingData.checkout || !selectedRoom) return 0;

    const nights = Math.ceil((new Date(bookingData.checkout) - new Date(bookingData.checkin)) / (1000 * 60 * 60 * 24));
    return nights * parseFloat(selectedRoom.precio_base);
  };

  const amenities = [
    { icon: Wifi, label: 'WiFi 6 Ultra' },
    { icon: Car, label: 'Valet Parking' },
    { icon: Coffee, label: 'Breakfast Elite' },
    { icon: Bath, label: 'Private Spa Bath' },
    { icon: Wind, label: 'Eco-Clima' },
    { icon: Tv, label: '4K Smart TV' }
  ];

  return (
    <section id="reservar" className="py-32 bg-slate-50 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-100/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-indigo-100/30 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-6 bg-blue-500/10 text-blue-600 border-blue-200 px-4 py-1.5 rounded-full font-bold uppercase tracking-widest text-xs">
              Módulo de Reserva
            </Badge>
            <h2 className="text-5xl md:text-7xl font-black text-slate-950 mb-8 tracking-tight leading-[1.1]">
              Su Estancia <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Empieza Aquí</span>
            </h2>
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
              Gestione su reserva en tiempo real con confirmación inmediata y atención personalizada.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Booking Form - Deep Integration */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-8"
          >
            <Card className="border-0 bg-white shadow-[0_30px_60px_rgba(0,0,0,0.05)] rounded-[3rem] overflow-hidden">
              <CardHeader className="bg-slate-950 p-10 md:p-14">
                <CardTitle className="flex items-center gap-4 text-white text-3xl font-black uppercase tracking-tight">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center">
                    <Calendar className="w-6 h-6" />
                  </div>
                  Formulario de Reserva
                </CardTitle>
                <p className="text-slate-400 font-medium mt-2">Complete los detalles para asegurar su habitación.</p>
              </CardHeader>
              <CardContent className="p-10 md:p-14">
                <form onSubmit={handleSubmit} className="space-y-12">
                  <div className="space-y-8">
                    <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-3">
                      <span className="w-8 h-[2px] bg-blue-600" />
                      01 / Selección de Estancia
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label className="text-slate-900 font-black uppercase tracking-widest text-[10px] ml-1">Tipo de Habitación</Label>
                        <Select value={bookingData.roomType} onValueChange={(value) => handleSelectChange('roomType', value)}>
                          <SelectTrigger className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 px-6 font-bold text-slate-700 focus:ring-blue-500/20">
                            <SelectValue placeholder="Seleccione una suite" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-slate-100">
                            {rooms.map((room) => (
                              <SelectItem key={room.id} value={room.id.toString()} className="h-12 font-medium">
                                {room.categoria.replace('_', ' ').toUpperCase()} - Hab. {room.numero_habitacion}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-slate-900 font-black uppercase tracking-widest text-[10px] ml-1">Huéspedes</Label>
                        <Select value={bookingData.guests.toString()} onValueChange={(value) => handleSelectChange('guests', parseInt(value))}>
                          <SelectTrigger className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 px-6 font-bold text-slate-700 focus:ring-blue-500/20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-slate-100">
                            {[1, 2, 3, 4].map(num => (
                              <SelectItem key={num} value={num.toString()} className="h-12 font-medium">
                                {num} {num === 1 ? 'Huésped' : 'Huéspedes'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label className="text-slate-900 font-black uppercase tracking-widest text-[10px] ml-1">Fecha de Entrada</Label>
                        <div className="relative">
                          <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input
                            name="checkin"
                            type="date"
                            value={bookingData.checkin}
                            onChange={handleInputChange}
                            className="h-16 pl-14 rounded-2xl border-slate-100 bg-slate-50/50 font-bold text-slate-700 focus:ring-blue-500/20 pt-1"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-slate-900 font-black uppercase tracking-widest text-[10px] ml-1">Fecha de Salida</Label>
                        <div className="relative">
                          <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input
                            name="checkout"
                            type="date"
                            value={bookingData.checkout}
                            onChange={handleInputChange}
                            className="h-16 pl-14 rounded-2xl border-slate-100 bg-slate-50/50 font-bold text-slate-700 focus:ring-blue-500/20 pt-1"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-3">
                      <span className="w-8 h-[2px] bg-blue-600" />
                      02 / Datos del Cliente
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label className="text-slate-900 font-black uppercase tracking-widest text-[10px] ml-1">Nombre</Label>
                        <Input
                          name="firstName"
                          value={bookingData.firstName}
                          onChange={handleInputChange}
                          className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 px-6 font-bold text-slate-700 focus:ring-blue-500/20"
                          placeholder="p. ej. Alejandro"
                          required
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-slate-900 font-black uppercase tracking-widest text-[10px] ml-1">Apellido</Label>
                        <Input
                          name="lastName"
                          value={bookingData.lastName}
                          onChange={handleInputChange}
                          className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 px-6 font-bold text-slate-700 focus:ring-blue-500/20"
                          placeholder="p. ej. Rodriguez"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label className="text-slate-900 font-black uppercase tracking-widest text-[10px] ml-1">Email</Label>
                        <Input
                          name="email"
                          type="email"
                          value={bookingData.email}
                          onChange={handleInputChange}
                          className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 px-6 font-bold text-slate-700 focus:ring-blue-500/20"
                          placeholder="correo@ejemplo.com"
                          required
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-slate-900 font-black uppercase tracking-widest text-[10px] ml-1">Teléfono</Label>
                        <Input
                          name="phone"
                          value={bookingData.phone}
                          onChange={handleInputChange}
                          className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 px-6 font-bold text-slate-700 focus:ring-blue-500/20"
                          placeholder="+58 412 000 0000"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-3">
                      <span className="w-8 h-[2px] bg-blue-600" />
                      03 / Personalización y Pago
                    </h3>

                    <div className="space-y-3">
                      <Label className="text-slate-900 font-black uppercase tracking-widest text-[10px] ml-1">Requerimientos Especiales</Label>
                      <Textarea
                        name="specialRequests"
                        value={bookingData.specialRequests}
                        onChange={handleInputChange}
                        className="min-h-[120px] rounded-2xl border-slate-100 bg-slate-50/50 p-6 font-medium text-slate-700 focus:ring-blue-500/20"
                        placeholder="Déjenos saber si necesita algo especial (alergias, decoración, etc.)"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-slate-900 font-black uppercase tracking-widest text-[10px] ml-1">Método de Pago</Label>
                      <Select value={bookingData.paymentMethod} onValueChange={(value) => handleSelectChange('paymentMethod', value)}>
                        <SelectTrigger className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 px-6 font-bold text-slate-700 focus:ring-blue-500/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-slate-100">
                          <SelectItem value="credit-card">Tarjeta de Crédito / Débito</SelectItem>
                          <SelectItem value="transfer">Transferencia Bancaria</SelectItem>
                          <SelectItem value="cash">Pago en Recepción</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-20 rounded-2xl bg-slate-950 hover:bg-blue-600 text-white font-black uppercase tracking-[0.2em] text-sm transition-all shadow-[0_20px_40px_rgba(0,0,0,0.1)] group/submit"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <div className="flex items-center gap-3">
                        <Loader className="w-5 h-5 animate-spin" />
                        Procesando Reserva...
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 group-hover/submit:rotate-12 transition-transform" />
                        Confirmar y Finalizar Reserva
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Booking Summary - Sticky Redesign */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-4"
          >
            <div className="sticky top-12 space-y-8">
              <Card className="border-0 bg-blue-600 shadow-[0_20px_50px_rgba(37,99,235,0.2)] rounded-[2.5rem] overflow-hidden text-white">
                <CardHeader className="pt-10 px-8 pb-6 border-b border-white/10">
                  <Badge className="w-fit bg-white/20 text-white border-0 px-3 py-1 mb-4 font-bold uppercase tracking-widest text-[10px]">
                    Confirme su Elección
                  </Badge>
                  <CardTitle className="text-3xl font-black uppercase tracking-tight">Detalle Final</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  {selectedRoom ? (
                    <div className="space-y-6">
                      <div className="flex gap-4">
                        <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                          <Bed className="w-8 h-8" />
                        </div>
                        <div>
                          <h4 className="font-black uppercase tracking-tight text-lg leading-tight mb-1">Hab. {selectedRoom.numero_habitacion}</h4>
                          <Badge variant="outline" className="border-white/30 text-white/80 font-bold uppercase text-[9px] tracking-widest bg-white/5 px-2">
                            {selectedRoom.categoria.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-white/10">
                        <div className="flex justify-between items-center text-sm font-medium">
                          <span className="text-blue-100 flex items-center gap-2">
                            <Calendar className="w-4 h-4 opacity-70" /> Check-in
                          </span>
                          <span className="font-black">{bookingData.checkin ? new Date(bookingData.checkin).toLocaleDateString() : '-- / -- / --'}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-medium">
                          <span className="text-blue-100 flex items-center gap-2">
                            <Calendar className="w-4 h-4 opacity-70" /> Check-out
                          </span>
                          <span className="font-black">{bookingData.checkout ? new Date(bookingData.checkout).toLocaleDateString() : '-- / -- / --'}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-medium">
                          <span className="text-blue-100 flex items-center gap-2">
                            <Users className="w-4 h-4 opacity-70" /> Huéspedes
                          </span>
                          <span className="font-black uppercase tracking-widest">{bookingData.guests} PERS.</span>
                        </div>
                      </div>

                      <div className="pt-8 mt-8 border-t border-white/20">
                        <div className="flex justify-between items-center bg-white/10 p-6 rounded-[2rem] border border-white/10">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100 mb-1">Inversión Total</p>
                            <span className="text-4xl font-black">${calculateTotal()}</span>
                          </div>
                          <div className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center">
                            <span className="text-xs font-bold uppercase tracking-tighter">USD</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center space-y-6">
                      <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-white/20">
                        <Search className="w-8 h-8 opacity-40" />
                      </div>
                      <p className="text-blue-100 font-medium leading-relaxed">
                        Seleccione una habitación para generar su presupuesto personalizado.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Security & Benefits Cards */}
              <div className="grid grid-cols-1 gap-4">
                <div className="p-6 bg-white rounded-3xl border border-slate-100 flex items-center gap-5 shadow-sm">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Shield className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-black uppercase tracking-widest text-[10px] text-slate-900 mb-1">Garantía Indigo</h4>
                    <p className="text-xs text-slate-500 font-medium tracking-tight">Encriptación SSL 256 bitsv</p>
                  </div>
                </div>

                <div className="p-6 bg-white rounded-3xl border border-slate-100 flex items-center gap-5 shadow-sm">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Star className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-black uppercase tracking-widest text-[10px] text-slate-900 mb-1">Mejor Tarifa</h4>
                    <p className="text-xs text-slate-500 font-medium tracking-tight">Precio directo garantizado</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BookingSection;
