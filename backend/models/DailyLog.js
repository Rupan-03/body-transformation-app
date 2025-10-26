//DailyLog.js

const mongoose = require('mongoose');

// --- NEW: Define sub-schemas for structured workout data ---
const ExerciseSetSchema = new mongoose.Schema({
    reps: { type: Number, required: true },
    weight: { type: Number, required: true },
});

const StrengthExerciseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    sets: [ExerciseSetSchema], // Array of sets for this exercise
});

const CardioExerciseSchema = new mongoose.Schema({
    type: { type: String, required: true }, // e.g., 'Running', 'Cycling'
    duration: { type: Number, required: true }, // in minutes
});
// --- END NEW SUB-SCHEMAS ---

const DailyLogSchema = new mongoose.Schema({
    // Link to the user who created this log
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // The specific date for this log entry
    date: {
        type: Date,
        required: true,
    },
    // The user's weight on this specific day
    weight: {
        type: Number,
        required: true,
    },
    // The calories the user consumed on this day
    calorieIntake: {
        type: Number,
        required: true,
    },
    // The protein the user consumed on this day
    proteinIntake: {
        type: Number,
        required: true,
    },

    // Strength workout details (conditionally required)
    workoutSplit: {
        type: String,
    },
    strengthExercises: {
        type: [StrengthExerciseSchema],
        default: undefined, // Don't save an empty array by default
        // Require at least one exercise IF it's a workout day AND the array isn't already populated
    },
    // Cardio workout details (conditionally required)
    cardioExercises: {
        type: [CardioExerciseSchema],
        default: undefined, // Don't save an empty array by default
        // Require at least one cardio activity IF it's a cardio day AND the array isn't already populated
    },
    // --- END NEW WORKOUT FIELDS ---
    
}, { timestamps: true }); // Adds createdAt and updatedAt fields automatically

// Ensure a user can only have one log entry per day
DailyLogSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyLog', DailyLogSchema);