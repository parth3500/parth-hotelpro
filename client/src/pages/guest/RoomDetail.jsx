import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import API from '../../services/api'

export default function RoomDetail() {
  const { id } = useParams()
  const [room, setRoom] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await API.get(`/rooms/${id}`)
        setRoom(res.data.room || res.data)

        // Try fetching reviews for this room
        try {
          const revRes = await API.get(`/reviews/room/${id}`)
          setReviews(revRes.data.reviews || [])
        } catch {
          // reviews optional
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load room details')
      } finally {
        setLoading(false)
      }
    }
    fetchDetails()
  }, [id])

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    )
  }

  if (error || !room) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error || 'Room not found'}</div>
        <Link to="/rooms" className="btn btn-outline-primary">Back to Rooms</Link>
      </div>
    )
  }

  return (
    <div className="container py-5">
      <div className="row g-4">
        <div className="col-lg-7">
          <div
            className="rounded-3 shadow-sm mb-4"
            style={{
              height: '380px',
              backgroundColor: '#e9ecef',
              backgroundImage: `url(${room.imageUrl || '/rooms/room_standard.jpg'})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          ></div>
          <h2 className="fw-bold mb-2">Room {room.roomNumber} — {room.category || room.type || 'Standard'}</h2>
          <p className="text-muted lead fs-6">{room.description || 'Modern luxury room equipped with premier comforts.'}</p>

          <h5 className="fw-bold mt-4 mb-3">Room Amenities & Features</h5>
          <div className="row g-2 mb-4">
            {(room.amenities || ['High-speed Wi-Fi', 'Flat-screen Smart TV', 'Air Conditioning', 'En-suite Bathroom', 'Minibar', 'Room Safe']).map((a, i) => (
              <div key={i} className="col-6 col-md-4">
                <div className="p-2 border rounded bg-white small d-flex align-items-center gap-2">
                  <i className="bi bi-check-circle-fill text-success"></i> {a}
                </div>
              </div>
            ))}
          </div>

          <h5 className="fw-bold mt-4 mb-3">Guest Reviews ({reviews.length})</h5>
          {reviews.length === 0 ? (
            <p className="text-muted small">No reviews yet for this room.</p>
          ) : (
            <div className="list-group">
              {reviews.map((r, i) => (
                <div key={i} className="list-group-item list-group-item-action">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-semibold small">{r.guestName || 'Verified Guest'}</span>
                    <span className="badge bg-warning text-dark">★ {r.rating}/5</span>
                  </div>
                  <p className="small text-muted mb-0">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="col-lg-5">
          <div className="card shadow-sm border-0 sticky-top" style={{ top: '80px' }}>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-baseline mb-3">
                <span className="fs-3 fw-bold text-hotel">${room.pricePerNight || room.basePrice || 120}</span>
                <span className="text-muted">/ night</span>
              </div>
              <ul className="list-unstyled small text-muted mb-4">
                <li className="mb-2"><i className="bi bi-people me-2"></i> Capacity: {room.capacity || 2} Guests</li>
                <li className="mb-2"><i className="bi bi-shield-check me-2"></i> Free cancellation up to 24h before check-in</li>
                <li className="mb-2"><i className="bi bi-clock me-2"></i> Check-in: 3:00 PM | Check-out: 11:00 AM</li>
              </ul>
              <Link to={`/guest/book/${room._id || room.id}`} className="btn btn-warning w-100 py-2 fw-bold">
                Proceed to Reservation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
