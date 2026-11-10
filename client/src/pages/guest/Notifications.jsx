import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import API from '../../services/api'

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const loadNotifications = async () => {
    try {
      const res = await API.get('/notifications')
      setNotifications(res.data.notifications || res.data || [])
    } catch (err) {
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  const markAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`)
      setNotifications(notifications.map(n => (n._id === id || n.id === id ? { ...n, isRead: true } : n)))
      toast.success('Marked as read')
    } catch {
      toast.error('Failed to update status')
    }
  }

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Notifications & Alerts</h2>
        <p className="text-muted">Stay informed on booking confirmations, check-in updates, and concierge announcements</p>
      </div>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      )}

      {!loading && notifications.length === 0 && (
        <div className="text-center py-5 bg-white rounded-3 shadow-sm p-4">
          <i className="bi bi-bell-slash fs-1 text-muted d-block mb-3"></i>
          <h4>No Notifications</h4>
          <p className="text-muted">You have no new alerts at this time.</p>
        </div>
      )}

      <div className="list-group shadow-sm">
        {notifications.map((n) => (
          <div
            key={n._id || n.id}
            className={`list-group-item list-group-item-action p-3 ${!n.isRead ? 'bg-light' : ''}`}
          >
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h6 className="fw-bold mb-1 d-flex align-items-center gap-2">
                  {!n.isRead && <span className="badge bg-primary rounded-pill p-1"></span>}
                  {n.title || n.subject || 'System Notification'}
                </h6>
                <p className="mb-1 text-muted small">{n.message || n.body}</p>
                <small className="text-muted">{new Date(n.createdAt || Date.now()).toLocaleString()}</small>
              </div>
              {!n.isRead && (
                <button
                  onClick={() => markAsRead(n._id || n.id)}
                  className="btn btn-outline-secondary btn-sm"
                >
                  Mark as read
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
