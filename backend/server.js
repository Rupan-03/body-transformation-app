const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// --- THIS IS THE CRITICAL CHANGE ---
// Define the exact URL of your frontend that is allowed to connect
const allowedOrigins = ['https://body-transformation-app.vercel.app'];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
};

app.use(cors(corsOptions));
// --- END OF CRITICAL CHANGE ---

app.use(express.json());

app.get('/', (req, res) => res.send('API is running...'));

// API Routes
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/goals', require('./routes/api/goals'));
app.use('/api/logs', require('./routes/api/logs'));

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));