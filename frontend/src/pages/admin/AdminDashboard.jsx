import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, BedDouble, TrendingUp, DollarSign, Loader2 } from 'lucide-react';
import api from '../../api/axios';

const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [statsData, setStatsData] = useState({
        usuarios: 0,
        reservasActivas: 0,
        habitacionesOcupadas: 0,
        totalHabitaciones: 20, // Valor inicial por defecto para evitar NaN en divisiones
        ingresos: 0,
        ocupacionSemanal: [0, 0, 0, 0, 0, 0, 0] // Lun-Dom
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            
            // --- CAMBIO CLAVE: Solicitamos todo a la nueva ruta optimizada ---
            const response = await api.get('/api/usuarios/dashboard-stats/');
            const data = response.data;

            setStatsData({
                usuarios: data.usuarios || 0,
                reservasActivas: data.reservasActivas || 0,
                habitacionesOcupadas: data.habitacionesOcupadas || 0,
                totalHabitaciones: data.totalHabitaciones || 20,
                ingresos: data.ingresos || 0,
                ocupacionSemanal: data.ocupacionSemanal || [0, 0, 0, 0, 0, 0, 0]
            });

        } catch (error) {
            console.error("Error cargando dashboard:", error);
            // No reiniciamos a cero para evitar parpadeos feos si ya había datos caché
        } finally {
            setLoading(false);
        }
    };

    // --- DATOS VISUALES PARA LAS TARJETAS ---
    const statsCards = [
        { 
            title: 'Usuarios Totales', 
            value: statsData.usuarios.toString(), 
            icon: <Users className="text-blue-600" />, 
            trend: 'Registrados', 
            color: 'bg-blue-50' 
        },
        { 
            title: 'Reservas Activas', 
            value: statsData.reservasActivas.toString(), 
            icon: <Calendar className="text-purple-600" />, 
            trend: 'En curso', 
            color: 'bg-purple-50' 
        },
        { 
            title: 'Ocupación Hoy', 
            value: `${statsData.habitacionesOcupadas}/${statsData.totalHabitaciones}`, 
            icon: <BedDouble className="text-emerald-600" />, 
            trend: 'Habitaciones', 
            color: 'bg-emerald-50' 
        },
        { 
            title: 'Ingresos Totales', 
            value: `$${parseFloat(statsData.ingresos).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})}`, 
            icon: <DollarSign className="text-amber-600" />, 
            trend: 'Acumulado', 
            color: 'bg-amber-50' 
        },
    ];

    // Cálculo porcentaje ocupación para el círculo
    const porcentajeOcupacion = statsData.totalHabitaciones > 0 
        ? Math.round((statsData.habitacionesOcupadas / statsData.totalHabitaciones) * 100) 
        : 0;

    // Configuración del círculo SVG
    const radius = 58;
    const circumference = 2 * Math.PI * radius; 
    const strokeDashoffset = circumference - (porcentajeOcupacion / 100) * circumference;

    // Calcular altura máxima para el gráfico para normalizar barras visualmente
    const maxReservasDia = Math.max(...statsData.ocupacionSemanal, 5); // Mínimo 5 de tope visual

    if (loading) {
        return <div className="flex h-96 justify-center items-center"><Loader2 className="w-10 h-10 animate-spin text-blue-600"/></div>;
    }

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 border-none outline-none">Panel de Resumen</h1>
                <p className="text-slate-500 mt-1">Bienvenido de nuevo, resumen en tiempo real del hotel.</p>
            </div>

            {/* Tarjetas de Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsCards.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
                    >
                        <div className="flex justify-between items-start">
                            <div className={`p-3 rounded-2xl ${stat.color}`}>
                                {stat.icon}
                            </div>
                            <span className="flex items-center text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-lg">
                                {stat.trend}
                            </span>
                        </div>
                        <div className="mt-4">
                            <p className="text-slate-500 text-sm font-medium">{stat.title}</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Gráfico y Estado */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Gráfico de Barras */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[350px]">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 font-primary">Actividad Semanal</h3>
                        <p className="text-sm text-slate-400 mb-6">Reservas de habitaciones, mesas y eventos (Lun - Dom)</p>
                    </div>
                    
                    <div className="h-48 flex items-end justify-between gap-3 sm:gap-6 px-2">
                        {statsData.ocupacionSemanal.map((cantidad, i) => {
                            // Altura relativa al máximo valor encontrado
                            const heightPercentage = (cantidad / maxReservasDia) * 100;
                            // Aseguramos un mínimo de altura visual para que no desaparezca si es 0 (pero se vea bajito)
                            const visualHeight = cantidad === 0 ? 2 : Math.max(heightPercentage, 5); 

                            return (
                                <motion.div
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${visualHeight}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className="w-full bg-blue-50 rounded-t-xl relative group flex flex-col justify-end items-center"
                                >
                                    {/* Tooltip con número al hacer hover */}
                                    <div className="mb-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-blue-600 absolute -top-6">
                                        {cantidad}
                                    </div>
                                    <div 
                                        className="w-full bg-blue-600 rounded-t-xl transition-all duration-300 group-hover:bg-blue-500"
                                        style={{ height: '100%' }} 
                                    ></div>
                                </motion.div>
                            );
                        })}
                    </div>
                    <div className="flex justify-between mt-4 text-xs text-slate-400 font-medium px-2 text-center uppercase tracking-wider">
                        <span className="w-full">Lun</span>
                        <span className="w-full">Mar</span>
                        <span className="w-full">Mié</span>
                        <span className="w-full">Jue</span>
                        <span className="w-full">Vie</span>
                        <span className="w-full">Sáb</span>
                        <span className="w-full">Dom</span>
                    </div>
                </div>

                {/* Tarjeta Estado Circular (Ocupación) */}
                <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl flex flex-col justify-between min-h-[350px]">
                    <div>
                        <h3 className="text-lg font-bold">Ocupación Hoy</h3>
                        <p className="text-slate-400 text-sm mt-2">Habitaciones ocupadas vs Total.</p>
                    </div>
                    <div className="py-8 text-center flex justify-center">
                        <div className="inline-block relative">
                            {/* SVG Circular Progress */}
                            <svg className="w-40 h-40 transform -rotate-90">
                                {/* Círculo Fondo */}
                                <circle 
                                    cx="80" cy="80" r={radius} 
                                    stroke="currentColor" 
                                    strokeWidth="10" 
                                    fill="transparent" 
                                    className="text-slate-800" 
                                />
                                {/* Círculo Progreso */}
                                <motion.circle 
                                    initial={{ strokeDashoffset: circumference }}
                                    animate={{ strokeDashoffset: strokeDashoffset }}
                                    transition={{ duration: 1.5, ease: "easeInOut" }}
                                    cx="80" cy="80" r={radius} 
                                    stroke="currentColor" 
                                    strokeWidth="10" 
                                    fill="transparent" 
                                    strokeDasharray={circumference} 
                                    strokeLinecap="round"
                                    className={`${porcentajeOcupacion > 80 ? 'text-red-500' : porcentajeOcupacion > 50 ? 'text-amber-500' : 'text-blue-500'}`} 
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <motion.span 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-3xl font-bold"
                                >
                                    {porcentajeOcupacion}%
                                </motion.span>
                                <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">
                                    {porcentajeOcupacion >= 100 ? 'LLENO' : 'DISPONIBLE'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-slate-400 mb-4">
                            {statsData.totalHabitaciones - statsData.habitacionesOcupadas} habitaciones disponibles.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;