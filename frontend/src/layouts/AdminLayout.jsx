import { Outlet, Navigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { User } from 'lucide-react'; // Se eliminó 'Bell' de los imports
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
    const { user, loading } = useAuth();

    // Si está cargando, mostrar spinner
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Cargando panel administrativo...</p>
                </div>
            </div>
        );
    }

    // Validar si hay usuario
    // CAMBIO AQUÍ: Si no hay usuario (cerró sesión), mandar al INDEX ('/')
    if (!user) {
        console.log('AdminLayout: No hay usuario, redirigiendo al inicio');
        return <Navigate to="/" replace />; 
    }

    // Validar rol de administrador (ADMINISTRADOR, admin o is_staff)
    const esAdmin = 
        user.is_staff === true || 
        user.rol === 'ADMINISTRADOR' || 
        user.rol === 'admin';

    if (!esAdmin) {
        console.log('AdminLayout: Acceso denegado a:', user);
        // CAMBIO OPCIONAL: Si intenta entrar un cliente normal, también lo mandamos al index
        return <Navigate to="/" replace />; 
    }

    return (
        <div className="flex min-h-screen bg-slate-50">
            <AdminSidebar />

            <main className="flex-1 overflow-y-auto">
                {/* Header del Top */}
                <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-end px-8 sticky top-0 z-10">
                    
                    {/* Área de Usuario (Se eliminó la campana y el separador) */}
                    <div className="flex items-center gap-4">
                        
                        <div className="flex items-center gap-2">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-slate-700">
                                    {user.first_name ? `${user.first_name} ${user.last_name}` : user.username}
                                </p>
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                                    Administrador
                                </p>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold border border-blue-200 shadow-sm">
                                {user.first_name?.[0]?.toUpperCase() || <User size={18} />}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Contenido de la página */}
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;