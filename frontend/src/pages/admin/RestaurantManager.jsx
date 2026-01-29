import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UtensilsCrossed,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Filter,
  ChevronDown,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle,
  X,
  Upload,
  Save,
  Image as ImageIcon
} from 'lucide-react';

import api from '../../api/axios';

const RestaurantManager = () => {
  const [dishes, setDishes] = useState([]);
  const [allergens, setAllergens] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterState, setFilterState] = useState('all'); 
  const [filterAvailable, setFilterAvailable] = useState('all'); 
  const [showFilters, setShowFilters] = useState(false);
  
  // Modales
  const [selectedDish, setSelectedDish] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, nombre: '' });
  const [alertModal, setAlertModal] = useState({ show: false, type: 'success', title: '', message: '' });

  // Imagen
  const [imagePreview, setImagePreview] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoria: 'principal',
    precio: 0.00,
    ingredientes: '',
    imagen: null,
    disponible: true,
    activo: true
  });

  const categories = [
    { value: 'entrada', label: 'Entrada' },
    { value: 'principal', label: 'Plato Principal' },
    { value: 'postre', label: 'Postre' },
    { value: 'bebida', label: 'Bebida' },
    { value: 'aperitivo', label: 'Aperitivo' },
    { value: 'ensalada', label: 'Ensalada' },
    { value: 'sopa', label: 'Sopa' },
    { value: 'guarnicion', label: 'Guarnición' }
  ];

  useEffect(() => {
    fetchDishes();
    fetchAllergens();
  }, []);

  const fetchDishes = async () => {
    try {
      setLoading(true);
      // Pedimos explícitamente TODOS los datos
      const response = await api.get('/api/platos/platos/', {
          params: {
              mostrar_inactivos: 'true',
              mostrar_no_disponibles: 'true'
          }
      });
      
      const data = response.data;
      if (Array.isArray(data)) setDishes(data);
      else if (data.results) setDishes(data.results);
      else setDishes([]);
      
    } catch (error) {
      console.error('Error cargando platos:', error);
      setDishes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllergens = async () => {
    try {
      const response = await api.get('/api/platos/alergenos/');
      setAllergens(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error cargando alérgenos:', error);
    }
  };

  const showAlert = (type, title, message) => {
    setAlertModal({ show: true, type, title, message });
  };

  // --- LOGICA DE GUARDADO (ACTUALIZADA) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // CORRECCIÓN: Agregamos query params para asegurar que el backend encuentre el registro
      const url = showEditModal
        ? `/api/platos/platos/${selectedDish.id}/?mostrar_inactivos=true&mostrar_no_disponibles=true`
        : '/api/platos/platos/';

      const formDataToSend = new FormData();
      formDataToSend.append('nombre', formData.nombre);
      formDataToSend.append('descripcion', formData.descripcion);
      formDataToSend.append('categoria', formData.categoria);
      formDataToSend.append('precio', formData.precio);
      formDataToSend.append('ingredientes', formData.ingredientes);
      
      // Enviar como string
      formDataToSend.append('disponible', formData.disponible ? 'true' : 'false');
      formDataToSend.append('activo', formData.activo ? 'true' : 'false');

      if (formData.imagen instanceof File) {
        formDataToSend.append('imagen', formData.imagen);
      }

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      const response = showEditModal
        ? await api.patch(url, formDataToSend, config)
        : await api.post(url, formDataToSend, config);

      if (response.status === 200 || response.status === 201) {
        await fetchDishes(); 
        closeModals();
        showAlert('success', '¡Éxito!', showEditModal ? 'Plato actualizado.' : 'Plato creado.');
      }
    } catch (error) {
      console.error('Error:', error);
      const msg = error.response?.data ? JSON.stringify(error.response.data) : 'Error de conexión';
      showAlert('error', 'Error al guardar', msg);
    }
  };
 
  // --- TOGGLE ESTADO (CORREGIDO) ---
  const toggleStatus = async (dish, field) => {
      try {
          const newValue = !dish[field];
          const formDataToSend = new FormData();
          formDataToSend.append(field, newValue ? 'true' : 'false');
          
          // CORRECCIÓN: Añadimos ambos flags para evitar 404
          await api.patch(`/api/platos/platos/${dish.id}/?mostrar_inactivos=true&mostrar_no_disponibles=true`, formDataToSend, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          
          setDishes(prev => prev.map(d => d.id === dish.id ? { ...d, [field]: newValue } : d));
          
      } catch (error) {
          console.error("Error toggling status", error);
          showAlert('error', 'Error', 'No se pudo actualizar el estado.');
      }
  };

  // --- BORRADO (CORREGIDO) ---
  const initiateDelete = (dish) => {
    setDeleteModal({ show: true, id: dish.id, nombre: dish.nombre });
  };

  const confirmDelete = async () => {
    try {
      // CORRECCIÓN: Añadimos ambos flags
      const response = await api.delete(`/api/platos/platos/${deleteModal.id}/?mostrar_inactivos=true&mostrar_no_disponibles=true`);
      if (response.status === 204 || response.status === 200) {
        await fetchDishes();
        setDeleteModal({ show: false, id: null, nombre: '' });
        showAlert('success', 'Eliminado', 'Plato eliminado correctamente.');
      }
    } catch (error) {
      setDeleteModal({ show: false, id: null, nombre: '' });
      showAlert('error', 'Error', 'No se pudo eliminar el plato.');
    }
  };

  const handleEdit = (dish) => {
    setSelectedDish(dish);
    setFormData({
      nombre: dish.nombre,
      descripcion: dish.descripcion || '',
      categoria: dish.categoria,
      precio: dish.precio,
      ingredientes: dish.ingredientes || '',
      imagen: null,
      disponible: dish.disponible,
      activo: dish.activo
    });
    if(dish.imagen) setImagePreview(dish.imagen);
    else if(dish.url_imagen) setImagePreview(dish.url_imagen);
    else setImagePreview(null);
    setShowEditModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, imagen: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      categoria: 'principal',
      precio: 0.00,
      ingredientes: '',
      imagen: null,
      disponible: true,
      activo: true
    });
    setSelectedDish(null);
    setImagePreview(null);
  };

  // --- FILTROS ---
  const filteredDishes = dishes.filter(dish => {
    const matchesSearch = dish.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || dish.categoria === filterCategory;
    
    let matchesState = true;
    if (filterState === 'active') matchesState = dish.activo === true;
    if (filterState === 'inactive') matchesState = dish.activo === false;
    
    let matchesAvailable = true;
    if (filterAvailable === 'available') matchesAvailable = dish.disponible === true;
    if (filterAvailable === 'unavailable') matchesAvailable = dish.disponible === false;

    return matchesSearch && matchesCategory && matchesState && matchesAvailable;
  });

  const getAvailabilityIcon = (available) => available ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />;
  const getAvailabilityColor = (available) => available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

  const stats = {
    total: dishes.length,
    activos: dishes.filter(d => d.activo).length,
    inactivos: dishes.filter(d => !d.activo).length,
    disponibles: dishes.filter(d => d.disponible && d.activo).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Menú del Restaurante</h1>
          <p className="text-slate-500 mt-1">Gestiona platos, precios y disponibilidad.</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
        >
          <Plus className="w-4 h-4" /> Nuevo Plato
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex justify-between items-center">
             <div><p className="text-sm text-slate-500">Total Platos</p><p className="text-2xl font-bold text-slate-900">{stats.total}</p></div>
             <UtensilsCrossed className="w-8 h-8 text-blue-500 bg-blue-50 p-1.5 rounded-full"/>
         </div>
         <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex justify-between items-center">
             <div><p className="text-sm text-slate-500">Activos</p><p className="text-2xl font-bold text-green-600">{stats.activos}</p></div>
             <Eye className="w-8 h-8 text-green-500 bg-green-50 p-1.5 rounded-full"/>
         </div>
         <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex justify-between items-center">
             <div><p className="text-sm text-slate-500">Inactivos</p><p className="text-2xl font-bold text-gray-500">{stats.inactivos}</p></div>
             <EyeOff className="w-8 h-8 text-gray-500 bg-gray-50 p-1.5 rounded-full"/>
         </div>
         <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex justify-between items-center">
             <div><p className="text-sm text-slate-500">En Stock</p><p className="text-2xl font-bold text-orange-600">{stats.disponibles}</p></div>
             <CheckCircle className="w-8 h-8 text-orange-500 bg-orange-50 p-1.5 rounded-full"/>
         </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar plato..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50">
            <Filter className="w-4 h-4" /> Filtros <ChevronDown className={`w-4 h-4 transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>
        
        <AnimatePresence>
            {showFilters && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100">
                        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500">
                            <option value="all">Todas las Categorías</option>
                            {categories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                        </select>
                        <select value={filterState} onChange={(e) => setFilterState(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500">
                            <option value="all">Todos (Activos e Inactivos)</option>
                            <option value="active">Solo Activos (Menú)</option>
                            <option value="inactive">Solo Inactivos</option>
                        </select>
                        <select value={filterAvailable} onChange={(e) => setFilterAvailable(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500">
                            <option value="all">Todo Stock</option>
                            <option value="available">Disponible</option>
                            <option value="unavailable">Agotado</option>
                        </select>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
            <div className="p-12 text-center text-slate-500">Cargando menú...</div>
        ) : filteredDishes.length === 0 ? (
            <div className="p-12 text-center text-slate-500">No se encontraron platos.</div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Plato</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Categoría</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Precio</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Stock (Disp.)</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Estado (Activo)</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredDishes.map((dish) => (
                            <tr key={dish.id} className={`group hover:bg-slate-50 transition-colors ${!dish.activo ? 'bg-slate-50/50' : ''}`}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className={`flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center overflow-hidden ${!dish.activo ? 'grayscale opacity-50' : ''}`}>
                                            {dish.imagen || dish.url_imagen ? (
                                                <img src={dish.imagen || dish.url_imagen} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="bg-orange-100 w-full h-full flex items-center justify-center"><UtensilsCrossed className="w-5 h-5 text-orange-500" /></div>
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <div className={`text-sm font-medium ${!dish.activo ? 'text-slate-500' : 'text-slate-900'}`}>{dish.nombre}</div>
                                            {!dish.activo && <span className="text-[10px] text-red-500 font-bold uppercase">Inactivo</span>}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 capitalize">
                                        {dish.categoria}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-700">
                                    ${parseFloat(dish.precio).toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button 
                                        onClick={() => toggleStatus(dish, 'disponible')}
                                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${dish.disponible ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                                    >
                                        {dish.disponible ? <CheckCircle className="w-3.5 h-3.5"/> : <XCircle className="w-3.5 h-3.5"/>}
                                        {dish.disponible ? 'En Stock' : 'Agotado'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button 
                                        onClick={() => toggleStatus(dish, 'activo')}
                                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${dish.activo ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                                    >
                                        {dish.activo ? <Eye className="w-3.5 h-3.5"/> : <EyeOff className="w-3.5 h-3.5"/>}
                                        {dish.activo ? 'Visible' : 'Oculto'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => handleEdit(dish)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"><Edit className="w-4 h-4"/></button>
                                        <button onClick={() => initiateDelete(dish)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4"/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>

      {/* --- MODALES --- */}

      {/* 1. Modal Formulario (Add/Edit) */}
      <AnimatePresence>
        {(showAddModal || showEditModal) && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm" onClick={closeModals}>
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} 
                    className="bg-white w-full max-w-2xl rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-slate-900">{showEditModal ? 'Editar Plato' : 'Nuevo Plato'}</h2>
                        <button onClick={closeModals} className="p-1 rounded-full hover:bg-slate-100 text-slate-500"><X className="w-6 h-6"/></button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nombre</label>
                                <input type="text" required value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Precio ($)</label>
                                <input type="number" required step="0.01" value={formData.precio} onChange={(e) => setFormData({...formData, precio: parseFloat(e.target.value)})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Categoría</label>
                                <select required value={formData.categoria} onChange={(e) => setFormData({...formData, categoria: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                                    {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                </select>
                            </div>
                        </div>
                        <div><label className="block text-xs font-bold text-slate-700 uppercase mb-1">Descripción</label><textarea rows="2" value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"></textarea></div>
                        <div><label className="block text-xs font-bold text-slate-700 uppercase mb-1">Ingredientes</label><textarea rows="2" placeholder="Separados por comas..." value={formData.ingredientes} onChange={(e) => setFormData({...formData, ingredientes: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"></textarea></div>
                        
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Imagen</label>
                            <div className="flex items-start gap-4">
                                <label className="flex-1 cursor-pointer border-2 border-dashed border-slate-300 rounded-xl h-32 flex flex-col items-center justify-center hover:bg-slate-50 transition-colors">
                                    <Upload className="w-6 h-6 text-slate-400 mb-2"/><span className="text-xs text-slate-500">Clic para subir imagen</span><input type="file" className="hidden" accept="image/*" onChange={handleImageChange}/>
                                </label>
                                {imagePreview && (<div className="w-32 h-32 rounded-xl overflow-hidden border border-slate-200 relative group"><img src={imagePreview} alt="Preview" className="w-full h-full object-cover"/><div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><button type="button" onClick={() => { setFormData({...formData, imagen: null}); setImagePreview(null); }} className="text-white p-1 bg-red-500 rounded-full"><Trash2 className="w-4 h-4"/></button></div></div>)}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${formData.disponible ? 'border-green-200 bg-green-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                                <input type="checkbox" checked={formData.disponible} onChange={(e) => setFormData({...formData, disponible: e.target.checked})} className="w-5 h-5 text-green-600 rounded focus:ring-green-500"/>
                                <div><span className="block text-sm font-bold text-slate-900">En Stock</span><span className="text-xs text-slate-500">Disponible hoy</span></div>
                            </label>
                            <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${formData.activo ? 'border-blue-200 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                                <input type="checkbox" checked={formData.activo} onChange={(e) => setFormData({...formData, activo: e.target.checked})} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"/>
                                <div><span className="block text-sm font-bold text-slate-900">Activo</span><span className="text-xs text-slate-500">Visible en menú</span></div>
                            </label>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <button type="button" onClick={closeModals} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Cancelar</button>
                            <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"><Save className="w-4 h-4"/> Guardar</button>
                        </div>
                    </form>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* 2. Modal Borrar */}
      <AnimatePresence>
        {deleteModal.show && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm" onClick={() => setDeleteModal({ show: false, id: null, nombre: '' })}>
                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle className="w-6 h-6 text-red-600"/></div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">¿Eliminar Plato?</h3>
                    <p className="text-slate-500 text-sm mb-6">Vas a eliminar <span className="font-bold">{deleteModal.nombre}</span>. Esta acción no se puede deshacer.</p>
                    <div className="flex gap-3">
                        <button onClick={() => setDeleteModal({ show: false, id: null, nombre: '' })} className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg">Cancelar</button>
                        <button onClick={confirmDelete} className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Eliminar</button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* 3. Modal Alerta */}
      <AnimatePresence>
        {alertModal.show && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm" onClick={() => setAlertModal(prev => ({...prev, show: false}))}>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm relative" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => setAlertModal(prev => ({...prev, show: false}))} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
                    <div className="flex items-start gap-4">
                        {alertModal.type === 'error' ? <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0"><XCircle className="w-6 h-6 text-red-600" /></div> : <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0"><CheckCircle className="w-6 h-6 text-green-600" /></div>}
                        <div><h3 className={`text-lg font-bold ${alertModal.type === 'error' ? 'text-red-700' : 'text-green-700'} mb-1`}>{alertModal.title}</h3><p className="text-slate-600 text-sm leading-relaxed">{alertModal.message}</p></div>
                    </div>
                    <div className="mt-6 flex justify-end"><button onClick={() => setAlertModal(prev => ({...prev, show: false}))} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm font-medium">Entendido</button></div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* Modal Ver Detalles */}
      <AnimatePresence>
        {selectedDish && !showEditModal && !deleteModal.show && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm" onClick={() => setSelectedDish(null)}>
                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-xl p-0 w-full max-w-lg shadow-2xl relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
                     <button onClick={() => setSelectedDish(null)} className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-colors z-10"><X className="w-5 h-5" /></button>
                     <div className="relative h-56 bg-slate-900 flex items-center justify-center">
                        {selectedDish.url_imagen_completa ? (<img src={selectedDish.url_imagen_completa} alt={selectedDish.nombre} className="w-full h-full object-cover opacity-90" />) : (<UtensilsCrossed className="w-16 h-16 text-slate-600" />)}
                        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-6 pt-20">
                            <h3 className="text-2xl font-bold text-white">{selectedDish.nombre}</h3>
                            <p className="text-slate-300 text-sm font-medium capitalize">{categories.find(cat => cat.value === selectedDish.categoria)?.label || selectedDish.categoria}</p>
                        </div>
                     </div>
                     <div className="p-6 space-y-6">
                        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                            <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Precio</p><p className="text-2xl font-bold text-blue-600">${parseFloat(selectedDish.precio).toFixed(2)}</p></div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Estado</p>
                                <div className="flex flex-col gap-1 items-end">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${selectedDish.disponible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{selectedDish.disponible ? <CheckCircle className="w-3.5 h-3.5"/> : <XCircle className="w-3.5 h-3.5"/>} {selectedDish.disponible ? 'En Stock' : 'Agotado'}</span>
                                </div>
                            </div>
                        </div>
                        {selectedDish.descripcion && (<div><p className="text-sm font-bold text-slate-900 mb-2">Descripción</p><p className="text-slate-600 text-sm leading-relaxed">{selectedDish.descripcion}</p></div>)}
                        {selectedDish.lista_ingredientes && selectedDish.lista_ingredientes.length > 0 && (<div><p className="text-sm font-bold text-slate-900 mb-2">Ingredientes</p><div className="flex flex-wrap gap-2">{selectedDish.lista_ingredientes.map((ing, i) => (<span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-full font-medium">{ing}</span>))}</div></div>)}
                     </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RestaurantManager;