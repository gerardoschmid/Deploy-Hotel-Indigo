import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Contexto para reservas de comida
const FoodReservationsContext = createContext();

// Acciones del reducer
const FOOD_RESERVATIONS_ACTIONS = {
  ADD_RESERVATION: 'ADD_RESERVATION',
  REMOVE_RESERVATION: 'REMOVE_RESERVATION',
  UPDATE_RESERVATION: 'UPDATE_RESERVATION',
  LOAD_RESERVATIONS: 'LOAD_RESERVATIONS',
  CLEAR_RESERVATIONS: 'CLEAR_RESERVATIONS',
};

// Estado inicial
const initialState = {
  reservations: [],
  loading: false,
  error: null,
};

// Reducer
const foodReservationsReducer = (state, action) => {
  switch (action.type) {
    case FOOD_RESERVATIONS_ACTIONS.ADD_RESERVATION: {
      const newReservation = {
        id: Date.now(), // ID temporal hasta que se guarde en backend
        ...action.payload,
        estado: 'pendiente',
        fecha_reserva: new Date().toISOString(),
        hora_reserva: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      };
      
      return {
        ...state,
        reservations: [...state.reservations, newReservation],
      };
    }

    case FOOD_RESERVATIONS_ACTIONS.REMOVE_RESERVATION: {
      return {
        ...state,
        reservations: state.reservations.filter(res => res.id !== action.payload),
      };
    }

    case FOOD_RESERVATIONS_ACTIONS.UPDATE_RESERVATION: {
      return {
        ...state,
        reservations: state.reservations.map(res =>
          res.id === action.payload.id
            ? { ...res, ...action.payload.data }
            : res
        ),
      };
    }

    case FOOD_RESERVATIONS_ACTIONS.LOAD_RESERVATIONS: {
      return {
        ...state,
        reservations: action.payload || [],
        loading: false,
      };
    }

    case FOOD_RESERVATIONS_ACTIONS.CLEAR_RESERVATIONS: {
      return {
        ...state,
        reservations: [],
      };
    }

    default:
      return state;
  }
};

// Provider del contexto
export const FoodReservationsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(foodReservationsReducer, initialState);

  // Cargar reservas desde localStorage al montar
  useEffect(() => {
    const savedReservations = localStorage.getItem('foodReservations');
    if (savedReservations) {
      try {
        const reservationsData = JSON.parse(savedReservations);
        dispatch({
          type: FOOD_RESERVATIONS_ACTIONS.LOAD_RESERVATIONS,
          payload: reservationsData,
        });
      } catch (error) {
        console.error('Error loading food reservations from localStorage:', error);
      }
    }
  }, []);

  // Guardar reservas en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('foodReservations', JSON.stringify(state.reservations));
  }, [state.reservations]);

  // Acciones
  const addFoodReservation = (dish, reservationData = {}) => {
    const reservation = {
      plato_id: dish.id,
      plato_nombre: dish.nombre,
      plato_precio: dish.precio,
      plato_categoria: dish.categoria_display,
      plato_imagen: dish.url_imagen_completa,
      ...reservationData,
    };

    dispatch({
      type: FOOD_RESERVATIONS_ACTIONS.ADD_RESERVATION,
      payload: reservation,
    });

    return reservation;
  };

  const removeFoodReservation = (reservationId) => {
    dispatch({
      type: FOOD_RESERVATIONS_ACTIONS.REMOVE_RESERVATION,
      payload: reservationId,
    });
  };

  const updateFoodReservation = (reservationId, data) => {
    dispatch({
      type: FOOD_RESERVATIONS_ACTIONS.UPDATE_RESERVATION,
      payload: { id: reservationId, data },
    });
  };

  const confirmReservation = (reservationId) => {
    updateFoodReservation(reservationId, { estado: 'confirmada' });
  };

  const cancelReservation = (reservationId) => {
    updateFoodReservation(reservationId, { estado: 'cancelada' });
  };

  const clearAllReservations = () => {
    dispatch({ type: FOOD_RESERVATIONS_ACTIONS.CLEAR_RESERVATIONS });
  };

  const value = {
    ...state,
    addFoodReservation,
    removeFoodReservation,
    updateFoodReservation,
    confirmReservation,
    cancelReservation,
    clearAllReservations,
    hasReservations: state.reservations.length > 0,
    pendingReservations: state.reservations.filter(res => res.estado === 'pendiente'),
    confirmedReservations: state.reservations.filter(res => res.estado === 'confirmada'),
  };

  return <FoodReservationsContext.Provider value={value}>{children}</FoodReservationsContext.Provider>;
};

// Hook para usar el contexto
export const useFoodReservations = () => {
  const context = useContext(FoodReservationsContext);
  if (!context) {
    throw new Error('useFoodReservations must be used within a FoodReservationsProvider');
  }
  return context;
};

export default FoodReservationsContext;
