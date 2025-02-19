// database/index.js
const mongoose = require('mongoose');
const initSensors = require('../helpers/initSensors');


const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/sensorsdb'
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URL, { });
    console.log('MongoDB connected');
    //mongoose.connection.once("")
    // Initialize sensors if none exist
    await initSensors();
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

module.exports = connectDB;
