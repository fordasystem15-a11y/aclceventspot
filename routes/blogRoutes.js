const express = require("express");
const Blog = require("../models/Blog");
const authMiddleware = require("../middleware/auth");   // ✅ consistent import
const roleMiddleware = require("../middleware/role");   // optional moderation

const router = express.Router();

// Create a new blog post
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { event, content } = req.body;

    if (!event || !content) {
      return res.status(400).json({ message: "Event and content are required." });
    }

    const blog = new Blog({
      event,
      content,
      author: req.user.id,       // logged-in user becomes author
      createdAt: new Date()
    });

    await blog.save();

    // ✅ Properly populate before sending response
    const populatedBlog = await Blog.findById(blog._id)
      .populate("event", "title")
      .populate("author", "name avatar");

    res.json(populatedBlog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create blog post." });
  }
});

// Get all blogs (sorted by newest first)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const blogs = await Blog.find()
      .sort({ createdAt: -1 })   // ✅ newest first
      .populate("event", "title")
      .populate("author", "name avatar");
    res.json(blogs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch blogs." });
  }
});

// Delete blog (Admins only, optional)
router.delete("/:id", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found." });

    await blog.deleteOne();
    res.json({ message: "Blog deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete blog." });
  }
});

// ✅ React to a blog (only one reaction per user)
router.post("/:id/react", authMiddleware, async (req, res) => {
  try {
    const { type } = req.body; // 'like', 'love', or 'wow'
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found." });

    // Remove user from all reaction arrays first
    blog.reactions.like.pull(req.user.id);
    blog.reactions.love.pull(req.user.id);
    blog.reactions.wow.pull(req.user.id);

    // Add to selected reaction
    if (type && blog.reactions[type]) {
      blog.reactions[type].push(req.user.id);
    }

    await blog.save();

    const updatedBlog = await Blog.findById(blog._id)
      .populate("event", "title")
      .populate("author", "name avatar");

    res.json(updatedBlog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to react to blog." });
  }
});

module.exports = router;
