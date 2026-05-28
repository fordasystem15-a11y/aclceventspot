// backend/routes/eventRoutes.js
const express = require('express');
const Event = require('../models/Event');
const authMiddleware = require("../middleware/auth");
const roleCheck = require('../middleware/roleCheck');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
  }),
});

// ✅ Helper: build full image URL for production
const getImageUrl = (filename) => {
  const baseUrl =
    process.env.NODE_ENV === 'production'
      ? 'https://aclceventspot-backend.onrender.com'
      : 'http://localhost:5000';
  return `${baseUrl}/uploads/${filename}`;
};

// ✅ Admin/Superadmin can create events
router.post(
  '/',
  authMiddleware,
  roleCheck(['admin', 'superadmin']),
  upload.single('image'),
  async (req, res) => {
    try {
      const { title, description } = req.body;
      if (!title || !description || !req.file) {
        return res.status(400).json({ error: 'Title, description, and image are required' });
      }

      const event = new Event({
        title,
        description,
        image: getImageUrl(req.file.filename), // ✅ absolute URL
        createdBy: req.user.id,
      });

      await event.save();
      res.json(event);
    } catch (err) {
      console.error('Event creation error:', err);
      res.status(500).json({ error: 'Failed to create event' });
    }
  }
);

// ✅ Anyone can list events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// ✅ Increment views only once per user
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (!event.viewedBy.includes(req.user.id)) {
      event.views += 1;
      event.viewedBy.push(req.user.id);
      await event.save();
    }

    res.json(event);
  } catch (err) {
    console.error('Event fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// ✅ Reactions (only one per user)
router.post('/:id/react', authMiddleware, async (req, res) => {
  try {
    const { type } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const existingReaction = event.reactedBy.find(r => r.user.toString() === req.user.id);

    if (existingReaction) {
      existingReaction.type = type; // ✅ update reaction type
    } else {
      event.reactedBy.push({ user: req.user.id, type });
    }

    event.reactions.like = event.reactedBy.filter(r => r.type === 'like').length;
    event.reactions.love = event.reactedBy.filter(r => r.type === 'love').length;
    event.reactions.wow = event.reactedBy.filter(r => r.type === 'wow').length;

    await event.save();
    res.json(event);
  } catch (err) {
    console.error('Reaction error:', err);
    res.status(500).json({ error: 'Failed to react' });
  }
});

// ✅ Comments
router.post('/:id/comment', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    event.comments.push({
      user: req.user.name,
      avatar: req.user.avatar || getImageUrl('default-avatar.png'),
      text,
      createdAt: new Date(),
    });

    await event.save();
    res.json(event);
  } catch (err) {
    console.error('Comment error:', err);
    res.status(500).json({ error: 'Failed to comment' });
  }
});

// ✅ Delete event (Admins/Superadmins only)
router.delete('/:id', authMiddleware, roleCheck(['admin', 'superadmin']), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    await event.deleteOne();
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('Event deletion error:', err);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

module.exports = router;
