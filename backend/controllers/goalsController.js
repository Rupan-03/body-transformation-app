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
        // 1. Get the user's current goals to compare against
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });
        
        // 2. Get all of the user's logs, sorted by date
        const logs = await DailyLog.find({ user: req.user.id }).sort({ date: 'asc' });

        // 3. Group the logs by week (Sunday to Saturday)
        const logsByWeek = logs.reduce((acc, log) => {
            const logDate = new Date(log.date);
            const weekStartDate = new Date(logDate);
            weekStartDate.setDate(logDate.getDate() - logDate.getDay());
            weekStartDate.setHours(0, 0, 0, 0);
            const weekKey = weekStartDate.toISOString();

            if (!acc[weekKey]) acc[weekKey] = [];
            acc[weekKey].push(log);
            return acc;
        }, {});

        // 4. Process each week to calculate averages and summaries
        const weeklySummaries = Object.entries(logsByWeek).map(([weekKey, weekLogs]) => {
            const totalCalories = weekLogs.reduce((sum, log) => sum + log.calorieIntake, 0);
            const totalProtein = weekLogs.reduce((sum, log) => sum + log.proteinIntake, 0);
            const logCount = weekLogs.length;

            // Get the weight from the last log entry of that week
            const endOfWeekWeight = weekLogs[weekLogs.length - 1].weight;

            return {
                weekOf: weekKey,
                endOfWeekWeight: endOfWeekWeight,
                avgCalories: Math.round(totalCalories / logCount),
                avgProtein: Math.round(totalProtein / logCount),
                calorieGoal: user.maintenanceCalories ? user.maintenanceCalories - 500 : 0,
                proteinGoal: user.proteinGoal || 0,
            };
        });

        // 5. Sort to show the most recent week first and send to frontend
        res.json(weeklySummaries.sort((a, b) => new Date(b.weekOf) - new Date(a.weekOf)));

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