import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Table API
export const tableApi = {
  // Access table via QR code URL
  accessTable: async (tableId) => {
    const response = await api.get(`/table/${tableId}`);
    return response.data;
  },
  
  // Get table session
  getTableSession: async (tableId) => {
    const response = await api.get(`/api/tables/${tableId}/session`);
    return response.data;
  },
  
  // Create new table session
  createTableSession: async (tableId) => {
    const response = await api.post(`/api/tables/${tableId}/session`);
    return response.data;
  },
};

// Menu API
export const menuApi = {
  // Get full menu
  getMenu: async () => {
    const response = await api.get('/api/menu');
    return response.data;
  },
  
  // Get menu categories
  getCategories: async () => {
    const response = await api.get('/api/menu/categories');
    return response.data;
  },
  
  // Get items by category
  getItemsByCategory: async (category) => {
    const response = await api.get(`/api/menu/items/${category}`);
    return response.data;
  },
  
  // Get specific item
  getItem: async (itemId) => {
    const response = await api.get(`/api/menu/item/${itemId}`);
    return response.data;
  },
};

// Order API
export const orderApi = {
  // Create new order
  createOrder: async (orderData) => {
    const response = await api.post('/api/orders', orderData);
    return response.data;
  },
  
  // Get orders for table
  getTableOrders: async (tableId) => {
    const response = await api.get(`/api/orders/${tableId}`);
    return response.data;
  },
  
  // Update order status
  updateOrderStatus: async (orderId, status) => {
    const response = await api.put(`/api/orders/${orderId}`, { status });
    return response.data;
  },
  
  // Update order notes
  updateOrderNotes: async (orderId, notesData) => {
    const response = await api.put(`/api/orders/${orderId}/notes`, notesData);
    return response.data;
  },
  
  // Cancel order
  cancelOrder: async (orderId) => {
    const response = await api.delete(`/api/orders/${orderId}`);
    return response.data;
  },
};

export default api;