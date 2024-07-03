const mongoose = require('mongoose');

const connectDB = (url) => {
  mongoose.set('strictQuery', true);
  console.log("connecting to MongoDB.....")
  mongoose.connect(url)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log("connection failed: " + error))
}

module.exports = connectDB;