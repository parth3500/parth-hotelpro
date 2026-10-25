import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import API from '../services/api'
import { loginStart, loginSuccess, loginFailure } from '../store/authSlice'

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const { loading, error } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    dispatch(loginStart())
    try {
      const res = await API.post('/login', formData)
      const { token, user } = res.data
      dispatch(loginSuccess({ token, user }))
      toast.success(`Welcome back, ${user.name || user.email}!`)
      if (user.role === 'admin') navigate('/admin/dashboard')
      else if (user.role === 'staff') navigate('/staff/dashboard')
      else navigate('/rooms')
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.'
      dispatch(loginFailure(msg))
      toast.error(msg)
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card shadow border-0 rounded-3">
            <div className="card-body p-4 p-md-5">
              <div className="text-center mb-4">
                <i className="bi bi-person-circle fs-1 text-primary"></i>
                <h3 className="fw-bold mt-2">Sign In to HotelPro</h3>
                <p className="text-muted small">Enter your credentials to access your account</p>
              </div>

              {error && <div className="alert alert-danger py-2 small">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Email address</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="guest@example.com"
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold">Password</label>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                  />
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary w-100 py-2 fw-semibold">
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              {/* Demo Account Quick Select */}
              <div className="mt-4 pt-3 border-top">
                <p className="text-muted small fw-semibold text-center mb-2">Demo Accounts (Password: <code>password123</code> / <code>Test@123</code>)</p>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm flex-fill"
                    onClick={() => setFormData({ email: 'admin@hotelpro.com', password: 'password123' })}
                  >
                    Admin
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm flex-fill"
                    onClick={() => setFormData({ email: 'staff@hotelpro.com', password: 'password123' })}
                  >
                    Staff
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm flex-fill"
                    onClick={() => setFormData({ email: 'guest@hotelpro.com', password: 'password123' })}
                  >
                    Guest
                  </button>
                </div>
              </div>

              <div className="text-center mt-4">
                <p className="small text-muted mb-0">
                  Don't have an account? <Link to="/register" className="fw-semibold">Register here</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
