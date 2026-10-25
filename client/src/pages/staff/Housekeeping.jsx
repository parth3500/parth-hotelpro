import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import API from '../../services/api'

export default function Housekeeping() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)

  const loadRooms = async () => {
    try {
      const res = await API.get('/rooms')
      setRooms(res.data.rooms || res.data || [])
    } catch {
      toast.error('Failed to load room statuses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRooms()
  }, [])

  const updateStatus = async (roomId, newStatus) => {
    try {
      await API.put(`/rooms/${roomId}`, { status: newStatus })
      toast.success(`Room status updated to ${newStatus}`)
      loadRooms()
    } catch (err) {
      toast.error('Failed to update room status')
    }
  }

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Housekeeping Status Board</h2>
        <p className="text-muted">Monitor room cleanliness and trigger turnover workflows</p>
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
                    <th>Room</th>
                    <th>Type</th>
                    <th>Floor</th>
                    <th>Current Status</th>
                    <th>Quick Transition</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((r) => (
                    <tr key={r._id || r.id}>
                      <td className="fw-bold">Room {r.roomNumber}</td>
                      <td className="text-capitalize">{r.type}</td>
                      <td>{r.floor || 1}</td>
                      <td>
                        <span className={`badge ${
                          r.status === 'available' ? 'bg-success' :
                          r.status === 'occupied' ? 'bg-danger' :
                          r.status === 'cleaning' ? 'bg-warning text-dark' : 'bg-secondary'
                        }`}>
                          {r.status || 'available'}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            onClick={() => updateStatus(r._id || r.id, 'available')}
                            className="btn btn-outline-success"
                          >
                            Mark Ready
                          </button>
                          <button
                            onClick={() => updateStatus(r._id || r.id, 'cleaning')}
                            className="btn btn-outline-warning text-dark"
                          >
                            Mark Cleaning
                          </button>
                          <button
                            onClick={() => updateStatus(r._id || r.id, 'maintenance')}
                            className="btn btn-outline-secondary"
                          >
                            Maintenance
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
