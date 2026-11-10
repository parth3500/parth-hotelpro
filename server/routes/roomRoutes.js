const express = require('express');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateRoom, sanitizeBody } = require('../middleware/validate');

const router = express.Router();

// shortcut: in-memory date overlap filtering, upgrade to MongoDB aggregation pipeline with compound index on (roomId, checkInDate, checkOutDate) for high-scale room searches

// GET /available (or /rooms/available) - MUST be defined before /:id
router.get('/available', async (req, res, next) => {
  try {
    const { checkInDate, checkOutDate, category, capacity, minPrice, maxPrice } = req.query;

    let allRooms = await Room.find({ isActive: true });
    // Filter out maintenance rooms
    let candidateRooms = allRooms.filter(r => r.status !== 'maintenance');

    if (category) {
      candidateRooms = candidateRooms.filter(r => r.category.toLowerCase() === category.toLowerCase());
    }

    if (capacity) {
      const cap = Number(capacity);
      if (!isNaN(cap)) {
        candidateRooms = candidateRooms.filter(r => (r.capacity || 2) >= cap);
      }
    }

    if (minPrice) {
      const min = Number(minPrice);
      if (!isNaN(min)) {
        candidateRooms = candidateRooms.filter(r => r.pricePerNight >= min);
      }
    }

    if (maxPrice) {
      const max = Number(maxPrice);
      if (!isNaN(max)) {
        candidateRooms = candidateRooms.filter(r => r.pricePerNight <= max);
      }
    }

    // If dates are provided, filter out rooms with overlapping active bookings
    if (checkInDate && checkOutDate) {
      const targetIn = new Date(checkInDate);
      const targetOut = new Date(checkOutDate);

      if (isNaN(targetIn.getTime()) || isNaN(targetOut.getTime()) || targetIn >= targetOut) {
        return res.status(400).json({
          success: false,
          message: 'checkOutDate must be after checkInDate and both dates must be valid.'
        });
      }

      const activeBookings = await Booking.find({
        status: { $in: ['confirmed', 'checked_in', 'pending'] }
      });

      const bookedRoomIds = new Set();
      for (const b of activeBookings) {
        const bIn = new Date(b.checkInDate);
        const bOut = new Date(b.checkOutDate);

        // Overlap condition: targetIn < bOut && targetOut > bIn
        if (targetIn < bOut && targetOut > bIn) {
          bookedRoomIds.add((b.roomId || '').toString());
        }
      }

      candidateRooms = candidateRooms.filter(r => {
        const roomIdStr = (r._id || r.id || '').toString();
        return !bookedRoomIds.has(roomIdStr);
      });
    }

    return res.status(200).json({
      success: true,
      count: candidateRooms.length,
      rooms: candidateRooms
    });
  } catch (err) {
    next(err);
  }
});

// GET / (or /rooms) - List all rooms with optional filtering
router.get('/', async (req, res, next) => {
  try {
    const { category, status, minPrice, maxPrice, capacity } = req.query;
    let rooms = await Room.find();

    if (category) {
      rooms = rooms.filter(r => r.category.toLowerCase() === category.toLowerCase());
    }
    if (status) {
      rooms = rooms.filter(r => r.status.toLowerCase() === status.toLowerCase());
    }
    if (capacity) {
      rooms = rooms.filter(r => (r.capacity || 2) >= Number(capacity));
    }
    if (minPrice) {
      rooms = rooms.filter(r => r.pricePerNight >= Number(minPrice));
    }
    if (maxPrice) {
      rooms = rooms.filter(r => r.pricePerNight <= Number(maxPrice));
    }

    return res.status(200).json({
      success: true,
      count: rooms.length,
      rooms
    });
  } catch (err) {
    next(err);
  }
});

// GET /:id (or /rooms/:id) - Get room details
router.get('/:id', async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: `Room with ID ${req.params.id} not found.`
      });
    }

    return res.status(200).json({
      success: true,
      room
    });
  } catch (err) {
    next(err);
  }
});

// POST / (or /rooms) - Create room (Admin only)
router.post('/', authenticateToken, authorizeRoles('admin'), sanitizeBody, validateRoom, async (req, res, next) => {
  try {
    const {
      roomNumber,
      category,
      pricePerNight,
      capacity,
      bedType,
      floor,
      amenities,
      images,
      description,
      status
    } = req.body;

    const existing = await Room.findOne({ roomNumber: roomNumber.trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Room number '${roomNumber}' already exists.`
      });
    }

    const newRoom = await Room.create({
      roomNumber: roomNumber.trim(),
      category,
      pricePerNight: Number(pricePerNight),
      capacity: capacity ? Number(capacity) : 2,
      bedType: bedType || 'King',
      floor: floor ? Number(floor) : 1,
      amenities: Array.isArray(amenities) ? amenities : ['Wi-Fi', 'TV', 'Air Conditioning'],
      images: Array.isArray(images) ? images : [],
      description: description || '',
      status: status || 'available',
      isActive: true
    });

    return res.status(201).json({
      success: true,
      message: 'Room created successfully',
      room: newRoom
    });
  } catch (err) {
    next(err);
  }
});

// PUT /:id (or /rooms/:id) - Update room (Admin only)
router.put('/:id', authenticateToken, authorizeRoles('admin'), sanitizeBody, async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: `Room with ID ${req.params.id} not found.`
      });
    }

    const updateFields = { ...req.body };
    delete updateFields._id;
    delete updateFields.id;

    if (updateFields.pricePerNight !== undefined) {
      updateFields.pricePerNight = Number(updateFields.pricePerNight);
    }
    if (updateFields.capacity !== undefined) {
      updateFields.capacity = Number(updateFields.capacity);
    }
    if (updateFields.floor !== undefined) {
      updateFields.floor = Number(updateFields.floor);
    }

    const updatedRoom = await Room.findByIdAndUpdate(req.params.id, updateFields);

    return res.status(200).json({
      success: true,
      message: 'Room updated successfully',
      room: updatedRoom
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /:id (or /rooms/:id) - Delete room (Admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: `Room with ID ${req.params.id} not found.`
      });
    }

    await Room.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
