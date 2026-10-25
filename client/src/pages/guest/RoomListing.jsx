import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import API from '../../services/api'
import { fetchRoomsStart, fetchRoomsSuccess, fetchRoomsFailure } from '../../store/roomSlice'

export default function RoomListing() {
  const dispatch = useDispatch()
  const { list: rooms, loading, error } = useSelector((state) => state.rooms)
  const [filterType, setFilterType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const loadRooms = async () => {
      dispatch(fetchRoomsStart())
      try {
        const res = await API.get('/rooms')
        dispatch(fetchRoomsSuccess(res.data.rooms || res.data || []))
      } catch (err) {
        dispatch(fetchRoomsFailure(err.message || 'Failed to fetch rooms'))
      }
    }
    loadRooms()
  }, [dispatch])

  const filteredRooms = rooms.filter((room) => {
    const matchesType = filterType === 'all' || room.type?.toLowerCase() === filterType.toLowerCase()
    const matchesSearch =
      (room.roomNumber && room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (room.type && room.type.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (room.description && room.description.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesType && matchesSearch
  })

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-1">Explore Available Rooms</h2>
          <p className="text-muted mb-0">Find the perfect accommodations for your stay</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card shadow-sm border-0 mb-4 p-3">
        <div className="row g-3">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by room number, features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-6">
            <select
              className="form-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Room Types</option>
              <option value="standard">Standard</option>
              <option value="deluxe">Deluxe</option>
              <option value="suite">Suite</option>
              <option value="presidential">Presidential</option>
            </select>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2 text-muted">Loading rooms...</p>
        </div>
      )}

      {error && (
        <div className="alert alert-danger shadow-sm">
          <i className="bi bi-exclamation-triangle me-2"></i> {error}
        </div>
      )}

      {!loading && !error && filteredRooms.length === 0 && (
        <div className="text-center py-5 bg-white rounded-3 shadow-sm p-4">
          <i className="bi bi-door-closed fs-1 text-muted d-block mb-3"></i>
          <h4>No rooms found</h4>
          <p className="text-muted">No rooms match your search or filter criteria.</p>
        </div>
      )}

      {/* Rooms Grid */}
      <div className="row g-4">
        {filteredRooms.map((room) => (
          <div key={room._id || room.id} className="col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm border-0 overflow-hidden">
              <div
                style={{
                  height: '180px',
                  backgroundColor: '#e9ecef',
                  backgroundImage: `url(${room.imageUrl || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80'})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              ></div>
              <div className="card-body d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h5 className="card-title fw-bold mb-0">Room {room.roomNumber}</h5>
                  <span className="badge bg-primary text-capitalize">{room.type || 'Standard'}</span>
                </div>
                <p className="card-text text-muted small flex-grow-1">
                  {room.description || 'Spacious, well-appointed room featuring premium bedding and modern amenities.'}
                </p>
                <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                  <div>
                    <span className="fs-5 fw-bold text-hotel">${room.pricePerNight || room.basePrice || 120}</span>
                    <span className="text-muted small"> / night</span>
                  </div>
                  <div className="d-flex gap-2">
                    <Link to={`/rooms/${room._id || room.id}`} className="btn btn-outline-primary btn-sm">
                      Details
                    </Link>
                    <Link to={`/guest/book/${room._id || room.id}`} className="btn btn-warning btn-sm fw-semibold">
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
