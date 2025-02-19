// test/api.test.js
const request = require('supertest');
const app = require('../index');
const Sensor = require('../models/Sensor');
const SensorReading = require('../models/SensorReading');
const mongoose = require('mongoose');
const chai = require('chai');
const expect = chai.expect;

describe('Sensor API Routes', function() {
  // Increase timeout if needed
  this.timeout(10000);

  // Wait for the DB connection to be ready before tests run.
  before(function(done) {
    if (mongoose.connection.readyState === 1) {
      return done();
    }
    mongoose.connection.once('open', done);
  });

  // After tests, close the mongoose connection
  after(function(done) {
    mongoose.connection.close(done);
  });

  describe('GET /api/sensors', () => {
    it('should return an array of sensors', async () => {
      const res = await request(app)
        .get('/api/sensors')
        .expect(200);
      
      expect(res.body).to.be.an('array');
    });
  });

  describe('GET /api/sensors/:id', () => {
    it('should return sensor details for a valid sensor id', async function() {
      // Get one sensor from the DB
      const sensor = await Sensor.findOne();
      if (!sensor) {
        this.skip(); // Skip test if no sensor found.
      }
      const res = await request(app)
        .get(`/api/sensors/${sensor._id}`)
        .expect(200);
      expect(res.body).to.have.property('_id', sensor._id.toString());
      expect(res.body).to.have.property('name');
    });
  });

  describe('GET /api/real/sensors/:id', () => {
    it('should return the latest sensor reading for a valid sensor id', async function() {
      // Get one sensor from the DB.
      const sensor = await Sensor.findOne();
      if (!sensor) {
        this.skip();
      }

      // Ensure there's at least one reading for this sensor.
      let sensorReading = await SensorReading.findOne({ sensorId: sensor._id }).sort({ createdAt: -1 });
      if (!sensorReading) {
        sensorReading = new SensorReading({
          sensorId: sensor._id,
          data: { Temperature: 25.5, Humidity: 50 }
        });
        await sensorReading.save();
      }

      const res = await request(app)
        .get(`/api/real/sensors/${sensor._id}`)
        .expect(200);
      expect(res.body).to.have.property('data');
    });
  });
});
