const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",   // ✅ links blog to an Event
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",    // ✅ links blog to a User
    required: true
  },
  content: {
    type: String,
    required: true, // ✅ even 1 word is allowed
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now // ✅ auto timestamp
  },
  reactions: {
  like: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  love: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  wow: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }

});

module.exports = mongoose.model("Blog", blogSchema);
