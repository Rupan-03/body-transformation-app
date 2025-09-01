const User = require('../models/User');

exports.updateUserProfile = async (req, res) => {
    const { age, gender, height, weight, activityLevel } = req.body;
    const profileFields = { age, gender, height, weight, activityLevel };

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