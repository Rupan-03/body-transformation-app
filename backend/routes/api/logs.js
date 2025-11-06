// backend/routes/api/logs.js

const express = require('express');
const router = express.Router();
const {
  createOrUpdateLog,
  getUserLogs,
  deleteLog,
  updateLog,
  getExerciseLists,
} = require('../../controllers/logController');
const authMiddleware = require('../../middleware/authMiddleware');

// @route   GET /api/logs
// @desc    Get all logs for the logged-in user
// @access  Private
router.get('/', authMiddleware, getUserLogs);

// @route   POST /api/logs
// @desc    Create or update today's log
// @access  Private
router.post('/', authMiddleware, createOrUpdateLog);

// @route   PUT /api/logs/:id
// @desc    Update a specific log entry
// @access  Private
router.put('/:id', authMiddleware, updateLog);

// @route   DELETE /api/logs/:id
// @desc    Delete a specific log entry
// @access  Private
router.delete('/:id', authMiddleware, deleteLog);

// @route   GET /api/logs/exerciselist
// @desc    Fetch autocomplete exercise name lists
// @access  Private
router.get('/exerciselist', authMiddleware, getExerciseLists);

module.exports = router;
