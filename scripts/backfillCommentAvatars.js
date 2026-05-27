// scripts/backfillCommentAvatars.js
const mongoose = require('mongoose');
const Event = require('../models/Event');
const User = require('../models/User');
require('dotenv').config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const events = await Event.find();
    for (const event of events) {
      let updated = false;

      for (const comment of event.comments) {
        // Only fix comments missing avatar
        if (!comment.avatar) {
          const userDoc = await User.findOne({ name: comment.user });
          if (userDoc && userDoc.avatar) {
            comment.avatar = userDoc.avatar;
            updated = true;
            console.log(`Updated avatar for comment by ${comment.user} in event ${event._id}`);
          } else {
            // fallback to default
            comment.avatar = '/uploads/default-avatar.png';
            updated = true;
            console.log(`Set default avatar for comment by ${comment.user} in event ${event._id}`);
          }
        }
      }

      if (updated) {
        await event.save();
      }
    }

    console.log('Backfill complete!');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

run();
