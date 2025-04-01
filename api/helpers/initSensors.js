// helpers/initSensors.js
const Sensor = require('../models/Sensor');

const min = { x: 730799.2656555176, y: 4383421.701904297, z: 0 };
const max = { x: 731108.456237793, y: 4383730.892486572, z: 309.1905822753906 };

const possibleTypes = [
  { icon: "fa-thermometer-half", title: "Temperature", unit: "°C" },
  { icon: "fa-tint", title: "Humidity", unit: "%" },
  { icon: "fa-cloud", title: "Atmospheric Pressure", unit: "hPa" },
  { icon: "fa-leaf", title: "Ground Status", unit: "" },
  { icon: "fa-sun", title: "Solar", unit: "W/m²" },
  { icon: "fa-bolt", title: "Wind", unit: "m/s" },
  { icon: "fa-water", title: "Water", unit: "mm" }
];

function getRandom(minVal, maxVal) {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  const center = (minVal + maxVal) / 2;
  const sigma = (maxVal - minVal) / 6;
  let value = center + num * sigma;
  if (value < minVal) value = minVal;
  if (value > maxVal) value = maxVal;
  return value;
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

      const numTypes = Math.floor(Math.random() * 2) + 1;
      const shuffled = possibleTypes.sort(() => 0.5 - Math.random());
      const types = shuffled.slice(0, numTypes);

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
