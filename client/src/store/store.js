import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import bookingReducer from './bookingSlice'
import roomReducer from './roomSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    bookings: bookingReducer,
    rooms: roomReducer,
  },
})

export default store
