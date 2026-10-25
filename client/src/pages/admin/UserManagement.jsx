import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import API from '../../services/api'

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const loadUsers = async () => {
    try {
      const res = await API.get('/admin/users')
      setUsers(res.data.users || res.data || [])
    } catch (err) {
      toast.error('Failed to load user accounts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleRoleChange = async (userId, newRole) => {
    try {
      await API.put(`/admin/users/${userId}/role`, { role: newRole })
      toast.success('User role updated successfully')
      loadUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user role')
    }
  }

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">User & Role Management</h2>
        <p className="text-muted">Manage guest, staff, and admin accounts across HotelPro</p>
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
                    <th>Name</th>
                    <th>Email</th>
                    <th>Current Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id || u.id}>
                      <td className="fw-semibold">{u.name || 'Anonymous User'}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`badge ${
                          u.role === 'admin' ? 'bg-danger' :
                          u.role === 'staff' ? 'bg-primary' : 'bg-secondary'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <select
                          className="form-select form-select-sm w-auto d-inline-block"
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id || u.id, e.target.value)}
                        >
                          <option value="guest">Guest</option>
                          <option value="staff">Staff</option>
                          <option value="admin">Admin</option>
                        </select>
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
