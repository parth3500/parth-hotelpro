import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHotel } from '../context/HotelContext';
import { Star, Users, Maximize, Bed, CheckCircle2, ArrowLeft, Calendar, ShieldCheck, Sparkles } from 'lucide-react';

export const RoomDetailPage = () => {
  const { id } = useParams();
  const { rooms, setSelectedRoom, setBookingDraft } = useHotel();
  const navigate = useNavigate();

  const room = rooms.find(r => String(r.id || r._id) === String(id)) || rooms[0];

  const [selectedImage, setSelectedImage] = useState(null);
  const activeImage = selectedImage || (room ? (room.image || (room.images && room.images[0]) || '') : '');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);

  useEffect(() => {
    if (room) {
      setSelectedRoom(room);
    }
  }, [room, setSelectedRoom]);

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 1;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  const nights = calculateNights();
  const subtotal = room ? nights * room.price : 0;
  const taxes = Math.round(subtotal * 0.12);
  const cleaningFee = 50;
  const total = subtotal + taxes + cleaningFee;

  const handleProceedToCheckout = (e) => {
    e.preventDefault();
    if (!checkIn || !checkOut) {
      alert('Please select both check-in and check-out dates.');
      return;
    }
    if (new Date(checkOut) <= new Date(checkIn)) {
      alert('Check-out date must be after check-in date.');
      return;
    }
    setBookingDraft({
      roomId: room.id || room._id,
      roomName: room.name,
      checkIn,
      checkOut,
      guests,
      nights,
      pricePerNight: room.price,
      subtotal,
      taxes,
      cleaningFee,
      totalPrice: total
    });
    navigate('/checkout');
  };

  if (!room) {
    return (
      <div className="bg-dark text-white min-vh-100 py-5 mt-5 d-flex align-items-center justify-content-center text-center">
        <div>
          <h3 className="fw-bold mb-3">Room Not Found</h3>
          <p className="text-muted mb-4">The room you are looking for could not be found.</p>
          <button onClick={() => navigate('/rooms')} className="btn" style={{ backgroundColor: '#d4a855', color: '#000', fontWeight: '600' }}>
            Back to Rooms
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark text-white min-vh-100 py-5 mt-5">
      <div className="container py-4">
        <button onClick={() => navigate('/rooms')} className="btn btn-outline-light btn-sm mb-4 d-flex align-items-center gap-2">
          <ArrowLeft size={16} /> Back to Rooms
        </button>

        <div className="row g-5">
          {/* Left Column: Gallery & Details */}
          <div className="col-lg-8">
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <span className="badge bg-warning text-dark mb-2 fw-bold">{room.type}</span>
                  <h1 className="display-5 fw-bold" style={{ fontFamily: 'Georgia, serif' }}>{room.name}</h1>
                </div>
                <div className="text-end">
                  <div className="h3 text-warning fw-bold mb-0">${room.price}</div>
                  <small className="text-muted">per night</small>
                </div>
              </div>

              <div className="d-flex align-items-center gap-3 text-muted small mb-4">
                <div className="d-flex align-items-center gap-1 text-warning">
                  <Star size={16} fill="#d4a855" />
                  <span className="fw-bold">{room.rating}</span>
                  <span>({room.reviewsCount} reviews)</span>
                </div>
                <span>&bull;</span>
                <span className="d-flex align-items-center gap-1"><Maximize size={16} /> {room.size || '42 m²'}</span>
                <span>&bull;</span>
                <span className="d-flex align-items-center gap-1"><Bed size={16} /> {room.bed || '1 King Bed'}</span>
                <span>&bull;</span>
                <span className="d-flex align-items-center gap-1"><Users size={16} /> Up to {room.capacity || 2} Guests</span>
              </div>
            </div>

            {/* Main Gallery Image */}
            <div className="mb-3 rounded-4 overflow-hidden border border-secondary" style={{ height: '420px' }}>
              <img src={activeImage} alt={room.name} className="w-100 h-100 object-fit-cover" />
            </div>

            {/* Thumbnails */}
            {room.images && room.images.length > 1 && (
              <div className="d-flex gap-3 mb-5">
                {room.images.map((img, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedImage(img)}
                    className={`rounded-3 overflow-hidden border cursor-pointer ${activeImage === img ? 'border-warning' : 'border-secondary'}`}
                    style={{ width: '90px', height: '70px', cursor: 'pointer' }}
                  >
                    <img src={img} alt="thumb" className="w-100 h-100 object-fit-cover" />
                  </div>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="mb-5">
              <h4 className="fw-bold mb-3" style={{ fontFamily: 'Georgia, serif' }}>About This Sanctuary</h4>
              <p className="text-muted lh-lg" style={{ fontSize: '1.05rem' }}>{room.description}</p>
            </div>

            {/* Amenities */}
            <div>
              <h4 className="fw-bold mb-4" style={{ fontFamily: 'Georgia, serif' }}>Room Amenities &amp; Features</h4>
              <div className="row g-3">
                {(room.amenities || []).map((amenity, index) => (
                  <div className="col-md-4 col-sm-6" key={index}>
                    <div className="d-flex align-items-center gap-2 p-3 rounded-3 border border-secondary bg-dark">
                      <CheckCircle2 size={18} className="text-warning" />
                      <span className="small">{amenity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Booking Widget Card */}
          <div className="col-lg-4">
            <div className="card bg-dark border border-secondary rounded-4 p-4 sticky-top shadow-lg" style={{ top: '100px' }}>
              <h4 className="fw-bold mb-4" style={{ fontFamily: 'Georgia, serif' }}>Book Your Stay</h4>

              <form onSubmit={handleProceedToCheckout}>
                <div className="mb-3">
                  <label className="form-label text-muted small fw-semibold"><Calendar size={14} className="me-1 text-warning" /> Check-in Date</label>
                  <input
                    type="date"
                    required
                    className="form-control bg-dark text-white border-secondary"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label text-muted small fw-semibold"><Calendar size={14} className="me-1 text-warning" /> Check-out Date</label>
                  <input
                    type="date"
                    required
                    className="form-control bg-dark text-white border-secondary"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label text-muted small fw-semibold"><Users size={14} className="me-1 text-warning" /> Guests</label>
                  <select
                    className="form-select bg-dark text-white border-secondary"
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                  >
                    {[...Array(Math.max(1, parseInt(room.capacity, 10) || 1))].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1} Guest{i > 0 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                {/* Price Breakdown */}
                <div className="bg-black p-3 rounded-3 border border-secondary mb-4">
                  <div className="d-flex justify-content-between mb-2 small text-muted">
                    <span>${room.price} &times; {nights} night{nights > 1 ? 's' : ''}</span>
                    <span>${subtotal}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2 small text-muted">
                    <span>Taxes &amp; Resort Fee (12%)</span>
                    <span>${taxes}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2 small text-muted">
                    <span>Cleaning &amp; Sanitization</span>
                    <span>${cleaningFee}</span>
                  </div>
                  <hr style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                  <div className="d-flex justify-content-between fw-bold text-white">
                    <span>Total Amount</span>
                    <span className="text-warning h5 mb-0">${total}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                  style={{ backgroundColor: '#d4a855', color: '#000', fontSize: '1.05rem' }}
                >
                  <Sparkles size={18} /> Proceed to Checkout
                </button>
              </form>

              <div className="mt-4 pt-3 border-top border-secondary text-center text-muted small d-flex align-items-center justify-content-center gap-2">
                <ShieldCheck size={16} className="text-warning" /> Free cancellation up to 48 hours prior to check-in
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
