import { createSlice } from '@reduxjs/toolkit'

const roomSlice = createSlice({
  name: 'rooms',
  initialState: {
    list: [],
    selectedRoom: null,
    loading: false,
    error: null,
    filter: {
      category: '',
      minPrice: '',
      maxPrice: '',
      type: '',
    },
  },
  reducers: {
    fetchRoomsStart(state) {
      state.loading = true
      state.error = null
    },
    fetchRoomsSuccess(state, action) {
      state.loading = false
      state.list = action.payload
    },
    fetchRoomsFailure(state, action) {
      state.loading = false
      state.error = action.payload
    },
    setSelectedRoom(state, action) {
      state.selectedRoom = action.payload
    },
    setFilter(state, action) {
      state.filter = { ...state.filter, ...action.payload }
    },
    resetFilter(state) {
      state.filter = { category: '', minPrice: '', maxPrice: '', type: '' }
    },
  },
})

export const {
  fetchRoomsStart,
  fetchRoomsSuccess,
  fetchRoomsFailure,
  setSelectedRoom,
  setFilter,
  resetFilter,
} = roomSlice.actions

export default roomSlice.reducer
