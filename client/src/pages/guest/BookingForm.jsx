import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import API from '../../services/api'
import { addBooking } from '../../store/bookingSlice'

export default function BookingForm() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)

  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Default dates: tomorrow to day after
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dayAfter = new Date()
  dayAfter.setDate(dayAfter.getDate() + 2)

  const formatDate = (d) => d.toISOString().split('T')[0]

  const [formData, setFormData] = useState({
    checkInDate: formatDate(tomorrow),
    checkOutDate: formatDate(dayAfter),
    numberOfGuests: 1,
    specialRequests: '',
    paymentMethod: 'card',
  })

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await API.get(`/rooms/${roomId}`)
        setRoom(res.data.room || res.data)
      } catch (err) {
        toast.error('Failed to load room details')
      } finally {
        setLoading(false)
      }
    }
    fetchRoom()
  }, [roomId])

  const calculateTotal = () => {
    if (!room) return 0
    const start = new Date(formData.checkInDate)
    const end = new Date(formData.checkOutDate)
    const diffTime = Math.abs(end - start)
    const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
    const price = room.pricePerNight || room.basePrice || 120
    return nights * price
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      // 1. Create booking
      const payload = {
        roomId,
        guestId: user?._id || user?.id,
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        numberOfGuests: Number(formData.numberOfGuests),
        specialRequests: formData.specialRequests,
        totalAmount: calculateTotal(),
      }

      const res = await API.post('/bookings', payload)
      const newBooking = res.data.booking || res.data

      // 2. Process immediate simulated payment
      try {
        await API.post('/payments', {
          bookingId: newBooking._id || newBooking.id,
          amount: calculateTotal(),
          paymentMethod: formData.paymentMethod,
        })
      } catch (payErr) {
        console.warn('Auto payment note:', payErr.message)
      }

      dispatch(addBooking(newBooking))
      toast.success('Reservation confirmed successfully!')
      navigate('/guest/bookings')
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to complete booking. Dates may be unavailable.'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    )
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 rounded-3">
            <div className="card-header bg-hotel text-white p-4">
              <h4 className="mb-0 fw-bold">Reserve Room {room?.roomNumber} ({room?.type})</h4>
              <p className="mb-0 small opacity-75">Complete your reservation details below</p>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Check-in Date</label>
                    <input
                      type="date"
                      name="checkInDate"
                      className="form-control"
                      required
                      value={formData.checkInDate}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Check-out Date</label>
                    <input
                      type="date"
                      name="checkOutDate"
                      className="form-control"
                      required
                      value={formData.checkOutDate}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Number of Guests</label>
                    <input
                      type="number"
                      name="numberOfGuests"
                      min={1}
                      max={room?.capacity || 4}
                      className="form-control"
                      value={formData.numberOfGuests}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Payment Method</label>
                    <select
                      name="paymentMethod"
                      className="form-select"
                      value={formData.paymentMethod}
                      onChange={handleChange}
                    >
                      <option value="card">Credit / Debit Card</option>
                      <option value="upi">UPI / Razorpay</option>
                      <option value="stripe">Stripe Portal</option>
                      <option value="cash">Pay at Hotel</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold small">Special Requests (Optional)</label>
                  <textarea
                    name="specialRequests"
                    rows="3"
                    className="form-control"
                    placeholder="e.g. Early check-in request, quiet room, extra pillows..."
                    value={formData.specialRequests}
                    onChange={handleChange}
                  ></textarea>
                </div>

                {/* Price Summary */}
                <div className="bg-light p-3 rounded mb-4 border">
                  <div className="d-flex justify-content-between mb-2 small text-muted">
                    <span>Base rate per night:</span>
                    <span>${room?.pricePerNight || room?.basePrice || 120}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2 small text-muted">
                    <span>Estimated taxes & fees:</span>
                    <span>Included</span>
                  </div>
                  <div className="d-flex justify-content-between fw-bold fs-5 pt-2 border-top">
                    <span>Total Amount:</span>
                    <span className="text-hotel">${calculateTotal()}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-warning w-100 py-3 fw-bold fs-6"
                >
                  {submitting ? 'Confirming Reservation...' : `Confirm & Pay $${calculateTotal()}`}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
