const { verifyToken } = require('../utils/jwt');

function auth(requiredRole = null) {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.split(' ')[1];

      if (!token) {
        return res.status(401).json({ error: 'Token missing' });
      }

      const payload = verifyToken(token); // throws if invalid
      req.user = payload; // { id, role }

      if (requiredRole && payload.role !== requiredRole) {
        return res.status(403).json({ error: 'Forbidden: Access Denied' });
      }

      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
}

module.exports = auth;
