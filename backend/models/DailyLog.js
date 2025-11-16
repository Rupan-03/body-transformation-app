// backend/models/DailyLog.js

const mongoose = require('mongoose');

// --- NUTRITION SUBSCHEMA ---
const MealSchema = new mongoose.Schema({
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
});

// --- WORKOUT/CARDIO UNIFIED SESSION SCHEMA ---
const ExerciseSetSchema = new mongoose.Schema({
  reps: { type: Number },
  weight: { type: Number },
});

const SessionSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['workout', 'cardio'], 
    required: true 
  },
  name: { type: String, required: true }, // e.g. "Leg Day" or "Treadmill"
  // If type = workout
  exercises: [{
    name: { type: String },
    sets: [ExerciseSetSchema],
  }],
  // If type = cardio
  durationMinutes: { type: Number },
  distanceKm: { type: Number },
  notes: { type: String },
});

// --- MAIN DAILY LOG SCHEMA ---
const DailyLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },

    // Body weight for the day
    weight: {
      type: Number,
      required: true, // keep existing behavior
    },

    // --- NEW: Nutrition by meals ---
    nutrition: {
      breakfast: { type: MealSchema, default: () => ({}) },
      lunch: { type: MealSchema, default: () => ({}) },
      dinner: { type: MealSchema, default: () => ({}) },
    },

    // --- Combined workout/cardio sessions ---
    sessions: [SessionSchema],
  },
  { timestamps: true }
);

// Ensure a user can only have one log entry per day
DailyLogSchema.index({ user: 1, date: 1 }, { unique: true });

/* -------------------------------------------------------------------------- */
/*                 DATE NORMALIZATION (switched to UTC midnight)              */
/* -------------------------------------------------------------------------- */

// Normalize `date` to **UTC midnight** before saving (prevents TZ off-by-one)
DailyLogSchema.pre('save', function normalizeDateToUtcMidnight(next) {
  if (this.date instanceof Date) {
    const d = new Date(this.date);
    this.date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  }
  next();
});

// Also normalize if `date` is ever changed via findOneAndUpdate
DailyLogSchema.pre('findOneAndUpdate', function normalizeUpdateDate(next) {
  const update = this.getUpdate() || {};
  const raw =
    (update.$set && update.$set.date) ||
    update.date;

  if (raw) {
    const d = new Date(raw);
    const utc = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    if (update.$set && update.$set.date) update.$set.date = utc;
    if (update.date) update.date = utc;
  }
  next();
});

/* -------------------------------------------------------------------------- */
/*                          OTHER EXISTING SAFEGUARDS                         */
/* -------------------------------------------------------------------------- */

// Ensure `weight` satisfies "required: true" even if controller passes null/undefined
DailyLogSchema.pre('validate', function ensureWeight(next) {
  if (this.weight === null || typeof this.weight === 'undefined') {
    this.weight = 0; // conservative default; adjust if you prefer another default
  }
  next();
});

module.exports = mongoose.model('DailyLog', DailyLogSchema);
