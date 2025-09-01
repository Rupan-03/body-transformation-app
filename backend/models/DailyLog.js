const mongoose = require('mongoose');

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
}, { timestamps: true }); // Adds createdAt and updatedAt fields automatically

// Ensure a user can only have one log entry per day
DailyLogSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyLog', DailyLogSchema);