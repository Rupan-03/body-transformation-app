const DailyLog = require('../models/DailyLog');

// @desc    Create or update a log for the current day (Upsert)
// @route   POST /api/logs
// @access  Private
exports.createOrUpdateLog = async (req, res) => {
    // Destructure ALL possible fields, including the new workout ones
    const {
        weight, calorieIntake, proteinIntake,
         workoutSplit, strengthExercises, cardioExercises
    } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const logData = {
        user: req.user.id,
        date: today,
        weight,
        calorieIntake,
        proteinIntake,
    };

    // --- SIMPLIFIED WORKOUT DATA HANDLING ---
    // Add workout data ONLY if it's provided and valid
    if (workoutSplit && strengthExercises && strengthExercises.length > 0) {
        // Optional: Add validation here to ensure sets/reps/weight have values
        logData.workoutSplit = workoutSplit;
        logData.strengthExercises = strengthExercises;
    } else {
        // Explicitly set to undefined if not provided or empty to clear old data
        logData.workoutSplit = undefined;
        logData.strengthExercises = undefined;
    }

    if (cardioExercises && cardioExercises.length > 0) {
        // Optional: Add validation here to ensure type/duration have values
        logData.cardioExercises = cardioExercises;
    } else {
        // Explicitly set to undefined if not provided or empty
        logData.cardioExercises = undefined;
    }
    // --- END SIMPLIFIED HANDLING ---

    try {
        const log = await DailyLog.findOneAndUpdate(
            { user: req.user.id, date: today },
            { $set: logData },
            // Add runValidators to ensure conditional requirements are checked
            { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
        );
        res.status(201).json(log);
    } catch (err) {
        // Handle Mongoose validation errors
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ msg: messages.join('. ') });
        }
        console.error("Error creating/updating log:", err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Update a specific log entry by its ID
// @route   PUT /api/logs/:id
// @access  Private
exports.updateLog = async (req, res) => {
    // Destructure all possible fields
    const {
        weight, calorieIntake, proteinIntake,
         workoutSplit, strengthExercises, cardioExercises
    } = req.body;
    const logId = req.params.id;

    // Basic validation
    if (weight === undefined || calorieIntake === undefined || proteinIntake === undefined ) {
        return res.status(400).json({ msg: 'Please provide weight, calorie and protein' });
    }

    try {
        let log = await DailyLog.findById(logId);
        if (!log) return res.status(404).json({ msg: 'Log entry not found' });
        if (log.user.toString() !== req.user.id) return res.status(401).json({ msg: 'User not authorized' });

        // Update basic fields
        log.weight = weight;
        log.calorieIntake = calorieIntake;
        log.proteinIntake = proteinIntake;

        // --- SIMPLIFIED WORKOUT DATA UPDATE ---
        // Update strength data if provided, otherwise clear it
        if (workoutSplit && strengthExercises && strengthExercises.length > 0) {
            log.workoutSplit = workoutSplit;
            log.strengthExercises = strengthExercises;
        } else {
            log.workoutSplit = undefined;
            log.strengthExercises = undefined; // Or markModified if just clearing array
        }

        // Update cardio data if provided, otherwise clear it
        if (cardioExercises && cardioExercises.length > 0) {
            log.cardioExercises = cardioExercises;
        } else {
            log.cardioExercises = undefined; // Or markModified if just clearing array
        }
        // --- END SIMPLIFIED UPDATE ---

        // Use save() to trigger Mongoose validation for subdocuments and conditional requirements
        const updatedLog = await log.save();
        res.json(updatedLog);

    } catch (err) {
        // Handle validation errors during save
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ msg: messages.join('. ') });
        }
        console.error("Error updating log:", err.message);
        if (err.kind === 'ObjectId') { // Handle invalid ID format
            return res.status(404).json({ msg: 'Log entry not found' });
        }
        res.status(500).send('Server Error');
    }
};

// getUserLogs and deleteLog remain unchanged
exports.getUserLogs = async (req, res) => {
    try {
        const logs = await DailyLog.find({ user: req.user.id }).sort({ date: -1 });
        res.json(logs);
    } catch (err) {
        console.error("Error fetching user logs:", err.message);
        res.status(500).send('Server Error');
    }
};

exports.deleteLog = async (req, res) => {
    try {
        const log = await DailyLog.findById(req.params.id);
        if (!log) {
            return res.status(404).json({ msg: 'Log entry not found' });
        }
        if (log.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }
        await DailyLog.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Log entry removed' });
    } catch (err) {
        console.error("Error deleting log:", err.message);
        if (err.kind === 'ObjectId') {
             return res.status(404).json({ msg: 'Log entry not found' });
        }
        res.status(500).send('Server Error');
    }
};

// --- NEW FUNCTION: Get Unique Exercise Lists ---
// @desc    Get all unique strength and cardio exercise names for the user
// @route   GET /api/logs/exerciselist
// @access  Private
exports.getExerciseLists = async (req, res) => {
    try {
        const userId = req.user.id;

        // Use MongoDB's distinct() to find all unique strength exercise names
        const strengthNames = await DailyLog.distinct("strengthExercises.name", { 
            user: userId, 
            "strengthExercises.name": { $ne: null, $ne: "" } // Ensure we only get valid names
        });

        // Use distinct() to find all unique cardio exercise types
        const cardioNames = await DailyLog.distinct("cardioExercises.type", { 
            user: userId, 
            "cardioExercises.type": { $ne: null, $ne: "" } // Ensure we only get valid types
        });

        res.json({
            strengthNames: strengthNames.sort(), // Return sorted lists
            cardioNames: cardioNames.sort()
        });

    } catch (err) {
        console.error("Error fetching exercise lists:", err.message);
        res.status(500).send('Server Error');
    }
};