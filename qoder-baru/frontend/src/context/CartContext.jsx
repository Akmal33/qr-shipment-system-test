import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state
const initialState = {
  items: [],
  tableId: null,
  orderNotes: '',
  totalAmount: 0,
};

// Action types
const ActionTypes = {
  SET_TABLE_ID: 'SET_TABLE_ID',
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_ITEM_QUANTITY: 'UPDATE_ITEM_QUANTITY',
  UPDATE_ITEM_NOTES: 'UPDATE_ITEM_NOTES',
  UPDATE_ORDER_NOTES: 'UPDATE_ORDER_NOTES',
  CLEAR_CART: 'CLEAR_CART',
  CALCULATE_TOTAL: 'CALCULATE_TOTAL',
};

// Reducer function
function cartReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_TABLE_ID:
      return {
        ...state,
        tableId: action.payload,
      };
      
    case ActionTypes.ADD_ITEM: {
      const { item, quantity, notes } = action.payload;
      const existingItemIndex = state.items.findIndex(
        cartItem => cartItem.item_id === item.id && cartItem.notes === (notes || '')
      );
      
      let updatedItems;
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        updatedItems = state.items.map((cartItem, index) =>
          index === existingItemIndex
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      } else {
        // Add new item
        const newItem = {
          item_id: item.id,
          item_name: item.name,
          unit_price: item.price,
          quantity,
          notes: notes || '',
          subtotal: item.price * quantity,
        };
        updatedItems = [...state.items, newItem];
      }
      
      return {
        ...state,
        items: updatedItems,
      };
    }
    
    case ActionTypes.REMOVE_ITEM: {
      const { itemId, notes } = action.payload;
      const updatedItems = state.items.filter(
        cartItem => !(cartItem.item_id === itemId && cartItem.notes === (notes || ''))
      );
      
      return {
        ...state,
        items: updatedItems,
      };
    }
    
    case ActionTypes.UPDATE_ITEM_QUANTITY: {
      const { itemId, notes, quantity } = action.payload;
      
      if (quantity <= 0) {
        return cartReducer(state, {
          type: ActionTypes.REMOVE_ITEM,
          payload: { itemId, notes },
        });
      }
      
      const updatedItems = state.items.map(cartItem =>
        cartItem.item_id === itemId && cartItem.notes === (notes || '')
          ? { 
              ...cartItem, 
              quantity,
              subtotal: cartItem.unit_price * quantity 
            }
          : cartItem
      );
      
      return {
        ...state,
        items: updatedItems,
      };
    }
    
    case ActionTypes.UPDATE_ITEM_NOTES: {
      const { itemId, oldNotes, newNotes } = action.payload;
      const updatedItems = state.items.map(cartItem =>
        cartItem.item_id === itemId && cartItem.notes === (oldNotes || '')
          ? { ...cartItem, notes: newNotes || '' }
          : cartItem
      );
      
      return {
        ...state,
        items: updatedItems,
      };
    }
    
    case ActionTypes.UPDATE_ORDER_NOTES:
      return {
        ...state,
        orderNotes: action.payload,
      };
      
    case ActionTypes.CLEAR_CART:
      return {
        ...initialState,
        tableId: state.tableId, // Keep table ID when clearing cart
      };
      
    case ActionTypes.CALCULATE_TOTAL: {
      const totalAmount = state.items.reduce(
        (total, item) => total + item.subtotal,
        0
      );
      
      return {
        ...state,
        totalAmount,
      };
    }
    
    default:
      return state;
  }
}

// Create context
const CartContext = createContext();

// Cart provider component
export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  
  // Calculate total whenever items change
  useEffect(() => {
    dispatch({ type: ActionTypes.CALCULATE_TOTAL });
  }, [state.items]);
  
  // Actions
  const actions = {
    setTableId: (tableId) => {
      dispatch({ type: ActionTypes.SET_TABLE_ID, payload: tableId });
    },
    
    addItem: (item, quantity = 1, notes = '') => {
      dispatch({
        type: ActionTypes.ADD_ITEM,
        payload: { item, quantity, notes },
      });
    },
    
    removeItem: (itemId, notes = '') => {
      dispatch({
        type: ActionTypes.REMOVE_ITEM,
        payload: { itemId, notes },
      });
    },
    
    updateItemQuantity: (itemId, quantity, notes = '') => {
      dispatch({
        type: ActionTypes.UPDATE_ITEM_QUANTITY,
        payload: { itemId, notes, quantity },
      });
    },
    
    updateItemNotes: (itemId, oldNotes, newNotes) => {
      dispatch({
        type: ActionTypes.UPDATE_ITEM_NOTES,
        payload: { itemId, oldNotes, newNotes },
      });
    },
    
    updateOrderNotes: (notes) => {
      dispatch({ type: ActionTypes.UPDATE_ORDER_NOTES, payload: notes });
    },
    
    clearCart: () => {
      dispatch({ type: ActionTypes.CLEAR_CART });
    },
  };
  
  const value = {
    ...state,
    ...actions,
  };
  
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// Hook to use cart context
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default CartProvider;