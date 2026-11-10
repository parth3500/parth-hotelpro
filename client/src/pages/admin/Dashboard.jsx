import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import API from '../../services/api'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRooms: 0,
    totalBookings: 0,
    totalRevenue: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const [usersRes, roomsRes, bookingsRes] = await Promise.all([
          API.get('/admin/users').catch(() => ({ data: { users: [] } })),
          API.get('/rooms').catch(() => ({ data: { rooms: [] } })),
          API.get('/bookings').catch(() => ({ data: { bookings: [] } })),
        ])

        const usersList = usersRes.data.users || usersRes.data || []
        const roomsList = roomsRes.data.rooms || roomsRes.data || []
        const bookingsList = bookingsRes.data.bookings || bookingsRes.data || []

        const rev = bookingsList.reduce((acc, b) => acc + (Number(b.totalAmount) || 0), 0)

        setStats({
          totalUsers: usersList.length,
          totalRooms: roomsList.length,
          totalBookings: bookingsList.length,
          totalRevenue: rev,
        })
      } catch (err) {
        console.warn('Error fetching stats:', err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchAdminStats()
  }, [])

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Administrative Headquarters</h2>
        <p className="text-muted">High-level telemetry, revenue auditing, and hotel operational controls</p>
      </div>

      {/* KPI Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card shadow-sm border-0 border-start border-primary border-4 p-3">
            <span className="text-muted small">Registered Users</span>
            <h3 className="fw-bold mb-0 text-primary">{stats.totalUsers}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-0 border-start border-success border-4 p-3">
            <span className="text-muted small">Room Inventory</span>
            <h3 className="fw-bold mb-0 text-success">{stats.totalRooms}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-0 border-start border-warning border-4 p-3">
            <span className="text-muted small">Total Bookings</span>
            <h3 className="fw-bold mb-0 text-warning">{stats.totalBookings}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-0 border-start border-info border-4 p-3">
            <span className="text-muted small">Gross Revenue</span>
            <h3 className="fw-bold mb-0 text-info">${stats.totalRevenue.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      {/* Admin Quick Panels */}
      <div className="row g-4">
        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100 p-4">
            <div className="fs-1 text-primary mb-3"><i className="bi bi-people-fill"></i></div>
            <h5 className="fw-bold">User & Staff Accounts</h5>
            <p className="text-muted small">Manage guest profiles, promote staff roles, and oversee permissions.</p>
            <Link to="/admin/users" className="btn btn-outline-primary mt-auto">Manage Users</Link>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100 p-4">
            <div className="fs-1 text-success mb-3"><i className="bi bi-door-open-fill"></i></div>
            <h5 className="fw-bold">Room & Inventory Controls</h5>
            <p className="text-muted small">Create new rooms, adjust seasonal pricing, and update amenities.</p>
            <Link to="/admin/rooms" className="btn btn-outline-success mt-auto">Manage Rooms</Link>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100 p-4">
            <div className="fs-1 text-info mb-3"><i className="bi bi-bar-chart-fill"></i></div>
            <h5 className="fw-bold">Reports & Intelligence</h5>
            <p className="text-muted small">RevPAR, occupancy percentages, and autonomous agent telemetry logs.</p>
            <Link to="/admin/reports" className="btn btn-outline-info mt-auto">View Analytics</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
