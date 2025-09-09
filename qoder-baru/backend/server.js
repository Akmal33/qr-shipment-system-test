const express = require('express');
const cors = require('cors');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const { MenuItem, Order, OrderItem, Table, MENU_CATEGORIES, ORDER_STATUSES } = require('./models');
const { seedMenuItems } = require('./data/seed');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8888;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory database (replace with real database in production)
let menuItems = seedMenuItems();
let orders = [];
let tables = {};

// Initialize tables
const initializeTables = () => {
  for (let i = 1; i <= 20; i++) {
    const tableId = i.toString().padStart(2, '0');
    tables[tableId] = new Table(tableId);
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Barcode Ordering System API is running' });
});

// Table session endpoint for QR code access
app.get('/table/:tableId', (req, res) => {
  const { tableId } = req.params;
  
  if (!tables[tableId]) {
    return res.status(404).json({ error: 'Table not found' });
  }
  
  // Create new session
  const sessionId = tables[tableId].createSession();
  
  res.json({
    table_id: tableId,
    session_id: sessionId,
    message: `Welcome to Table ${tableId}`,
    menu_url: `/api/menu`
  });
});

// Menu API endpoints
app.get('/api/menu', (req, res) => {
  res.json({
    categories: [...new Set(menuItems.map(item => item.category))],
    items: menuItems
  });
});

app.get('/api/menu/categories', (req, res) => {
  const categories = [...new Set(menuItems.map(item => item.category))];
  res.json(categories);
});

app.get('/api/menu/items/:category', (req, res) => {
  const { category } = req.params;
  const categoryItems = menuItems.filter(item => 
    item.category.toLowerCase() === category.toLowerCase() && item.available
  );
  res.json(categoryItems);
});

app.get('/api/menu/item/:id', (req, res) => {
  const { id } = req.params;
  const item = menuItems.find(item => item.id === id);
  
  if (!item) {
    return res.status(404).json({ error: 'Menu item not found' });
  }
  
  res.json(item);
});

// Order API endpoints
app.post('/api/orders', (req, res) => {
  const { table_id, items, order_notes } = req.body;
  
  if (!table_id || !items || items.length === 0) {
    return res.status(400).json({ error: 'Table ID and items are required' });
  }
  
  if (!tables[table_id]) {
    return res.status(404).json({ error: 'Table not found' });
  }
  
  // Calculate total amount
  let total_amount = 0;
  const orderItems = items.map(item => {
    const menuItem = menuItems.find(mi => mi.id === item.item_id);
    if (!menuItem) {
      throw new Error(`Menu item ${item.item_id} not found`);
    }
    
    const subtotal = menuItem.price * item.quantity;
    total_amount += subtotal;
    
    return {
      ...item,
      unit_price: menuItem.price,
      subtotal: subtotal,
      item_name: menuItem.name
    };
  });
  
  const order = {
    id: uuidv4(),
    table_id,
    items: orderItems,
    order_notes: order_notes || '',
    total_amount,
    status: 'confirmed',
    timestamp: new Date().toISOString()
  };
  
  orders.push(order);
  tables[table_id].current_orders.push(order.id);
  
  res.status(201).json(order);
});

app.get('/api/orders/:tableId', (req, res) => {
  const { tableId } = req.params;
  const tableOrders = orders.filter(order => order.table_id === tableId);
  res.json(tableOrders);
});

app.put('/api/orders/:orderId', (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  
  const order = orders.find(o => o.id === orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  order.status = status;
  res.json(order);
});

app.put('/api/orders/:orderId/notes', (req, res) => {
  const { orderId } = req.params;
  const { order_notes, item_notes } = req.body;
  
  const order = orders.find(o => o.id === orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  if (order_notes !== undefined) {
    order.order_notes = order_notes;
  }
  
  if (item_notes && Array.isArray(item_notes)) {
    item_notes.forEach(update => {
      const item = order.items.find(i => i.item_id === update.item_id);
      if (item) {
        item.notes = update.notes;
      }
    });
  }
  
  res.json(order);
});

app.delete('/api/orders/:orderId', (req, res) => {
  const { orderId } = req.params;
  const orderIndex = orders.findIndex(o => o.id === orderId);
  
  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  const order = orders[orderIndex];
  
  // Remove from table's current orders
  if (tables[order.table_id]) {
    tables[order.table_id].current_orders = tables[order.table_id].current_orders
      .filter(id => id !== orderId);
  }
  
  orders.splice(orderIndex, 1);
  res.json({ message: 'Order cancelled successfully' });
});

// Table session endpoints
app.get('/api/tables/:tableId/session', (req, res) => {
  const { tableId } = req.params;
  
  if (!tables[tableId]) {
    return res.status(404).json({ error: 'Table not found' });
  }
  
  res.json(tables[tableId]);
});

app.post('/api/tables/:tableId/session', (req, res) => {
  const { tableId } = req.params;
  
  if (!tables[tableId]) {
    return res.status(404).json({ error: 'Table not found' });
  }
  
  const sessionId = uuidv4();
  tables[tableId].active_session = sessionId;
  tables[tableId].current_orders = [];
  
  res.json({
    table_id: tableId,
    session_id: sessionId,
    message: 'New session created'
  });
});

// QR Code generation endpoints
app.get('/api/qr/table/:tableId', async (req, res) => {
  const { tableId } = req.params;
  const { format = 'png' } = req.query;
  
  if (!tables[tableId]) {
    return res.status(404).json({ error: 'Table not found' });
  }
  
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
    const tableUrl = `${frontendUrl}/table/${tableId}`;
    
    if (format === 'svg') {
      const qrSvg = await QRCode.toString(tableUrl, { type: 'svg' });
      res.setHeader('Content-Type', 'image/svg+xml');
      res.send(qrSvg);
    } else {
      const qrBuffer = await QRCode.toBuffer(tableUrl, {
        errorCorrectionLevel: 'M',
        type: 'png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 300
      });
      res.setHeader('Content-Type', 'image/png');
      res.send(qrBuffer);
    }
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

app.get('/api/qr/tables/all', async (req, res) => {
  const { format = 'json' } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
  
  try {
    const qrData = [];
    
    for (const tableId of Object.keys(tables)) {
      const tableUrl = `${frontendUrl}/table/${tableId}`;
      const qrCodeDataUrl = await QRCode.toDataURL(tableUrl, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 200
      });
      
      qrData.push({
        table_id: tableId,
        table_url: tableUrl,
        qr_code: qrCodeDataUrl,
        print_url: `/api/qr/table/${tableId}?format=png`
      });
    }
    
    if (format === 'html') {
      let html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>QR Codes for All Tables</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .qr-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
            .qr-item { text-align: center; border: 1px solid #ddd; padding: 20px; border-radius: 8px; }
            .qr-item h3 { margin-top: 0; }
            .qr-item img { max-width: 200px; height: auto; }
            .table-url { font-family: monospace; font-size: 12px; word-break: break-all; margin: 10px 0; }
            @media print { .qr-item { page-break-inside: avoid; } }
          </style>
        </head>
        <body>
          <h1>Restaurant Table QR Codes</h1>
          <p>Print this page to create QR code table tents for your restaurant.</p>
          <div class="qr-grid">
      `;
      
      qrData.forEach(item => {
        html += `
          <div class="qr-item">
            <h3>Table ${item.table_id}</h3>
            <img src="${item.qr_code}" alt="QR Code for Table ${item.table_id}" />
            <div class="table-url">${item.table_url}</div>
            <p>Scan to view menu and order</p>
          </div>
        `;
      });
      
      html += `
          </div>
        </body>
        </html>
      `;
      
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } else {
      res.json(qrData);
    }
  } catch (error) {
    console.error('Error generating QR codes:', error);
    res.status(500).json({ error: 'Failed to generate QR codes' });
  }
});

// Initialize app
initializeTables();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app;