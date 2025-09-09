# Barcode Ordering System 🍽️📱

A QR code-based food and beverage ordering system where each table has a unique QR code that directly links to a web-based menu interface. Customers scan the code with their mobile devices to instantly access the restaurant's digital menu and place orders without downloading any apps.

## ✨ Features

### 🔗 QR Code Direct Access
- **URL-Based QR Codes**: Each table QR contains direct web link
- **Instant Browser Opening**: No app installation required
- **Table Auto-Detection**: URL automatically identifies table
- **Universal Compatibility**: Works with any QR scanner or camera app

### 📱 Digital Menu Display
- **Category Organization**: Separate sections for food and beverages
- **Item Information**: Name, description, price, and images
- **Real-time Updates**: Dynamic menu availability
- **Search Functionality**: Quick item discovery
- **Mobile-Responsive**: Optimized for smartphones and tablets

### 🛒 Smart Order Management
- **Shopping Cart**: Persistent cart across sessions
- **Quantity Control**: Increment/decrement item quantities
- **Order Notes**: Add special instructions for each item or entire order
- **Order Modification**: Edit orders and notes before confirmation
- **Multi-item Orders**: Support for combination orders

### 📝 Notes & Special Instructions
- **Item-Level Notes**: Custom instructions for individual menu items
  - Cooking preferences (spicy level, cooking style)
  - Ingredient modifications (no onions, extra sauce)
  - Dietary restrictions (vegetarian, halal, allergies)
- **Order-Level Notes**: General instructions for the entire order
  - Delivery timing requests
  - Special occasions or celebrations
  - Customer preferences or urgent requests

### 🏪 Table Association
- **Table Identification**: Link orders to specific tables
- **Session Management**: Maintain table sessions
- **Order History**: Track orders per table

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React with Vite, Mobile-responsive PWA
- **Backend**: Node.js with Express.js
- **Database**: In-memory (easily replaceable with PostgreSQL/MongoDB)
- **QR Code Generation**: Built-in QR code creation system
- **Real-time**: RESTful API architecture

### Project Structure
```
barcode-ordering-system/
├── backend/                 # Node.js Express API
│   ├── server.js           # Main server file
│   ├── models.js           # Data models
│   ├── data/
│   │   └── seed.js         # Initial menu data
│   └── package.json        # Backend dependencies
├── frontend/               # React PWA
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # State management
│   │   ├── services/       # API integration
│   │   └── utils/          # Helper functions
│   └── package.json        # Frontend dependencies
├── docs/                   # Documentation
└── package.json            # Root package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone and setup the project:**
```bash
cd barcode-ordering-system
npm run install:all
```

2. **Start the development servers:**
```bash
# Start both frontend and backend
npm run dev

# Or start individually:
npm run dev:backend  # Backend on http://localhost:3001
npm run dev:frontend # Frontend on http://localhost:5173
```

3. **Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

### QR Code Access

1. **Generate QR codes for tables:**
   - View all QR codes: http://localhost:3001/api/qr/tables/all?format=html
   - Individual table QR: http://localhost:3001/api/qr/table/05

2. **Test table access:**
   - Direct URL: http://localhost:5173/table/05
   - This simulates scanning a QR code for Table 05

## 📋 Usage Guide

### For Customers

1. **Scan QR Code**: Use phone camera to scan the table's QR code
2. **Access Menu**: Browser opens automatically to the digital menu
3. **Browse Items**: Navigate through food and beverage categories
4. **Add to Cart**: Select items, adjust quantities, add special notes
5. **Review Order**: Check cart, add overall order notes
6. **Submit**: Place order - it's sent directly to the kitchen

### For Restaurant Staff

1. **Print QR Codes**: Access http://localhost:3001/api/qr/tables/all?format=html
2. **Place QR Codes**: Print and place QR codes on each table
3. **Monitor Orders**: Orders appear in the system with table information
4. **Process Orders**: View item details, special instructions, and notes

## 🔧 API Endpoints

### Table Management
```
GET  /table/:tableId              # QR code entry point
GET  /api/tables/:tableId/session # Get table session
POST /api/tables/:tableId/session # Create new session
```

### Menu Management
```
GET /api/menu                     # Get full menu
GET /api/menu/categories          # Get categories
GET /api/menu/items/:category     # Get items by category
GET /api/menu/item/:id            # Get specific item
```

### Order Management
```
POST   /api/orders               # Create new order
GET    /api/orders/:tableId      # Get orders for table
PUT    /api/orders/:orderId      # Update order status
PUT    /api/orders/:orderId/notes # Update order notes
DELETE /api/orders/:orderId      # Cancel order
```

### QR Code Generation
```
GET /api/qr/table/:tableId        # Generate QR for specific table
GET /api/qr/tables/all            # Get all table QR codes
GET /api/qr/tables/all?format=html # Printable QR codes page
```

## 🍽️ Default Menu Items

The system comes with sample Indonesian restaurant items:

### Main Courses
- **Nasi Goreng** - Indonesian-style fried rice (Rp 25,000)
- **Mie Goreng** - Stir-fried noodles (Rp 22,000)
- **Ayam Goreng** - Indonesian fried chicken (Rp 30,000)
- **Gado-Gado** - Indonesian salad with peanut sauce (Rp 20,000)

### Beverages
- **Kopi** - Traditional Indonesian coffee (Rp 8,000)
- **Es Teh Manis** - Sweet iced tea (Rp 6,000)
- **Milkshake** - Creamy milk beverage (Rp 15,000)
- **Es Jeruk** - Fresh orange juice (Rp 7,000)
- **Teh Hangat** - Hot tea (Rp 5,000)

### Desserts
- **Es Campur** - Mixed ice dessert (Rp 12,000)

## 📱 Mobile Features

### Progressive Web App (PWA)
- **Install Prompt**: Can be installed on mobile devices
- **Offline Support**: Basic functionality without internet
- **Fast Loading**: Optimized for mobile networks
- **Touch-Friendly**: Large buttons and easy navigation

### Mobile Optimizations
- **Responsive Design**: Adapts to any screen size
- **Touch Gestures**: Swipe and tap interactions
- **Mobile Cart**: Slide-up cart interface on mobile
- **Quick Actions**: One-tap quantity adjustments

## 🔒 Security Features

- **Table Validation**: Secure QR code verification
- **Session Security**: Protected table sessions
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Proper cross-origin resource sharing

## 🛠️ Customization

### Adding Menu Items

Edit `backend/data/seed.js` to add new menu items:

```javascript
new MenuItem(
  'item_id_001',
  'Item Name',
  MENU_CATEGORIES.MAIN_COURSE, // or other category
  price_in_currency,
  'Description of the item',
  true, // availability
  '/images/item.jpg' // image URL
)
```

### Modifying Categories

Update `backend/models.js` to add new categories:

```javascript
const MENU_CATEGORIES = {
  MAIN_COURSE: 'main_course',
  APPETIZERS: 'appetizers',
  // Add new categories here
};
```

### Styling Customization

Modify CSS files in `frontend/src/components/` to change:
- Colors and themes
- Fonts and typography
- Layout and spacing
- Mobile responsiveness

## 🧪 Testing

### Manual Testing

1. **QR Code Flow:**
   ```bash
   # Access table directly
   curl http://localhost:3001/table/05
   ```

2. **Menu Retrieval:**
   ```bash
   # Get menu
   curl http://localhost:3001/api/menu
   ```

3. **Order Submission:**
   ```bash
   # Create test order
   curl -X POST http://localhost:3001/api/orders \\n     -H \"Content-Type: application/json\" \\n     -d '{\"table_id\":\"05\",\"items\":[{\"item_id\":\"nasi_goreng_001\",\"quantity\":2,\"notes\":\"Extra spicy\"}],\"order_notes\":\"Test order\"}'
   ```

### Frontend Testing

1. Access http://localhost:5173/table/05
2. Navigate through menu categories
3. Add items to cart with notes
4. Submit test order
5. Verify order appears in backend

## 🚀 Production Deployment

### Environment Variables

Create `.env` files:

**Backend (.env):**
```
PORT=3001
FRONTEND_URL=https://your-domain.com
NODE_ENV=production
```

**Frontend (.env.production):**
```
VITE_API_BASE_URL=https://api.your-domain.com
```

### Build Commands

```bash
# Build frontend for production
npm run build

# Start production server
npm start
```

### Database Migration

For production, replace the in-memory database:

1. Install database driver (e.g., `pg` for PostgreSQL)
2. Update `backend/models.js` to use real database
3. Create database migration scripts
4. Update connection configuration

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

**QR codes not generating:**
- Ensure backend is running on port 3001
- Check console for QR code generation errors

**Frontend not connecting to backend:**
- Verify CORS configuration
- Check API base URL in frontend configuration

**Orders not submitting:**
- Verify table ID format (2-digit string)
- Check item IDs match menu items
- Ensure required fields are provided

**Mobile display issues:**
- Clear browser cache
- Test on different mobile browsers
- Check responsive CSS breakpoints

### Getting Help

- Check the console for error messages
- Verify all services are running
- Test API endpoints individually
- Review network requests in browser dev tools

---

**Built with ❤️ for seamless restaurant experiences** 🍽️✨