const express = require('express');
const { createPayment, getPaymentByBooking } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', createPayment);
router.get('/booking/:bookingId', getPaymentByBooking);

module.exports = router;
