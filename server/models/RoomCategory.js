const { createModel } = require('./modelFactory');

const RoomCategorySchema = {
  name: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  basePrice: { type: Number, required: true },
  capacity: { type: Number, default: 2 },
  features: { type: [String], default: [] }
};

const RoomCategory = createModel('RoomCategory', RoomCategorySchema);

module.exports = RoomCategory;
