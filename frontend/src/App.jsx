import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { FoodReservationsProvider } from './context/FoodReservationsContext';
import ErrorBoundary from './components/ErrorBoundary';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import ReservationsPage from './pages/ReservationsPage';
import ReservationPage from './pages/ReservationPage';
import ReservationDetailPage from './pages/ReservationDetailPage';
import RestaurantMenu from './components/RestaurantMenu';
import CheckoutPage from './pages/CheckoutPage';
import AdminLayout from './layouts/AdminLayout';
import ForgotPasswordPage from './pages/ForgotPasswordPage';


// Importar componentes del admin
import AdminDashboard from './pages/admin/AdminDashboard';
import RoomManagement from './pages/admin/RoomManagement';
import RestaurantManager from './pages/admin/RestaurantManager';
import ReservationManagement from './pages/admin/ReservationManagement';
import UserManagement from './pages/admin/UserManagement';
import GestionMesas from './pages/admin/GestionMesas';
import GestionSalones from './pages/admin/GestionSalones';
import ContactPage from './pages/ContactPage';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <FoodReservationsProvider>
          <CartProvider>
            <Router>
              <Routes>
                {/* RUTAS PÚBLICAS CLIENTE */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/mis-reservas" element={<ReservationsPage />} />
                <Route path="/reservar" element={<ReservationPage />} />
                <Route path="/reservar/:habitacionId" element={<ReservationDetailPage />} />
                <Route path="/menu-restaurante" element={<RestaurantMenu />} />
                <Route path="/realizar-pedido" element={<CheckoutPage />} />
                <Route path="/contacto" element={<ContactPage />} />
                

                {/* RUTA LOGIN ADMINISTRADOR */}
                <Route path="/admin-login" element={<LoginPage adminMode={true} />} />

                {/* RUTA PROTEGIDA PANEL ADMINISTRATIVO */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Navigate to="/admin/dashboard" />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="habitaciones" element={<RoomManagement />} />
                  <Route path="restaurante" element={<RestaurantManager />} />
                  <Route path="reservas" element={<ReservationManagement />} />
                  <Route path="usuarios" element={<UserManagement />} />
                  
                  {/* Nuevas rutas de gestión */}
                  <Route path="gestion/mesas" element={<GestionMesas />} />
                  <Route path="gestion/salones" element={<GestionSalones />} />
                </Route>

                {/* 404 - Redirigir a Home */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Router>
          </CartProvider>
        </FoodReservationsProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
