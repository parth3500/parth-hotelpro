import { createSlice } from '@reduxjs/toolkit'

const bookingSlice = createSlice({
  name: 'bookings',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {
    fetchBookingsStart(state) {
      state.loading = true
      state.error = null
    },
    fetchBookingsSuccess(state, action) {
      state.loading = false
      state.list = action.payload
    },
    fetchBookingsFailure(state, action) {
      state.loading = false
      state.error = action.payload
    },
    addBooking(state, action) {
      state.list.unshift(action.payload)
    },
    updateBookingStatus(state, action) {
      const { id, status } = action.payload
      const booking = state.list.find(b => b._id === id || b.id === id)
      if (booking) booking.status = status
    },
  },
})

export const {
  fetchBookingsStart,
  fetchBookingsSuccess,
  fetchBookingsFailure,
  addBooking,
  updateBookingStatus,
} = bookingSlice.actions
export default bookingSlice.reducer
