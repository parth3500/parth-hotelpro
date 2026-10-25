const jwt = require('jsonwebtoken');
const User = require('../models/User');

// shortcut: stateless JWTs without token revocation list, upgrade to Redis blacklist when instant session revoking is required
const JWT_SECRET = process.env.JWT_SECRET || 'hotelpro_super_secret_jwt_key_2026';
const JWT_EXPIRE = process.env.JWT_EXPIRE || process.env.JWT_EXPIRES_IN || '7d';

function generateToken(user) {
  const payload = {
    id: (user._id || user.id || '').toString(),
    email: user.email,
    role: (user.role || 'guest').toLowerCase(),
    name: user.name
  };
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRE
  });
}

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.headers['x-access-token']) {
    token = req.headers['x-access-token'];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }
}

function authorizeRoles(...allowedRoles) {
  const normalizedAllowed = allowedRoles.map(r => r.toLowerCase());
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    const userRole = (req.user.role || '').toLowerCase();
    if (!normalizedAllowed.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Role '${req.user.role}' is not authorized to access this resource.`
      });
    }

    next();
  };
}

module.exports = {
  generateToken,
  authenticateToken,
  authorizeRoles,
  JWT_SECRET,
  JWT_EXPIRE
};
