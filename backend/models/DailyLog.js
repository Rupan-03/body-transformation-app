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
      required: true,
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

module.exports = mongoose.model('DailyLog', DailyLogSchema);
