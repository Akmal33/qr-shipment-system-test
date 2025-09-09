import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tableApi } from '../services/api';
import { useCart } from '../context/CartContext';
import './TableAccess.css';

function TableAccess() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const { setTableId } = useCart();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tableData, setTableData] = useState(null);
  
  useEffect(() => {
    const accessTable = async () => {
      if (!tableId) {
        setError('Invalid table ID');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const data = await tableApi.accessTable(tableId);
        setTableData(data);
        setTableId(tableId);
        
        // Automatically redirect to menu after 2 seconds
        setTimeout(() => {
          navigate(`/menu/${tableId}`);
        }, 2000);
        
      } catch (err) {
        console.error('Error accessing table:', err);
        if (err.response?.status === 404) {
          setError('Table not found. Please check the QR code and try again.');
        } else {
          setError('Unable to access table. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    accessTable();
  }, [tableId, navigate, setTableId]);
  
  const handleContinue = () => {
    navigate(`/menu/${tableId}`);
  };
  
  if (loading) {
    return (
      <div className="table-access loading">
        <div className="spinner"></div>
        <h2>Connecting to Table {tableId}...</h2>
        <p>Please wait while we set up your ordering session.</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="table-access error">
        <div className="error-icon">⚠️</div>
        <h2>Connection Error</h2>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="retry-btn"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <div className="table-access success">
      <div className="success-icon">✅</div>
      <h1>Welcome to Table {tableId}!</h1>
      <p className="welcome-message">{tableData?.message}</p>
      
      <div className="table-info">
        <div className="info-item">
          <span className="label">Table:</span>
          <span className="value">{tableId}</span>
        </div>
        <div className="info-item">
          <span className="label">Session:</span>
          <span className="value">{tableData?.session_id?.slice(-8)}</span>
        </div>
      </div>
      
      <div className="actions">
        <button 
          onClick={handleContinue} 
          className="continue-btn"
        >
          View Menu & Start Ordering
        </button>
      </div>
      
      <div className="auto-redirect">
        <p>You'll be automatically redirected to the menu in a few seconds...</p>
      </div>
    </div>
  );
}

export default TableAccess;