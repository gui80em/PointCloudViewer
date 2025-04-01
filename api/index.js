// index.js

const express = require('express');
const cors = require("cors")
const app = express();
const port = process.env.PORT || 8080;


const sensorRoutes = require('./routes/sensor.routes');
const connectDB = require('./database');
const startCronJob = require('./helpers/cronJob');

// Connect to the database (and initialize sensors if needed)
connectDB();

// Middleware to parse JSON bodies
app.use(cors())
app.use(express.json());

// Mount sensor routes under /api
app.use('/api', sensorRoutes);

// Start the server only if not in test mode
if (process.env.NODE_ENV !== 'test') {
    // Start the cron job (runs every 5 minutes)
    startCronJob();

    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

module.exports = app;
