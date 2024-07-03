const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
    name: { type: String, unique: true, require: true }, 
});

const ClassModel = mongoose.model("Class", ClassSchema);

module.exports = ClassModel;
