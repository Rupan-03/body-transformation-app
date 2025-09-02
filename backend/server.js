const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// --- THIS IS THE CRITICAL CHANGE ---
// Replace the complex corsOptions block with this single, reliable line.
// This tells your server to accept requests from anyone, which is
// perfect for getting it working with Vercel and Postman.
app.use(cors());
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