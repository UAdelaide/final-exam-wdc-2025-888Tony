const express = require('express');
const path = require('path');
require('dotenv').config();
const session = require('express-session'); // for session management

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));

// Session middleware setup
app.use(session({
  secret: 'a-super-secret-key-for-the-dog-walking-app',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));


// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');
const dogRoutes = require('./routes/dogRoutes'); // New route imported

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dogs', dogRoutes); // New route used

// Export the app instead of listening here
module.exports = app;