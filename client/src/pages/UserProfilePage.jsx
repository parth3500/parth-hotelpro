import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { Calendar, Users, FileText, XCircle, Mail, Phone } from 'lucide-react';

export const UserProfilePage = () => {
  const { user, setUser, bookings, cancelBooking, showToast } = useHotel();
  const [activeTab, setActiveTab] = useState('bookings');
  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({ ...user });

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setUser(profileForm);
    setIsEditing(false);
    showToast("Profile updated successfully.");
  };

  const userBookings = bookings.filter(b => b.guestEmail.toLowerCase() === user.email.toLowerCase() || user.role === 'Admin');

  return (
    <div className="bg-dark text-white min-vh-100 py-5 mt-5">
      <div className="container py-4">
        {/* Profile Header */}
        <div className="card bg-dark border border-secondary rounded-4 p-4 mb-5 shadow-sm">
          <div className="row align-items-center">
            <div className="col-lg-auto text-center mb-3 mb-lg-0">
              <img
                src={user.avatar}
                alt={user.name}
                className="rounded-circle object-fit-cover border border-warning"
                style={{ width: '100px', height: '100px', borderWidth: '3px!important' }}
              />
            </div>
            <div className="col-lg">
              <div className="d-flex align-items-center gap-3 mb-1">
                <h1 className="h3 fw-bold mb-0" style={{ fontFamily: 'Georgia, serif' }}>{user.name}</h1>
                <span className="badge bg-warning text-dark px-3 py-1 fw-bold">{user.role}</span>
              </div>
              <p className="text-muted small mb-2 d-flex align-items-center gap-3">
                <span className="d-flex align-items-center gap-1"><Mail size={14} className="text-warning" /> {user.email}</span>
                <span className="d-flex align-items-center gap-1"><Phone size={14} className="text-warning" /> {user.phone}</span>
              </p>
            </div>
            <div className="col-lg-auto text-lg-end mt-3 mt-lg-0">
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
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label text-muted small">Email</label>
                  <input
                    type="email"
                    className="form-control bg-dark text-white border-secondary"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label text-muted small">Phone</label>
                  <input
                    type="text"
                    className="form-control bg-dark text-white border-secondary"
                    value={profileForm.phone}
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
                  <div className="col-lg-6" key={b.id}>
                    <div className="card bg-dark border border-secondary rounded-4 p-4 h-100 shadow-sm">
                      <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom border-secondary">
                        <div>
                          <span className="text-warning fw-bold">{b.id}</span>
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
                            onClick={() => showToast(`Invoice for ${b.id} downloaded successfully.`)}
                            className="btn btn-outline-light btn-sm d-flex align-items-center gap-1"
                          >
                            <FileText size={14} /> Receipt
                          </button>
                          {String(b.status).toLowerCase() === 'confirmed' && (
                            <button
                              onClick={() => cancelBooking(b.id)}
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
