import React from 'react';
import { Building2, Mail, Phone, MapPin, Globe, Share2, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer style={{ backgroundColor: '#0c0c0c', color: '#aaa', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '70px 0 30px' }}>
      <div className="container">
        <div className="row g-5 mb-5">
          <div className="col-lg-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <Building2 size={28} style={{ color: '#d4a855' }} />
              <span style={{ fontFamily: 'Georgia, serif', fontWeight: '700', fontSize: '1.4rem', color: '#f5f0e8' }}>
                Hotel<span style={{ color: '#d4a855' }}>Pro</span>
              </span>
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.7', color: '#999' }}>
              Redefining luxury hospitality with uncompromised comfort, curated experiences, and world-class service tailored for modern travelers.
            </p>
            <div className="d-flex gap-3 mt-4">
              <a href="#social" className="text-decoration-none" style={{ color: '#d4a855' }}><Globe size={20} /></a>
              <a href="#social" className="text-decoration-none" style={{ color: '#d4a855' }}><Share2 size={20} /></a>
              <a href="#social" className="text-decoration-none" style={{ color: '#d4a855' }}><MessageCircle size={20} /></a>
            </div>
          </div>

          <div className="col-lg-2 col-md-4">
            <h5 className="text-white mb-3" style={{ fontSize: '1rem', letterSpacing: '0.05em' }}>Quick Links</h5>
            <ul className="list-unstyled d-flex flex-column gap-2" style={{ fontSize: '0.9rem' }}>
              <li><Link to="/" className="text-decoration-none text-muted hover-light">Home</Link></li>
              <li><Link to="/rooms" className="text-decoration-none text-muted hover-light">Room Catalog</Link></li>
              <li><Link to="/profile" className="text-decoration-none text-muted hover-light">My Bookings</Link></li>
              <li><Link to="/admin" className="text-decoration-none text-muted hover-light">Staff Dashboard</Link></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-4">
            <h5 className="text-white mb-3" style={{ fontSize: '1rem', letterSpacing: '0.05em' }}>Contact Us</h5>
            <ul className="list-unstyled d-flex flex-column gap-3" style={{ fontSize: '0.9rem' }}>
              <li className="d-flex align-items-start gap-2">
                <MapPin size={18} className="text-warning mt-1 flex-shrink-0" />
                <span>100 Grand Avenue, Ocean View, CA 90210</span>
              </li>
              <li className="d-flex align-items-center gap-2">
                <Phone size={18} className="text-warning flex-shrink-0" />
                <span>+1 (800) 555-HOTEL</span>
              </li>
              <li className="d-flex align-items-center gap-2">
                <Mail size={18} className="text-warning flex-shrink-0" />
                <span>concierge@hotelpro.com</span>
              </li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-4">
            <h5 className="text-white mb-3" style={{ fontSize: '1rem', letterSpacing: '0.05em' }}>Newsletter</h5>
            <p style={{ fontSize: '0.85rem', color: '#999' }}>Subscribe to receive exclusive offers and seasonal packages.</p>
            <div className="input-group mb-3">
              <input type="email" className="form-control bg-dark text-white border-secondary" placeholder="Your email" />
              <button className="btn" style={{ backgroundColor: '#d4a855', color: '#000', fontWeight: '600' }}>Join</button>
            </div>
          </div>
        </div>

        <hr style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
        <div className="row pt-3">
          <div className="col-md-6 text-center text-md-start">
            <p style={{ fontSize: '0.85rem', color: '#777' }}>&copy; 2026 HotelPro International. All rights reserved.</p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <p style={{ fontSize: '0.85rem', color: '#777' }}>Privacy Policy &bull; Terms of Service</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
