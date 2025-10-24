const express = require('express');
const router = express.Router();
const { createOrUpdateLog, getUserLogs, deleteLog, updateLog } = require('../../controllers/logController');
const authMiddleware = require('../../middleware/authMiddleware');

// Route to get all logs for a user
router.get('/', authMiddleware, getUserLogs);

// Route to create or update a log for today
router.post('/', authMiddleware, createOrUpdateLog);


// The ':id' is a URL parameter that will hold the ID of the log to delete
router.delete('/:id', authMiddleware, deleteLog);

// Handles requests to modify an existing log entry
router.put('/:id', authMiddleware, updateLog);

module.exports = router;