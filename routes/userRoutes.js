const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth'); // ✅ consistent import

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/avatars'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Upload avatar route
router.post('/avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // ✅ Use absolute URL for Render deployment
    const baseURL = process.env.BASE_URL || 'https://aclceventspot-backend.onrender.com';
    user.avatar = `${baseURL}/uploads/avatars/${req.file.filename}`;
    await user.save();

    res.json({ avatar: user.avatar });
  } catch (err) {
    console.error('Avatar upload error:', err);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

module.exports = router;
