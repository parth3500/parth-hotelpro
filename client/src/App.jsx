import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HotelProvider } from './context/HotelContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';

import { LandingPage } from './pages/LandingPage';
import { RoomCatalogPage } from './pages/RoomCatalogPage';
import { RoomDetailPage } from './pages/RoomDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './App.css';

function App() {
  return (
    <HotelProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100 bg-dark text-white font-sans">
          <Navbar />
          <div className="flex-grow-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/rooms" element={<RoomCatalogPage />} />
              <Route path="/rooms/:id" element={<RoomDetailPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/profile" element={<UserProfilePage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
            </Routes>
          </div>
          <Footer />
          <Toast />
        </div>
      </Router>
    </HotelProvider>
  );
}

export default App;
