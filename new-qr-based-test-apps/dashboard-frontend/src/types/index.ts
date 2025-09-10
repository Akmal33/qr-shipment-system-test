// Data types for the warehouse management system

export interface Item {
  id: string;
  itemId: string;
  name: string;
  category: string;
  barcode: string;
  costPrice: number;
  sellingPrice: number;
  profitMargin: number;
  stockLevel: number;
  warehouseLocation: string;
  status: 'active' | 'inactive' | 'discontinued';
  createdAt: string;
  updatedAt: string;
}

export interface Shipment {
  id: string;
  shipmentId: string;
  items: string[];
  destination: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'delayed' | 'cancelled';
  estimatedDelivery?: string;
  actualDelivery?: string;
  remainingTime: string;
  trackingNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  userId: string;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'warehouse_operator' | 'scanner_user';
  accessLevel: string;
  barcode: string;
  isActive: boolean;
  lastScan?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScanLog {
  id: string;
  scanId: string;
  userId: string;
  itemId: string;
  scanType: 'item_validation' | 'user_validation';
  result: 'success' | 'failure';
  location: string;
  deviceId: string;
  timestamp: string;
  errorMsg?: string;
}

export interface BarcodeRequest {
  itemId: string;
  type: 'item' | 'user' | 'shipment';
  format: 'CODE128' | 'CODE39' | 'QR';
  width?: number;
  height?: number;
}

export interface BarcodeResponse {
  barcodeId: string;
  itemId: string;
  barcodeData: string;
  imageUrl: string;
  format: string;
  createdAt: string;
}

export interface ProfitAnalytics {
  totalProfit: number;
  averageMargin: number;
  topPerformers: string[];
  lowPerformers: string[];
  trendDirection: 'up' | 'down' | 'stable';
}

export interface ShipmentPerformance {
  totalShipments: number;
  deliveredOnTime: number;
  delayed: number;
  averageDeliveryTime: string;
  successRate: string;
}

export interface InventoryTurnover {
  totalItems: number;
  fastMoving: number;
  slowMoving: number;
  averageTurnover: number;
  categories: { [key: string]: number };
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ApiResponse<T> {
  data: T;
  total?: number;
  page?: number;
  pageSize?: number;
}

export interface DashboardStats {
  totalItems: number;
  totalShipments: number;
  activeShipments: number;
  totalProfit: number;
  averageMargin: number;
  recentActivity: {
    type: string;
    description: string;
    timestamp: string;
  }[];
}