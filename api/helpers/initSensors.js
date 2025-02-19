// helpers/initSensors.js
const Sensor = require('../models/Sensor');

const min = { x: 730799.2656555176, y: 4383421.701904297, z: 0 };
const max = { x: 731108.456237793, y: 4383730.892486572, z: 309.1905822753906 };

const possibleTypes = [
  { icon: "fa-thermometer-half", title: "Temperature" },
  { icon: "fa-tint", title: "Humidity" },
  { icon: "fa-cloud", title: "Atmospheric Pressure" },
  { icon: "fa-leaf", title: "Ground Status" },
  { icon: "fa-sun", title: "Solar" },
  { icon: "fa-bolt", title: "Wind" },
  { icon: "fa-water", title: "Water" }
];

function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

async function initSensors() {
  try {
    const count = await Sensor.countDocuments();
    if (count > 0) {
      console.log('Sensors already initialized');
      return;
    }

    console.log('Initializing sensors...');

    const sensorsToInsert = [];
    for (let i = 0; i < 6; i++) {

      const location = {
        x: getRandom(min.x, max.x),
        y: getRandom(min.y, max.y),
        z: getRandom(min.z, max.z),
      };

      // Randomly decide if the sensor will have one or two types
      const numTypes = Math.floor(Math.random() * 2) + 1;
      // Shuffle possibleTypes and pick the first numTypes entries
      const shuffled = possibleTypes.sort(() => 0.5 - Math.random());
      const types = shuffled.slice(0, numTypes);

      // Create a sensor name (e.g., "Sensor 1", "Sensor 2", …)
      const name = `Sensor ${i + 1}`;

      sensorsToInsert.push({
        name,
        types,
        location,
      });
    }

    await Sensor.insertMany(sensorsToInsert);
    console.log('Sensors initialized successfully.');
  } catch (err) {
    console.error('Error initializing sensors:', err);
  }
}

module.exports = initSensors;
