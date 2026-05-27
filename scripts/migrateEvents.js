// migrateEvents.js
const mongoose = require('mongoose');
const Event = require('../models/Event');

async function migrate() {
  try {
    await mongoose.connect('mongodb://localhost:27017/yourdbname');

    const events = await Event.find({ caption: { $exists: true } });

    for (const ev of events) {
      // Move caption into description if description is missing
      if (!ev.description && ev.caption) {
        ev.description = ev.caption;
      }

      // Ensure title exists (fallback if missing)
      if (!ev.title) {
        ev.title = 'Untitled Event';
      }

      // Remove old caption field
      ev.caption = undefined;

      await ev.save();
      console.log(`Migrated event ${ev._id}`);
    }

    console.log('Migration complete!');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

migrate();
