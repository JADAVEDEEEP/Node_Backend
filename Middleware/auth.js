const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided, access denied'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.user = { id: decoded.userId }; // <-- use decoded.userId
next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Token is invalid' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token has expired' });
    }
    res.status(401).json({ success: false, message: 'Authentication failed' });
  }
};

module.exports = auth;
