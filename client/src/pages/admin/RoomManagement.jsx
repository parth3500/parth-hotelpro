import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import API from '../../services/api'

export default function RoomManagement() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [newRoom, setNewRoom] = useState({
    roomNumber: '',
    type: 'deluxe',
    pricePerNight: 150,
    capacity: 2,
    floor: 1,
    description: '',
  })

  const loadRooms = async () => {
    try {
      const res = await API.get('/rooms')
      setRooms(res.data.rooms || res.data || [])
    } catch {
      toast.error('Failed to load rooms')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRooms()
  }, [])

  const handleCreateRoom = async (e) => {
    e.preventDefault()
    try {
      await API.post('/rooms', {
        ...newRoom,
        pricePerNight: Number(newRoom.pricePerNight),
        capacity: Number(newRoom.capacity),
        floor: Number(newRoom.floor),
      })
      toast.success('Room created successfully!')
      setNewRoom({
        roomNumber: '',
        type: 'deluxe',
        pricePerNight: 150,
        capacity: 2,
        floor: 1,
        description: '',
      })
      loadRooms()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create room')
    }
  }

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Room Inventory & Pricing Management</h2>
        <p className="text-muted">Configure room inventory, base rates, seasonal changes, and floor allocations</p>
      </div>

      <div className="row g-4">
        {/* New Room Form */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 sticky-top" style={{ top: '80px' }}>
            <div className="card-header bg-hotel text-white p-3">
              <h5 className="mb-0 fw-bold">Add New Room</h5>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleCreateRoom}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Room Number</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={newRoom.roomNumber}
                    onChange={(e) => setNewRoom({ ...newRoom, roomNumber: e.target.value })}
                    placeholder="e.g. 302"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Room Type</label>
                  <select
                    className="form-select"
                    value={newRoom.type}
                    onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value })}
                  >
                    <option value="standard">Standard</option>
                    <option value="deluxe">Deluxe</option>
                    <option value="suite">Suite</option>
                    <option value="presidential">Presidential</option>
                  </select>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-semibold">Rate ($/night)</label>
                    <input
                      type="number"
                      className="form-control"
                      required
                      value={newRoom.pricePerNight}
                      onChange={(e) => setNewRoom({ ...newRoom, pricePerNight: e.target.value })}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold">Capacity</label>
                    <input
                      type="number"
                      className="form-control"
                      value={newRoom.capacity}
                      onChange={(e) => setNewRoom({ ...newRoom, capacity: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Floor</label>
                  <input
                    type="number"
                    className="form-control"
                    value={newRoom.floor}
                    onChange={(e) => setNewRoom({ ...newRoom, floor: e.target.value })}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold">Description</label>
                  <textarea
                    rows="2"
                    className="form-control"
                    placeholder="Room features..."
                    value={newRoom.description}
                    onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-warning w-100 fw-bold">
                  Create Room
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Existing Rooms List */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white p-3">
              <h5 className="mb-0 fw-bold">Active Inventory ({rooms.length})</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Room</th>
                      <th>Type</th>
                      <th>Price</th>
                      <th>Capacity</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map((r) => (
                      <tr key={r._id || r.id}>
                        <td className="fw-bold">Room {r.roomNumber}</td>
                        <td className="text-capitalize">{r.type}</td>
                        <td>${r.pricePerNight || r.basePrice || 120}</td>
                        <td>{r.capacity || 2} Guests</td>
                        <td>
                          <span className={`badge ${
                            r.status === 'available' ? 'bg-success' :
                            r.status === 'occupied' ? 'bg-danger' : 'bg-warning text-dark'
                          }`}>
                            {r.status || 'available'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
