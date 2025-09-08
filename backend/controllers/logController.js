const DailyLog = require('../models/DailyLog');

// @desc    Create or update a log for the current day (Upsert)
// @route   POST /api/logs
// @access  Private
exports.createOrUpdateLog = async (req, res) => {
    const { weight, calorieIntake, proteinIntake } = req.body;

    // Get today's date at midnight (to ensure we always find the same day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const logData = {
        user: req.user.id,
        date: today,
        weight,
        calorieIntake,
        proteinIntake,
    };

    try {
        // Find a log for this user for today and update it.
        // If one doesn't exist, create it (upsert: true).
        const log = await DailyLog.findOneAndUpdate(
            { user: req.user.id, date: today },
            { $set: logData },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        res.status(201).json(log);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get all logs for the logged-in user
// @route   GET /api/logs
// @access  Private
exports.getUserLogs = async (req, res) => {
    try {
        const logs = await DailyLog.find({ user: req.user.id }).sort({ date: -1 }); // Sort by most recent
        res.json(logs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Delete a specific log entry by its ID
// @route   DELETE /api/logs/:id
// @access  Private
exports.deleteLog = async (req, res) => {
    try {
        // Find the log by the ID provided in the URL
        const log = await DailyLog.findById(req.params.id);

        if (!log) {
            return res.status(404).json({ msg: 'Log entry not found' });
        }

        // IMPORTANT SECURITY CHECK: Make sure the log belongs to the user trying to delete it
        if (log.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await DailyLog.findByIdAndDelete(req.params.id);

        res.json({ msg: 'Log entry removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};