// backend/controllers/logController.js
const DailyLog = require('../models/DailyLog');

/* ----------------------- Date helpers (UTC-safe) ------------------------ */
// Parse "YYYY-MM-DD" into a Date at UTC midnight
function ymdToUtcMidnight(ymd) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(ymd || ''))) return null;
  const [y, m, d] = ymd.split('-').map((n) => parseInt(n, 10));
  if (!y || !m || !d) return null;
  return new Date(Date.UTC(y, m - 1, d));
}

// Normalize any Date-like value to UTC midnight
function toUtcMidnight(dateLike) {
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return null;
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function todayUtcMidnight() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function isFutureUtcDate(d) {
  return d.getTime() > todayUtcMidnight().getTime();
}
/* ----------------------------------------------------------------------- */

// @desc    Create or update a log for the current day (Upsert + Merge)
// @route   POST /api/logs
// @access  Private
exports.createOrUpdateLog = async (req, res) => {
  const { weight, nutrition, sessions, date: clientDate } = req.body || {};

  let targetDate = null;
  if (clientDate) {
    targetDate = ymdToUtcMidnight(clientDate) || toUtcMidnight(clientDate);
    if (!targetDate) return res.status(400).json({ msg: 'Invalid date format.' });
  } else {
    targetDate = todayUtcMidnight();
  }

  if (isFutureUtcDate(targetDate)) {
    return res.status(400).json({ msg: 'Future dates are not allowed.' });
  }

  try {
    // 🐞 expose and log what the server will use
    // res.set('X-Debug-Client-Date', String(clientDate ?? ''));
    // res.set('X-Debug-Target-Date-UTC', targetDate.toISOString());
    if (req.user?.id) res.set('X-Debug-User', String(req.user.id));
    console.log('[DEBUG] createOrUpdateLog input', {
      user: req.user?.id || null,
      clientDate,
      targetDateUTC: targetDate.toISOString(),
      weight,
    });

    // Use targetDate (UTC midnight)
    let log = await DailyLog.findOne({ user: req.user.id, date: targetDate });

    if (!log) {
      log = new DailyLog({
        user: req.user.id,
        date: targetDate, // UTC midnight
        weight: typeof weight !== 'undefined' ? weight : null,
        nutrition: {
          breakfast: nutrition?.breakfast || {},
          lunch: nutrition?.lunch || {},
          dinner: nutrition?.dinner || {},
        },
        sessions: Array.isArray(sessions) ? sessions : [],
      });
    } else {
      if (typeof weight !== 'undefined' && weight !== null) {
        log.weight = weight;
      }
      if (nutrition) {
        log.nutrition = log.nutrition || {};
        for (const meal of ['breakfast', 'lunch', 'dinner']) {
          if (nutrition[meal]) {
            log.nutrition[meal] = {
              ...log.nutrition[meal],
              ...nutrition[meal],
            };
          }
        }
      }
      if (Array.isArray(sessions) && sessions.length > 0) {
        log.sessions = Array.isArray(log.sessions) ? log.sessions : [];
        sessions.forEach((newSession) => {
          const existingIndex = log.sessions.findIndex(
            (s) =>
              s.type === newSession.type &&
              s.name?.toLowerCase() === newSession.name?.toLowerCase()
          );
          if (existingIndex >= 0) {
            log.sessions[existingIndex] = { ...log.sessions[existingIndex], ...newSession };
          } else {
            log.sessions.push(newSession);
          }
        });
      }
    }

    // // 🐞 pre-save check (what is about to be stored)
    // console.log('[DEBUG] BEFORE save', {
    //   logDateISO: log.date?.toISOString?.() || null,
    //   hasSessions: Array.isArray(log.sessions) ? log.sessions.length : 0,
    // });

    await log.save();

    // 🐞 post-save verification (what actually got stored)
    // console.log('[DEBUG] AFTER save', { savedDateISO: log.date.toISOString() });

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
    const { date } = req.query || {};

    if (date) {
      const target =
        ymdToUtcMidnight(date) || toUtcMidnight(date);
      if (!target) return res.status(400).json({ msg: 'Invalid date format' });

      const log = await DailyLog.findOne({ user: req.user.id, date: target });
      return res.json(log || null);
    }

    // default: all logs (existing behavior)
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
