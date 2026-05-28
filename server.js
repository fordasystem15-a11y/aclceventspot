// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const app = express();

// ✅ CORS configuration — allow your Vercel frontend
app.use(cors({
  origin: [
    'https://aclceventspot-frontend.vercel.app', // your live frontend
    'http://localhost:3000'                      // for local testing
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));

app.use(express.json());

// ✅ Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Simple test route
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

// Connect to MongoDB
console.log('Mongo URI:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, { family: 4 })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// ✅ Routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const eventRoutes = require('./routes/eventRoutes');
const userRoutes = require('./routes/userRoutes');
const blogRoutes = require('./routes/blogRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/blogs', blogRoutes);

// ✅ Middleware imports
const authMiddleware = require('./middleware/auth');
const roleMiddleware = require('./middleware/role');

// Optional helper (already covered by authMiddleware)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Protected route (any logged-in user)
app.get('/api/secure-data', authMiddleware, (req, res) => {
  res.json({
    message: 'This is protected data!',
    user: req.user
  });
});

// Protected route (admin only)
app.get('/api/admin-dashboard', authMiddleware, roleMiddleware('admin'), (req, res) => {
  res.json({
    message: 'Welcome to the admin dashboard',
    user: req.user
  });
});

// Protected route (user only)
app.get('/api/user-dashboard', authMiddleware, roleMiddleware('user'), (req, res) => {
  res.json({
    message: 'Welcome to the user dashboard',
    user: req.user
  });
});
