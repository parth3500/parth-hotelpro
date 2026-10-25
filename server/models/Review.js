const { createModel } = require('./modelFactory');

const ReviewSchema = {
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  roomId: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  staffResponse: { type: String, default: null }
};

const Review = createModel('Review', ReviewSchema);

module.exports = Review;
