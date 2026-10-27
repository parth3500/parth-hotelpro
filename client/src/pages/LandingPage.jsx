import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHotel } from '../context/HotelContext';
import { testimonials } from '../data/mockData';
import { Search, Calendar, Users, Star, ArrowRight, ShieldCheck, Wifi, Award, Sparkles } from 'lucide-react';

export const LandingPage = () => {
  const { rooms, setSelectedRoom } = useHotel();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useState({
    checkIn: '',
    checkOut: '',
    guests: 2,
    type: 'All'
  });

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/rooms?type=${searchParams.type}&guests=${searchParams.guests}`);
  };

  return (
    <div className="bg-dark text-white min-vh-100">
      {/* Hero Section */}
      <div className="position-relative d-flex align-items-center justify-content-center text-center"
        style={{
          minHeight: '85vh',
          background: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url("https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80") center/cover no-repeat',
          paddingTop: '80px'
        }}>
        <div className="container position-relative z-2 py-5">
          <span className="badge px-3 py-2 mb-3 text-uppercase tracking-wide" style={{ backgroundColor: 'rgba(212,168,85,0.2)', color: '#d4a855', border: '1px solid #d4a855', fontSize: '0.75rem', letterSpacing: '0.15em' }}>
            Unrivaled Elegance &amp; Hospitality
          </span>
          <h1 className="display-3 fw-bold mb-4" style={{ fontFamily: 'Georgia, serif', maxWidth: '800px', margin: '0 auto', lineHeight: '1.2' }}>
            Where Luxury Meets Ultimate Tranquility
          </h1>
          <p className="lead mb-5 text-light opacity-85" style={{ maxWidth: '600px', margin: '0 auto', fontSize: '1.15rem' }}>
            Experience world-class accommodations, breathtaking views, and uncompromising personalized service.
          </p>

          {/* Quick Search Widget */}
          <div className="card bg-dark border border-secondary shadow-lg p-4 mx-auto rounded-4 text-start" style={{ maxWidth: '950px', backgroundColor: 'rgba(18,18,18,0.95)!important', backdropFilter: 'blur(10px)' }}>
            <form onSubmit={handleSearch} className="row g-3 align-items-end">
              <div className="col-md-3">
                <label className="form-label text-muted small fw-semibold"><Calendar size={14} className="me-1 text-warning" /> Check-in</label>
                <input
                  type="date"
                  className="form-control bg-dark text-white border-secondary"
                  value={searchParams.checkIn}
                  onChange={(e) => setSearchParams({ ...searchParams, checkIn: e.target.value })}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label text-muted small fw-semibold"><Calendar size={14} className="me-1 text-warning" /> Check-out</label>
                <input
                  type="date"
                  className="form-control bg-dark text-white border-secondary"
                  value={searchParams.checkOut}
                  onChange={(e) => setSearchParams({ ...searchParams, checkOut: e.target.value })}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label text-muted small fw-semibold"><Users size={14} className="me-1 text-warning" /> Guests</label>
                <select
                  className="form-select bg-dark text-white border-secondary"
                  value={searchParams.guests}
                  onChange={(e) => setSearchParams({ ...searchParams, guests: e.target.value })}
                >
                  <option value={1}>1 Guest</option>
                  <option value={2}>2 Guests</option>
                  <option value={3}>3 Guests</option>
                  <option value={4}>4+ Guests</option>
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label text-muted small fw-semibold">Room Type</label>
                <select
                  className="form-select bg-dark text-white border-secondary"
                  value={searchParams.type}
                  onChange={(e) => setSearchParams({ ...searchParams, type: e.target.value })}
                >
                  <option value="All">All Types</option>
                  <option value="Suite">Suite</option>
                  <option value="Deluxe">Deluxe</option>
                  <option value="Executive">Executive</option>
                  <option value="Standard">Standard</option>
                </select>
              </div>
              <div className="col-md-2">
                <button type="submit" className="btn w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
                  style={{ backgroundColor: '#d4a855', color: '#000', transition: 'all 0.2s' }}>
                  <Search size={18} /> Explore
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Highlights / Features */}
      <div className="py-5 bg-black">
        <div className="container py-4">
          <div className="text-center mb-5">
            <h6 className="text-warning text-uppercase tracking-wider small fw-bold">Why Choose HotelPro</h6>
            <h2 className="fw-bold" style={{ fontFamily: 'Georgia, serif' }}>An Extraordinary Experience</h2>
          </div>
          <div className="row g-4 text-center">
            <div className="col-md-3">
              <div className="p-4 rounded-4 border border-secondary bg-dark h-100">
                <div className="mb-3 text-warning"><Award size={36} /></div>
                <h5 className="fw-bold mb-2">5-Star Luxury</h5>
                <p className="text-muted small mb-0">Award-winning accommodations designed with supreme elegance and comfort.</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-4 rounded-4 border border-secondary bg-dark h-100">
                <div className="mb-3 text-warning"><Sparkles size={36} /></div>
                <h5 className="fw-bold mb-2">24/7 Butler Service</h5>
                <p className="text-muted small mb-0">Dedicated concierge and butler service ready to cater to your every request.</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-4 rounded-4 border border-secondary bg-dark h-100">
                <div className="mb-3 text-warning"><Wifi size={36} /></div>
                <h5 className="fw-bold mb-2">Ultra-Fast Wi-Fi</h5>
                <p className="text-muted small mb-0">Complimentary high-speed fiber internet throughout the entire estate.</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-4 rounded-4 border border-secondary bg-dark h-100">
                <div className="mb-3 text-warning"><ShieldCheck size={36} /></div>
                <h5 className="fw-bold mb-2">Secure &amp; Private</h5>
                <p className="text-muted small mb-0">State-of-the-art security and absolute privacy guaranteed for all guests.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Rooms */}
      <div className="py-5" style={{ backgroundColor: '#111' }}>
        <div className="container py-4">
          <div className="d-flex justify-content-between align-items-end mb-5">
            <div>
              <h6 className="text-warning text-uppercase tracking-wider small fw-bold">Curated Spaces</h6>
              <h2 className="fw-bold mb-0" style={{ fontFamily: 'Georgia, serif' }}>Featured Accommodations</h2>
            </div>
            <button onClick={() => navigate('/rooms')} className="btn btn-outline-light d-flex align-items-center gap-2">
              View All Rooms <ArrowRight size={16} />
            </button>
          </div>

          <div className="row g-4">
            {rooms.slice(0, 3).map((room) => (
              <div className="col-lg-4 col-md-6" key={room.id}>
                <div className="card bg-dark border border-secondary text-white rounded-4 overflow-hidden h-100 shadow-sm hover-card">
                  <div className="position-relative" style={{ height: '240px' }}>
                    <img src={room.image} alt={room.name} className="w-100 h-100 object-fit-cover" />
                    <span className="position-absolute top-0 end-0 m-3 badge bg-dark text-warning border border-warning px-3 py-2">
                      ${room.price} / night
                    </span>
                    <span className="position-absolute bottom-0 start-0 m-3 badge bg-black bg-opacity-75 text-light px-2 py-1">
                      {room.type}
                    </span>
                  </div>
                  <div className="card-body d-flex flex-column p-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h5 className="card-title fw-bold mb-0" style={{ fontFamily: 'Georgia, serif' }}>{room.name}</h5>
                      <div className="d-flex align-items-center gap-1 text-warning small">
                        <Star size={14} fill="#d4a855" />
                        <span>{room.rating}</span>
                      </div>
                    </div>
                    <p className="text-muted small mb-3 flex-grow-1">{room.description.substring(0, 95)}...</p>
                    <div className="d-flex justify-content-between align-items-center pt-3 border-top border-secondary">
                      <span className="small text-muted">{room.size} &bull; {room.bed}</span>
                      <button
                        onClick={() => {
                          setSelectedRoom(room);
                          navigate(`/rooms/${room.id}`);
                        }}
                        className="btn btn-sm"
                        style={{ backgroundColor: '#d4a855', color: '#000', fontWeight: '600' }}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-5 bg-black">
        <div className="container py-4">
          <div className="text-center mb-5">
            <h6 className="text-warning text-uppercase tracking-wider small fw-bold">Testimonials</h6>
            <h2 className="fw-bold" style={{ fontFamily: 'Georgia, serif' }}>What Our Guests Say</h2>
          </div>
          <div className="row g-4">
            {testimonials.map((t) => (
              <div className="col-md-4" key={t.id}>
                <div className="p-4 rounded-4 border border-secondary bg-dark h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex gap-1 text-warning mb-3">
                      {[...Array(Math.max(1, Math.round(t.rating) || 5))].map((_, i) => (
                        <Star key={i} size={16} fill="#d4a855" />
                      ))}
                    </div>
                    <p className="text-light italic mb-4" style={{ fontSize: '0.95rem' }}>"{t.comment}"</p>
                  </div>
                  <div className="d-flex align-items-center gap-3 pt-3 border-top border-secondary">
                    <img src={t.avatar} alt={t.name} className="rounded-circle object-fit-cover" style={{ width: '45px', height: '45px' }} />
                    <div>
                      <h6 className="fw-bold mb-0 text-white">{t.name}</h6>
                      <small className="text-muted">{t.role}</small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
