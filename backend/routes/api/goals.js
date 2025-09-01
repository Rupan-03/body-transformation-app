const express = require('express');
const router = express.Router();
const { setTargetWeight, getWeeklySummary, manualGoalUpdate } = require('../../controllers/goalsController');
const authMiddleware = require('../../middleware/authMiddleware');

// Existing route
router.put('/target-weight', authMiddleware, setTargetWeight);

// --- NEW ROUTES ---
// Route to get the weekly summary data
router.get('/weekly-summary', authMiddleware, getWeeklySummary);

// Route to manually trigger the goal update
router.post('/manual-update', authMiddleware, manualGoalUpdate);
// --- END NEW ROUTES ---

module.exports = router;