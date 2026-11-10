import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import API from '../../services/api'

export default function Reviews() {
  const { user } = useSelector((state) => state.auth)
  const [formData, setFormData] = useState({
    roomId: '',
    rating: 5,
    comment: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.roomId) {
      toast.error('Please enter a room ID or number')
      return
    }
    setSubmitting(true)
    try {
      await API.post('/reviews', {
        roomId: formData.roomId,
        guestId: user?._id || user?.id,
        rating: Number(formData.rating),
        comment: formData.comment,
      })
      toast.success('Thank you! Your review has been submitted.')
      setFormData({ roomId: '', rating: 5, comment: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-hotel text-white p-4">
              <h4 className="mb-0 fw-bold">Leave a Review</h4>
              <p className="mb-0 small opacity-75">Share your feedback about your stay with HotelPro</p>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold small">Room ID or Number</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={formData.roomId}
                    onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                    placeholder="e.g. 101 or Room ID"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold small">Rating (1 to 5 Stars)</label>
                  <select
                    className="form-select"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  >
                    <option value="5">⭐⭐⭐⭐⭐ 5 - Excellent</option>
                    <option value="4">⭐⭐⭐⭐ 4 - Very Good</option>
                    <option value="3">⭐⭐⭐ 3 - Average</option>
                    <option value="2">⭐⭐ 2 - Poor</option>
                    <option value="1">⭐ 1 - Terrible</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold small">Your Review</label>
                  <textarea
                    rows="4"
                    className="form-control"
                    required
                    placeholder="Tell us about the cleanliness, staff hospitality, and amenities..."
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  ></textarea>
                </div>

                <button type="submit" disabled={submitting} className="btn btn-warning w-100 py-2 fw-semibold">
                  {submitting ? 'Submitting...' : 'Post Review'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
