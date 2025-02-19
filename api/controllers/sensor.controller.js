// controllers/sensorController.js
const Sensor = require('../models/Sensor');
const SensorReading = require('../models/SensorReading');

exports.getSensors = async (req, res) => {
  try {
    const query = {};

    // If bounding box parameters are provided, filter by location.
    // Example: /api/sensors?minX=730800&maxX=731100&minY=4383422&maxY=4383731&minZ=0&maxZ=310
    const { minX, maxX, minY, maxY, minZ, maxZ } = req.query;
    if (minX && maxX && minY && maxY) {
      query['location.x'] = { $gte: parseFloat(minX), $lte: parseFloat(maxX) };
      query['location.y'] = { $gte: parseFloat(minY), $lte: parseFloat(maxY) };
      if (minZ && maxZ) {
        query['location.z'] = { $gte: parseFloat(minZ), $lte: parseFloat(maxZ) };
      }
    }

    const sensors = await Sensor.find(query);
    res.json(sensors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSensorById = async (req, res) => {
  try {
    const sensor = await Sensor.findById(req.params.id);
    if (!sensor) {
      return res.status(404).json({ error: 'Sensor not found' });
    }
    res.json(sensor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLatestSensorReading = async (req, res) => {
  try {
    const latestReading = await SensorReading.findOne({ sensorId: req.params.id })
      .sort({ createdAt: -1 });
    if (!latestReading) {
      return res.status(404).json({ error: 'No readings found for this sensor' });
    }
    res.json(latestReading);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
