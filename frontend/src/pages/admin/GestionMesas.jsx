import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  ChevronDown,
  UtensilsCrossed,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  X,
  Eye,
  Image as ImageIcon,
  Save
} from 'lucide-react';
import api from '../../api/axios';

const GestionMesas = () => {
  const [mesas, setMesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCapacity, setFilterCapacity] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMesa, setSelectedMesa] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, numero: '' });
  const [alertModal, setAlertModal] = useState({ show: false, type: 'success', title: '', message: '' });

  const [formData, setFormData] = useState({
    numero_mesa: '',
    capacidad: 2,
    imagen: null
  });

  useEffect(() => {
    fetchMesas();
  }, []);

  const fetchMesas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/mesas-restaurante/mesas/');
      setMesas(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error cargando mesas:', error);
      setMesas([]);
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, title, message) => {
    setAlertModal({ show: true, type, title, message });
  };

  // --- FUNCIÓN closeModals para evitar el ReferenceError ---
  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = showEditModal
        ? `/api/mesas-restaurante/mesas/${selectedMesa.id}/`
        : '/api/mesas-restaurante/mesas/';

      const formDataToSend = new FormData();
      formDataToSend.append('numero_mesa', formData.numero_mesa);
      formDataToSend.append('capacidad', formData.capacidad);
      
      if (selectedImage) {
        formDataToSend.append('imagen', selectedImage);
      } 

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      const response = showEditModal
        ? await api.put(url, formDataToSend, config)
        : await api.post(url, formDataToSend, config);

      if (response.status === 200 || response.status === 201) {
        await fetchMesas();
        closeModals();
        showAlert('success', '¡Éxito!', showEditModal ? 'Mesa actualizada correctamente.' : 'Mesa creada correctamente.');
      }
    } catch (error) {
      console.error('Error:', error);
      const msg = error.response?.data ? JSON.stringify(error.response.data) : 'Error de conexión';
      showAlert('error', 'Error al guardar', msg);
    }
  };

  // --- LÓGICA DE PROTECCIÓN (FUNCIONALIDAD PEDIDA) ---
  const initiateDelete = async (mesa) => {
    try {
      const response = await api.get('/api/reservas-restaurante/reservas/');
      const todasLasReservas = response.data.results || response.data || [];
      
      const tieneReservas = todasLasReservas.some(res => 
        (res.mesa === mesa.id || res.mesa?.id === mesa.id) && 
        (res.estado === 'confirmada' || res.estado === 'pendiente')
      );

      if (tieneReservas) {
        showAlert(
          'error', 
          'Mesa Comprometida', 
          `No se puede eliminar la mesa "${mesa.numero_mesa}" porque tiene reservas activas.`
        );
        return;
      }

      setDeleteModal({
          show: true,
          id: mesa.id,
          numero: mesa.numero_mesa
      });
    } catch (error) {
      showAlert('error', 'Error', 'No se pudo verificar la disponibilidad de la mesa.');
    }
  };

  const confirmDelete = async () => {
    try {
      const response = await api.delete(`/api/mesas-restaurante/mesas/${deleteModal.id}/`);
      if (response.status === 204 || response.status === 200) {
        await fetchMesas();
        setDeleteModal({ show: false, id: null, numero: '' });
        showAlert('success', 'Eliminado', 'La mesa ha sido eliminada exitosamente.');
      }
    } catch (error) {
      setDeleteModal({ show: false, id: null, numero: '' });
      showAlert('error', 'No se pudo eliminar', 'Es posible que tenga reservas activas en la base de datos.');
    }
  };

  const handleEdit = (mesa) => {
    setSelectedMesa(mesa);
    setFormData({
      numero_mesa: mesa.numero_mesa,
      capacidad: mesa.capacidad,
      imagen: null
    });
    setImagePreview(mesa.imagen_url || null);
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      numero_mesa: '',
      capacidad: 2,
      imagen: null
    });
    setSelectedMesa(null);
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

  const filteredMesas = mesas.filter(mesa => {
    const matchesSearch = mesa.numero_mesa?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCapacity = filterCapacity === 'all' || mesa.capacidad === parseInt(filterCapacity);
    return matchesSearch && matchesCapacity;
  });

  const stats = {
    total: mesas.length,
    capacidad_total: mesas.reduce((sum, mesa) => sum + (mesa.capacidad || 0), 0),
    mesas_2_personas: mesas.filter(m => m.capacidad === 2).length,
    mesas_4_personas: mesas.filter(m => m.capacidad === 4).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestión de Mesas</h1>
          <p className="text-slate-500 mt-1">Administra las mesas del restaurante</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva Mesa
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Mesas</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </div>
            <UtensilsCrossed className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Capacidad Total</p>
              <p className="text-2xl font-bold text-purple-600">{stats.capacidad_total}</p>
            </div>
            <Users className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Mesas 2 Personas</p>
              <p className="text-2xl font-bold text-green-600">{stats.mesas_2_personas}</p>
            </div>
            <Users className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Mesas 4+ Personas</p>
              <p className="text-2xl font-bold text-orange-600">{stats.mesas_4_personas}</p>
            </div>
            <Users className="w-8 h-8 text-orange-500" />
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
                placeholder="Buscar mesa..."
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

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
            <select
              value={filterCapacity}
              onChange={(e) => setFilterCapacity(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            >
              <option value="all">Todas las capacidades</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(cap => (
                <option key={cap} value={cap}>{cap} personas</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Lista de Mesas */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-slate-500">Cargando mesas...</p>
          </div>
        ) : filteredMesas.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <UtensilsCrossed className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>No se encontraron mesas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Mesa</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Capacidad</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Imagen</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredMesas.map((mesa) => (
                  <motion.tr
                    key={mesa.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                          {mesa.numero_mesa[0]}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">{mesa.numero_mesa}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-slate-500">
                        <Users className="w-4 h-4 mr-1 text-slate-400" />
                        {mesa.capacidad} personas
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {mesa.imagen_url ? (
                        <div className="h-10 w-16 rounded overflow-hidden border border-slate-200">
                          <img src={mesa.imagen_url} alt={mesa.numero_mesa} className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-10 w-10 bg-slate-100 rounded flex items-center justify-center text-slate-400">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setSelectedMesa(mesa)} className="p-1 text-slate-400 hover:text-blue-600 transition-colors" title="Ver Detalles">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleEdit(mesa)} className="p-1 text-slate-400 hover:text-amber-600 transition-colors" title="Editar">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => initiateDelete(mesa)} className="p-1 text-slate-400 hover:text-red-600 transition-colors" title="Eliminar">
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

      {/* --- MODAL AGREGAR / EDITAR --- */}
      <AnimatePresence>
        {(showAddModal || showEditModal) && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={closeModals}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">{showEditModal ? 'Editar Mesa' : 'Nueva Mesa'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder="Número de mesa" value={formData.numero_mesa} onChange={(e) => setFormData({...formData, numero_mesa: e.target.value})} className="w-full p-2 border rounded-lg" required />
                <select value={formData.capacidad} onChange={(e) => setFormData({...formData, capacidad: parseInt(e.target.value)})} className="w-full p-2 border rounded-lg">
                  {[2, 4, 6, 8, 10].map(n => <option key={n} value={n}>{n} personas</option>)}
                </select>
                <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm" />
                {imagePreview && <div className="mt-4 relative"><img src={imagePreview} className="h-32 w-full object-cover rounded-lg border" /><button type="button" onClick={() => { setSelectedImage(null); setImagePreview(null); }} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"><X className="w-4 h-4" /></button></div>}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <button type="button" onClick={closeModals} className="px-4 py-2 bg-slate-100 rounded-lg">Cancelar</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"><Save className="w-4 h-4" /> Guardar</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL DETALLES --- */}
      <AnimatePresence>
        {selectedMesa && !showEditModal && !deleteModal.show && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setSelectedMesa(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg p-6 w-full max-w-sm shadow-2xl relative text-center">
                <button onClick={() => setSelectedMesa(null)} className="absolute top-4 right-4 text-slate-400"><X className="w-6 h-6" /></button>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 shadow-sm"><UtensilsCrossed className="h-8 w-8" /></div>
                <h2 className="text-2xl font-bold text-slate-900">{selectedMesa.numero_mesa}</h2>
                <p className="text-slate-500 mb-6 font-semibold uppercase tracking-wider text-xs">Mesa de Restaurante</p>
                {selectedMesa.imagen_url && <img src={selectedMesa.imagen_url} className="w-full h-48 object-cover rounded-xl mb-6 shadow-sm border" />}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Capacidad Máxima</p>
                    <p className="text-xl font-black text-slate-800 flex items-center gap-2"><Users className="w-5 h-5 text-slate-600" /> {selectedMesa.capacidad} Personas</p>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL ELIMINAR --- */}
      <AnimatePresence>
        {deleteModal.show && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-[60]" onClick={() => setDeleteModal({ show: false, id: null, numero: '' })}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl p-6 w-full max-w-sm text-center border border-slate-100 shadow-2xl">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600"><AlertTriangle className="w-8 h-8" /></div>
              <h3 className="text-xl font-bold text-slate-900">¿Eliminar Mesa?</h3>
              <p className="text-slate-600 my-4 text-sm leading-relaxed">Estás a punto de borrar la mesa <span className="font-bold">{deleteModal.numero}</span>. Esta acción no se puede deshacer.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteModal({ show: false, id: null, numero: '' })} className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200">Cancelar</button>
                <button onClick={confirmDelete} className="flex-1 py-2.5 bg-red-600 text-white font-medium rounded-lg shadow-md hover:bg-red-700">Confirmar</button>
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
              <button onClick={() => setAlertModal(prev => ({...prev, show: false}))} className={`mt-6 w-full py-2 rounded-lg text-white font-bold transition-colors ${alertModal.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>Entendido</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GestionMesas;