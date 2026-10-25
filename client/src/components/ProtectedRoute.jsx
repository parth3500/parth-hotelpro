import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'

export default function ProtectedRoute({ roles = [] }) {
  const { token, user } = useSelector((state) => state.auth)

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (roles.length > 0 && user && !roles.includes(user.role)) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger shadow-sm my-5 p-4">
          <i className="bi bi-exclamation-triangle-fill fs-1 text-danger d-block mb-3"></i>
          <h4 className="alert-heading">Access Denied (403)</h4>
          <p>Your current role (<strong>{user.role}</strong>) does not have permission to access this portal.</p>
        </div>
      </div>
    )
  }

  return <Outlet />
}
