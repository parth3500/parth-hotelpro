import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useHotel } from '../context/HotelContext';
import { Search, Filter, Star, Users, SlidersHorizontal } from 'lucide-react';

export const RoomCatalogPage = () => {
  const { rooms, setSelectedRoom } = useHotel();
  const navigate = useNavigate();
  const [urlParams] = useSearchParams();

  const [keyword, setKeyword] = useState('');
  const [selectedType, setSelectedType] = useState(urlParams.get('type') || 'All');
  const [maxPrice, setMaxPrice] = useState(700);
  const [guestCount, setGuestCount] = useState(parseInt(urlParams.get('guests')) || 1);
  const [selectedAmenity, setSelectedAmenity] = useState('All');
  const [sortBy, setSortBy] = useState('price-asc');

  const allAmenities = useMemo(() => {
    const set = new Set();
    rooms.forEach(r => (r.amenities || []).forEach(a => set.add(a)));
    return Array.from(set);
  }, [rooms]);

  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      const matchKeyword = (room.name || '').toLowerCase().includes(keyword.toLowerCase()) ||
                           (room.description || '').toLowerCase().includes(keyword.toLowerCase());
      const matchType = selectedType === 'All' || (room.type || '').toLowerCase() === selectedType.toLowerCase();
      const roomPrice = Number(room.price || room.pricePerNight || 0);
      const matchPrice = roomPrice <= maxPrice;
      const matchGuests = (Number(room.capacity) || 1) >= guestCount;
      const matchAmenity = selectedAmenity === 'All' || (room.amenities || []).includes(selectedAmenity);

      return matchKeyword && matchType && matchPrice && matchGuests && matchAmenity;
    }).sort((a, b) => {
      const priceA = Number(a.price || a.pricePerNight || 0);
      const priceB = Number(b.price || b.pricePerNight || 0);
      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return 0;
    });
  }, [rooms, keyword, selectedType, maxPrice, guestCount, selectedAmenity, sortBy]);

  return (
    <div className="bg-dark text-white min-vh-100 py-5 mt-5">
      <div className="container py-4">
        <div className="row mb-5 align-items-center">
          <div className="col-lg-6">
            <h6 className="text-warning text-uppercase tracking-wider small fw-bold">Explore Catalog</h6>
            <h1 className="display-5 fw-bold" style={{ fontFamily: 'Georgia, serif' }}>Our Accommodations</h1>
            <p className="text-muted">Find the ideal sanctuary tailored to your style and requirements.</p>
          </div>
          <div className="col-lg-6">
            <div className="input-group bg-dark border border-secondary rounded-pill p-1">
              <span className="input-group-text bg-transparent border-0 text-muted ps-3"><Search size={20} /></span>
              <input
                type="text"
                className="form-control bg-transparent text-white border-0 shadow-none"
                placeholder="Search suites, deluxe rooms, amenities..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* Filters Sidebar */}
          <div className="col-lg-3">
            <div className="card bg-dark border border-secondary rounded-4 p-4 sticky-top" style={{ top: '100px' }}>
              <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom border-secondary">
                <h5 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ fontFamily: 'Georgia, serif' }}>
                  <Filter size={18} className="text-warning" /> Filters
                </h5>
                <button
                  onClick={() => {
                    setKeyword('');
                    setSelectedType('All');
                    setMaxPrice(700);
                    setGuestCount(1);
                    setSelectedAmenity('All');
                  }}
                  className="btn btn-sm btn-link text-warning text-decoration-none p-0"
                >
                  Reset All
                </button>
              </div>

              {/* Room Type */}
              <div className="mb-4">
                <label className="form-label text-muted small fw-semibold">Room Type</label>
                <select
                  className="form-select bg-dark text-white border-secondary"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="All">All Types</option>
                  <option value="Suite">Suite</option>
                  <option value="Deluxe">Deluxe</option>
                  <option value="Executive">Executive</option>
                  <option value="Standard">Standard</option>
                </select>
              </div>

              {/* Max Price Slider */}
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-1">
                  <label className="form-label text-muted small fw-semibold">Max Price</label>
                  <span className="text-warning fw-bold">${maxPrice} / night</span>
                </div>
                <input
                  type="range"
                  className="form-range"
                  min="100"
                  max="700"
                  step="25"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                />
              </div>

              {/* Guests */}
              <div className="mb-4">
                <label className="form-label text-muted small fw-semibold">Minimum Capacity</label>
                <select
                  className="form-select bg-dark text-white border-secondary"
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                >
                  <option value={1}>1+ Guests</option>
                  <option value={2}>2+ Guests</option>
                  <option value={3}>3+ Guests</option>
                  <option value={4}>4+ Guests</option>
                </select>
              </div>

              {/* Amenities */}
              <div className="mb-3">
                <label className="form-label text-muted small fw-semibold">Required Amenity</label>
                <select
                  className="form-select bg-dark text-white border-secondary"
                  value={selectedAmenity}
                  onChange={(e) => setSelectedAmenity(e.target.value)}
                >
                  <option value="All">All Amenities</option>
                  {allAmenities.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Rooms Grid */}
          <div className="col-lg-9">
            <div className="d-flex justify-content-between align-items-center mb-4 bg-dark border border-secondary rounded-3 p-3">
              <span className="text-muted small">Showing <strong className="text-white">{filteredRooms.length}</strong> available rooms</span>
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted small d-none d-sm-inline">Sort by:</span>
                <select
                  className="form-select form-select-sm bg-dark text-white border-secondary"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{ width: '160px' }}
                >
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>

            {filteredRooms.length === 0 ? (
              <div className="text-center py-5 bg-dark border border-secondary rounded-4">
                <SlidersHorizontal size={48} className="text-muted mb-3" />
                <h4 className="fw-bold">No rooms match your criteria</h4>
                <p className="text-muted mb-4">Try adjusting your filters or search keywords.</p>
                <button
                  onClick={() => {
                    setSelectedType('All');
                    setMaxPrice(700);
                    setGuestCount(1);
                    setSelectedAmenity('All');
                    setKeyword('');
                  }}
                  className="btn"
                  style={{ backgroundColor: '#d4a855', color: '#000', fontWeight: '600' }}
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="row g-4">
                {filteredRooms.map(room => (
                  <div className="col-md-6 col-xl-4" key={room.id}>
                    <div className="card bg-dark border border-secondary text-white rounded-4 overflow-hidden h-100 shadow-sm hover-card">
                      <div className="position-relative" style={{ height: '220px' }}>
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
                          <h5 className="card-title fw-bold mb-0" style={{ fontFamily: 'Georgia, serif', fontSize: '1.15rem' }}>{room.name}</h5>
                          <div className="d-flex align-items-center gap-1 text-warning small">
                            <Star size={14} fill="#d4a855" />
                            <span>{room.rating}</span>
                          </div>
                        </div>
                        <p className="text-muted small mb-3 flex-grow-1">{(room.description || '').substring(0, 85)}...</p>
                        <div className="d-flex flex-wrap gap-1 mb-3">
                          {(room.amenities || []).slice(0, 3).map((am, i) => (
                            <span key={i} className="badge bg-secondary bg-opacity-25 text-light" style={{ fontSize: '0.7rem' }}>{am}</span>
                          ))}
                          {room.amenities && room.amenities.length > 3 && (
                            <span className="badge bg-secondary bg-opacity-25 text-muted" style={{ fontSize: '0.7rem' }}>+{room.amenities.length - 3}</span>
                          )}
                        </div>
                        <div className="d-flex justify-content-between align-items-center pt-3 border-top border-secondary">
                          <span className="small text-muted d-flex align-items-center gap-1"><Users size={14} /> {room.capacity || 2} Guests</span>
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
