import api from './axios';

// Obtener todas las reservaciones del usuario autenticado
export const getUserReservations = async () => {
  try {
    const response = await api.get('/api/reservas-habitacion/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener reservaciones:', error);
    throw error;
  }
};

// Obtener detalles de una reservación específica
export const getReservationDetails = async (reservationId) => {
  try {
    const response = await api.get(`/api/reservas-habitacion/${reservationId}/`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener detalles de reservación:', error);
    throw error;
  }
};

// Crear una nueva reservación
// --- AQUÍ ESTABA EL DETALLE ---
// Agregamos { withCredentials: true } explícitamente para forzar el envío de la cookie
export const createReservation = async (reservationData) => {
  try {
    const response = await api.post('/api/reservas-habitacion/', reservationData, {
        withCredentials: true 
    });
    return response.data;
  } catch (error) {
    console.error('Error al crear reservación:', error);
    throw error;
  }
};

// Cancelar una reservación
export const cancelReservation = async (reservationId) => {
  try {
    const response = await api.patch(`/api/reservas-habitacion/${reservationId}/`, {
      estado: 'cancelada'
    });
    return response.data;
  } catch (error) {
    console.error('Error al cancelar reservación:', error);
    throw error;
  }
};

// Modificar una reservación
export const updateReservation = async (reservationId, updateData) => {
  try {
    const response = await api.patch(`/api/reservas-habitacion/${reservationId}/`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error al modificar reservación:', error);
    throw error;
  }
};

// Verificar OTP para confirmar reserva (También blindamos esta por si acaso)
export const verifyReservationOTP = async (reservationId, otpCode) => {
  try {
    const response = await api.post(
        `/api/reservas-habitacion/${reservationId}/verificar_otp/`, 
        { codigo_otp: otpCode },
        { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error('Error verificando OTP:', error);
    throw error;
  }
};

// Reenviar OTP
export const resendReservationOTP = async (reservationId) => {
  try {
    const response = await api.post(
        `/api/reservas-habitacion/${reservationId}/reenviar_otp/`,
        {}, // body vacío
        { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error('Error reenviando OTP:', error);
    throw error;
  }
};