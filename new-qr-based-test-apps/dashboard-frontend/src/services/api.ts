import axios from 'axios';
import { 
  Item, 
  Shipment, 
  BarcodeRequest, 
  BarcodeResponse, 
  ProfitAnalytics, 
  ShipmentPerformance, 
  InventoryTurnover,
  PaginationParams,
  ApiResponse,
  DashboardStats
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001';
const BARCODE_SERVICE_URL = process.env.REACT_APP_BARCODE_SERVICE_URL || 'http://localhost:8002';

// Create axios instances
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

const barcodeClient = axios.create({
  baseURL: BARCODE_SERVICE_URL,
  timeout: 10000,
});

// Request interceptor for auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Dashboard API
export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get('/api/v1/dashboard/stats');
    return response.data;
  },
};

// Inventory API
export const inventoryApi = {
  getItems: async (params: PaginationParams): Promise<ApiResponse<Item[]>> => {
    const response = await apiClient.get('/api/v1/inventory/items', { params });
    return response.data;
  },

  createItem: async (item: Partial<Item>): Promise<Item> => {
    const response = await apiClient.post('/api/v1/inventory/items', item);
    return response.data;
  },

  updateItem: async (id: string, item: Partial<Item>): Promise<Item> => {
    const response = await apiClient.put(`/api/v1/inventory/items/${id}`, item);
    return response.data;
  },

  deleteItem: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/inventory/items/${id}`);
  },

  getItemById: async (id: string): Promise<Item> => {
    const response = await apiClient.get(`/api/v1/inventory/items/${id}`);
    return response.data;
  },
};

// Shipments API
export const shipmentsApi = {
  getShipments: async (params: PaginationParams): Promise<ApiResponse<Shipment[]>> => {
    const response = await apiClient.get('/api/v1/shipments', { params });
    return response.data;
  },

  getShipmentStatus: async (id: string): Promise<Shipment> => {
    const response = await apiClient.get(`/api/v1/shipments/${id}/status`);
    return response.data;
  },

  updateShipmentStatus: async (id: string, status: string): Promise<Shipment> => {
    const response = await apiClient.put(`/api/v1/shipments/${id}/status`, { status });
    return response.data;
  },

  createShipment: async (shipment: Partial<Shipment>): Promise<Shipment> => {
    const response = await apiClient.post('/api/v1/shipments', shipment);
    return response.data;
  },
};

// Analytics API
export const analyticsApi = {
  getProfitMargins: async (): Promise<ProfitAnalytics> => {
    const response = await apiClient.get('/api/v1/analytics/profit-margins');
    return response.data;
  },

  getShipmentPerformance: async (): Promise<ShipmentPerformance> => {
    const response = await apiClient.get('/api/v1/analytics/shipment-performance');
    return response.data;
  },

  getInventoryTurnover: async (): Promise<InventoryTurnover> => {
    const response = await apiClient.get('/api/v1/analytics/inventory-turnover');
    return response.data;
  },
};

// Barcode API
export const barcodeApi = {
  generateBarcode: async (request: BarcodeRequest): Promise<BarcodeResponse> => {
    const response = await barcodeClient.post('/api/v1/barcode/generate', request);
    return response.data;
  },

  getBarcodeInfo: async (id: string): Promise<BarcodeResponse> => {
    const response = await barcodeClient.get(`/api/v1/barcode/${id}`);
    return response.data;
  },
};

// Health check
export const healthApi = {
  checkDashboardApi: async (): Promise<boolean> => {
    try {
      await apiClient.get('/health');
      return true;
    } catch {
      return false;
    }
  },

  checkBarcodeService: async (): Promise<boolean> => {
    try {
      await barcodeClient.get('/health');
      return true;
    } catch {
      return false;
    }
  },
};