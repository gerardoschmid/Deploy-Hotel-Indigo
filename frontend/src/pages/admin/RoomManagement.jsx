import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BedDouble,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  ChevronDown,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Wrench,
  AlertTriangle,
  X,
  Upload,
  Save,
  Maximize2
} from 'lucide-react';

import api from '../../api/axios';

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFloor, setFilterFloor] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Modales
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Estados para modales de alerta
  const [deleteModal, setDeleteModal] = useState({ show: false, roomId: null, roomNumber: '' });
  const [alertModal, setAlertModal] = useState({ show: false, type: 'success', title: '', message: '' });

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    numero_habitacion: '',
    piso: 1,
    tipo_ocupacion: 'doble',
    tamaño_cama: 'queen',
    categoria: 'estandar',
    caracteristicas: '',
    descripcion: '',
    precio_base: 150.00,
    estado: 'disponible',
    metros_cuadrados: 45,
    imagen: '',
    activa: true
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/habitaciones/habitaciones/');
      const data = response.data;

      if (Array.isArray(data)) {
        setRooms(data);
      } else if (data.results) {
        setRooms(data.results);
      } else {
        setRooms([]);
      }
    } catch (error) {
      console.error('Error cargando habitaciones:', error);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, title, message) => {
    setAlertModal({ show: true, type, title, message });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = showEditModal
        ? `/api/habitaciones/habitaciones/${selectedRoom.id}/`
        : '/api/habitaciones/habitaciones/';

      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key === 'imagen') {
            if (formData.imagen instanceof File) {
                formDataToSend.append('imagen', formData.imagen);
            }
        } else if (formData[key] !== null) {
            formDataToSend.append(key, formData[key]);
        }
      });

      const config = {
        headers: { 'Content-Type': 'multipart/form-data' },
      };

      const response = showEditModal
        ? await api.patch(url, formDataToSend, config)
        : await api.post(url, formDataToSend, config);

      if (response.status === 200 || response.status === 201) {
        await fetchRooms();
        closeModals();
        showAlert('success', '¡Éxito!', showEditModal ? 'Habitación actualizada correctamente.' : 'Habitación creada correctamente.');
      }
    } catch (error) {
      console.error('Error:', error);
      const msg = error.response?.data ? JSON.stringify(error.response.data) : 'Error de conexión';
      showAlert('error', 'Error al guardar', msg);
    }
  };

  const initiateDelete = (room) => {
    setDeleteModal({
        show: true,
        roomId: room.id,
        roomNumber: room.numero_habitacion
    });
  };

  const confirmDelete = async () => {
    try {
      const response = await api.delete(`/api/habitaciones/habitaciones/${deleteModal.roomId}/`);

      if (response.status === 204 || response.status === 200) {
        await fetchRooms();
        setDeleteModal({ show: false, roomId: null, roomNumber: '' });
        showAlert('success', 'Eliminado', 'La habitación ha sido eliminada exitosamente.');
      }
    } catch (error) {
      console.error('Error:', error);
      setDeleteModal({ show: false, roomId: null, roomNumber: '' });
      const errorMessage = error.response?.data?.error || 'No se puede eliminar esta habitación. Es posible que tenga reservas activas.';
      showAlert('error', 'No se pudo eliminar', errorMessage);
    }
  };

  const handleEdit = (room) => {
    setSelectedRoom(room);
    setFormData({
      numero_habitacion: room.numero_habitacion,
      piso: room.piso,
      tipo_ocupacion: room.tipo_ocupacion,
      tamaño_cama: room.tamaño_cama,
      categoria: room.categoria,
      caracteristicas: room.caracteristicas || '',
      descripcion: room.descripcion || '',
      precio_base: room.precio_base,
      estado: room.estado,
      metros_cuadrados: room.metros_cuadrados,
      imagen: room.imagen || '', 
      activa: room.activa
    });
    // Si viene imagen, ponerla en preview
    if(room.imagen) setImagePreview(room.imagen);
    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      numero_habitacion: '',
      piso: 1,
      tipo_ocupacion: 'doble',
      tamaño_cama: 'queen',
      categoria: 'estandar',
      caracteristicas: '',
      descripcion: '',
      precio_base: 150.00,
      estado: 'disponible',
      metros_cuadrados: 45,
      imagen: '',
      activa: true
    });
    setSelectedRoom(null);
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, imagen: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'disponible': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'ocupada': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'limpieza': return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'mantenimiento': return <Wrench className="w-4 h-4 text-gray-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'disponible': return 'bg-green-100 text-green-800';
      case 'ocupada': return 'bg-red-100 text-red-800';
      case 'limpieza': return 'bg-orange-100 text-orange-800';
      case 'mantenimiento': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.numero_habitacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (room.caracteristicas && room.caracteristicas.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFloor = filterFloor === 'all' || room.piso === parseInt(filterFloor);
    const matchesStatus = filterStatus === 'all' || room.estado === filterStatus;
    const matchesCategory = filterCategory === 'all' || room.categoria === filterCategory;

    return matchesSearch && matchesFloor && matchesStatus && matchesCategory;
  });

  const stats = {
    total: rooms.length,
    disponibles: rooms.filter(r => r.estado === 'disponible').length,
    ocupadas: rooms.filter(r => r.estado === 'ocupada').length,
    mantenimiento: rooms.filter(r => r.estado === 'mantenimiento').length,
    limpieza: rooms.filter(r => r.estado === 'limpieza').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestión de Habitaciones</h1>
          <p className="text-slate-500 mt-1">Administra todas las habitaciones del hotel</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva Habitación
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </div>
            <BedDouble className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Disp.</p>
              <p className="text-2xl font-bold text-green-600">{stats.disponibles}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Ocupadas</p>
              <p className="text-2xl font-bold text-red-600">{stats.ocupadas}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Limpieza</p>
              <p className="text-2xl font-bold text-orange-600">{stats.limpieza}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Mant.</p>
              <p className="text-2xl font-bold text-gray-600">{stats.mantenimiento}</p>
            </div>
            <Wrench className="w-8 h-8 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg border border-slate-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar habitación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            <Filter className="w-4 h-4" />
            Filtros
            <ChevronDown className={`w-4 h-4 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100">
                    <select
                      value={filterFloor}
                      onChange={(e) => setFilterFloor(e.target.value)}
                      className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Todos los pisos</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(floor => (
                        <option key={floor} value={floor}>Piso {floor}</option>
                      ))}
                    </select>

                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Todos los estados</option>
                      <option value="disponible">Disponible</option>
                      <option value="ocupada">Ocupada</option>
                      <option value="limpieza">En Limpieza</option>
                      <option value="mantenimiento">En Mantenimiento</option>
                    </select>

                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Todas las categorías</option>
                      <option value="estandar">Estándar</option>
                      <option value="deluxe">Deluxe</option>
                      <option value="suite">Suite</option>
                      <option value="suite_presidencial">Suite Presidencial</option>
                      <option value="estudio">Estudio</option>
                    </select>
                  </div>
              </motion.div>
            )}
        </AnimatePresence>
      </div>

      {/* Lista de Habitaciones */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-slate-500">Cargando habitaciones...</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <BedDouble className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>No se encontraron habitaciones</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Habitación</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ubicación</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Precio</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredRooms.map((room) => (
                  <motion.tr
                    key={room.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                           {room.imagen ? (
                              <img src={room.imagen} alt="" className="h-full w-full object-cover" />
                           ) : (
                              <BedDouble className="h-5 w-5 text-blue-600" />
                           )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">{room.numero_habitacion}</div>
                          <div className="text-sm text-slate-500 capitalize">{room.categoria?.replace('_', ' ')}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-slate-500">
                        <MapPin className="w-4 h-4 mr-1" />
                        Piso {room.piso}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">
                        <div className="capitalize">{room.tipo_ocupacion}</div>
                        <div className="text-slate-500 capitalize">{room.tamaño_cama}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(room.estado)}`}>
                        {getStatusIcon(room.estado)}
                        {room.estado === 'disponible' ? 'Disponible' :
                          room.estado === 'ocupada' ? 'Ocupada' :
                            room.estado === 'limpieza' ? 'En Limpieza' : 'En Mantenimiento'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">
                        ${parseFloat(room.precio_base || 0).toFixed(2)}
                      </div>
                      <div className="text-slate-500 text-xs">por noche</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedRoom(room)}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                          title="Ver Detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(room)}
                          className="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => initiateDelete(room)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* 1. Modal Confirmación de Eliminación */}
      <AnimatePresence>
        {deleteModal.show && (
            <div 
                className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-[60]"
                onClick={() => setDeleteModal({ show: false, roomId: null, roomNumber: '' })}
            >
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm border border-slate-100"
                >
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">¿Eliminar Habitación?</h3>
                        <p className="text-slate-600 mb-6">
                            Estás a punto de eliminar la habitación <span className="font-bold">{deleteModal.roomNumber}</span>. 
                            Esta acción no se puede deshacer.
                        </p>
                        <div className="flex gap-3 w-full">
                            <button 
                                onClick={() => setDeleteModal({ show: false, roomId: null, roomNumber: '' })}
                                className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={confirmDelete}
                                className="flex-1 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-md hover:shadow-lg"
                            >
                                Sí, Eliminar
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* 2. Modal Alerta/Error */}
      <AnimatePresence>
        {alertModal.show && (
            <div 
                className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-[70]"
                onClick={() => setAlertModal(prev => ({...prev, show: false}))}
            >
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm relative"
                >
                    <button 
                        onClick={() => setAlertModal(prev => ({...prev, show: false}))}
                        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-start gap-4">
                        {alertModal.type === 'error' ? (
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <XCircle className="w-6 h-6 text-red-600" />
                            </div>
                        ) : (
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        )}
                        <div>
                            <h3 className={`text-lg font-bold ${alertModal.type === 'error' ? 'text-red-700' : 'text-green-700'} mb-1`}>
                                {alertModal.title}
                            </h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                {alertModal.message}
                            </p>
                        </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                        <button 
                            onClick={() => setAlertModal(prev => ({...prev, show: false}))}
                            className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${
                                alertModal.type === 'error' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                            }`}
                        >
                            Entendido
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* Modal Agregar/Editar Habitación */}
      {(showAddModal || showEditModal) && (
        <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={closeModals}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900">
                {showEditModal ? 'Editar Habitación' : 'Nueva Habitación'}
                </h2>
                <button onClick={closeModals} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100">
                    <X className="w-6 h-6" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Número de Habitación *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.numero_habitacion}
                    onChange={(e) => setFormData({ ...formData, numero_habitacion: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: 101"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Piso *
                  </label>
                  <select
                    required
                    value={formData.piso}
                    onChange={(e) => setFormData({ ...formData, piso: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(floor => (
                      <option key={floor} value={floor}>Piso {floor}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tipo de Ocupación *
                  </label>
                  <select
                    required
                    value={formData.tipo_ocupacion}
                    onChange={(e) => setFormData({ ...formData, tipo_ocupacion: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="doble">Doble (2 personas)</option>
                    <option value="triple">Triple (3 personas)</option>
                    <option value="cuadruple">Cuádruple (4 personas)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tamaño de Cama *
                  </label>
                  <select
                    required
                    value={formData.tamaño_cama}
                    onChange={(e) => setFormData({ ...formData, tamaño_cama: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="queen">Queen</option>
                    <option value="king">King</option>
                    <option value="twin">Twin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Categoría *
                  </label>
                  <select
                    required
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="estandar">Estándar</option>
                    <option value="deluxe">Deluxe</option>
                    <option value="suite">Suite</option>
                    <option value="suite_presidencial">Suite Presidencial</option>
                    <option value="estudio">Estudio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Precio Base ($) *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={formData.precio_base}
                    onChange={(e) => setFormData({ ...formData, precio_base: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="150.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Metros Cuadrados
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.metros_cuadrados}
                    onChange={(e) => setFormData({ ...formData, metros_cuadrados: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="45"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Estado Actual *
                  </label>
                  <select
                    required
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="disponible">Disponible</option>
                    <option value="ocupada">Ocupada</option>
                    <option value="limpieza">En Limpieza</option>
                    <option value="mantenimiento">En Mantenimiento</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Características
                </label>
                <textarea
                  value={formData.caracteristicas}
                  onChange={(e) => setFormData({ ...formData, caracteristicas: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Vista al mar, balcón, aire acondicionado..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descripción detallada de la habitación..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Imagen Principal (Opcional)
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  
                  {imagePreview && (
                    <div className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-200">
                      <img
                        src={imagePreview}
                        alt="Previsualización"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="activa"
                  checked={formData.activa}
                  onChange={(e) => setFormData({ ...formData, activa: e.target.checked })}
                  className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="activa" className="text-sm text-slate-700">
                  Habitación activa
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModals}
                  className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 font-medium text-slate-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> {showEditModal ? 'Guardar Cambios' : 'Crear Habitación'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal Ver Detalles */}
      {selectedRoom && !showEditModal && !deleteModal.show && (
        <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedRoom(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto"
          >
            <button
                onClick={() => setSelectedRoom(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            >
                <X className="w-6 h-6" />
            </button>

            {/* Cabecera Centrada */}
            <div className="flex flex-col items-center text-center mb-6">
                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden mb-3 shadow-sm">
                    {selectedRoom.imagen ? (
                      <img src={selectedRoom.imagen} alt="" className="h-full w-full object-cover"/>
                    ) : (
                      <BedDouble className="h-8 w-8 text-blue-600" />
                    )}
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">
                    Habitación {selectedRoom.numero_habitacion}
                </h2>
                <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${getStatusColor(selectedRoom.estado)}`}>
                    {getStatusIcon(selectedRoom.estado)}
                    {selectedRoom.estado}
                </span>
            </div>

            {/* Imagen Principal */}
            {selectedRoom.imagen && (
                <div className="w-full h-56 rounded-xl overflow-hidden mb-6 border border-slate-100 shadow-sm bg-slate-50 flex items-center justify-center">
                  <img
                    src={selectedRoom.imagen}
                    alt={`Habitación ${selectedRoom.numero_habitacion}`}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
            )}

            {/* Detalles */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl mb-6">
                <div>
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Tipo</p>
                    <p className="font-medium text-slate-800 capitalize">{selectedRoom.tipo_ocupacion}</p>
                </div>
                <div>
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Cama</p>
                    <p className="font-medium text-slate-800 capitalize">{selectedRoom.tamaño_cama}</p>
                </div>
                <div>
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Piso</p>
                    <p className="font-medium text-slate-800">{selectedRoom.piso}</p>
                </div>
                <div>
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Area</p>
                    <p className="font-medium text-slate-800">{selectedRoom.metros_cuadrados} m²</p>
                </div>
            </div>

            <div className="text-center mb-6">
                <p className="text-xs text-slate-400 uppercase font-bold mb-1">Precio por Noche</p>
                <p className="text-3xl font-black text-blue-600">${parseFloat(selectedRoom.precio_base || 0).toFixed(2)}</p>
            </div>

            <div className="space-y-4">
                {selectedRoom.caracteristicas && (
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold mb-1">Características</p>
                        <p className="text-sm text-slate-600">{selectedRoom.caracteristicas}</p>
                    </div>
                )}
                {selectedRoom.descripcion && (
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold mb-1">Descripción</p>
                        <p className="text-sm text-slate-600">{selectedRoom.descripcion}</p>
                    </div>
                )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default RoomManagement;