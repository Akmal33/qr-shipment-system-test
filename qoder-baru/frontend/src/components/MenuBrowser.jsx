import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { menuApi } from '../services/api';
import { useCart } from '../context/CartContext';
import MenuCategory from './MenuCategory';
import MenuItem from './MenuItem';
import Cart from './Cart';
import './MenuBrowser.css';

function MenuBrowser() {
  const { tableId } = useParams();
  const { setTableId } = useCart();
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCart, setShowCart] = useState(false);
  
  useEffect(() => {
    if (tableId) {
      setTableId(tableId);
    }
  }, [tableId, setTableId]);
  
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const [menuData, categoriesData] = await Promise.all([
          menuApi.getMenu(),
          menuApi.getCategories()
        ]);
        
        setMenuItems(menuData.items || []);
        setCategories(categoriesData || []);
        
        // Set first category as default
        if (categoriesData && categoriesData.length > 0) {
          setSelectedCategory(categoriesData[0]);
        }
        
      } catch (err) {
        console.error('Error fetching menu:', err);
        setError('Unable to load menu. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMenu();
  }, []);
  
  useEffect(() => {
    // Filter items by category and search term
    let filtered = menuItems.filter(item => item.available);
    
    if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredItems(filtered);
  }, [selectedCategory, searchTerm, menuItems]);
  
  const formatCategoryName = (category) => {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };
  
  if (loading) {
    return (
      <div className="menu-browser loading">
        <div className="loading-spinner"></div>
        <h2>Loading Menu...</h2>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="menu-browser error">
        <h2>Error Loading Menu</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }
  
  return (
    <div className="menu-browser">
      {/* Header */}
      <div className="menu-header">
        <div className="table-info">
          <h1>Table {tableId}</h1>
          <p>Select items to add to your order</p>
        </div>
        <button 
          className="cart-toggle"
          onClick={() => setShowCart(!showCart)}
        >
          🛒 Cart
        </button>
      </div>
      
      {/* Search Bar */}
      <div className="search-section">
        <input
          type="text"
          placeholder="Search menu items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      
      {/* Category Tabs */}
      <div className="category-tabs">
        {categories.map(category => (
          <button
            key={category}
            className={`category-tab ${
              selectedCategory === category ? 'active' : ''
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {formatCategoryName(category)}
          </button>
        ))}
      </div>
      
      {/* Menu Items */}
      <div className="menu-content">
        <div className="menu-items">
          {filteredItems.length > 0 ? (
            filteredItems.map(item => (
              <MenuItem 
                key={item.id} 
                item={item} 
                formatPrice={formatPrice}
              />
            ))
          ) : (
            <div className="no-items">
              <p>No items found {searchTerm && `for \"${searchTerm}\"`}</p>
            </div>
          )}
        </div>
        
        {/* Cart Sidebar */}
        {showCart && (
          <div className="cart-sidebar">
            <Cart 
              formatPrice={formatPrice}
              onClose={() => setShowCart(false)}
            />
          </div>
        )}
      </div>
      
      {/* Mobile Cart Button */}
      <div className="mobile-cart-button">
        <button 
          className="mobile-cart-btn"
          onClick={() => setShowCart(true)}
        >
          🛒 View Cart
        </button>
      </div>
    </div>
  );
}

export default MenuBrowser;