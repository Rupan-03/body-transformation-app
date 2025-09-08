const User = require('../models/User');
const DailyLog = require('../models/DailyLog'); 

exports.updateUserProfile = async (req, res) => {
    const { age, gender, height, weight, activityLevel, primaryGoal} = req.body;
    const profileFields = {};
    if (age) profileFields.age = age;
    if (gender) profileFields.gender = gender;
    if (height) profileFields.height = height;
    if (weight) profileFields.weight = weight;
    if (activityLevel) profileFields.activityLevel = activityLevel;
    if (primaryGoal) profileFields.primaryGoal = primaryGoal;

    // --- NEW: Calculate goals as soon as the profile is submitted ---
    if (weight) {
        profileFields.maintenanceCalories = Math.round(weight * 1.9 * 14);
        profileFields.proteinGoal = Math.round(weight * 1.7);
    }
    // --- END NEW ---

    try {
        let user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: profileFields },
            { new: true }
        ).select('-password');

        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Delete a user's profile, auth data, and all their logs
// @route   DELETE /api/profile
// @access  Private
exports.deleteUserAccount = async (req, res) => {
    try {
        // 1. Delete all of the user's daily logs to prevent orphaned data
        await DailyLog.deleteMany({ user: req.user.id });
        
        // 2. Delete the user's profile and authentication record
        await User.findByIdAndDelete(req.user.id);

        res.json({ msg: 'Your account has been permanently deleted.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};