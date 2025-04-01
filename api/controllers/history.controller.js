// controllers/historyController.js
const SensorReading = require('../models/SensorReading');

function getStartDate(timeRange) {
  const now = new Date();
  let start;
  switch (timeRange) {
    case '1day':
      start = new Date(now.getTime() - 24 * 3600 * 1000);
      break;
    case '1week':
      start = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
      break;
    case '1month':
      start = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
      break;
    case '1year':
      start = new Date(now.getTime() - 365 * 24 * 3600 * 1000);
      break;
    case '5years':
      start = new Date(now.getTime() - 5 * 365 * 24 * 3600 * 1000);
      break;
    default:
      start = new Date(0); // return all history if no valid timeRange is given
  }
  return start;
}

exports.getSensorHistory = async (req, res) => {
  try {
    const sensorId = req.params.id;
    const type = req.query.type; 
    const timeRange = req.query.timeRange || '1day';
    
    const startDate = getStartDate(timeRange);
    
    // Find readings for this sensor since the startDate
    const readings = await SensorReading.find({
      sensorId,
      createdAt: { $gte: startDate }
    }).sort({ createdAt: 1 }); // sort ascending by time

    // If a sensor type is provided, extract that property from each reading.
    if (type) {
      const dataPoints = readings
        .map(reading => {
          const value = reading.data[type];
          if (value !== undefined) {
            return { timestamp: reading.createdAt, value };
          }
          return null;
        })
        .filter(pt => pt !== null);
      return res.json(dataPoints);
    } else {
      // Otherwise, return the full readings
      return res.json(readings);
    }
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
