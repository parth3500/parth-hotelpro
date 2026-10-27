const Room = require('../models/Room');

// @desc    Get all rooms (with optional filters)
// @route   GET /api/rooms
// @access  Public
const getRooms = async (req, res, next) => {
  try {
    const { type, capacity, minPrice, maxPrice, isAvailable } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (capacity) filter.capacity = { $gte: Number(capacity) };
    if (minPrice || maxPrice) {
      filter.pricePerNight = {};
      if (minPrice) filter.pricePerNight.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerNight.$lte = Number(maxPrice);
    }
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';

    const rooms = await Room.find(filter);
    res.json({
      success: true,
      count: rooms.length,
      data: rooms,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single room by ID
// @route   GET /api/rooms/:id
// @access  Public
const getRoomById = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    res.json({ success: true, data: room });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a room
// @route   POST /api/rooms
// @access  Private/Admin
const createRoom = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (payload.price && !payload.pricePerNight) {
      payload.pricePerNight = Number(payload.price);
    }
    if (!payload.roomNumber) {
      payload.roomNumber = `RM-${Math.floor(100 + Math.random() * 900)}`;
    }
    if (payload.type) {
      payload.type = payload.type.toLowerCase();
    }
    const room = await Room.create(payload);
    res.status(201).json({ success: true, data: room });
  } catch (err) {
    next(err);
  }
};

// @desc    Update room
// @route   PUT /api/rooms/:id
// @access  Private/Admin
const updateRoom = async (req, res, next) => {
  try {
    let room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const payload = { ...req.body };
    if (payload.price && !payload.pricePerNight) {
      payload.pricePerNight = Number(payload.price);
    }
    if (payload.type) {
      payload.type = payload.type.toLowerCase();
    }

    room = await Room.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: room });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Private/Admin
const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    await room.deleteOne();
    res.json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

module.exports = { getRooms, getRoomById, createRoom, updateRoom, deleteRoom };
