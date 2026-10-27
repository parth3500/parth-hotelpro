import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { Calendar, Users, FileText, XCircle, Mail, Phone, Lock } from 'lucide-react';

export const UserProfilePage = () => {
  const { user, setUser, bookings, cancelBooking, showToast, setIsAuthModalOpen } = useHotel();
  const [activeTab, setActiveTab] = useState('bookings');
  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState(user || {});

  if (!user) {
    return (
      <div className="bg-dark text-white min-vh-100 py-5 mt-5 d-flex align-items-center justify-content-center text-center">
        <div className="card bg-dark border border-secondary rounded-4 p-5 shadow-lg" style={{ maxWidth: '520px', width: '92%' }}>
          <div className="d-flex justify-content-center mb-3">
            <div className="p-3 rounded-circle" style={{ backgroundColor: 'rgba(212,168,85,0.15)', border: '1px solid #d4a855' }}>
              <Lock size={40} style={{ color: '#d4a855' }} />
            </div>
          </div>
          <h3 className="fw-bold mb-2 text-white" style={{ fontFamily: 'Georgia, serif' }}>Sign In to View Bookings</h3>
          <p className="text-muted mb-4" style={{ fontSize: '0.92rem' }}>
            No account is currently signed in. Please sign in with your account or use the Git Demo credentials to manage your bookings and profile.
          </p>
          <div className="p-3 rounded-3 mb-4 text-start small border border-secondary" style={{ backgroundColor: '#181926' }}>
            <span className="text-warning fw-bold d-block mb-2">Git Demo Access Credentials:</span>
            <div className="d-flex justify-content-between text-muted py-1 border-bottom border-secondary border-opacity-50">
              <span className="text-warning fw-semibold">Admin:</span>
              <span className="text-white font-monospace">admin@hotelpro.com &bull; admin123</span>
            </div>
            <div className="d-flex justify-content-between text-muted py-1 mt-1">
              <span className="text-info fw-semibold">Customer:</span>
              <span className="text-white font-monospace">customer@hotelpro.com &bull; customer123</span>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="btn py-2 fw-bold w-100 shadow"
            style={{ backgroundColor: '#d4a855', color: '#000', borderRadius: '10px' }}
          >
            Sign In / Demo Access
          </button>
        </div>
      </div>
    );
  }

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setUser(profileForm);
    setIsEditing(false);
    showToast("Profile updated successfully.");
  };

  const userBookings = bookings.filter(b => (b.guestEmail && user.email && b.guestEmail.toLowerCase() === user.email.toLowerCase()) || user.role === 'Admin');

  return (
    <div className="bg-dark text-white min-vh-100 py-5 mt-5">
      <div className="container py-4">
        {/* Profile Header */}
        <div className="card bg-dark border border-secondary rounded-4 p-4 mb-5 shadow-sm">
          <div className="row align-items-center">
            <div className="col-lg-auto text-center mb-3 mb-lg-0">
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                alt={user.name}
                className="rounded-circle object-fit-cover border border-warning"
                style={{ width: '100px', height: '100px', borderWidth: '3px!important' }}
              />
            </div>
            <div className="col-lg">
              <div className="d-flex align-items-center gap-3 mb-1 flex-wrap">
                <h1 className="h3 fw-bold mb-0" style={{ fontFamily: 'Georgia, serif' }}>{user.name}</h1>
                <span className="badge bg-warning text-dark px-3 py-1 fw-bold">{user.role}</span>
                <span className="badge bg-success bg-opacity-25 text-success border border-success px-2 py-1 small">
                  Authenticated Real Account
                </span>
              </div>
              <p className="text-muted small mb-2 d-flex align-items-center gap-3">
                <span className="d-flex align-items-center gap-1"><Mail size={14} className="text-warning" /> {user.email}</span>
                <span className="d-flex align-items-center gap-1"><Phone size={14} className="text-warning" /> {user.phone || '+1 (555) 019-2834'}</span>
              </p>
            </div>
            <div className="col-lg-auto text-lg-end mt-3 mt-lg-0 d-flex gap-2">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="btn btn-sm btn-outline-warning"
              >
                Account Details
              </button>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="btn btn-outline-light btn-sm"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </div>

          {isEditing && (
            <form onSubmit={handleSaveProfile} className="mt-4 pt-4 border-top border-secondary">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label text-muted small">Name</label>
                  <input
                    type="text"
                    className="form-control bg-dark text-white border-secondary"
                    value={profileForm.name || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label text-muted small">Email</label>
                  <input
                    type="email"
                    className="form-control bg-dark text-white border-secondary"
                    value={profileForm.email || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label text-muted small">Phone</label>
                  <input
                    type="text"
                    className="form-control bg-dark text-white border-secondary"
                    value={profileForm.phone || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  />
                </div>
                <div className="col-12 text-end">
                  <button type="submit" className="btn btn-sm px-4" style={{ backgroundColor: '#d4a855', color: '#000', fontWeight: '600' }}>
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Tabs */}
        <ul className="nav nav-tabs border-bottom border-secondary mb-4">
          <li className="nav-item">
            <button
              className={`nav-link text-white bg-transparent border-0 px-4 py-3 fw-semibold ${activeTab === 'bookings' ? 'border-bottom border-warning border-3 text-warning' : 'text-muted'}`}
              onClick={() => setActiveTab('bookings')}
            >
              My Bookings ({userBookings.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link text-white bg-transparent border-0 px-4 py-3 fw-semibold ${activeTab === 'preferences' ? 'border-bottom border-warning border-3 text-warning' : 'text-muted'}`}
              onClick={() => setActiveTab('preferences')}
            >
              Preferences &amp; Security
            </button>
          </li>
        </ul>

        {activeTab === 'bookings' ? (
          <div>
            {userBookings.length === 0 ? (
              <div className="text-center py-5 bg-dark border border-secondary rounded-4">
                <Calendar size={48} className="text-muted mb-3" />
                <h4 className="fw-bold">No bookings found</h4>
                <p className="text-muted">You have not made any room reservations yet.</p>
              </div>
            ) : (
              <div className="row g-4">
                {userBookings.map(b => (
                  <div className="col-lg-6" key={b.id || b._id}>
                    <div className="card bg-dark border border-secondary rounded-4 p-4 h-100 shadow-sm">
                      <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom border-secondary">
                        <div>
                          <span className="text-warning fw-bold">{b.id || b._id}</span>
                          <span className="text-muted small ms-2">({b.createdAt})</span>
                        </div>
                        <span className={`badge px-3 py-1 ${String(b.status).toLowerCase() === 'confirmed' ? 'bg-success bg-opacity-25 text-success' : String(b.status).toLowerCase() === 'completed' ? 'bg-info bg-opacity-25 text-info' : 'bg-danger bg-opacity-25 text-danger'}`}>
                          {b.status}
                        </span>
                      </div>

                      <h4 className="fw-bold mb-2" style={{ fontFamily: 'Georgia, serif' }}>{b.roomName}</h4>

                      <div className="d-flex align-items-center gap-3 text-muted small mb-3">
                        <span className="d-flex align-items-center gap-1"><Calendar size={14} className="text-warning" /> {b.checkIn} &rarr; {b.checkOut}</span>
                        <span>&bull;</span>
                        <span className="d-flex align-items-center gap-1"><Users size={14} className="text-warning" /> {b.guests} Guests</span>
                      </div>

                      <div className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top border-secondary">
                        <div>
                          <small className="text-muted d-block">Total Paid</small>
                          <span className="h5 fw-bold text-warning mb-0">${b.totalPrice}</span>
                        </div>
                        <div className="d-flex gap-2">
                          <button
                            onClick={() => showToast(`Invoice for ${b.id || b._id} downloaded successfully.`)}
                            className="btn btn-outline-light btn-sm d-flex align-items-center gap-1"
                          >
                            <FileText size={14} /> Receipt
                          </button>
                          {String(b.status).toLowerCase() === 'confirmed' && (
                            <button
                              onClick={() => cancelBooking(b.id || b._id)}
                              className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
                            >
                              <XCircle size={14} /> Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="card bg-dark border border-secondary rounded-4 p-4">
            <h4 className="fw-bold mb-4" style={{ fontFamily: 'Georgia, serif' }}>Account Security &amp; Preferences</h4>
            <div className="mb-4">
              <h6 className="text-warning mb-2">Two-Factor Authentication</h6>
              <p className="text-muted small">Protect your account with SMS or Authenticator app verification.</p>
              <button className="btn btn-outline-light btn-sm">Enable 2FA</button>
            </div>
            <hr style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
            <div className="mb-4">
              <h6 className="text-warning mb-2">Email Notifications</h6>
              <div className="form-check form-switch mb-2">
                <input className="form-check-input" type="checkbox" defaultChecked id="notif1" />
                <label className="form-check-label text-muted small" htmlFor="notif1">Booking confirmations and itinerary updates</label>
              </div>
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" defaultChecked id="notif2" />
                <label className="form-check-label text-muted small" htmlFor="notif2">Exclusive member discounts and promotional offers</label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
