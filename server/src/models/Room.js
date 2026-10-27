const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: [true, 'Please provide a room number'],
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    trim: true,
    default: function() {
      return `Room ${this.roomNumber}`;
    },
  },
  type: {
    type: String,
    required: [true, 'Please provide room type'],
    enum: ['single', 'double', 'suite', 'deluxe', 'executive', 'standard'],
    lowercase: true,
  },
  pricePerNight: {
    type: Number,
    required: [true, 'Please provide price per night'],
    min: [0, 'Price cannot be negative'],
  },
  price: {
    type: Number,
    default: function() {
      return this.pricePerNight;
    },
  },
  capacity: {
    type: Number,
    required: [true, 'Please provide room capacity'],
    min: [1, 'Capacity must be at least 1'],
  },
  size: {
    type: String,
    trim: true,
    default: '35 m²',
  },
  bed: {
    type: String,
    trim: true,
    default: '1 King Bed',
  },
  rating: {
    type: Number,
    default: 4.8,
  },
  reviewsCount: {
    type: Number,
    default: 12,
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80',
  },
  images: [{
    type: String,
  }],
  amenities: [{
    type: String,
    trim: true,
  }],
  description: {
    type: String,
    trim: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Sync price and pricePerNight
roomSchema.pre('save', function(next) {
  if (this.price && !this.pricePerNight) {
    this.pricePerNight = this.price;
  } else if (this.pricePerNight && !this.price) {
    this.price = this.pricePerNight;
  }
  if (!this.images || this.images.length === 0) {
    this.images = [this.image];
  }
  next();
});

const Room = mongoose.model('Room', roomSchema);
module.exports = Room;
