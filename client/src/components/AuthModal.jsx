import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { Mail, Lock, User, X, LogIn, UserPlus, CheckCircle2, ShieldCheck, KeyRound } from 'lucide-react';

export const AuthModal = ({ isOpen, onClose }) => {
  const { loginUser, registerUser, user, logoutUser } = useHotel();
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleQuickFill = (email, password) => {
    setTab('login');
    setFormData(prev => ({ ...prev, email, password }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (tab === 'login') {
      const res = await loginUser(formData.email, formData.password);
      setLoading(false);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Authentication failed. Please verify email and password.');
      }
    } else {
      if (!formData.name || !formData.email || !formData.password) {
        setLoading(false);
        setError('Please fill in all required fields.');
        return;
      }
      if (formData.password.length < 6) {
        setLoading(false);
        setError('Password must be at least 6 characters.');
        return;
      }
      const res = await registerUser(formData.name, formData.email, formData.password, formData.role);
      setLoading(false);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Registration failed.');
      }
    }
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-3"
      style={{
        backgroundColor: 'rgba(5, 5, 10, 0.85)',
        backdropFilter: 'blur(10px)',
        zIndex: 9999,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="card shadow-lg rounded-4 text-white"
        style={{
          backgroundColor: '#14151f',
          border: '1px solid #33364f',
          maxWidth: '480px',
          width: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div className="p-4 border-bottom border-secondary d-flex justify-content-between align-items-center" style={{ backgroundColor: '#181926' }}>
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge px-2 py-1" style={{ backgroundColor: 'rgba(212,168,85,0.2)', color: '#d4a855', border: '1px solid rgba(212,168,85,0.4)', fontSize: '0.75rem' }}>
                HOTELPRO AUTH
              </span>
            </div>
            <h4 className="fw-bold mb-0" style={{ fontFamily: 'Georgia, serif', color: '#ffffff' }}>
              {user ? 'Account Overview' : (tab === 'login' ? 'Sign In to HotelPro' : 'Create New Account')}
            </h4>
          </div>
          <button
            onClick={onClose}
            className="btn btn-sm text-light p-1 rounded-circle"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {user ? (
            /* Logged In State */
            <div className="text-center py-2">
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                alt={user.name}
                className="rounded-circle mb-3 border border-warning"
                style={{ width: '84px', height: '84px', objectFit: 'cover', borderWidth: '3px!important' }}
              />
              <h4 className="fw-bold mb-1 text-white">{user.name}</h4>
              <p className="text-muted small mb-3">{user.email}</p>
              <div className="d-flex justify-content-center gap-2 mb-4">
                <span className="badge bg-warning text-dark px-3 py-1 fw-bold fs-6">
                  {user.role}
                </span>
                <span className="badge bg-success bg-opacity-25 text-success border border-success px-3 py-1 d-flex align-items-center gap-1 fs-6">
                  <CheckCircle2 size={14} /> Active Session
                </span>
              </div>
              <button
                onClick={() => {
                  logoutUser();
                  onClose();
                }}
                className="btn btn-outline-danger w-100 py-2 rounded-3 fw-semibold"
              >
                Sign Out
              </button>
            </div>
          ) : (
            /* Logged Out / Sign In Form */
            <>
              {/* Git Demo Credentials Box */}
              <div
                className="p-3 rounded-3 mb-4"
                style={{
                  backgroundColor: '#1b1d2c',
                  border: '1px solid #3d4160',
                }}
              >
                <div className="d-flex align-items-center gap-2 mb-2">
                  <KeyRound size={16} className="text-warning" />
                  <span className="fw-bold small text-white">Git Demo Access Credentials</span>
                </div>
                <div className="small mb-3 text-light" style={{ fontSize: '0.82rem', lineHeight: '1.5' }}>
                  <div className="d-flex justify-content-between py-1 border-bottom border-secondary border-opacity-50">
                    <span className="text-warning fw-semibold">Admin:</span>
                    <span className="font-monospace text-white">admin@hotelpro.com &bull; admin123</span>
                  </div>
                  <div className="d-flex justify-content-between py-1">
                    <span className="text-info fw-semibold">Customer:</span>
                    <span className="font-monospace text-white">customer@hotelpro.com &bull; customer123</span>
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('admin@hotelpro.com', 'admin123')}
                    className="btn btn-sm flex-fill fw-semibold d-flex align-items-center justify-content-center gap-1"
                    style={{ backgroundColor: 'rgba(212,168,85,0.2)', color: '#f3c769', border: '1px solid #d4a855' }}
                  >
                    <ShieldCheck size={14} /> Fill Admin Demo
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('customer@hotelpro.com', 'customer123')}
                    className="btn btn-sm flex-fill fw-semibold d-flex align-items-center justify-content-center gap-1"
                    style={{ backgroundColor: 'rgba(56,189,248,0.15)', color: '#38bdf8', border: '1px solid #38bdf8' }}
                  >
                    <User size={14} /> Fill Customer Demo
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="d-flex rounded-3 p-1 mb-3" style={{ backgroundColor: '#1a1b26', border: '1px solid #2e3048' }}>
                <button
                  type="button"
                  onClick={() => { setTab('login'); setError(''); }}
                  className={`btn btn-sm flex-fill rounded-2 py-2 d-flex align-items-center justify-content-center gap-2 fw-bold ${tab === 'login' ? 'btn-warning text-dark' : 'text-light'}`}
                  style={tab === 'login' ? { backgroundColor: '#d4a855' } : {}}
                >
                  <LogIn size={15} /> Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setTab('register'); setError(''); }}
                  className={`btn btn-sm flex-fill rounded-2 py-2 d-flex align-items-center justify-content-center gap-2 fw-bold ${tab === 'register' ? 'btn-warning text-dark' : 'text-light'}`}
                  style={tab === 'register' ? { backgroundColor: '#d4a855' } : {}}
                >
                  <UserPlus size={15} /> Register
                </button>
              </div>

              {error && (
                <div
                  className="py-2 px-3 small rounded-3 mb-3 fw-semibold text-white"
                  style={{ backgroundColor: '#dc2626', border: '1px solid #ef4444' }}
                  role="alert"
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {tab === 'register' && (
                  <div className="mb-3">
                    <label className="form-label text-white small fw-semibold mb-1">Full Name</label>
                    <div className="input-group">
                      <span className="input-group-text text-light" style={{ backgroundColor: '#1f2133', borderColor: '#404464' }}>
                        <User size={16} />
                      </span>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="form-control text-white"
                        style={{ backgroundColor: '#1a1b28', borderColor: '#404464' }}
                        placeholder="e.g. Sajal Tiwari"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label text-white small fw-semibold mb-1">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text text-light" style={{ backgroundColor: '#1f2133', borderColor: '#404464' }}>
                      <Mail size={16} />
                    </span>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-control text-white"
                      style={{ backgroundColor: '#1a1b28', borderColor: '#404464' }}
                      placeholder="admin@hotelpro.com"
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label text-white small fw-semibold mb-1">Password</label>
                  <div className="input-group">
                    <span className="input-group-text text-light" style={{ backgroundColor: '#1f2133', borderColor: '#404464' }}>
                      <Lock size={16} />
                    </span>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="form-control text-white"
                      style={{ backgroundColor: '#1a1b28', borderColor: '#404464' }}
                      placeholder="Enter password"
                      required
                    />
                  </div>
                </div>

                {tab === 'register' && (
                  <div className="mb-4">
                    <label className="form-label text-white small fw-semibold mb-1">Account Role</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="form-select text-white"
                      style={{ backgroundColor: '#1a1b28', borderColor: '#404464' }}
                    >
                      <option value="customer">Customer / Guest</option>
                      <option value="admin">Hotel Administrator (Full Access)</option>
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn w-100 py-2 fw-bold rounded-3 mt-2 shadow"
                  style={{ backgroundColor: '#d4a855', color: '#000', fontSize: '0.95rem' }}
                >
                  {loading ? 'Authenticating...' : (tab === 'login' ? 'Sign In' : 'Create Real Account')}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
