const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const weeklyGoalUpdate = require('./scheduler'); // <-- IMPORT THE SCHEDULER

dotenv.config();
connectDB();

const app = express();

app.use(cors({
    origin: '*', // Allows requests from any origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());

app.get('/', (req, res) => res.send('API is running...'));

// API Routes
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/goals', require('./routes/api/goals'));
app.use('/api/logs', require('./routes/api/logs'));

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
    weeklyGoalUpdate(); // <-- START THE SCHEDULER
});