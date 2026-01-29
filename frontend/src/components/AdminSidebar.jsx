import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    BedDouble,
    CalendarCheck,
    Users,
    Settings,
    LogOut,
    UtensilsCrossed,
    Bell,
    Home,
    Crown,
    Menu, // Icono hamburguesa
    X     // Icono cerrar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminSidebar = () => {
    const location = useLocation();
    const { logout, user } = useAuth();
    
    // Estado para controlar el menú en móvil
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const menuItems = [
        { title: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin/dashboard' },
        { title: 'Habitaciones', icon: <BedDouble size={20} />, path: '/admin/habitaciones' },
        { title: 'Restaurante', icon: <UtensilsCrossed size={20} />, path: '/admin/restaurante' },
        { title: 'Reservas', icon: <CalendarCheck size={20} />, path: '/admin/reservas' },
        
        // Separador
        { title: 'GESTIÓN', isSeparator: true },
        
        // Gestión de Mesas y Salones
        { title: 'Gestión Mesas', icon: <UtensilsCrossed size={20} />, path: '/admin/gestion/mesas' },
        { title: 'Gestión Salones', icon: <Crown size={20} />, path: '/admin/gestion/salones' },
        
        { title: 'Usuarios', icon: <Users size={20} />, path: '/admin/usuarios' },
    ];

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    return (
        <>
            {/* --- BOTÓN MENÚ MÓVIL (Solo visible en pantallas pequeñas) --- */}
            <button 
                onClick={toggleMobileMenu}
                className="md:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-lg shadow-lg hover:bg-slate-800 transition-colors"
            >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* --- OVERLAY DE FONDO (Solo móvil) --- */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* --- SIDEBAR --- */}
            <aside 
                className={`
                    fixed md:sticky top-0 left-0 z-50 h-screen w-64 
                    bg-slate-900 text-white flex flex-col shadow-2xl 
                    transition-transform duration-300 ease-in-out
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}
            >
                {/* Header del Sidebar */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                            Hotel Admin
                        </h2>
                        <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-semibold">
                            Panel de Gestión
                        </p>
                    </div>
                    {/* Botón cerrar dentro del sidebar (solo móvil) */}
                    <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Navegación (flex-1 hace que ocupe el espacio disponible y empuje el footer abajo) */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
                    {menuItems.map((item, index) => {
                        if (item.isSeparator) {
                            return (
                                <div key={index} className="py-2 mt-2">
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold px-4">
                                        {item.title}
                                    </p>
                                </div>
                            );
                        }
                        
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)} // Cerrar menú al navegar en móvil
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                {item.icon}
                                <span className="font-medium text-sm">{item.title}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer: Usuario y Logout (Siempre abajo) */}
                <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                    
                    {/* Tarjeta de Usuario */}
                    <div className="flex items-center gap-3 px-2 mb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30 shrink-0">
                            {user?.username?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-slate-200 truncate">{user?.username || 'Administrador'}</p>
                            <p className="text-xs text-slate-500 truncate" title={user?.email}>{user?.email || 'admin@hotel.com'}</p>
                        </div>
                    </div>

                    {/* Botón Cerrar Sesión */}
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-400 bg-red-500/10 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-all text-sm font-medium"
                    >
                        <LogOut size={18} />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;