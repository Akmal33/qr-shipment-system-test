import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { orderApi } from '../services/api';
import './Cart.css';

function Cart({ formatPrice, onClose }) {
  const {
    items,
    tableId,
    orderNotes,
    totalAmount,
    updateItemQuantity,
    removeItem,
    updateOrderNotes,
    clearCart
  } = useCart();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  
  const handleQuantityChange = (itemId, notes, newQuantity) => {
    updateItemQuantity(itemId, newQuantity, notes);
  };
  
  const handleRemoveItem = (itemId, notes) => {
    removeItem(itemId, notes);
  };
  
  const handleSubmitOrder = async () => {
    if (items.length === 0) {
      alert('Please add items to your cart before ordering.');
      return;
    }
    
    if (!tableId) {
      alert('Table ID is missing. Please scan the QR code again.');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const orderData = {
        table_id: tableId,
        items: items.map(item => ({
          item_id: item.item_id,
          quantity: item.quantity,
          notes: item.notes
        })),
        order_notes: orderNotes
      };
      
      const response = await orderApi.createOrder(orderData);
      
      setSubmitSuccess(true);
      
      // Clear cart after successful submission
      setTimeout(() => {
        clearCart();
        setSubmitSuccess(false);
        if (onClose) onClose();
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting order:', error);
      setSubmitError(
        error.response?.data?.error || 
        'Failed to submit order. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (submitSuccess) {
    return (
      <div className=\"cart success\">
        <div className=\"success-message\">
          <div className=\"success-icon\">✅</div>
          <h2>Order Submitted Successfully!</h2>
          <p>Your order has been sent to the kitchen.</p>
          <p>Order details:</p>
          <div className=\"order-summary\">
            <p><strong>Table:</strong> {tableId}</p>
            <p><strong>Items:</strong> {items.length}</p>
            <p><strong>Total:</strong> {formatPrice(totalAmount)}</p>
          </div>
          <p>This window will close automatically...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className=\"cart\">
      {/* Cart Header */}
      <div className=\"cart-header\">
        <h2>Your Order</h2>
        {onClose && (
          <button onClick={onClose} className=\"close-cart\">
            ✕
          </button>
        )}
      </div>
      
      {/* Cart Items */}
      <div className=\"cart-items\">
        {items.length === 0 ? (
          <div className=\"empty-cart\">
            <p>Your cart is empty</p>
            <p>Add items from the menu to start ordering</p>
          </div>
        ) : (
          items.map((item, index) => (
            <div key={`${item.item_id}-${item.notes}-${index}`} className=\"cart-item\">
              <div className=\"item-info\">
                <h4>{item.item_name}</h4>
                {item.notes && (
                  <p className=\"item-notes\">Note: {item.notes}</p>
                )}
                <p className=\"item-price\">{formatPrice(item.unit_price)} each</p>
              </div>
              
              <div className=\"item-controls\">
                <div className=\"quantity-controls\">
                  <button 
                    onClick={() => handleQuantityChange(
                      item.item_id, 
                      item.notes, 
                      item.quantity - 1
                    )}
                    className=\"quantity-btn\"
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span className=\"quantity\">{item.quantity}</span>
                  <button 
                    onClick={() => handleQuantityChange(
                      item.item_id, 
                      item.notes, 
                      item.quantity + 1
                    )}
                    className=\"quantity-btn\"
                    disabled={item.quantity >= 10}
                  >
                    +
                  </button>
                </div>
                
                <div className=\"subtotal\">
                  {formatPrice(item.subtotal)}
                </div>
                
                <button 
                  onClick={() => handleRemoveItem(item.item_id, item.notes)}
                  className=\"remove-btn\"
                  title=\"Remove item\"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Order Notes */}
      {items.length > 0 && (
        <div className=\"order-notes-section\">
          <label htmlFor=\"order-notes\">Order Notes (Optional):</label>
          <textarea
            id=\"order-notes\"
            placeholder=\"Any special instructions for your entire order...\"
            value={orderNotes}
            onChange={(e) => updateOrderNotes(e.target.value)}
            maxLength={300}
            className=\"order-notes-input\"
            rows={3}
          />
          <div className=\"character-count\">
            {orderNotes.length}/300
          </div>
        </div>
      )}
      
      {/* Cart Summary */}
      {items.length > 0 && (
        <div className=\"cart-summary\">
          <div className=\"summary-row\">
            <span>Items ({items.reduce((sum, item) => sum + item.quantity, 0)}):</span>
            <span>{formatPrice(totalAmount)}</span>
          </div>
          <div className=\"summary-row total\">
            <span>Total:</span>
            <span>{formatPrice(totalAmount)}</span>
          </div>
        </div>
      )}
      
      {/* Submit Error */}
      {submitError && (
        <div className=\"submit-error\">
          <p>❌ {submitError}</p>
        </div>
      )}
      
      {/* Cart Actions */}
      <div className=\"cart-actions\">
        {items.length > 0 && (
          <>
            <button 
              onClick={() => clearCart()}
              className=\"clear-cart-btn\"
              disabled={isSubmitting}
            >
              Clear Cart
            </button>
            
            <button 
              onClick={handleSubmitOrder}
              className=\"submit-order-btn\"
              disabled={isSubmitting || items.length === 0}
            >
              {isSubmitting ? (
                <>
                  <span className=\"submitting-spinner\"></span>
                  Submitting...
                </>
              ) : (
                <>📤 Submit Order</>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Cart;