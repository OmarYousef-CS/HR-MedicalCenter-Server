const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const AdminSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: { type: String },
  isAdmin: { type: Boolean, default: true },
  // You can add any specific fields for admin here
});

// Hash the password before saving to the database
AdminSchema.pre('save', async function (next) {
  const admin = this;

  if (admin.isModified('password') || admin.isNew) {
    const hash = await bcrypt.hash(admin.password, 10);
    admin.password = hash;
    next();
  } else {
    return next();
  }
});

const AdminModel = mongoose.model('Admin', AdminSchema);

module.exports = AdminModel;
