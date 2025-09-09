import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import './MenuItem.css';

function MenuItem({ item, formatPrice }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  const handleAddToCart = async () => {
    if (isAdding) return;
    
    setIsAdding(true);
    try {
      addItem(item, quantity, notes);
      
      // Reset form
      setQuantity(1);
      setNotes('');
      setShowNotes(false);
      
      // Show success feedback
      setTimeout(() => setIsAdding(false), 500);
      
    } catch (error) {
      console.error('Error adding item to cart:', error);
      setIsAdding(false);
    }
  };
  
  const incrementQuantity = () => {
    setQuantity(prev => Math.min(prev + 1, 10)); // Max 10 items
  };
  
  const decrementQuantity = () => {
    setQuantity(prev => Math.max(prev - 1, 1)); // Min 1 item
  };
  
  return (
    <div className="menu-item">
      {/* Item Image */}
      <div className="item-image\">
        {item.image_url ? (
          <img 
            src={item.image_url} 
            alt={item.name}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="image-placeholder\" style={{display: item.image_url ? 'none' : 'flex'}}>
          🍽️
        </div>
      </div>
      
      {/* Item Details */}
      <div className="item-details\">
        <h3 className="item-name\">{item.name}</h3>
        <p className="item-description\">{item.description}</p>
        <div className="item-price\">{formatPrice(item.price)}</div>
        
        {/* Availability Status */}
        {!item.available && (
          <div className="unavailable-badge\">Currently Unavailable</div>
        )}
      </div>
      
      {/* Add to Cart Section */}
      {item.available && (
        <div className="add-to-cart-section\">
          {/* Quantity Selector */}
          <div className="quantity-selector\">
            <button 
              type="button\"
              onClick={decrementQuantity}
              className="quantity-btn\"
              disabled={quantity <= 1}
            >
              -
            </button>
            <span className="quantity-display\">{quantity}</span>
            <button 
              type="button\"
              onClick={incrementQuantity}
              className="quantity-btn\"
              disabled={quantity >= 10}
            >
              +
            </button>
          </div>
          
          {/* Notes Toggle */}
          <button 
            type="button\"
            onClick={() => setShowNotes(!showNotes)}
            className={`notes-toggle ${showNotes ? 'active' : ''}`}
          >
            📝 {showNotes ? 'Hide' : 'Add'} Notes
          </button>
          
          {/* Notes Input */}
          {showNotes && (
            <div className="notes-section\">
              <textarea
                placeholder="Special instructions (e.g., extra spicy, no onions)...\"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={200}
                className="notes-input\"
                rows={3}
              />
              <div className="character-count\">
                {notes.length}/200
              </div>
            </div>
          )}
          
          {/* Add to Cart Button */}
          <button 
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`add-to-cart-btn ${isAdding ? 'adding' : ''}`}
          >
            {isAdding ? (
              <>
                <span className="adding-spinner\"></span>
                Adding...
              </>
            ) : (
              <>🛒 Add to Cart</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default MenuItem;