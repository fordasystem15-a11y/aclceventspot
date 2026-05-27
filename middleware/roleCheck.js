// backend/middleware/roleCheck.js
module.exports = function roleCheck(roles) {
  return (req, res, next) => {
    // Ensure user is attached by authMiddleware
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};
