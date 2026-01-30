import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  ChevronDown,
  Crown,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Wrench,
  Eye,
  Upload,
  X,
  FileText,
  Save,
  Maximize2,
  Image as ImageIcon
} from 'lucide-react';
import api from '../../api/axios';

const GestionSalones = () => {
  const [salones, setSalones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Modales
  const [selectedSalon, setSelectedSalon] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, nombre: '' });
  const [alertModal, setAlertModal] = useState({ show: false, type: 'success', title: '', message: '' });

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    estado: 'disponible',
    imagen: null
  });

  useEffect(() => {
    fetchSalones();
  }, []);

  const fetchSalones = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/salones-eventos/salones/');
      setSalones(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error cargando salones:', error);
      setSalones([]);
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, title, message) => {
    setAlertModal({ show: true, type, title, message });
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = showEditModal
        ? `/api/salones-eventos/salones/${selectedSalon.id}/`
        : '/api/salones-eventos/salones/';

      const formDataToSend = new FormData();
      formDataToSend.append('nombre', formData.nombre);
      formDataToSend.append('descripcion', formData.descripcion);
      formDataToSend.append('estado', formData.estado);
      
      if (selectedImage) {
        formDataToSend.append('imagen', selectedImage);
      }

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      const response = showEditModal
        ? await api.put(url, formDataToSend, config)
        : await api.post(url, formDataToSend, config);

      if (response.status === 200 || response.status === 201) {
        await fetchSalones();
        closeModals();
        showAlert('success', '¡Éxito!', showEditModal ? 'Salón actualizado correctamente.' : 'Salón creado correctamente.');
      }
    } catch (error) {
      console.error('Error:', error);
      const msg = error.response?.data ? JSON.stringify(error.response.data) : 'Error de conexión';
      showAlert('error', 'Error al guardar', msg);
    }
  };

  const handleEdit = (salon) => {
    setSelectedSalon(salon);
    setFormData({
      nombre: salon.nombre,
      descripcion: salon.descripcion || '',
      estado: salon.estado || 'disponible',
      imagen: null
    });
    setImagePreview(salon.imagen_url || null);
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      estado: 'disponible',
      imagen: null
    });
    setSelectedSalon(null);
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const initiateDelete = async (salon) => {
    try {
      const response = await api.get('/api/reservas-salon/reservas/');
      const todasLasReservas = response.data.results || response.data || [];
      
      const tieneReservas = todasLasReservas.some(res => 
        (res.salon === salon.id || res.salon?.id === salon.id) && 
        (res.estado === 'confirmada' || res.estado === 'pendiente')
      );

      if (tieneReservas) {
        showAlert(
          'error', 
          'Acción Denegada', 
          `El salón "${salon.nombre}" tiene reservas activas. No puede ser eliminado.`
        );
        return;
      }

      setDeleteModal({ show: true, id: salon.id, nombre: salon.nombre });
    } catch (error) {
      console.error("Error verificando reservas:", error);
      showAlert('error', 'Error', 'No se pudo verificar el estado de las reservas.');
    }
  };

  const confirmDelete = async () => {
    try {
      const response = await api.delete(`/api/salones-eventos/salones/${deleteModal.id}/`);
      if (response.status === 204 || response.status === 200) {
        await fetchSalones();
        setDeleteModal({ show: false, id: null, nombre: '' });
        showAlert('success', 'Eliminado', 'El salón ha sido eliminado exitosamente.');
      }
    } catch (error) {
      setDeleteModal({ show: false, id: null, nombre: '' });
      showAlert('error', 'No se pudo eliminar', 'Error al procesar la eliminación.');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'disponible': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'ocupado': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'mantenimiento': return <Wrench className="w-4 h-4 text-gray-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'disponible': return 'bg-green-100 text-green-800';
      case 'ocupado': return 'bg-red-100 text-red-800';
      case 'mantenimiento': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSalones = salones.filter(salon => {
    const matchesSearch = salon.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          salon.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || salon.estado === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: salones.length,
    disponibles: salones.filter(s => s.estado === 'disponible').length,
    ocupados: salones.filter(s => s.estado === 'ocupado').length,
    mantenimiento: salones.filter(s => s.estado === 'mantenimiento').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestión de Salones</h1>
          <p className="text-slate-500 mt-1">Administra los espacios para eventos</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Nuevo Salón
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
            { label: 'Total Salones', value: stats.total, icon: Crown, color: 'text-blue-500', bg: 'bg-white' },
            { label: 'Disponibles', value: stats.disponibles, icon: CheckCircle, color: 'text-green-500', bg: 'bg-white' },
            { label: 'Ocupados', value: stats.ocupados, icon: XCircle, color: 'text-red-500', bg: 'bg-white' },
            { label: 'Mantenimiento', value: stats.mantenimiento, icon: Wrench, color: 'text-gray-500', bg: 'bg-white' },
        ].map((stat, idx) => (
             <div key={idx} className={`${stat.bg} p-4 rounded-lg border border-slate-200 flex justify-between items-center shadow-sm`}>
                <div>
                    <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color.replace('text-', 'text-slate-900 ')}`}>{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color.replace('text-', 'bg-').replace('500', '50')}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
             </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg border border-slate-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar salón..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            <Filter className="w-4 h-4" /> Filtros <ChevronDown className={`w-4 h-4 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
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
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Estado Actual</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full md:w-1/3 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Todos los estados</option>
                      <option value="disponible">Disponible</option>
                      <option value="ocupado">Ocupado</option>
                      <option value="mantenimiento">Mantenimiento</option>
                    </select>
                  </div>
              </motion.div>
            )}
        </AnimatePresence>
      </div>

      {/* Lista de Salones */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-slate-500">Cargando salones...</p>
          </div>
        ) : filteredSalones.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <Crown className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>No se encontraron salones</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Salón</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Imagen</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredSalones.map((salon) => (
                  <motion.tr
                    key={salon.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900">{salon.nombre}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(salon.estado)}`}>
                        {getStatusIcon(salon.estado)}
                        <span className="capitalize">{salon.estado}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {salon.imagen_url ? (
                        <div className="h-10 w-16 rounded overflow-hidden border border-slate-200">
                            <img src={salon.imagen_url} alt={salon.nombre} className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-10 w-10 bg-slate-100 rounded flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-slate-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setSelectedSalon(salon)} className="p-1 text-slate-400 hover:text-blue-600 rounded-full transition-colors" title="Ver Detalles">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleEdit(salon)} className="p-1 text-slate-400 hover:text-amber-600 rounded-full transition-colors" title="Editar">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => initiateDelete(salon)} className="p-1 text-slate-400 hover:text-red-600 rounded-full transition-colors" title="Eliminar">
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

      {/* --- MODAL FORMULARIO (ADD/EDIT) CON MEJORA DE IMAGEN --- */}
      <AnimatePresence>
        {(showAddModal || showEditModal) && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={closeModals}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">{showEditModal ? 'Editar Salón' : 'Nuevo Salón'}</h2>
                    <p className="text-sm text-slate-500">Información del salón de eventos.</p>
                </div>
                <button onClick={closeModals} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"><X className="w-6 h-6" /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nombre del Salón</label>
                        <input
                            type="text"
                            required
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                            placeholder="Ej: Salón Real"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Estado</label>
                        <select
                            required
                            value={formData.estado}
                            onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="disponible">Disponible</option>
                            <option value="ocupado">Ocupado</option>
                            <option value="mantenimiento">Mantenimiento</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Descripción</label>
                        <textarea
                            required
                            rows={3}
                            value={formData.descripcion}
                            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            placeholder="Detalles sobre el salón..."
                        />
                    </div>

                    {/* MEJORA VISUAL DE SUBIDA DE IMAGEN */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Imagen del Salón</label>
                        <div className="mt-1">
                            {!imagePreview ? (
                                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors group">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <div className="p-3 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                            <Upload className="w-6 h-6 text-slate-400" />
                                        </div>
                                        <p className="mb-1 text-sm text-slate-500 font-medium">Clic para subir imagen</p>
                                        <p className="text-xs text-slate-400">PNG, JPG o WEBP</p>
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>
                            ) : (
                                <div className="relative w-full h-40 rounded-xl overflow-hidden border border-slate-200 shadow-sm group">
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                        <label className="p-2 bg-white text-slate-900 rounded-full cursor-pointer hover:scale-110 transition-transform shadow-lg">
                                            <Upload className="w-5 h-5" />
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                                            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-lg transform hover:scale-110 transition-all"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                    <button type="button" onClick={closeModals} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Cancelar</button>
                    <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-lg shadow-blue-500/30 flex items-center gap-2">
                        <Save className="w-4 h-4" /> {showEditModal ? 'Guardar' : 'Crear'}
                    </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL DETALLES --- */}
      <AnimatePresence>
        {selectedSalon && !showEditModal && !deleteModal.show && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setSelectedSalon(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg p-6 w-full max-w-sm shadow-2xl relative text-center">
                <button onClick={() => setSelectedSalon(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full"><X className="w-6 h-6" /></button>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-600 shadow-sm"><Crown className="h-8 w-8" /></div>
                <h2 className="text-2xl font-bold text-slate-900">{selectedSalon.nombre}</h2>
                <span className={`px-3 py-0.5 text-xs font-bold rounded-full ${getStatusColor(selectedSalon.estado)} mt-2`}>{selectedSalon.estado}</span>
                {selectedSalon.imagen_url && <img src={selectedSalon.imagen_url} className="mt-6 w-full h-40 object-cover rounded-xl border shadow-sm" />}
                <p className="mt-4 text-sm text-slate-600">{selectedSalon.descripcion}</p>
                <button onClick={() => setSelectedSalon(null)} className="mt-8 w-full py-2 bg-slate-900 text-white rounded-lg font-bold text-sm">Cerrar</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL ELIMINAR --- */}
      <AnimatePresence>
        {deleteModal.show && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-[60]" onClick={() => setDeleteModal({ show: false, id: null, nombre: '' })}>
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600"><AlertTriangle className="w-8 h-8" /></div>
                    <h3 className="text-xl font-bold text-slate-900">¿Eliminar Salón?</h3>
                    <p className="text-slate-600 my-4 text-sm">Estás a punto de borrar el salón <span className="font-bold">{deleteModal.nombre}</span>. Esta acción es irreversible.</p>
                    <div className="flex gap-3">
                        <button onClick={() => setDeleteModal({ show: false, id: null, nombre: '' })} className="flex-1 py-2 bg-slate-100 rounded-lg transition-colors">Cancelar</button>
                        <button onClick={confirmDelete} className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all shadow-md">Confirmar</button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* --- MODAL ALERTA --- */}
      <AnimatePresence>
        {alertModal.show && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-[70]" onClick={() => setAlertModal(prev => ({...prev, show: false}))}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm text-center relative">
                    <button onClick={() => setAlertModal(prev => ({...prev, show: false}))} className="absolute top-4 right-4 text-slate-400"><X className="w-5 h-5" /></button>
                    {alertModal.type === 'error' ? <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" /> : <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />}
                    <h3 className="text-lg font-bold text-slate-900">{alertModal.title}</h3>
                    <p className="text-slate-600 text-sm mt-2">{alertModal.message}</p>
                    <button onClick={() => setAlertModal(prev => ({...prev, show: false}))} className="mt-6 w-full py-2 bg-slate-900 text-white rounded-lg font-bold">Entendido</button>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GestionSalones;