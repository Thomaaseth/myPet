require('dotenv/config');

const express = require('express');
const cors = require('cors');

const app = express();

// CORS configuration
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }));

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Static files
app.use('/uploads', express.static('uploads'));

// Apply other configurations from src
require('./src/config/config')(app);

// Routes from src
const authRoutes = require('./src/routes/auth.routes');
const petRoutes = require('./src/routes/pet.routes');
const vetRoutes = require('./src/routes/vet.routes');

app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/', vetRoutes);

// Error handling
require('./error-handling/error.handling')(app);

module.exports = app;