const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
require('./Models/db');

const productRoutes = require('./Routes/products');
const AuthRouter = require('./Routes/AuthRouter');

const app = express();

// Middleware
app.use(bodyParser.json());

const allowedOrigins = [
  "http://localhost:3000",
  "https://react-frontend-e8xi.vercel.app",

];

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Routes
app.use('/auth', AuthRouter);
app.use('/api', productRoutes);

// Root
app.get('/', (req, res) => {
  res.send('Backend is running on local & vercel 🚀');
});

// -------------------------------------------------------
// ⚠️ IMPORTANT PART
// Vercel must EXPORT the app, not LISTEN
// -------------------------------------------------------
if (require.main === module) {
  // Only run this locally
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`🚀 Local backend running on port: ${PORT}`);
  });
}

// For Vercel serverless
module.exports = app;
