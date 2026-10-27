import React from 'react';
import { NavLink } from 'react-router-dom';
import { useHotel } from '../context/HotelContext';
import { Building2, ShieldCheck, User } from 'lucide-react';

export const Navbar = () => {
  const { user, toggleUserRole } = useHotel();

  return (
    <nav className="navbar navbar-expand-lg fixed-top" style={{ backgroundColor: 'rgba(10, 10, 10, 0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="container">
        <NavLink to="/" className="navbar-brand d-flex align-items-center gap-2 text-decoration-none">
          <Building2 size={28} style={{ color: '#d4a855' }} />
          <span style={{ fontFamily: 'Georgia, serif', fontWeight: '700', fontSize: '1.4rem', color: '#f5f0e8', letterSpacing: '0.03em' }}>
            Hotel<span style={{ color: '#d4a855' }}>Pro</span>
          </span>
        </NavLink>

        <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu"
          style={{ color: '#f5f0e8' }}>
          <span className="navbar-toggler-icon" style={{ filter: 'invert(1)' }}></span>
        </button>

        <div className="collapse navbar-collapse" id="navMenu">
          <ul className="navbar-nav mx-auto gap-2">
            <li className="nav-item">
              <NavLink to="/" end className="nav-link px-3 py-2 rounded" style={({ isActive }) => ({
                color: isActive ? '#d4a855' : '#ccc',
                backgroundColor: isActive ? 'rgba(212,168,85,0.1)' : 'transparent',
                transition: 'all 0.2s'
              })}>Home</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/rooms" className="nav-link px-3 py-2 rounded" style={({ isActive }) => ({
                color: isActive ? '#d4a855' : '#ccc',
                backgroundColor: isActive ? 'rgba(212,168,85,0.1)' : 'transparent',
                transition: 'all 0.2s'
              })}>Rooms</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/profile" className="nav-link px-3 py-2 rounded" style={({ isActive }) => ({
                color: isActive ? '#d4a855' : '#ccc',
                backgroundColor: isActive ? 'rgba(212,168,85,0.1)' : 'transparent',
                transition: 'all 0.2s'
              })}>My Bookings</NavLink>
            </li>
            {user.role === 'Admin' && (
              <li className="nav-item">
                <NavLink to="/admin" className="nav-link px-3 py-2 rounded" style={({ isActive }) => ({
                  color: isActive ? '#d4a855' : '#ccc',
                  backgroundColor: isActive ? 'rgba(212,168,85,0.1)' : 'transparent',
                  transition: 'all 0.2s'
                })}>Admin</NavLink>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-3">
            <button
              onClick={toggleUserRole}
              className="btn btn-sm d-flex align-items-center gap-2"
              style={{ backgroundColor: 'rgba(212,168,85,0.15)', color: '#d4a855', border: '1px solid rgba(212,168,85,0.4)', borderRadius: '20px', padding: '6px 14px', fontSize: '0.82rem' }}
              title="Toggle Admin/Guest role"
            >
              {user.role === 'Admin' ? <ShieldCheck size={16} /> : <User size={16} />}
              {user.role}
            </button>

            <NavLink to="/profile" className="d-flex align-items-center gap-2 text-decoration-none" style={{ color: '#f5f0e8' }}>
              <img
                src={user.avatar}
                alt={user.name}
                style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #d4a855' }}
              />
              <span className="d-none d-lg-block" style={{ fontSize: '0.9rem', color: '#ccc' }}>{user.name.split(' ')[0]}</span>
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};
