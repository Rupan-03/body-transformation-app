const User = require('../models/User');
const DailyLog = require('../models/DailyLog'); // <-- Make sure to import DailyLog

// This is the existing function for setting target weight
exports.setTargetWeight = async (req, res) => {
    // ... no changes here
    const { targetWeight } = req.body;
    if (!targetWeight) return res.status(400).json({ msg: 'Target weight is required.' });
    try {
        const updatedUser = await User.findByIdAndUpdate(req.user.id, { $set: { targetWeight } }, { new: true }).select('-password');
        if (!updatedUser) return res.status(404).json({ msg: 'User not found' });
        res.json(updatedUser);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// --- NEW FUNCTION: Get Weekly Summaries ---
// @desc    Get a summary of weight from every Sunday
// @route   GET /api/goals/weekly-summary
// @access  Private
exports.getWeeklySummary = async (req, res) => {
    try {
        // 1. Find all logs for the user
        const logs = await DailyLog.find({ user: req.user.id }).sort({ date: 'asc' });

        // 2. Filter to get only the logs recorded on a Sunday (Day 0)
        const sundayLogs = logs.filter(log => new Date(log.date).getDay() === 0);

        // 3. Format the data for the frontend
        const weeklySummary = sundayLogs.map(log => ({
            date: log.date,
            weight: log.weight
        }));

        res.json(weeklySummary);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// --- NEW FUNCTION: Manual Goal Update ---
// @desc    Manually recalculate goals based on last Sunday's weight
// @route   POST /api/goals/manual-update
// @access  Private
exports.manualGoalUpdate = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 1. Find the date of the most recent Sunday
        const lastSunday = new Date(today);
        lastSunday.setDate(today.getDate() - today.getDay());
        
        // 2. Find the user's log entry for that specific Sunday
        const sundayLog = await DailyLog.findOne({ user: req.user.id, date: lastSunday });

        if (!sundayLog || !sundayLog.weight) {
            return res.status(400).json({ msg: "No weight log found for last Sunday. Please add a log for that day to update your goals." });
        }

        // 3. Recalculate goals using the weight from that log
        const newMaintenanceCalories = Math.round(sundayLog.weight * 1.9 * 14);
        const newProteinGoal = Math.round(sundayLog.weight * 1.7);

        // 4. Update the user's main profile with the new goals
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            {
                maintenanceCalories: newMaintenanceCalories,
                proteinGoal: newProteinGoal,
                lastWeeklyUpdate: today
            },
            { new: true }
        ).select('-password');

        res.json(updatedUser);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};