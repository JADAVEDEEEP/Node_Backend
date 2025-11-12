const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const productRoutes = require('./Routes/products');
require('dotenv').config(); // ✅ move this up
const AuthRouter = require('./Routes/AuthRouter');

require('./Models/db');

const app = express();
const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.send('Backend is running ✅');
});


app.use(bodyParser.json());
app.use(cors());

app.use('/auth', AuthRouter);
app.use('/api',productRoutes)


app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
