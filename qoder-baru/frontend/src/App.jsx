import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TableAccess from './components/TableAccess';
import MenuBrowser from './components/MenuBrowser';
import CartProvider from './context/CartContext';
import './App.css';

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/table/:tableId" element={<TableAccess />} />
            <Route path="/menu/:tableId" element={<MenuBrowser />} />
            <Route path="/" element={
              <div className="welcome">
                <h1>Barcode Ordering System</h1>
                <p>Scan the QR code on your table to start ordering</p>
              </div>
            } />
          </Routes>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
