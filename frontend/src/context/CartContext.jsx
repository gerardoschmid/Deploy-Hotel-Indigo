import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Contexto del carrito de compras
const CartContext = createContext();

// Acciones del reducer
const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  LOAD_CART: 'LOAD_CART',
};

// Estado inicial
const initialState = {
  items: [],
  total: 0,
  itemCount: 0,
  restaurantId: 1, // ID del restaurante por defecto
};

// Reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM: {
      const { dish, quantity = 1 } = action.payload;
      const existingItem = state.items.find(item => item.id === dish.id);
      
      let newItems;
      if (existingItem) {
        newItems = state.items.map(item =>
          item.id === dish.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newItems = [...state.items, { ...dish, quantity }];
      }

      const newTotal = newItems.reduce((sum, item) => 
        sum + (parseFloat(item.precio || 0) * item.quantity), 0
      );
      const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        ...state,
        items: newItems,
        total: newTotal,
        itemCount: newItemCount,
      };
    }

    case CART_ACTIONS.REMOVE_ITEM: {
      const newItems = state.items.filter(item => item.id !== action.payload);
      const newTotal = newItems.reduce((sum, item) => 
        sum + (parseFloat(item.precio || 0) * item.quantity), 0
      );
      const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        ...state,
        items: newItems,
        total: newTotal,
        itemCount: newItemCount,
      };
    }

    case CART_ACTIONS.UPDATE_QUANTITY: {
      const { itemId, quantity } = action.payload;
      if (quantity <= 0) {
        return cartReducer(state, { type: CART_ACTIONS.REMOVE_ITEM, payload: itemId });
      }

      const newItems = state.items.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      );
      const newTotal = newItems.reduce((sum, item) => 
        sum + (parseFloat(item.precio || 0) * item.quantity), 0
      );
      const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        ...state,
        items: newItems,
        total: newTotal,
        itemCount: newItemCount,
      };
    }

    case CART_ACTIONS.CLEAR_CART:
      return {
        ...state,
        items: [],
        total: 0,
        itemCount: 0,
      };

    case CART_ACTIONS.LOAD_CART: {
      const { items, total, itemCount } = action.payload;
      return {
        ...state,
        items: items || [],
        total: total || 0,
        itemCount: itemCount || 0,
      };
    }

    default:
      return state;
  }
};

// Provider del contexto
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Cargar carrito desde localStorage al montar
  useEffect(() => {
    const savedCart = localStorage.getItem('restaurantCart');
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        dispatch({
          type: CART_ACTIONS.LOAD_CART,
          payload: cartData,
        });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('restaurantCart', JSON.stringify({
      items: state.items,
      total: state.total,
      itemCount: state.itemCount,
    }));
  }, [state.items, state.total, state.itemCount]);

  // Acciones
  const addToCart = (dish, quantity = 1) => {
    dispatch({
      type: CART_ACTIONS.ADD_ITEM,
      payload: { dish, quantity },
    });
  };

  const removeFromCart = (dishId) => {
    dispatch({
      type: CART_ACTIONS.REMOVE_ITEM,
      payload: dishId,
    });
  };

  const updateQuantity = (dishId, quantity) => {
    dispatch({
      type: CART_ACTIONS.UPDATE_QUANTITY,
      payload: { itemId: dishId, quantity },
    });
  };

  const clearCart = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
  };

  const value = {
    ...state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isEmpty: state.items.length === 0,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Hook para usar el contexto
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
