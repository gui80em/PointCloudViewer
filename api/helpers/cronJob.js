// helpers/cronJob.js
const cron = require('node-cron');
const Sensor = require('../models/Sensor');
const SensorReading = require('../models/SensorReading');


function getRandomValue(min, max) {
  return Math.random() * (max - min) + min;
}


function generateSensorReading(sensor) {
  const reading = {};

  sensor.types.forEach((sensorType) => {
    const title = sensorType.title;
    switch (title) {
      case "Temperature":
        reading.Temperature = parseFloat(getRandomValue(15, 30).toFixed(2));
        break;
      case "Humidity":
        reading.Humidity = parseFloat(getRandomValue(30, 80).toFixed(2));
        break;
      case "Atmospheric Pressure":
        reading["Atmospheric Pressure"] = parseFloat(getRandomValue(1000, 1050).toFixed(2));
        break;
      case "Ground Status":
        reading["Ground Status"] = parseFloat(getRandomValue(0, 100).toFixed(2));
        break;
      case "Solar":
        reading.Solar = parseFloat(getRandomValue(0, 1000).toFixed(2));
        break;
      case "Wind":
        reading.Wind = parseFloat(getRandomValue(0, 20).toFixed(2));
        break;
      case "Water":
        reading.Water = parseFloat(getRandomValue(0, 50).toFixed(2));
        break;
      default:
        reading[title] = parseFloat(getRandomValue(0, 100).toFixed(2));
    }
  });

  return reading;
}

function startCronJob() {
  // Schedule the job to run every 5 minutes (*/5 * * * *)
  cron.schedule('*/5 * * * *', async () => {
    console.log('Cron job: Creating sensor readings...');
    try {
      // Retrieve all sensors.
      const sensors = await Sensor.find();
      for (const sensor of sensors) {
        // Generate reading data based on sensor types.
        const readingData = generateSensorReading(sensor);

        // Create a new sensor reading.
        const newReading = new SensorReading({
          sensorId: sensor._id,
          data: readingData,
        });
        await newReading.save();

        console.log(`Created new reading for Sensor [${sensor.name}]:`, readingData);
      }
    } catch (err) {
      console.error('Error in cron job:', err);
    }
  });
}

module.exports = startCronJob;
