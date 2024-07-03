const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const ClassResponsibleSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  number: { type: String, },
  email: { type: String, },
  personalId: { type: String, },
  class: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
  // You can add any specific fields for admin here
});

// Hash the password before saving to the database
ClassResponsibleSchema.pre('save', async function (next) {
  const classResponsible = this;

  const hash = await bcrypt.hash(classResponsible.password, 10);
  classResponsible.password = hash;
  next();
});

const ClassResponsibleModel = mongoose.model('ClassResponsible', ClassResponsibleSchema);

module.exports = ClassResponsibleModel;
