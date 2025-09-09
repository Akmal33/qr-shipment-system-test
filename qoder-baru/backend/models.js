// Data models for the ordering system

class MenuItem {
  constructor(id, name, category, price, description, available = true, image_url = null) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.price = price;
    this.description = description;
    this.available = available;
    this.image_url = image_url;
  }
  
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      category: this.category,
      price: this.price,
      description: this.description,
      available: this.available,
      image_url: this.image_url
    };
  }
}

class OrderItem {
  constructor(item_id, quantity, unit_price, notes = '') {
    this.item_id = item_id;
    this.quantity = quantity;
    this.unit_price = unit_price;
    this.subtotal = unit_price * quantity;
    this.notes = notes;
  }
  
  updateQuantity(newQuantity) {
    this.quantity = newQuantity;
    this.subtotal = this.unit_price * newQuantity;
  }
  
  toJSON() {
    return {
      item_id: this.item_id,
      quantity: this.quantity,
      unit_price: this.unit_price,
      subtotal: this.subtotal,
      notes: this.notes
    };
  }
}

class Order {
  constructor(table_id, items = [], order_notes = '') {
    this.id = this.generateId();
    this.table_id = table_id;
    this.items = items;
    this.order_notes = order_notes;
    this.total_amount = this.calculateTotal();
    this.status = 'pending'; // pending, confirmed, preparing, ready, completed, cancelled
    this.timestamp = new Date().toISOString();
  }
  
  generateId() {
    return 'order_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  
  calculateTotal() {
    return this.items.reduce((total, item) => total + item.subtotal, 0);
  }
  
  addItem(orderItem) {
    const existingItemIndex = this.items.findIndex(item => 
      item.item_id === orderItem.item_id && item.notes === orderItem.notes
    );
    
    if (existingItemIndex >= 0) {
      this.items[existingItemIndex].updateQuantity(
        this.items[existingItemIndex].quantity + orderItem.quantity
      );
    } else {
      this.items.push(orderItem);
    }
    
    this.total_amount = this.calculateTotal();
  }
  
  removeItem(item_id, notes = '') {
    this.items = this.items.filter(item => 
      !(item.item_id === item_id && item.notes === notes)
    );
    this.total_amount = this.calculateTotal();
  }
  
  updateItemQuantity(item_id, newQuantity, notes = '') {
    const item = this.items.find(item => 
      item.item_id === item_id && item.notes === notes
    );
    
    if (item) {
      if (newQuantity <= 0) {
        this.removeItem(item_id, notes);
      } else {
        item.updateQuantity(newQuantity);
        this.total_amount = this.calculateTotal();
      }
    }
  }
  
  updateStatus(newStatus) {
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];
    if (validStatuses.includes(newStatus)) {
      this.status = newStatus;
    }
  }
  
  toJSON() {
    return {
      id: this.id,
      table_id: this.table_id,
      items: this.items.map(item => item.toJSON()),
      order_notes: this.order_notes,
      total_amount: this.total_amount,
      status: this.status,
      timestamp: this.timestamp
    };
  }
}

class Table {
  constructor(id) {
    this.id = id;
    this.active_session = null;
    this.current_orders = [];
    this.qr_code_url = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/table/${id}`;
  }
  
  createSession() {
    this.active_session = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    this.current_orders = [];
    return this.active_session;
  }
  
  addOrder(orderId) {
    if (!this.current_orders.includes(orderId)) {
      this.current_orders.push(orderId);
    }
  }
  
  removeOrder(orderId) {
    this.current_orders = this.current_orders.filter(id => id !== orderId);
  }
  
  toJSON() {
    return {
      id: this.id,
      active_session: this.active_session,
      current_orders: this.current_orders,
      qr_code_url: this.qr_code_url
    };
  }
}

// Menu categories
const MENU_CATEGORIES = {
  MAIN_COURSE: 'main_course',
  HOT_BEVERAGES: 'hot_beverages',
  COLD_BEVERAGES: 'cold_beverages',
  APPETIZERS: 'appetizers',
  DESSERTS: 'desserts'
};

// Order statuses
const ORDER_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

module.exports = {
  MenuItem,
  OrderItem,
  Order,
  Table,
  MENU_CATEGORIES,
  ORDER_STATUSES
};