import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'

export default function Home() {
  const { user } = useSelector((state) => state.auth)

  return (
    <div>
      {/* Hero Header */}
      <section className="hero-section text-white text-center py-5">
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <span className="badge bg-warning text-dark px-3 py-2 mb-3 rounded-pill fw-semibold">
                Autonomous Multi-Agent Hotel Management
              </span>
              <h1 className="display-4 fw-bold mb-3">Welcome to HotelPro</h1>
              <p className="lead mb-4 text-light opacity-90">
                Experience seamless hospitality powered by specialized autonomous agents for booking,
                concierge, housekeeping, and billing operations.
              </p>
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <Link to="/rooms" className="btn btn-warning btn-lg px-4 fw-bold">
                  <i className="bi bi-search me-2"></i> Browse Rooms
                </Link>
                {!user ? (
                  <Link to="/register" className="btn btn-outline-light btn-lg px-4">
                    <i className="bi bi-person-plus me-2"></i> Create Account
                  </Link>
                ) : (
                  <Link to={`/${user.role}/dashboard`} className="btn btn-outline-light btn-lg px-4">
                    <i className="bi bi-speedometer2 me-2"></i> Go to Dashboard
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-5 bg-white">
        <div className="container py-4">
          <div className="text-center mb-5">
            <h2 className="fw-bold">Intelligent Multi-Agent Platform</h2>
            <p className="text-muted">Designed to streamline modern hotel operations with zero downtime</p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm p-3">
                <div className="card-body">
                  <div className="text-primary fs-1 mb-3">
                    <i className="bi bi-calendar2-check"></i>
                  </div>
                  <h5 className="card-title fw-bold">Booking Agent</h5>
                  <p className="card-text text-muted">
                    Automated conflict resolution and double-booking guard with sub-millisecond precision.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm p-3">
                <div className="card-body">
                  <div className="text-success fs-1 mb-3">
                    <i className="bi bi-stars"></i>
                  </div>
                  <h5 className="card-title fw-bold">Housekeeping Agent</h5>
                  <p className="card-text text-muted">
                    Instant turnover scheduling and room hygiene monitoring linked to live check-outs.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm p-3">
                <div className="card-body">
                  <div className="text-warning fs-1 mb-3">
                    <i className="bi bi-credit-card-2-front"></i>
                  </div>
                  <h5 className="card-title fw-bold">Billing & Concierge</h5>
                  <p className="card-text text-muted">
                    Real-time payment audit, dynamic seasonal rate calculations, and automated guest notices.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-4 bg-dark text-white text-center">
        <div className="container">
          <p className="mb-0 text-muted">&copy; {new Date().getFullYear()} HotelPro Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
