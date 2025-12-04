const express = require('express');

const cors = require('cors');
require('dotenv').config();
require('./Models/db');

const productRoutes = require('./Routes/products');
const AuthRouter = require('./Routes/AuthRouter');

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://react-frontend-ten-vert.vercel.app"
];

app.use(cors({
  origin: allowedOrigins, 
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth', AuthRouter);
app.use('/api', productRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Global Error Handler:", err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: err.message || "Unknown error"
  });
});

// ✅ Render needs this (normal server)
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
