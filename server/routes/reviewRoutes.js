const express = require('express');
const Review = require('../models/Review');
const Room = require('../models/Room');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateReview, sanitizeBody } = require('../middleware/validate');

const router = express.Router();

// shortcut: linear memory average rating calculation, upgrade to MongoDB aggregation pipeline with materialised rating fields on Room documents

// POST / (or /reviews) - Submit room review
router.post('/', authenticateToken, sanitizeBody, validateReview, async (req, res, next) => {
  try {
    const { roomId, rating, comment } = req.body;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: `Room with ID ${roomId} not found.`
      });
    }

    const review = await Review.create({
      userId: req.user.id,
      userName: req.user.name || 'Valued Guest',
      roomId: (room._id || room.id).toString(),
      rating: Number(rating),
      comment: comment.trim()
    });

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review
    });
  } catch (err) {
    next(err);
  }
});

// GET /room/:roomId (or /reviews/room/:roomId) - Get reviews for a room
router.get('/room/:roomId', async (req, res, next) => {
  try {
    const reviews = await Review.find({ roomId: req.params.roomId });
    const count = reviews.length;
    const averageRating = count > 0
      ? Number((reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / count).toFixed(1))
      : 0;

    return res.status(200).json({
      success: true,
      count,
      averageRating,
      reviews
    });
  } catch (err) {
    next(err);
  }
});

// GET / (or /reviews) - Get all reviews
router.get('/', async (req, res, next) => {
  try {
    const reviews = await Review.find();
    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (err) {
    next(err);
  }
});

// PUT /:id/response (or /reviews/:id/response) - Staff responds to guest review
router.put('/:id/response', authenticateToken, authorizeRoles('staff', 'admin'), sanitizeBody, async (req, res, next) => {
  try {
    const { staffResponse } = req.body;
    if (!staffResponse || typeof staffResponse !== 'string' || !staffResponse.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Staff response text is required.'
      });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: `Review with ID ${req.params.id} not found.`
      });
    }

    const updated = await Review.findByIdAndUpdate(req.params.id, {
      staffResponse: staffResponse.trim()
    });

    return res.status(200).json({
      success: true,
      message: 'Staff response submitted successfully',
      review: updated
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
