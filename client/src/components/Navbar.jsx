import React from 'react';
import { NavLink } from 'react-router-dom';
import { useHotel } from '../context/HotelContext';
import { Building2, ShieldCheck, User, LogIn, LogOut } from 'lucide-react';
import { AuthModal } from './AuthModal';

export const Navbar = () => {
  const { user, logoutUser, isAuthModalOpen, setIsAuthModalOpen } = useHotel();

  return (
    <>
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
              {user?.role === 'Admin' && (
                <li className="nav-item">
                  <NavLink to="/admin" className="nav-link px-3 py-2 rounded" style={({ isActive }) => ({
                    color: isActive ? '#d4a855' : '#ccc',
                    backgroundColor: isActive ? 'rgba(212,168,85,0.1)' : 'transparent',
                    transition: 'all 0.2s'
                  })}>Admin</NavLink>
                </li>
              )}
            </ul>

            <div className="d-flex align-items-center gap-2">
              {user ? (
                /* Authenticated State */
                <>
                  <span
                    className="badge d-flex align-items-center gap-1"
                    style={{
                      backgroundColor: user.role === 'Admin' ? 'rgba(212,168,85,0.2)' : 'rgba(56,189,248,0.2)',
                      color: user.role === 'Admin' ? '#d4a855' : '#38bdf8',
                      border: `1px solid ${user.role === 'Admin' ? 'rgba(212,168,85,0.5)' : 'rgba(56,189,248,0.5)'}`,
                      borderRadius: '20px',
                      padding: '6px 12px',
                      fontSize: '0.8rem',
                    }}
                  >
                    {user.role === 'Admin' ? <ShieldCheck size={14} /> : <User size={14} />}
                    {user.role}
                  </span>

                  <NavLink to="/profile" className="d-flex align-items-center gap-2 text-decoration-none px-2" style={{ color: '#f5f0e8' }}>
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                      alt={user.name}
                      style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #d4a855' }}
                    />
                    <span className="d-none d-lg-block" style={{ fontSize: '0.9rem', color: '#ccc' }}>
                      {user.name.split(' ')[0]}
                    </span>
                  </NavLink>

                  <button
                    onClick={logoutUser}
                    className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
                    style={{ borderRadius: '20px', padding: '5px 12px', fontSize: '0.8rem' }}
                    title="Sign Out"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </>
              ) : (
                /* Logged Out Initial State: No dummy account */
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="btn fw-bold d-flex align-items-center gap-2"
                  style={{
                    backgroundColor: '#d4a855',
                    color: '#000000',
                    borderRadius: '24px',
                    padding: '7px 18px',
                    fontSize: '0.88rem',
                    boxShadow: '0 4px 12px rgba(212,168,85,0.25)'
                  }}
                >
                  <LogIn size={16} /> Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Real Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};
