const { createModel } = require('./modelFactory');

const HotelSchema = {
  name: { type: String, required: true },
  description: { type: String, default: '' },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  country: { type: String, default: '' },
  rating: { type: Number, default: 4.8 },
  amenities: { type: [String], default: ['Free Wi-Fi', 'Pool', 'Spa', 'Restaurant', 'Gym', 'Parking'] },
  images: { type: [String], default: [] },
  contactEmail: { type: String, default: 'concierge@hotelpro.com' },
  contactPhone: { type: String, default: '+1 (555) 123-4567' },
  checkInTime: { type: String, default: '14:00' },
  checkOutTime: { type: String, default: '11:00' }
};

const Hotel = createModel('Hotel', HotelSchema);

module.exports = Hotel;
