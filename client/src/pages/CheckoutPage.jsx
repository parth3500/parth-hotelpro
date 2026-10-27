import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHotel } from '../context/HotelContext';
import { ShieldCheck, CreditCard, CheckCircle2, Lock, ArrowLeft, Calendar, Users } from 'lucide-react';

export const CheckoutPage = () => {
  const { bookingDraft, user, addBooking } = useHotel();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    guestName: user.name,
    guestEmail: user.email,
    phone: user.phone || '+1 (555) 019-2834',
    specialRequests: '',
    paymentMethod: 'Credit Card',
    cardNumber: '•••• •••• •••• 4242',
    cardExp: '12/28',
    cardCvc: '•••'
  });

  const [confirmedBooking, setConfirmedBooking] = useState(null);

  if (!bookingDraft) {
    return (
      <div className="bg-dark text-white min-vh-100 py-5 mt-5 d-flex align-items-center justify-content-center text-center">
        <div>
          <h3 className="fw-bold mb-3">No Active Booking in Progress</h3>
          <p className="text-muted mb-4">Please select a room and dates to begin your reservation.</p>
          <button onClick={() => navigate('/rooms')} className="btn" style={{ backgroundColor: '#d4a855', color: '#000', fontWeight: '600' }}>
            Explore Rooms
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const newBooking = addBooking({
      roomId: bookingDraft.roomId,
      roomName: bookingDraft.roomName,
      guestName: formData.guestName,
      guestEmail: formData.guestEmail,
      checkIn: bookingDraft.checkIn,
      checkOut: bookingDraft.checkOut,
      guests: bookingDraft.guests,
      totalPrice: bookingDraft.totalPrice,
      paymentMethod: formData.paymentMethod,
      specialRequests: formData.specialRequests
    });
    setConfirmedBooking(newBooking);
  };

  if (confirmedBooking) {
    return (
      <div className="bg-dark text-white min-vh-100 py-5 mt-5 d-flex align-items-center justify-content-center">
        <div className="container" style={{ maxWidth: '650px' }}>
          <div className="card bg-dark border border-secondary rounded-4 p-5 text-center shadow-lg">
            <div className="mb-4 text-success">
              <CheckCircle2 size={64} />
            </div>
            <span className="badge bg-success bg-opacity-25 text-success mb-3 px-3 py-2 align-self-center">Reservation Confirmed</span>
            <h1 className="fw-bold mb-2" style={{ fontFamily: 'Georgia, serif' }}>Thank You, {confirmedBooking.guestName}!</h1>
            <p className="text-muted mb-4">Your booking has been successfully confirmed. A confirmation email has been sent to <strong className="text-white">{confirmedBooking.guestEmail}</strong>.</p>

            <div className="bg-black p-4 rounded-4 border border-secondary text-start mb-4">
              <div className="d-flex justify-content-between mb-3 pb-2 border-bottom border-secondary">
                <span className="text-muted">Booking Reference</span>
                <span className="text-warning fw-bold">{confirmedBooking.id}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Accommodation</span>
                <span className="text-white fw-semibold">{confirmedBooking.roomName}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Dates</span>
                <span className="text-white">{confirmedBooking.checkIn} to {confirmedBooking.checkOut}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Guests</span>
                <span className="text-white">{confirmedBooking.guests} Guest(s)</span>
              </div>
              <div className="d-flex justify-content-between pt-2 border-top border-secondary">
                <span className="text-white fw-bold">Total Paid</span>
                <span className="text-warning fw-bold h5 mb-0">${confirmedBooking.totalPrice}</span>
              </div>
            </div>

            <div className="d-flex gap-3 justify-content-center">
              <button onClick={() => navigate('/profile')} className="btn px-4 py-2" style={{ backgroundColor: '#d4a855', color: '#000', fontWeight: '600' }}>
                View My Bookings
              </button>
              <button onClick={() => navigate('/')} className="btn btn-outline-light px-4 py-2">
                Return Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark text-white min-vh-100 py-5 mt-5">
      <div className="container py-4" style={{ maxWidth: '1000px' }}>
        <button onClick={() => navigate(-1)} className="btn btn-outline-light btn-sm mb-4 d-flex align-items-center gap-2">
          <ArrowLeft size={16} /> Back
        </button>

        <h1 className="display-5 fw-bold mb-5" style={{ fontFamily: 'Georgia, serif' }}>Secure Checkout</h1>

        <div className="row g-5">
          {/* Left: Guest & Payment Form */}
          <div className="col-lg-7">
            <form onSubmit={handleSubmit}>
              <div className="card bg-dark border border-secondary rounded-4 p-4 mb-4">
                <h4 className="fw-bold mb-4" style={{ fontFamily: 'Georgia, serif' }}>1. Guest Information</h4>
                <div className="mb-3">
                  <label className="form-label text-muted small fw-semibold">Full Name</label>
                  <input
                    type="text"
                    required
                    className="form-control bg-dark text-white border-secondary"
                    value={formData.guestName}
                    onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label text-muted small fw-semibold">Email Address</label>
                  <input
                    type="email"
                    required
                    className="form-control bg-dark text-white border-secondary"
                    value={formData.guestEmail}
                    onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label text-muted small fw-semibold">Phone Number</label>
                  <input
                    type="text"
                    required
                    className="form-control bg-dark text-white border-secondary"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="mb-0">
                  <label className="form-label text-muted small fw-semibold">Special Requests (Optional)</label>
                  <textarea
                    className="form-control bg-dark text-white border-secondary"
                    rows="2"
                    placeholder="High floor, quiet room, airport pickup..."
                    value={formData.specialRequests}
                    onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                  ></textarea>
                </div>
              </div>

              <div className="card bg-dark border border-secondary rounded-4 p-4 mb-4">
                <h4 className="fw-bold mb-4" style={{ fontFamily: 'Georgia, serif' }}>2. Payment Method</h4>
                <div className="d-flex gap-3 mb-4">
                  {['Credit Card', 'PayPal', 'Pay at Hotel'].map((method) => (
                    <button
                      type="button"
                      key={method}
                      onClick={() => setFormData({ ...formData, paymentMethod: method })}
                      className={`btn flex-grow-1 py-2 fw-semibold ${formData.paymentMethod === method ? 'btn-warning text-dark' : 'btn-outline-secondary text-light'}`}
                    >
                      {method}
                    </button>
                  ))}
                </div>

                {formData.paymentMethod === 'Credit Card' && (
                  <div>
                    <div className="mb-3">
                      <label className="form-label text-muted small fw-semibold">Card Number</label>
                      <div className="input-group">
                        <span className="input-group-text bg-dark text-secondary border-secondary"><CreditCard size={18} /></span>
                        <input
                          type="text"
                          className="form-control bg-dark text-white border-secondary"
                          value={formData.cardNumber}
                          onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-muted small fw-semibold">Expiration Date</label>
                        <input
                          type="text"
                          className="form-control bg-dark text-white border-secondary"
                          value={formData.cardExp}
                          onChange={(e) => setFormData({ ...formData, cardExp: e.target.value })}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-muted small fw-semibold">CVC / CVV</label>
                        <input
                          type="text"
                          className="form-control bg-dark text-white border-secondary"
                          value={formData.cardCvc}
                          onChange={(e) => setFormData({ ...formData, cardCvc: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="btn w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                style={{ backgroundColor: '#d4a855', color: '#000', fontSize: '1.1rem' }}
              >
                <Lock size={18} /> Confirm &amp; Pay ${bookingDraft.totalPrice}
              </button>
            </form>
          </div>

          {/* Right: Summary Card */}
          <div className="col-lg-5">
            <div className="card bg-dark border border-secondary rounded-4 p-4 sticky-top shadow-lg" style={{ top: '100px' }}>
              <h4 className="fw-bold mb-4" style={{ fontFamily: 'Georgia, serif' }}>Reservation Summary</h4>

              <div className="bg-black p-3 rounded-3 border border-secondary mb-4">
                <h5 className="fw-bold mb-1 text-white">{bookingDraft.roomName}</h5>
                <p className="text-muted small mb-3">Luxury Accommodation</p>
                <div className="d-flex align-items-center gap-2 text-muted small mb-2">
                  <Calendar size={16} className="text-warning" />
                  <span>{bookingDraft.checkIn} &rarr; {bookingDraft.checkOut}</span>
                </div>
                <div className="d-flex align-items-center gap-2 text-muted small">
                  <Users size={16} className="text-warning" />
                  <span>{bookingDraft.guests} Guest(s) &bull; {bookingDraft.nights} Night(s)</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2 small text-muted">
                  <span>Room Subtotal ({bookingDraft.nights} nights)</span>
                  <span>${bookingDraft.subtotal}</span>
                </div>
                <div className="d-flex justify-content-between mb-2 small text-muted">
                  <span>Taxes &amp; Resort Fee</span>
                  <span>${bookingDraft.taxes}</span>
                </div>
                <div className="d-flex justify-content-between mb-2 small text-muted">
                  <span>Cleaning Fee</span>
                  <span>${bookingDraft.cleaningFee}</span>
                </div>
                <hr style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                <div className="d-flex justify-content-between fw-bold text-white">
                  <span>Total Due</span>
                  <span className="text-warning h4 mb-0">${bookingDraft.totalPrice}</span>
                </div>
              </div>

              <div className="text-muted small d-flex align-items-center gap-2 pt-3 border-top border-secondary">
                <ShieldCheck size={16} className="text-warning" /> 256-Bit Bank-Grade Secure SSL Encryption
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
