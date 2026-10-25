// shortcut: regex and manual field-presence validation without third-party schema validator, upgrade to Zod or Joi if complex nested schemas arise

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_CATEGORIES = ['Standard', 'Deluxe', 'Suite', 'Executive'];
const VALID_ROOM_STATUSES = ['available', 'occupied', 'cleaning', 'maintenance'];
const VALID_SERVICE_TYPES = ['cleaning', 'room_service', 'towels', 'maintenance', 'wake_up_call', 'other'];

/**
 * Strips whitespace and null bytes from request body
 */
function sanitizeBody(req, res, next) {
  if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].replace(/\0/g, '').trim();
      }
    }
  }
  next();
}

/**
 * Validates registration payload
 */
function validateRegister(req, res, next) {
  const { name, email, password } = req.body || {};

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'Name is required.' });
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({ success: false, message: 'A valid email address is required.' });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
  }

  next();
}

/**
 * Validates login payload
 */
function validateLogin(req, res, next) {
  const { email, password } = req.body || {};

  if (!email || typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({ success: false, message: 'Email is required.' });
  }

  if (!password || typeof password !== 'string' || !password) {
    return res.status(400).json({ success: false, message: 'Password is required.' });
  }

  next();
}

/**
 * Validates room creation/update payload
 */
function validateRoom(req, res, next) {
  const { roomNumber, category, pricePerNight } = req.body || {};

  if (!roomNumber || typeof roomNumber !== 'string' || roomNumber.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'Room number is required.' });
  }

  if (!category || !VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({
      success: false,
      message: `Invalid room category. Allowed categories: ${VALID_CATEGORIES.join(', ')}`
    });
  }

  if (pricePerNight === undefined || isNaN(Number(pricePerNight)) || Number(pricePerNight) <= 0) {
    return res.status(400).json({ success: false, message: 'Price per night must be a positive number.' });
  }

  next();
}

/**
 * Validates booking creation payload
 */
function validateBooking(req, res, next) {
  const { roomId, checkInDate, checkOutDate } = req.body || {};

  if (!roomId || typeof roomId !== 'string' || roomId.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'roomId is required.' });
  }

  if (!checkInDate || !checkOutDate) {
    return res.status(400).json({ success: false, message: 'checkInDate and checkOutDate are required.' });
  }

  const inDate = new Date(checkInDate);
  const outDate = new Date(checkOutDate);

  if (isNaN(inDate.getTime()) || isNaN(outDate.getTime())) {
    return res.status(400).json({ success: false, message: 'Invalid date format for checkInDate or checkOutDate.' });
  }

  if (outDate <= inDate) {
    return res.status(400).json({ success: false, message: 'checkOutDate must be strictly after checkInDate.' });
  }

  next();
}

/**
 * Validates payment creation payload
 */
function validatePayment(req, res, next) {
  const { bookingId } = req.body || {};

  if (!bookingId || typeof bookingId !== 'string' || bookingId.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'bookingId is required.' });
  }

  next();
}

/**
 * Validates review creation payload
 */
function validateReview(req, res, next) {
  const { roomId, rating, comment } = req.body || {};

  if (!roomId || typeof roomId !== 'string' || roomId.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'roomId is required.' });
  }

  const numRating = Number(rating);
  if (rating === undefined || isNaN(numRating) || numRating < 1 || numRating > 5) {
    return res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5.' });
  }

  if (!comment || typeof comment !== 'string' || comment.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'Review comment cannot be empty.' });
  }

  next();
}

/**
 * Validates service request creation payload
 */
function validateServiceRequest(req, res, next) {
  const { roomNumber, details, type } = req.body || {};

  if (!roomNumber || typeof roomNumber !== 'string' || roomNumber.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'roomNumber is required.' });
  }

  if (!details || typeof details !== 'string' || details.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'Service details cannot be empty.' });
  }

  if (type && !VALID_SERVICE_TYPES.includes(type)) {
    return res.status(400).json({
      success: false,
      message: `Invalid service type. Allowed: ${VALID_SERVICE_TYPES.join(', ')}`
    });
  }

  next();
}

/**
 * Generic required fields validator
 */
function validateRequired(fields = []) {
  return (req, res, next) => {
    const missing = [];
    for (const field of fields) {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        missing.push(field);
      }
    }
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(', ')}`
      });
    }
    next();
  };
}

module.exports = {
  sanitizeBody,
  validateRegister,
  validateLogin,
  validateRoom,
  validateBooking,
  validatePayment,
  validateReview,
  validateServiceRequest,
  validateRequired
};
