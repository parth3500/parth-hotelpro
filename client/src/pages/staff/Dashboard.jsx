import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import API from '../../services/api'

export default function StaffDashboard() {
  const [metrics, setMetrics] = useState({
    occupancyRate: 0,
    activeCheckins: 0,
    openServiceTickets: 0,
    roomsCleaning: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        const res = await API.get('/staff/dashboard')
        setMetrics(res.data.metrics || res.data || {
          occupancyRate: 75,
          activeCheckins: 12,
          openServiceTickets: 3,
          roomsCleaning: 5,
        })
      } catch (err) {
        console.warn('Using default metrics', err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchStaffData()
  }, [])

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Staff Operations Desk</h2>
          <p className="text-muted mb-0">Daily management for check-ins, guest turnarounds, and room services</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card shadow-sm border-0 border-start border-primary border-4 p-3">
            <span className="text-muted small">Active Check-Ins</span>
            <h3 className="fw-bold mb-0 text-primary">{metrics.activeCheckins || 0}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-0 border-start border-warning border-4 p-3">
            <span className="text-muted small">Rooms Cleaning</span>
            <h3 className="fw-bold mb-0 text-warning">{metrics.roomsCleaning || 0}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-0 border-start border-danger border-4 p-3">
            <span className="text-muted small">Service Requests</span>
            <h3 className="fw-bold mb-0 text-danger">{metrics.openServiceTickets || 0}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-0 border-start border-success border-4 p-3">
            <span className="text-muted small">Occupancy Rate</span>
            <h3 className="fw-bold mb-0 text-success">{metrics.occupancyRate || 0}%</h3>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="row g-4">
        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100 p-4">
            <div className="fs-1 text-primary mb-3"><i className="bi bi-box-arrow-in-right"></i></div>
            <h5 className="fw-bold">Guest Check-In & Check-Out</h5>
            <p className="text-muted small">Process guest arrivals, issue key allocations, and finalize departures.</p>
            <Link to="/staff/checkinout" className="btn btn-outline-primary mt-auto">Open Check Desk</Link>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100 p-4">
            <div className="fs-1 text-warning mb-3"><i className="bi bi-stars"></i></div>
            <h5 className="fw-bold">Housekeeping & Sanitization</h5>
            <p className="text-muted small">Update room readiness status from dirty/cleaning to inspect and available.</p>
            <Link to="/staff/housekeeping" className="btn btn-outline-warning text-dark mt-auto">Open Housekeeping</Link>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100 p-4">
            <div className="fs-1 text-danger mb-3"><i className="bi bi-tools"></i></div>
            <h5 className="fw-bold">Service & Maintenance</h5>
            <p className="text-muted small">Handle in-room guest requests, luggage support, and engineering issues.</p>
            <Link to="/staff/service-requests" className="btn btn-outline-danger mt-auto">Open Requests</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
