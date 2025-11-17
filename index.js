const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
require('./Models/db');

const productRoutes = require('./Routes/products')
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

app.use(bodyParser.json());

app.use('/auth', AuthRouter);
app.use('/api', productRoutes);

app.get('/', (req, res) => {
  res.send("Backend is running 🔥");
});

// ✅ If running locally → Start server normally
if (require.main === module) {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`🚀 Local server running at http://localhost:${PORT}`);
  });
}

// ❌ Vercel doesn't use listen()
// ✅ Export for Vercel Serverless Function
module.exports = app;
