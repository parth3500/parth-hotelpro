import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import API from '../../services/api'

export default function BookingMonitor() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  const loadBookings = async () => {
    try {
      const res = await API.get('/bookings')
      setBookings(res.data.bookings || res.data || [])
    } catch {
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBookings()
  }, [])

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Global Reservation Monitor</h2>
        <p className="text-muted">Oversee all hotel bookings, conflict statuses, and financial settlement states</p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : (
        <div className="card shadow-sm border-0">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Reference</th>
                    <th>Dates</th>
                    <th>Guests</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b._id || b.id}>
                      <td className="fw-bold">#{b.bookingReference || (b._id || b.id).slice(-6)}</td>
                      <td>
                        {new Date(b.checkInDate).toLocaleDateString()} — {new Date(b.checkOutDate).toLocaleDateString()}
                      </td>
                      <td>{b.numberOfGuests || 1}</td>
                      <td>${b.totalAmount}</td>
                      <td>
                        <span className="badge bg-success">{b.paymentStatus || 'paid'}</span>
                      </td>
                      <td>
                        <span className={`badge ${
                          b.status === 'confirmed' ? 'bg-primary' :
                          b.status === 'checked_in' ? 'bg-success' :
                          b.status === 'cancelled' ? 'bg-danger' : 'bg-secondary'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
