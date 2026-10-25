import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import API from '../../services/api'

export default function GuestDashboard() {
  const { user } = useSelector((state) => state.auth)
  const [stats, setStats] = useState({ bookings: 0, notifications: 0 })
  const [recentBookings, setRecentBookings] = useState([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const bRes = await API.get('/bookings')
        const bookingsList = bRes.data.bookings || bRes.data || []
        setRecentBookings(bookingsList.slice(0, 3))

        let notifCount = 0
        try {
          const nRes = await API.get('/notifications')
          notifCount = (nRes.data.notifications || []).filter(n => !n.isRead).length
        } catch {
          // optional
        }

        setStats({ bookings: bookingsList.length, notifications: notifCount })
      } catch (err) {
        console.error('Failed to load guest data', err)
      }
    }
    loadData()
  }, [])

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Welcome, {user?.name || 'Guest'}!</h2>
        <p className="text-muted">Manage your stay and view recent reservations</p>
      </div>

      {/* Quick Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm border-0 border-start border-primary border-4 p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small">Total Reservations</span>
                <h3 className="fw-bold mb-0">{stats.bookings}</h3>
              </div>
              <div className="fs-1 text-primary"><i className="bi bi-calendar2-check"></i></div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 border-start border-warning border-4 p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small">Unread Alerts</span>
                <h3 className="fw-bold mb-0">{stats.notifications}</h3>
              </div>
              <div className="fs-1 text-warning"><i className="bi bi-bell"></i></div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 border-start border-success border-4 p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small">Quick Action</span>
                <Link to="/rooms" className="d-block btn btn-outline-success btn-sm mt-1">Book Room</Link>
              </div>
              <div className="fs-1 text-success"><i className="bi bi-door-open"></i></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold">Recent Reservations</h5>
          <Link to="/guest/bookings" className="btn btn-sm btn-link text-decoration-none">View All</Link>
        </div>
        <div className="card-body p-0">
          {recentBookings.length === 0 ? (
            <p className="p-4 text-muted mb-0">No recent reservations found.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Ref</th>
                    <th>Dates</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((b) => (
                    <tr key={b._id || b.id}>
                      <td className="fw-semibold">#{b.bookingReference || (b._id || b.id).slice(-6)}</td>
                      <td>{new Date(b.checkInDate).toLocaleDateString()}</td>
                      <td>${b.totalAmount}</td>
                      <td><span className="badge bg-secondary text-capitalize">{b.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
