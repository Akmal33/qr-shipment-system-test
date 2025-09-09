import React from 'react';
import './MenuCategory.css';

function MenuCategory({ category, isActive, onClick, itemCount }) {
  const formatCategoryName = (category) => {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  return (
    <button
      className={`menu-category ${isActive ? 'active' : ''}`}
      onClick={() => onClick(category)}
    >
      <span className=\"category-name\">
        {formatCategoryName(category)}
      </span>
      {itemCount !== undefined && (
        <span className=\"item-count\">({itemCount})</span>
      )}
    </button>
  );
}

export default MenuCategory;