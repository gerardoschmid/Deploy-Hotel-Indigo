import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Search,
  Filter,
  ChevronDown,
  Users,
  BedDouble,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Mail,
  Eye,
  Edit,
  RefreshCw,
  Trash2,
  UtensilsCrossed,
  Crown,
  AlertTriangle,
  X,
  Save,
  PartyPopper,
  FileText
} from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const ReservationManagement = () => {
  const { user } = useAuth();
  
  // --- ESTADOS DE DATOS ---
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- ESTADOS DE FILTROS ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('todas'); 

  // --- ESTADOS DE SELECCIÓN Y EDICIÓN ---
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [newPrice, setNewPrice] = useState(''); 

  // --- ESTADOS DE MODALES ---
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, type: '', code: '' });
  const [alertModal, setAlertModal] = useState({ show: false, type: 'success', title: '', message: '' });

  useEffect(() => {
    fetchAllReservations();
  }, []);

  const fetchAllReservations = async () => {
    try {
      setLoading(true);
      
      const [habitacionesRes, mesasRes, salonesRes] = await Promise.all([
        api.get('/api/reservas-habitacion/'),
        api.get('/api/reservas-restaurante/reservas/'),
        api.get('/api/reservas-salon/reservas/')
      ]);

      const habitaciones = habitacionesRes.data.results || habitacionesRes.data || [];
      const mesas = mesasRes.data.results || mesasRes.data || [];
      const salones = salonesRes.data.results || salonesRes.data || [];

      const unifiedReservations = [
        // --- HABITACIONES ---
        ...habitaciones.map(h => ({
          id: `habitacion_${h.id}`, 
          real_id: h.id,            
          tipo: 'habitacion',
          codigo: h.codigo_confirmacion,
          cliente: h.usuario?.username || h.usuario_username || 'Sin usuario',
          email: h.usuario?.email || h.usuario_email || 'No disponible',
          fecha: h.fecha_checkin,
          descripcion: `Habitación ${h.habitacion?.numero_habitacion || 'N/A'}`,
          estado: h.estado,
          total: parseFloat(h.total || 0),
          fecha_creacion: h.fecha_creacion,
          detalles_extra: `${h.huespedes} huésped(es)`,
          notas: ''
        })),
        // --- RESTAURANTE ---
        ...mesas.map(m => ({
          id: `mesa_${m.id}`,
          real_id: m.id,
          tipo: 'restaurante',
          codigo: m.codigo_reserva,
          cliente: m.usuario?.username || m.usuario_username || 'Sin usuario',
          email: m.usuario?.email || m.usuario_email || 'No disponible',
          fecha: m.fecha_reserva,
          descripcion: `Mesa ${m.numero_mesa || 'N/A'}`, 
          estado: m.estado,
          total: 0,
          fecha_creacion: m.fecha_creacion,
          detalles_extra: `${m.cantidad_personas} personas`,
          notas: m.notas || ''
        })),
        // --- SALONES ---
        ...salones.map(s => ({
          id: `salon_${s.id}`,
          real_id: s.id,
          tipo: 'salon',
          codigo: s.codigo_evento,
          cliente: s.usuario?.username || s.usuario_username || 'Sin usuario',
          email: s.usuario?.email || s.usuario_email || 'No disponible',
          fecha: s.fecha_evento,
          descripcion: `Salón: ${s.nombre_salon || 'Evento'}`,
          estado: s.estado,
          total: parseFloat(s.total_reserva || 0),
          fecha_creacion: s.fecha_creacion,
          detalles_extra: `${s.cantidad_invitados} invitados`,
          notas: ''
        }))
      ];

      unifiedReservations.sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));
      setReservations(unifiedReservations);
      
    } catch (error) {
      console.error('Error cargando reservas:', error);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, title, message) => {
    setAlertModal({ show: true, type, title, message });
  };

  // --- LÓGICA ACTUALIZACIÓN ---
  const handleUpdateReservation = async () => {
    if (!selectedReservation) return;

    try {
        let endpoint = '';
        const payload = { estado: newStatus };

        if (selectedReservation.tipo === 'habitacion') {
            endpoint = `/api/reservas-habitacion/${selectedReservation.real_id}/`;
        } else if (selectedReservation.tipo === 'restaurante') {
            endpoint = `/api/reservas-restaurante/reservas/${selectedReservation.real_id}/`;
        } else if (selectedReservation.tipo === 'salon') {
            endpoint = `/api/reservas-salon/reservas/${selectedReservation.real_id}/`;
            if (newPrice !== '' && newPrice !== null) {
                payload.total_reserva = parseFloat(newPrice);
            }
        }

        await api.patch(endpoint, payload);

        const updatedTotal = (selectedReservation.tipo === 'salon' && newPrice !== '') 
            ? parseFloat(newPrice) 
            : selectedReservation.total;

        setReservations(prev => prev.map(r => 
            r.id === selectedReservation.id ? { 
                ...r, 
                estado: newStatus,
                total: updatedTotal
            } : r
        ));
        
        setSelectedReservation(prev => ({ 
            ...prev, 
            estado: newStatus,
            total: updatedTotal
        }));

        setIsEditing(false);
        showAlert('success', 'Actualizado', 'La reserva ha sido actualizada correctamente.');

    } catch (error) {
        console.error('Error actualizando:', error);
        const msg = error.response?.data?.total_reserva 
            ? "Error al actualizar precio (verifique permisos)." 
            : "No se pudo actualizar la reserva.";
        showAlert('error', 'Error', msg);
    }
  };

  // --- LÓGICA ELIMINACIÓN (CON FILTRO DE TIPO) ---
  const initiateDelete = (reservation) => {
    // Definimos los estados permitidos para borrar
    const allowedStates = ['cancelada', 'completada'];

    if (!allowedStates.includes(reservation.estado)) {
      showAlert(
        'error', 
        'Acción bloqueada', 
        `Solo se pueden eliminar reservas que estén en estado "cancelada" o "completada". La reserva actual está "${reservation.estado}".`
      );
      return;
    }

    setDeleteModal({ 
        show: true, 
        id: reservation.real_id, 
        type: reservation.tipo, 
        code: reservation.codigo 
    });
  };

  const confirmDelete = async () => {
    try {
      let endpoint = '';
      if (deleteModal.type === 'habitacion') endpoint = `/api/reservas-habitacion/${deleteModal.id}/`;
      else if (deleteModal.type === 'restaurante') endpoint = `/api/reservas-restaurante/reservas/${deleteModal.id}/`;
      else if (deleteModal.type === 'salon') endpoint = `/api/reservas-salon/reservas/${deleteModal.id}/`;

      await api.delete(endpoint);

      const idCompuesto = `${deleteModal.type}_${deleteModal.id}`;
      setReservations(prev => prev.filter(r => r.id !== idCompuesto));
      
      if (selectedReservation && selectedReservation.id === idCompuesto) {
        setSelectedReservation(null);
      }

      setDeleteModal({ show: false, id: null, type: '', code: '' });
      showAlert('success', 'Eliminado', 'El registro de la reserva ha sido eliminado.');

    } catch (error) {
      console.error('Error eliminando:', error);
      setDeleteModal({ show: false, id: null, type: '', code: '' });
      showAlert('error', 'Error', 'No se pudo eliminar el registro.');
    }
  };

  // --- HELPERS VISUALES ---
  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmada': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pendiente': return <Clock className="w-4 h-4 text-orange-500" />;
      case 'cancelada': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'completada': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmada': return 'bg-green-100 text-green-800';
      case 'pendiente': return 'bg-orange-100 text-orange-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      case 'completada': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'habitacion': return <BedDouble className="w-4 h-4" />;
      case 'restaurante': return <UtensilsCrossed className="w-4 h-4" />;
      case 'salon': return <Crown className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // --- FILTRADO ---
  const getFilteredReservations = () => {
    return reservations.filter(reservation => {
      if (activeTab === 'habitaciones' && reservation.tipo !== 'habitacion') return false;
      if (activeTab === 'mesas' && reservation.tipo !== 'restaurante') return false;
      if (activeTab === 'salones' && reservation.tipo !== 'salon') return false;

      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        (reservation.codigo && reservation.codigo.toLowerCase().includes(searchLower)) ||
        (reservation.cliente && reservation.cliente.toLowerCase().includes(searchLower)) ||
        (reservation.descripcion && reservation.descripcion.toLowerCase().includes(searchLower));

      const matchesStatus = filterStatus === 'all' || reservation.estado === filterStatus;

      let matchesDate = true;
      if (filterDate === 'today') {
        matchesDate = new Date(reservation.fecha).toDateString() === new Date().toDateString();
      } else if (filterDate === 'week') {
        const now = new Date();
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        matchesDate = new Date(reservation.fecha) >= now && new Date(reservation.fecha) <= weekFromNow;
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  };

  const filteredReservations = getFilteredReservations();

  const stats = {
    total: reservations.length,
    confirmadas: reservations.filter(r => r.estado === 'confirmada').length,
    pendientes: reservations.filter(r => r.estado === 'pendiente').length,
    ingresos: reservations.reduce((sum, r) => sum + (r.total || 0), 0),
    habitaciones: reservations.filter(r => r.tipo === 'habitacion').length,
    restaurante: reservations.filter(r => r.tipo === 'restaurante').length,
    salones: reservations.filter(r => r.tipo === 'salon').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestión de Reservas</h1>
          <p className="text-slate-500 mt-1">Administra todas las reservaciones del hotel</p>
        </div>
        <button onClick={fetchAllReservations} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <RefreshCw className="w-4 h-4" /> Actualizar
        </button>
      </div>

      {/* Pestañas */}
      <div className="bg-white rounded-lg border border-slate-200 p-1 flex space-x-1 overflow-x-auto">
        {[
            { id: 'todas', icon: Calendar, label: 'Todas', count: stats.total },
            { id: 'habitaciones', icon: BedDouble, label: 'Habitaciones', count: stats.habitaciones },
            { id: 'mesas', icon: UtensilsCrossed, label: 'Restaurante', count: stats.restaurante },
            { id: 'salones', icon: Crown, label: 'Salones', count: stats.salones },
        ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
                <tab.icon className="w-4 h-4"/> {tab.label} <span className={`px-2 py-0.5 rounded-full text-xs ml-1 ${activeTab === tab.id ? 'bg-white/20' : 'bg-slate-100 text-slate-600'}`}>{tab.count}</span>
            </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 flex justify-between items-center shadow-sm">
            <div><p className="text-sm text-slate-500">Total</p><p className="text-2xl font-bold">{stats.total}</p></div>
            <Calendar className="w-8 h-8 text-blue-500"/>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 flex justify-between items-center shadow-sm">
            <div><p className="text-sm text-slate-500">Confirmadas</p><p className="text-2xl font-bold text-green-600">{stats.confirmadas}</p></div>
            <CheckCircle className="w-8 h-8 text-green-500"/>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 flex justify-between items-center shadow-sm">
            <div><p className="text-sm text-slate-500">Pendientes</p><p className="text-2xl font-bold text-orange-600">{stats.pendientes}</p></div>
            <Clock className="w-8 h-8 text-orange-500"/>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 flex justify-between items-center shadow-sm">
            <div><p className="text-sm text-slate-500">Ingresos Est.</p><p className="text-2xl font-bold text-green-600">${stats.ingresos.toFixed(2)}</p></div>
            <DollarSign className="w-8 h-8 text-green-500"/>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input type="text" placeholder="Buscar por código, cliente..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4" /> Filtros <ChevronDown className={`w-4 h-4 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
            >
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                <option value="all">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="confirmada">Confirmada</option>
                <option value="cancelada">Cancelada</option>
                <option value="completada">Completada</option>
              </select>
              <select value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                <option value="all">Todas las fechas</option>
                <option value="today">Hoy</option>
                <option value="week">Esta semana</option>
              </select>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div><p className="mt-2 text-slate-500">Cargando reservas...</p></div>
        ) : filteredReservations.length === 0 ? (
          <div className="p-8 text-center text-slate-500"><Calendar className="w-12 h-12 mx-auto mb-4 text-slate-300" /><p>No se encontraron reservas</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Código</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Descripción</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Estado</th>
                  {activeTab !== 'mesas' && <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Total</th>}
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredReservations.map((res) => (
                  <motion.tr key={res.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${res.tipo === 'habitacion' ? 'bg-blue-100 text-blue-800' : res.tipo === 'salon' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'}`}>
                            {getTipoIcon(res.tipo)} <span className="capitalize">{res.tipo}</span>
                        </span>
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-slate-900">{res.codigo || '-'}</td>
                    <td className="px-4 py-4 text-sm text-slate-600">{res.cliente}</td>
                    <td className="px-4 py-4 text-sm text-slate-600 max-w-xs truncate">{res.descripcion}</td>
                    <td className="px-4 py-4 text-sm text-slate-600">{formatDateTime(res.fecha)}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(res.estado)}`}>
                            {getStatusIcon(res.estado)} <span className="capitalize">{res.estado}</span>
                        </span>
                    </td>
                    {activeTab !== 'mesas' && <td className="px-4 py-4 text-sm font-bold text-slate-900">${parseFloat(res.total || 0).toFixed(2)}</td>}
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                            <button 
                                onClick={() => { 
                                    setSelectedReservation(res); 
                                    setIsEditing(false); 
                                    setNewStatus(res.estado); 
                                    setNewPrice(res.total);
                                }} 
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                            >
                                <Eye className="w-4 h-4"/>
                            </button>
                            <button 
                                onClick={() => initiateDelete(res)} 
                                className={`p-1.5 rounded-full transition-all ${['cancelada', 'completada'].includes(res.estado) ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' : 'text-slate-200 cursor-not-allowed'}`}
                                title={['cancelada', 'completada'].includes(res.estado) ? 'Eliminar' : 'No se puede eliminar una reserva activa'}
                            >
                                <Trash2 className="w-4 h-4"/>
                            </button>
                        </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- MODALES --- */}

      {/* MODAL DETALLES / EDICIÓN */}
      <AnimatePresence>
        {selectedReservation && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setSelectedReservation(null)}>
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-start mb-6">
                        <h2 className="text-xl font-bold text-slate-900">Detalles de Reserva</h2>
                        <button onClick={() => setSelectedReservation(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
                    </div>
                    <div className="bg-slate-100 p-3 rounded-lg flex justify-between items-center mb-6">
                        <div><span className="text-xs uppercase font-bold text-slate-500 block">UUID</span><span className="font-mono text-sm text-slate-700">{selectedReservation.codigo}</span></div>
                        <div className="text-right"><span className="text-xs uppercase font-bold text-slate-500 block">ID Interno</span><span className="font-mono text-sm text-slate-700">#{selectedReservation.real_id}</span></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Info Reserva</h3>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">Estado:</span>
                                {isEditing ? (
                                    <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="text-sm p-1 border rounded">{['pendiente', 'confirmada', 'completada', 'cancelada'].map(s => <option key={s} value={s}>{s}</option>)}</select>
                                ) : (
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedReservation.estado)}`}>{selectedReservation.estado}</span>
                                )}
                            </div>
                            <div className="flex justify-between"><span className="text-sm text-slate-500">Tipo:</span><span className="font-medium capitalize">{selectedReservation.tipo}</span></div>
                            <div className="flex justify-between"><span className="text-sm text-slate-500">Fecha:</span><span className="font-medium">{formatDateTime(selectedReservation.fecha)}</span></div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Info Cliente</h3>
                            <p className="text-sm font-medium">{selectedReservation.cliente}</p>
                            <p className="text-sm text-slate-500 truncate">{selectedReservation.email}</p>
                            {selectedReservation.tipo !== 'restaurante' && (
                                <div className="mt-4 pt-4 border-t">
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-slate-700">Total:</span>
                                        {isEditing && selectedReservation.tipo === 'salon' ? <input type="number" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className="w-24 text-right p-1 border rounded" /> : <span className="text-xl font-bold">${selectedReservation.total.toFixed(2)}</span>}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="border-t pt-4 flex justify-end gap-3">
                        {isEditing ? (
                            <button onClick={handleUpdateReservation} className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2"><Save className="w-4 h-4"/> Guardar</button>
                        ) : (
                            <>
                                <button onClick={() => initiateDelete(selectedReservation)} className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"><Trash2 className="w-4 h-4"/> Eliminar</button>
                                <button onClick={() => { setIsEditing(true); setNewStatus(selectedReservation.estado); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"><Edit className="w-4 h-4"/> Gestionar</button>
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* MODAL ELIMINAR */}
      <AnimatePresence>
        {deleteModal.show && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-[60]" onClick={() => setDeleteModal({ show: false })}>
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 className="w-6 h-6 text-red-600"/></div>
                    <h3 className="text-lg font-bold text-slate-900">¿Eliminar Registro?</h3>
                    <p className="text-slate-500 text-sm mt-2 mb-6">Esta reserva ya ha finalizado o ha sido cancelada. El registro se eliminará permanentemente.</p>
                    <div className="flex gap-3">
                        <button onClick={() => setDeleteModal({ show: false })} className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg transition-colors">Cancelar</button>
                        <button onClick={confirmDelete} className="flex-1 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition-all">Eliminar</button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
      
      {/* MODAL ALERTA */}
      <AnimatePresence>
        {alertModal.show && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-[70]" onClick={() => setAlertModal({ ...alertModal, show: false })}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm relative" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => setAlertModal({ ...alertModal, show: false })} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"><X className="w-5 h-5" /></button>
                    <div className="flex items-center gap-4">
                        {alertModal.type === 'success' ? <CheckCircle className="w-8 h-8 text-green-500" /> : <AlertCircle className="w-8 h-8 text-red-500" />}
                        <div><h3 className="font-bold text-slate-900">{alertModal.title}</h3><p className="text-sm text-slate-600">{alertModal.message}</p></div>
                    </div>
                    <button onClick={() => setAlertModal({ ...alertModal, show: false })} className="w-full mt-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold">Entendido</button>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ReservationManagement;