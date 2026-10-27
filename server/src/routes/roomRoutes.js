const express = require('express');
const {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
} = require('../controllers/roomController');
const { protect, isAdmin } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getRooms)
  .post(protect, isAdmin, createRoom);

router.route('/:id')
  .get(getRoomById)
  .put(protect, isAdmin, updateRoom)
  .delete(protect, isAdmin, deleteRoom);

module.exports = router;
