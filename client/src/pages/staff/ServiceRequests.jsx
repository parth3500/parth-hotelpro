import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import API from '../../services/api'

export default function ServiceRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  const loadRequests = async () => {
    try {
      const res = await API.get('/services')
      setRequests(res.data.services || res.data || [])
    } catch {
      toast.error('Failed to load service requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [])

  const updateRequestStatus = async (id, status) => {
    try {
      await API.put(`/services/${id}`, { status })
      toast.success(`Request marked as ${status}`)
      loadRequests()
    } catch {
      toast.error('Failed to update service request')
    }
  }

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Guest Service & Maintenance Tickets</h2>
        <p className="text-muted">Manage in-room amenity delivery, housekeeping calls, and maintenance</p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-5 bg-white rounded shadow-sm p-4">
          <i className="bi bi-inbox fs-1 text-muted d-block mb-3"></i>
          <h5>No Active Service Tickets</h5>
          <p className="text-muted">All guest requests have been resolved.</p>
        </div>
      ) : (
        <div className="card shadow-sm border-0">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Type</th>
                    <th>Room / Guest</th>
                    <th>Description</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr key={r._id || r.id}>
                      <td className="fw-semibold text-capitalize">{r.type || 'Room Service'}</td>
                      <td>Room #{r.roomNumber || r.roomId || 'General'}</td>
                      <td className="small text-muted">{r.description || r.notes}</td>
                      <td>
                        <span className={`badge ${r.priority === 'urgent' ? 'bg-danger' : 'bg-info text-dark'}`}>
                          {r.priority || 'standard'}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-secondary text-capitalize">{r.status || 'open'}</span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            onClick={() => updateRequestStatus(r._id || r.id, 'in_progress')}
                            className="btn btn-outline-warning text-dark"
                          >
                            In Progress
                          </button>
                          <button
                            onClick={() => updateRequestStatus(r._id || r.id, 'completed')}
                            className="btn btn-outline-success"
                          >
                            Resolve
                          </button>
                        </div>
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
