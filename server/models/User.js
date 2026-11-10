const { createModel } = require('./modelFactory');

const UserSchema = {
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['guest', 'staff', 'admin'], default: 'guest' },
  phone: { type: String, default: '' },
  avatar: { type: String, default: '' },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  assignedDepartment: { type: String, default: 'General' }
};

const User = createModel('User', UserSchema);

module.exports = User;
