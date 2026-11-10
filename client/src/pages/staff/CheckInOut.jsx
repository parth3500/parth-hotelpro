import React, { useState } from 'react'
import { toast } from 'react-toastify'
import API from '../../services/api'

export default function CheckInOut() {
  const [bookingId, setBookingId] = useState('')
  const [keyCardNumber, setKeyCardNumber] = useState('KC-101')
  const [loading, setLoading] = useState(false)
  const [actionLog, setActionLog] = useState([])

  const handleCheckIn = async (e) => {
    e.preventDefault()
    if (!bookingId) return
    setLoading(true)
    try {
      const res = await API.post(`/bookings/${bookingId}/checkin`, { keyCardNumber })
      toast.success(res.data.message || 'Check-in processed successfully!')
      setActionLog([
        { time: new Date().toLocaleTimeString(), action: `Check-in for Booking #${bookingId}`, status: 'Success' },
        ...actionLog,
      ])
      setBookingId('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckOut = async (e) => {
    e.preventDefault()
    if (!bookingId) return
    setLoading(true)
    try {
      const res = await API.post(`/bookings/${bookingId}/checkout`, {})
      toast.success(res.data.message || 'Check-out completed. Room marked for cleaning.')
      setActionLog([
        { time: new Date().toLocaleTimeString(), action: `Check-out for Booking #${bookingId}`, status: 'Completed' },
        ...actionLog,
      ])
      setBookingId('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-out failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Guest Check-In / Check-Out Management</h2>
        <p className="text-muted">Process guest arrivals and departures with automated room status updates</p>
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-hotel text-white p-3">
              <h5 className="mb-0 fw-bold">Front Desk Action Form</h5>
            </div>
            <div className="card-body p-4">
              <div className="mb-3">
                <label className="form-label fw-semibold small">Booking Reference or ID</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Booking ID (e.g. 64f1...)"
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold small">Key Card / Room Access Code</label>
                <input
                  type="text"
                  className="form-control"
                  value={keyCardNumber}
                  onChange={(e) => setKeyCardNumber(e.target.value)}
                />
              </div>

              <div className="d-flex gap-3">
                <button
                  type="button"
                  onClick={handleCheckIn}
                  disabled={loading || !bookingId}
                  className="btn btn-primary flex-grow-1 py-2 fw-semibold"
                >
                  <i className="bi bi-box-arrow-in-right me-1"></i> Process Check-In
                </button>
                <button
                  type="button"
                  onClick={handleCheckOut}
                  disabled={loading || !bookingId}
                  className="btn btn-outline-danger flex-grow-1 py-2 fw-semibold"
                >
                  <i className="bi bi-box-arrow-right me-1"></i> Process Check-Out
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white p-3">
              <h5 className="mb-0 fw-bold">Session Activity Stream</h5>
            </div>
            <div className="card-body p-0">
              {actionLog.length === 0 ? (
                <p className="p-4 text-muted small mb-0">No actions recorded in this session yet.</p>
              ) : (
                <ul className="list-group list-group-flush">
                  {actionLog.map((log, idx) => (
                    <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                      <span className="small">{log.action}</span>
                      <span className="badge bg-success">{log.time}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
