const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  image: { type: String, required: true },

  // ✅ Title shown in Events.js cards
  title: { type: String, required: true },

  // ✅ Description shown in EventDetails.js
  description: { type: String, required: true },

  reactions: {
    like: { type: Number, default: 0 },
    love: { type: Number, default: 0 },
    wow: { type: Number, default: 0 },
  },
  reactedBy: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      type: { type: String, enum: ['like', 'love', 'wow'] }
    }
  ],
  comments: [
    {
      user: String,
      avatar: String,
      text: String,
      createdAt: { type: Date, default: Date.now }
    }
  ],

  views: { type: Number, default: 0 },
  viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);
