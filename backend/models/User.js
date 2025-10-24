const mongoose = require('mongoose');
const validator = require('validator');
const crypto = require('crypto'); // Built-in Node.js module for cryptography

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: {
        type: String,
        required: [true, 'Please provide an email.'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email address.']
    },
    password: { type: String, required: true },

    // --- UPDATED GOAL FIELD ---
    primaryGoal: {
        type: String,
        enum: ['light_loss', 'moderate_loss', 'light_gain', 'moderate_gain'],
        // required: true, // REMOVED THIS LINE
    },
    // --- END UPDATE ---

    age: { type: Number },
    gender: { type: String, enum: ['male', 'female'] },
    height: { type: Number },
    weight: { type: Number },
    activityLevel: {
        type: String,
        enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
    },
    targetWeight: { type: Number },
    tdee: { type: Number },
    proteinGoal: { type: Number },
    lastWeeklyUpdate: { type: Date },
    resetPasswordToken: String, // Keep if using password reset
    resetPasswordExpire: Date, // Keep if using password reset
    date: { type: Date, default: Date.now },
});

// --- NEW METHOD to generate and hash the password reset token ---
// This method is attached to each user document and handles the secure token generation.
UserSchema.methods.getResetPasswordToken = function() {
    // 1. Generate a random, secure 20-byte token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // 2. Hash the token using SHA256 before saving it to the database.
    // This is a crucial security step. We never save the plain token.
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // 3. Set the token's expiry time to 10 minutes from the current time.
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    // 4. Return the UN-HASHED token. This is the version that will be sent to the user's email.
    return resetToken;
};

module.exports = mongoose.model('User', UserSchema);