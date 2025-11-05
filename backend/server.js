const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// ✅ Load environment variables
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// ✅ Connect to MongoDB
connectDB();

const app = express();

// ✅ CORS Configuration for Render
const allowedOrigins = [
  'http://localhost:5173', // local dev
  'https://zenithfitapp.onrender.com', // 🔁 your deployed frontend URL
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json());

// ✅ Base route
app.get('/', (req, res) => res.send('API is running...'));

// ✅ API Routes
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/goals', require('./routes/api/goals'));
app.use('/api/logs', require('./routes/api/logs'));

// ✅ Port binding for Render
const PORT = process.env.PORT || 10000;

app.listen(PORT, '0.0.0.0', () => console.log(`Server started on port ${PORT}`));
