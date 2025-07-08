// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    console.log('🔐 [auth.js] Incoming Authorization Header:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('⛔ [auth.js] Authorization token missing or malformed');
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authorization token missing or malformed'
      });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    console.log('🔐 [auth.js] Extracted Token:', token);

    if (!process.env.JWT_SECRET) {
      console.error('❌ [auth.js] JWT_SECRET is not defined in environment variables');
      return res.status(500).json({
        success: false,
        error: 'ServerError',
        message: 'JWT secret is missing in server configuration'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error('❌ [auth.js] JWT verification failed:', err.message);
      return res.status(401).json({
        success: false,
        error: 'InvalidToken',
        message: 'Token verification failed: ' + err.message
      });
    }

    if (!decoded.userId) {
      console.warn('⛔ [auth.js] Token payload missing userId');
      return res.status(401).json({
        success: false,
        error: 'InvalidPayload',
        message: 'Token payload is invalid'
      });
    }

    console.log('🔓 [auth.js] Decoded Token Payload:', decoded);

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      console.warn('⛔ [auth.js] Invalid token: user not found');
      return res.status(401).json({
        success: false,
        error: 'UserNotFound',
        message: 'User associated with token was not found'
      });
    }

    console.log('✅ [auth.js] Authenticated user:', user.name, user._id);
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ [auth.js] Auth middleware error:', error.message);
    return res.status(401).json({
      success: false,
      error: 'AuthMiddlewareError',
      message: 'Authentication failed: ' + error.message
    });
  }
};

module.exports = auth;