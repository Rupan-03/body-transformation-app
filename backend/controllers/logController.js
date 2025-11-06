// backend/controllers/logController.js
const DailyLog = require('../models/DailyLog');

// @desc    Create or update a log for the current day (Upsert + Merge)
// @route   POST /api/logs
// @access  Private
exports.createOrUpdateLog = async (req, res) => {
  const { weight, nutrition, sessions } = req.body;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    let log = await DailyLog.findOne({ user: req.user.id, date: today });

    if (!log) {
      // Create a new log if none exists
      log = new DailyLog({
        user: req.user.id,
        date: today,
        weight: weight || null,
        nutrition: {
          breakfast: nutrition?.breakfast || {},
          lunch: nutrition?.lunch || {},
          dinner: nutrition?.dinner || {},
        },
        sessions: Array.isArray(sessions) ? sessions : [],
      });
    } else {
      // Merge existing data intelligently

      // ✅ Update weight if provided
      if (typeof weight !== 'undefined' && weight !== null) {
        log.weight = weight;
      }

      // ✅ Merge nutrition meal-by-meal
      if (nutrition) {
        for (const meal of ['breakfast', 'lunch', 'dinner']) {
          if (nutrition[meal]) {
            log.nutrition[meal] = {
              ...log.nutrition[meal],
              ...nutrition[meal],
            };
          }
        }
      }

      // ✅ Merge or append new sessions (workout/cardio)
      if (Array.isArray(sessions) && sessions.length > 0) {
        sessions.forEach((newSession) => {
          const existingIndex = log.sessions.findIndex(
            (s) =>
              s.type === newSession.type &&
              s.name?.toLowerCase() === newSession.name?.toLowerCase()
          );

          if (existingIndex >= 0) {
            // Merge data if same type & name exist
            log.sessions[existingIndex] = {
              ...log.sessions[existingIndex],
              ...newSession,
            };
          } else {
            // Add new session
            log.sessions.push(newSession);
          }
        });
      }
    }

    await log.save();
    res.status(201).json(log);
  } catch (err) {
    console.error('Error creating/updating log:', err);
    res.status(500).send('Server Error');
  }
};

// @desc    Update a specific log entry by ID
// @route   PUT /api/logs/:id
// @access  Private
exports.updateLog = async (req, res) => {
  const { weight, nutrition, sessions } = req.body;
  const logId = req.params.id;

  try {
    let log = await DailyLog.findById(logId);
    if (!log) return res.status(404).json({ msg: 'Log not found' });
    if (log.user.toString() !== req.user.id)
      return res.status(401).json({ msg: 'Not authorized' });

    if (typeof weight !== 'undefined') {
      log.weight = weight;
    }

    if (nutrition) {
      for (const meal of ['breakfast', 'lunch', 'dinner']) {
        if (nutrition[meal]) {
          log.nutrition[meal] = {
            ...log.nutrition[meal],
            ...nutrition[meal],
          };
        }
      }
    }

    if (Array.isArray(sessions)) {
      log.sessions = sessions;
    }

    await log.save();
    res.json(log);
  } catch (err) {
    console.error('Error updating log:', err);
    res.status(500).send('Server Error');
  }
};

// @desc    Get all logs for the logged-in user
// @route   GET /api/logs
// @access  Private
exports.getUserLogs = async (req, res) => {
  try {
    const logs = await DailyLog.find({ user: req.user.id }).sort({ date: -1 });
    res.json(logs);
  } catch (err) {
    console.error('Error fetching logs:', err);
    res.status(500).send('Server Error');
  }
};

// @desc    Delete a log by ID
// @route   DELETE /api/logs/:id
// @access  Private
exports.deleteLog = async (req, res) => {
  try {
    const log = await DailyLog.findById(req.params.id);
    if (!log) return res.status(404).json({ msg: 'Log not found' });
    if (log.user.toString() !== req.user.id)
      return res.status(401).json({ msg: 'Not authorized' });

    await log.deleteOne();
    res.json({ msg: 'Log deleted successfully' });
  } catch (err) {
    console.error('Error deleting log:', err);
    res.status(500).send('Server Error');
  }
};

// @desc    Get unique exercise names for autocomplete
// @route   GET /api/logs/exerciselist
// @access  Private
exports.getExerciseLists = async (req, res) => {
  try {
    const logs = await DailyLog.find({ user: req.user.id });
    const workoutNames = new Set();
    const cardioNames = new Set();

    logs.forEach((log) => {
      log.sessions?.forEach((session) => {
        if (session.type === 'workout' && session.name)
          workoutNames.add(session.name);
        if (session.type === 'cardio' && session.name)
          cardioNames.add(session.name);
      });
    });

    res.json({
      strengthNames: Array.from(workoutNames),
      cardioNames: Array.from(cardioNames),
    });
  } catch (err) {
    console.error('Error fetching exercise list:', err);
    res.status(500).send('Server Error');
  }
};
