import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import API from '../../services/api'

export default function BookingHistory() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState(null)

  const loadBookings = async () => {
    try {
      const res = await API.get('/bookings')
      setBookings(res.data.bookings || res.data || [])
    } catch (err) {
      toast.error('Failed to load your reservations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBookings()
  }, [])

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? Refund policy will be applied.')) {
      return
    }
    setCancellingId(bookingId)
    try {
      const res = await API.put(`/bookings/${bookingId}/cancel`, {
        reason: 'Guest requested cancellation',
      })
      toast.success(res.data.message || 'Booking cancelled successfully')
      loadBookings()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking')
    } finally {
      setCancellingId(null)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <span className="badge bg-success">Confirmed</span>
      case 'checked_in':
        return <span className="badge bg-primary">Checked In</span>
      case 'checked_out':
        return <span className="badge bg-secondary">Checked Out</span>
      case 'cancelled':
        return <span className="badge bg-danger">Cancelled</span>
      default:
        return <span className="badge bg-info text-dark">{status}</span>
    }
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">My Booking History</h2>
          <p className="text-muted mb-0">View all past and upcoming hotel stays</p>
        </div>
        <Link to="/rooms" className="btn btn-primary btn-sm">
          <i className="bi bi-plus-lg me-1"></i> Book New Room
        </Link>
      </div>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      )}

      {!loading && bookings.length === 0 && (
        <div className="text-center py-5 bg-white rounded-3 shadow-sm p-4">
          <i className="bi bi-calendar-x fs-1 text-muted d-block mb-3"></i>
          <h4>No Bookings Found</h4>
          <p className="text-muted">You haven't made any reservations yet.</p>
          <Link to="/rooms" className="btn btn-warning">Browse Rooms Now</Link>
        </div>
      )}

      <div className="row g-4">
        {bookings.map((b) => (
          <div key={b._id || b.id} className="col-12">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
                  <div>
                    <h5 className="fw-bold mb-1">
                      Booking #{b.bookingReference || (b._id || b.id).toString().slice(-6).toUpperCase()}
                    </h5>
                    <span className="text-muted small">
                      Placed on {new Date(b.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                  <div>{getStatusBadge(b.status)}</div>
                </div>

                <div className="row g-3 py-3 border-top border-bottom mb-3">
                  <div className="col-md-3">
                    <span className="text-muted small d-block">Dates</span>
                    <strong className="small">
                      {new Date(b.checkInDate).toLocaleDateString()} — {new Date(b.checkOutDate).toLocaleDateString()}
                    </strong>
                  </div>
                  <div className="col-md-3">
                    <span className="text-muted small d-block">Guests</span>
                    <strong className="small">{b.numberOfGuests || 1} Guest(s)</strong>
                  </div>
                  <div className="col-md-3">
                    <span className="text-muted small d-block">Total Paid</span>
                    <strong className="small text-hotel">${b.totalAmount}</strong>
                  </div>
                  <div className="col-md-3">
                    <span className="text-muted small d-block">Payment Status</span>
                    <span className="badge bg-light text-dark border">
                      {b.paymentStatus || 'paid'}
                    </span>
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <div className="small text-muted">
                    {b.refundAmount ? `Refund Processed: $${b.refundAmount}` : ''}
                  </div>
                  <div className="d-flex gap-2">
                    {b.status === 'confirmed' && (
                      <button
                        onClick={() => handleCancel(b._id || b.id)}
                        disabled={cancellingId === (b._id || b.id)}
                        className="btn btn-outline-danger btn-sm"
                      >
                        {cancellingId === (b._id || b.id) ? 'Processing...' : 'Cancel Booking'}
                      </button>
                    )}
                    <Link to="/guest/reviews" className="btn btn-outline-secondary btn-sm">
                      Leave Review
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
