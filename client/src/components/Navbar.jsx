import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../store/authSlice'

export default function Navbar() {
  const { user, token } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-hotel sticky-top shadow-sm">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <i className="bi bi-building"></i>
          <span>HotelPro</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#hotelNav"
          aria-controls="hotelNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="hotelNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/rooms">
                <i className="bi bi-door-open me-1"></i> Rooms
              </Link>
            </li>

            {token && user?.role === 'guest' && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/guest/dashboard">
                    <i className="bi bi-speedometer2 me-1"></i> Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/guest/bookings">
                    <i className="bi bi-journal-check me-1"></i> My Bookings
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/guest/notifications">
                    <i className="bi bi-bell me-1"></i> Notifications
                  </Link>
                </li>
              </>
            )}

            {token && (user?.role === 'staff' || user?.role === 'admin') && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/staff/dashboard">
                    <i className="bi bi-clipboard2-pulse me-1"></i> Staff Desk
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/staff/checkinout">
                    <i className="bi bi-box-arrow-in-right me-1"></i> Check-In/Out
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/staff/housekeeping">
                    <i className="bi bi-stars me-1"></i> Housekeeping
                  </Link>
                </li>
              </>
            )}

            {token && user?.role === 'admin' && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/dashboard">
                    <i className="bi bi-shield-lock me-1"></i> Admin
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/rooms">
                    <i className="bi bi-gear me-1"></i> Manage Rooms
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/reports">
                    <i className="bi bi-graph-up me-1"></i> Reports
                  </Link>
                </li>
              </>
            )}
          </ul>

          <div className="d-flex align-items-center gap-2">
            {token ? (
              <div className="d-flex align-items-center gap-3">
                <span className="badge bg-light text-dark text-capitalize px-3 py-2">
                  <i className="bi bi-person-circle me-1"></i>
                  {user?.name || user?.email} ({user?.role})
                </span>
                <button onClick={handleLogout} className="btn btn-outline-light btn-sm">
                  <i className="bi bi-box-arrow-right me-1"></i> Logout
                </button>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-outline-light btn-sm">
                  Login
                </Link>
                <Link to="/register" className="btn btn-warning btn-sm">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
