const express = require('express');
const {
  createBooking,
  getMyBookings,
  getAllBookings,
  getBookingById,
  cancelBooking,
} = require('../controllers/bookingController');
const { protect, isAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(isAdmin, getAllBookings)
  .post(createBooking);

router.get('/my', getMyBookings);

router.route('/:id')
  .get(getBookingById);

router.put('/:id/cancel', cancelBooking);

module.exports = router;
