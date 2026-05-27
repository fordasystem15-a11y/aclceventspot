function roleMiddleware(requiredRole) {
  return (req, res, next) => {
    // Ensure user is attached
    if (!req.user || !req.user.role) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Superadmin bypasses all checks
    if (req.user.role === 'superadmin') {
      return next();
    }

    // Check required role
    if (req.user.role !== requiredRole) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }

    next();
  };
}

module.exports = roleMiddleware;
