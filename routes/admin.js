const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');   // ✅ consistent import
const roleMiddleware = require('../middleware/role');

const router = express.Router();

// Get all users (admin-only)
router.get('/users', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Promote user to admin (admin-only)
router.put('/promote/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: 'admin' },
      { new: true, runValidators: false }
    );

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User promoted to admin successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Demote admin back to user (admin-only, safeguard for superadmin)
router.put('/demote/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ error: 'User not found' });

    // Prevent demoting superadmin
    if (user.role === 'superadmin') {
      return res.status(403).json({ error: 'Cannot demote Super Admin account' });
    }

    // Prevent demoting yourself
    if (user._id.toString() === req.user.id) {
      return res.status(403).json({ error: 'You cannot demote your own account' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { role: 'user' },
      { new: true, runValidators: false }
    );

    res.json({ message: 'Admin demoted to user successfully', user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
