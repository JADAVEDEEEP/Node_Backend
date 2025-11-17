const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config(); // ✅ keep at the top
require('./Models/db'); // connect to DB

const productRoutes = require('./Routes/products');
const AuthRouter = require('./Routes/AuthRouter');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(bodyParser.json());

const allowedOrigins = [
  "http://localhost:3000",
  "https://react-frontend-vakw.vercel.app"
];

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Routes
app.use('/auth', AuthRouter);
app.use('/api', productRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('Backend is running ✅');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
