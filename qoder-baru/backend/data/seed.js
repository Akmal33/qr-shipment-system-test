const { MenuItem, MENU_CATEGORIES } = require('../models');

// Initial menu items as specified in the design document
const initialMenuItems = [
  // Main Course Items
  new MenuItem(
    'nasi_goreng_001',
    'Nasi Goreng',
    MENU_CATEGORIES.MAIN_COURSE,
    25000,
    'Indonesian-style fried rice with vegetables and spices',
    true,
    '/images/nasi_goreng.jpg'
  ),
  
  new MenuItem(
    'mie_goreng_001', 
    'Mie Goreng',
    MENU_CATEGORIES.MAIN_COURSE,
    22000,
    'Stir-fried noodles with vegetables and savory sauce',
    true,
    '/images/mie_goreng.jpg'
  ),
  
  // Hot Beverages
  new MenuItem(
    'kopi_001',
    'Kopi',
    MENU_CATEGORIES.HOT_BEVERAGES,
    8000,
    'Traditional Indonesian coffee',
    true,
    '/images/kopi.jpg'
  ),
  
  // Cold Beverages
  new MenuItem(
    'es_teh_manis_001',
    'Es Teh Manis',
    MENU_CATEGORIES.COLD_BEVERAGES,
    6000,
    'Refreshing sweet iced tea',
    true,
    '/images/es_teh_manis.jpg'
  ),
  
  new MenuItem(
    'milkshake_001',
    'Milkshake',
    MENU_CATEGORIES.COLD_BEVERAGES,
    15000,
    'Creamy milk-based beverage',
    true,
    '/images/milkshake.jpg'
  ),
  
  // Additional items to make the menu more complete
  new MenuItem(
    'ayam_goreng_001',
    'Ayam Goreng',
    MENU_CATEGORIES.MAIN_COURSE,
    30000,
    'Indonesian fried chicken with special spices',
    true,
    '/images/ayam_goreng.jpg'
  ),
  
  new MenuItem(
    'gado_gado_001',
    'Gado-Gado',
    MENU_CATEGORIES.MAIN_COURSE,
    20000,
    'Indonesian salad with peanut sauce dressing',
    true,
    '/images/gado_gado.jpg'
  ),
  
  new MenuItem(
    'es_jeruk_001',
    'Es Jeruk',
    MENU_CATEGORIES.COLD_BEVERAGES,
    7000,
    'Fresh orange juice with ice',
    true,
    '/images/es_jeruk.jpg'
  ),
  
  new MenuItem(
    'teh_hangat_001',
    'Teh Hangat',
    MENU_CATEGORIES.HOT_BEVERAGES,
    5000,
    'Hot Indonesian tea',
    true,
    '/images/teh_hangat.jpg'
  ),
  
  new MenuItem(
    'es_campur_001',
    'Es Campur',
    MENU_CATEGORIES.DESSERTS,
    12000,
    'Mixed ice dessert with various toppings',
    true,
    '/images/es_campur.jpg'
  )
];

function seedMenuItems() {
  console.log('Seeding initial menu items...');
  console.log(`Added ${initialMenuItems.length} menu items:`);
  
  initialMenuItems.forEach(item => {
    console.log(`- ${item.name} (${item.category}): Rp ${item.price.toLocaleString()}`);
  });
  
  return initialMenuItems.map(item => item.toJSON());
}

module.exports = {
  initialMenuItems,
  seedMenuItems
};