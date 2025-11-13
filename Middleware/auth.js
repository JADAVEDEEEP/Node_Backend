// React Dashboard (Frontend)
//       ↓
// GET /api/products with token
//       ↓
// Express Router → / (auth, getProducts)
//       ↓
// auth.js → verifies token → sets req.user.id
//       ↓
// getProducts → uses req.user.id → Product.find({ userId })
//       ↓
// MongoDB → returns products
//       ↓
// Controller → sends products as JSON
//       ↓
// React → displays on dashboard ✅

// When a user logs in, the server gives them a token as proof of their identity.
// This token is stored on the frontend (like in localStorage) and sent with every request to protected routes.
// Before allowing access, the backend checks if the token is real and valid.
// If it’s valid, the user is allowed to continue and see their own data.
// If it’s missing or invalid, the request is blocked for security.
// So, the token simply acts as a digital pass that proves the user is allowed to use that route.

// In short — based on the user’s token, the backend verifies who the user is and then allows access only to the routes they’re authorized for.
// Using the decoded userId from that token, the backend fetches products that belong specifically to that user — no one else’s data.

// So the token = proof of identity,
// and the userId inside the token = key to fetch that user’s specific products.

// Import the jsonwebtoken package for verifying tokens
const jwt = require('jsonwebtoken');

// 🔒 Authentication middleware to protect routes
const auth = async (req, res, next) => {
  try {
    // 🧾 Get the "Authorization" header from the incoming request
    const authHeader = req.header('Authorization');

    // ⚠️ If there's no header or it doesn't start with "Bearer ", deny access
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided, access denied'
      });
    }

    // ✂️ Extract the actual token by removing "Bearer " from the header
    const token = authHeader.replace('Bearer ', '');

    // 🔍 Verify the token using the secret key from environment variables
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🧑‍💼 Store the decoded user information (userId) in the request object
    // This allows access to the user's ID in protected routes (e.g., req.user.id)
    req.user = { id: decoded.userId };

    // ✅ If everything is valid, move on to the next middleware or route handler
    next();
  } catch (error) {
    // ❌ Log the error for debugging purposes
    console.error('Auth middleware error:', error.message);

    // ⚠️ Handle specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Token is invalid' });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token has expired' });
    }

    // 🛑 Handle any other unexpected authentication errors
    res.status(401).json({ success: false, message: 'Authentication failed' });
  }
};

// 📦 Export the middleware so it can be used in protected routes
module.exports = auth;
