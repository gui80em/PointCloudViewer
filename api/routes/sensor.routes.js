// routes/sensorRoutes.js
const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensor.controller');
const historyController = require('../controllers/history.controller');


// GET /api/sensors - Retrieve all sensors (optionally filtered by bounding box)
router.get('/sensors', sensorController.getSensors);

// GET /api/sensors/:id - Retrieve a specific sensor by its ID
router.get('/sensors/:id', sensorController.getSensorById);

// GET /api/real/sensors/:id - Retrieve the latest sensor reading for a sensor
router.get('/real/sensors/:id', historyController.getLatestSensorReading);

// GET /api/history/sensors/:id
router.get('/history/sensors/:id', historyController.getSensorHistory);

module.exports = router;
