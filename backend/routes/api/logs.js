const express = require('express');
const router = express.Router();
const { createOrUpdateLog, getUserLogs } = require('../../controllers/logController');
const authMiddleware = require('../../middleware/authMiddleware');

// Route to get all logs for a user
router.get('/', authMiddleware, getUserLogs);

// Route to create or update a log for today
router.post('/', authMiddleware, createOrUpdateLog);

module.exports = router;