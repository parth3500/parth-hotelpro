const { createModel } = require('./modelFactory');

const RoomSchema = {
  roomNumber: { type: String, required: true, unique: true },
  hotelId: { type: String, default: 'hotel_1' },
  category: { type: String, required: true, enum: ['Standard', 'Deluxe', 'Suite', 'Executive'] },
  pricePerNight: { type: Number, required: true },
  capacity: { type: Number, default: 2 },
  bedType: { type: String, default: 'King' },
  floor: { type: Number, default: 1 },
  amenities: { type: [String], default: ['Wi-Fi', 'TV', 'Air Conditioning', 'Safe', 'Mini Bar'] },
  images: { type: [String], default: [] },
  status: { type: String, enum: ['available', 'occupied', 'cleaning', 'maintenance'], default: 'available' },
  description: { type: String, default: '' },
  isActive: { type: Boolean, default: true }
};

const Room = createModel('Room', RoomSchema);

module.exports = Room;
