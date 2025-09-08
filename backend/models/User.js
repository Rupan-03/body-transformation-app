const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    // ... name, email, password, profile fields ...
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    age: { type: Number },
    gender: { type: String, enum: ['male', 'female'] },
    height: { type: Number }, // in cm
    weight: { type: Number }, // in kg
    activityLevel: {
        type: String,
        enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
    },
    primaryGoal: {
        type: String,
        enum: ['fat_loss', 'muscle_gain'],
        required: true,
    },
    
    // Goal fields
    targetWeight: { type: Number },
    maintenanceCalories: { type: Number },
    proteinGoal: { type: Number },

    // --- NEW FIELD ---
    // Tracks the date of the last successful weekly recalculation
    lastWeeklyUpdate: { type: Date },

    date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);