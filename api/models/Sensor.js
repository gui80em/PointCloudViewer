// models/Sensor.js
const mongoose = require('mongoose');

const SensorTypeSchema = new mongoose.Schema({
  title: String,
  icon: String,
  unit: String,
});

const SensorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  types: [SensorTypeSchema],
  location: {
    x: Number,
    y: Number,
    z: Number,
  },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Sensor', SensorSchema);
