const mongoose = require('mongoose');

const SensorReadingSchema = new mongoose.Schema({
  sensorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sensor' },
  data: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SensorReading', SensorReadingSchema);
