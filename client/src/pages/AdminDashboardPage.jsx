import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { Building2, Calendar, Users, DollarSign, Plus, Trash2, Star, XCircle } from 'lucide-react';

export const AdminDashboardPage = () => {
  const { rooms, bookings, staff, addRoom, deleteRoom, addStaff, deleteStaff, cancelBooking, showToast } = useHotel();
  const [activeTab, setActiveTab] = useState('overview');

  // New Room Form State
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [newRoomForm, setNewRoomForm] = useState({
    name: '',
    type: 'Deluxe',
    price: 200,
    capacity: 2,
    size: '40 m²',
    bed: '1 King Bed',
    image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80',
    description: '',
    amenities: 'Free Wi-Fi, Air Conditioning, Smart TV, Safe'
  });

  // New Staff Form State
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffForm, setNewStaffForm] = useState({
    name: '',
    role: 'Front Desk',
    department: 'Front Office',
    email: '',
    status: 'Active'
  });

  const totalRevenue = bookings.filter(b => String(b.status).toLowerCase() !== 'cancelled').reduce((acc, b) => acc + (Number(b.totalPrice) || 0), 0);
  const activeBookingsCount = bookings.filter(b => String(b.status).toLowerCase() === 'confirmed').length;
  const occupancyRate = Math.round((activeBookingsCount / Math.max(rooms.length, 1)) * 100);

  const handleCreateRoom = (e) => {
    e.preventDefault();
    addRoom({
      ...newRoomForm,
      price: Number(newRoomForm.price),
      capacity: Number(newRoomForm.capacity),
      amenities: newRoomForm.amenities.split(',').map(s => s.trim())
    });
    setShowAddRoomModal(false);
    setNewRoomForm({
      name: '',
      type: 'Deluxe',
      price: 200,
      capacity: 2,
      size: '40 m²',
      bed: '1 King Bed',
      image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80',
      description: '',
      amenities: 'Free Wi-Fi, Air Conditioning, Smart TV, Safe'
    });
  };

  const handleCreateStaff = (e) => {
    e.preventDefault();
    addStaff(newStaffForm);
    setShowAddStaffModal(false);
    setNewStaffForm({
      name: '',
      role: 'Front Desk',
      department: 'Front Office',
      email: '',
      status: 'Active'
    });
  };

  return (
    <div className="bg-dark text-white min-vh-100 py-5 mt-5">
      <div className="container py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h6 className="text-warning text-uppercase tracking-wider small fw-bold">Management Control Center</h6>
            <h1 className="display-5 fw-bold" style={{ fontFamily: 'Georgia, serif' }}>Admin Dashboard</h1>
          </div>
          <span className="badge bg-warning text-dark px-3 py-2 fw-bold">Staff Access Granted</span>
        </div>

        {/* Stats Row */}
        <div className="row g-4 mb-5">
          <div className="col-md-3">
            <div className="card bg-dark border border-secondary rounded-4 p-4 h-100 shadow-sm">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted small">Total Revenue</span>
                <DollarSign className="text-warning" size={24} />
              </div>
              <h3 className="fw-bold text-white mb-0">${totalRevenue.toLocaleString()}</h3>
              <small className="text-success mt-1 d-block">+14.2% from last month</small>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-dark border border-secondary rounded-4 p-4 h-100 shadow-sm">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted small">Active Bookings</span>
                <Calendar className="text-warning" size={24} />
              </div>
              <h3 className="fw-bold text-white mb-0">{activeBookingsCount}</h3>
              <small className="text-muted mt-1 d-block">{bookings.length} total reservations</small>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-dark border border-secondary rounded-4 p-4 h-100 shadow-sm">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted small">Room Inventory</span>
                <Building2 className="text-warning" size={24} />
              </div>
              <h3 className="fw-bold text-white mb-0">{rooms.length} Rooms</h3>
              <small className="text-success mt-1 d-block">{occupancyRate}% occupancy rate</small>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-dark border border-secondary rounded-4 p-4 h-100 shadow-sm">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted small">Staff Roster</span>
                <Users className="text-warning" size={24} />
              </div>
              <h3 className="fw-bold text-white mb-0">{staff.length} Active</h3>
              <small className="text-muted mt-1 d-block">All departments staffed</small>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <ul className="nav nav-tabs border-bottom border-secondary mb-4">
          <li className="nav-item">
            <button
              className={`nav-link text-white bg-transparent border-0 px-4 py-3 fw-semibold ${activeTab === 'overview' ? 'border-bottom border-warning border-3 text-warning' : 'text-muted'}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview &amp; Analytics
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link text-white bg-transparent border-0 px-4 py-3 fw-semibold ${activeTab === 'rooms' ? 'border-bottom border-warning border-3 text-warning' : 'text-muted'}`}
              onClick={() => setActiveTab('rooms')}
            >
              Room Inventory ({rooms.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link text-white bg-transparent border-0 px-4 py-3 fw-semibold ${activeTab === 'bookings' ? 'border-bottom border-warning border-3 text-warning' : 'text-muted'}`}
              onClick={() => setActiveTab('bookings')}
            >
              Bookings ({bookings.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link text-white bg-transparent border-0 px-4 py-3 fw-semibold ${activeTab === 'staff' ? 'border-bottom border-warning border-3 text-warning' : 'text-muted'}`}
              onClick={() => setActiveTab('staff')}
            >
              Staff Roster ({staff.length})
            </button>
          </li>
        </ul>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="card bg-dark border border-secondary rounded-4 p-4 h-100">
                <h4 className="fw-bold mb-4" style={{ fontFamily: 'Georgia, serif' }}>Recent Activity Feed</h4>
                <div className="d-flex flex-column gap-3">
                  {bookings.slice(0, 5).map(b => (
                    <div key={b.id} className="d-flex align-items-center justify-content-between p-3 rounded-3 bg-black border border-secondary">
                      <div>
                        <h6 className="fw-bold mb-1">{b.guestName} booked {b.roomName}</h6>
                        <small className="text-muted">{b.checkIn} to {b.checkOut} &bull; Ref: {b.id}</small>
                      </div>
                      <span className="text-warning fw-bold">${b.totalPrice}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="card bg-dark border border-secondary rounded-4 p-4 h-100">
                <h4 className="fw-bold mb-4" style={{ fontFamily: 'Georgia, serif' }}>Quick Actions</h4>
                <div className="d-grid gap-3">
                  <button onClick={() => { setActiveTab('rooms'); setShowAddRoomModal(true); }} className="btn btn-outline-warning py-2 text-start d-flex align-items-center justify-content-between">
                    <span>Add New Room</span> <Plus size={18} />
                  </button>
                  <button onClick={() => { setActiveTab('staff'); setShowAddStaffModal(true); }} className="btn btn-outline-warning py-2 text-start d-flex align-items-center justify-content-between">
                    <span>Add Staff Member</span> <Plus size={18} />
                  </button>
                  <button onClick={() => showToast("System maintenance and cache cleared successfully.")} className="btn btn-outline-light py-2 text-start">
                    Clear System Cache
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Rooms */}
        {activeTab === 'rooms' && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="fw-bold mb-0" style={{ fontFamily: 'Georgia, serif' }}>Room Inventory</h4>
              <button onClick={() => setShowAddRoomModal(true)} className="btn btn-sm d-flex align-items-center gap-2" style={{ backgroundColor: '#d4a855', color: '#000', fontWeight: '600' }}>
                <Plus size={16} /> Add Room
              </button>
            </div>

            {showAddRoomModal && (
              <div className="card bg-dark border border-warning rounded-4 p-4 mb-4">
                <h5 className="fw-bold mb-3 text-warning">Add New Accommodation</h5>
                <form onSubmit={handleCreateRoom}>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label text-muted small">Room Name</label>
                      <input type="text" required className="form-control bg-dark text-white border-secondary" value={newRoomForm.name} onChange={(e) => setNewRoomForm({ ...newRoomForm, name: e.target.value })} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label text-muted small">Type</label>
                      <select className="form-select bg-dark text-white border-secondary" value={newRoomForm.type} onChange={(e) => setNewRoomForm({ ...newRoomForm, type: e.target.value })}>
                        <option value="Suite">Suite</option>
                        <option value="Deluxe">Deluxe</option>
                        <option value="Executive">Executive</option>
                        <option value="Standard">Standard</option>
                      </select>
                    </div>
                    <div className="col-md-2">
                      <label className="form-label text-muted small">Price ($/night)</label>
                      <input type="number" required className="form-control bg-dark text-white border-secondary" value={newRoomForm.price} onChange={(e) => setNewRoomForm({ ...newRoomForm, price: e.target.value })} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label text-muted small">Capacity (Guests)</label>
                      <input type="number" required className="form-control bg-dark text-white border-secondary" value={newRoomForm.capacity} onChange={(e) => setNewRoomForm({ ...newRoomForm, capacity: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small">Image URL</label>
                      <input type="text" required className="form-control bg-dark text-white border-secondary" value={newRoomForm.image} onChange={(e) => setNewRoomForm({ ...newRoomForm, image: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small">Amenities (comma separated)</label>
                      <input type="text" className="form-control bg-dark text-white border-secondary" value={newRoomForm.amenities} onChange={(e) => setNewRoomForm({ ...newRoomForm, amenities: e.target.value })} />
                    </div>
                    <div className="col-12">
                      <label className="form-label text-muted small">Description</label>
                      <textarea className="form-control bg-dark text-white border-secondary" rows="2" value={newRoomForm.description} onChange={(e) => setNewRoomForm({ ...newRoomForm, description: e.target.value })}></textarea>
                    </div>
                    <div className="col-12 text-end">
                      <button type="button" onClick={() => setShowAddRoomModal(false)} className="btn btn-outline-light btn-sm me-2">Cancel</button>
                      <button type="submit" className="btn btn-sm px-4" style={{ backgroundColor: '#d4a855', color: '#000', fontWeight: '600' }}>Save Room</button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle border border-secondary">
                <thead>
                  <tr className="text-muted small">
                    <th>Room</th>
                    <th>Type</th>
                    <th>Price</th>
                    <th>Capacity</th>
                    <th>Rating</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map(room => (
                    <tr key={room.id}>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <img src={room.image} alt={room.name} className="rounded object-fit-cover" style={{ width: '45px', height: '40px' }} />
                          <span className="fw-semibold">{room.name}</span>
                        </div>
                      </td>
                      <td><span className="badge bg-secondary bg-opacity-25 text-light">{room.type}</span></td>
                      <td className="text-warning fw-bold">${room.price}</td>
                      <td>{room.capacity} Guests</td>
                      <td>
                        <span className="d-flex align-items-center gap-1 text-warning">
                          <Star size={14} fill="#d4a855" /> {room.rating}
                        </span>
                      </td>
                      <td className="text-end">
                        <button onClick={() => deleteRoom(room.id)} className="btn btn-outline-danger btn-sm">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Bookings */}
        {activeTab === 'bookings' && (
          <div>
            <h4 className="fw-bold mb-4" style={{ fontFamily: 'Georgia, serif' }}>All Guest Reservations</h4>
            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle border border-secondary">
                <thead>
                  <tr className="text-muted small">
                    <th>Ref ID</th>
                    <th>Guest Name</th>
                    <th>Accommodation</th>
                    <th>Dates</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id}>
                      <td className="text-warning fw-bold">{b.id}</td>
                      <td>
                        <div className="fw-semibold">{b.guestName}</div>
                        <small className="text-muted">{b.guestEmail}</small>
                      </td>
                      <td>{b.roomName}</td>
                      <td>{b.checkIn} &rarr; {b.checkOut}</td>
                      <td className="text-warning fw-bold">${b.totalPrice}</td>
                      <td>
                        <span className={`badge px-2 py-1 ${String(b.status).toLowerCase() === 'confirmed' ? 'bg-success bg-opacity-25 text-success' : 'bg-danger bg-opacity-25 text-danger'}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="text-end">
                        {String(b.status).toLowerCase() === 'confirmed' && (
                          <button onClick={() => cancelBooking(b.id)} className="btn btn-outline-danger btn-sm" title="Cancel Booking">
                            <XCircle size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Staff Roster */}
        {activeTab === 'staff' && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="fw-bold mb-0" style={{ fontFamily: 'Georgia, serif' }}>Staff Roster &amp; Departments</h4>
              <button onClick={() => setShowAddStaffModal(true)} className="btn btn-sm d-flex align-items-center gap-2" style={{ backgroundColor: '#d4a855', color: '#000', fontWeight: '600' }}>
                <Plus size={16} /> Add Staff
              </button>
            </div>

            {showAddStaffModal && (
              <div className="card bg-dark border border-warning rounded-4 p-4 mb-4">
                <h5 className="fw-bold mb-3 text-warning">Add Staff Member</h5>
                <form onSubmit={handleCreateStaff}>
                  <div className="row g-3">
                    <div className="col-md-3">
                      <label className="form-label text-muted small">Full Name</label>
                      <input type="text" required className="form-control bg-dark text-white border-secondary" value={newStaffForm.name} onChange={(e) => setNewStaffForm({ ...newStaffForm, name: e.target.value })} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label text-muted small">Role / Title</label>
                      <input type="text" required className="form-control bg-dark text-white border-secondary" value={newStaffForm.role} onChange={(e) => setNewStaffForm({ ...newStaffForm, role: e.target.value })} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label text-muted small">Department</label>
                      <input type="text" required className="form-control bg-dark text-white border-secondary" value={newStaffForm.department} onChange={(e) => setNewStaffForm({ ...newStaffForm, department: e.target.value })} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label text-muted small">Email</label>
                      <input type="email" required className="form-control bg-dark text-white border-secondary" value={newStaffForm.email} onChange={(e) => setNewStaffForm({ ...newStaffForm, email: e.target.value })} />
                    </div>
                    <div className="col-12 text-end">
                      <button type="button" onClick={() => setShowAddStaffModal(false)} className="btn btn-outline-light btn-sm me-2">Cancel</button>
                      <button type="submit" className="btn btn-sm px-4" style={{ backgroundColor: '#d4a855', color: '#000', fontWeight: '600' }}>Save Staff</button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle border border-secondary">
                <thead>
                  <tr className="text-muted small">
                    <th>Name</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map(s => (
                    <tr key={s.id}>
                      <td className="fw-semibold">{s.name}</td>
                      <td>{s.role}</td>
                      <td><span className="badge bg-secondary bg-opacity-25 text-light">{s.department}</span></td>
                      <td className="text-muted">{s.email}</td>
                      <td><span className="badge bg-success bg-opacity-25 text-success">{s.status}</span></td>
                      <td className="text-end">
                        <button onClick={() => deleteStaff(s.id)} className="btn btn-outline-danger btn-sm">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
