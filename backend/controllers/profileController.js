// backend/controllers/profileController.js

const User = require('../models/User');
const DailyLog = require('../models/DailyLog');
// --- IMPORT THE CALCULATION UTILITY ---
const { calculateTDEE, calculateProteinGoal } = require('../utils/calorieCalculator');

// @desc    Update user profile data and calculate initial goals
// @route   PUT /api/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
    // 1. Destructure all possible fields from the request body
    const { age, gender, height, weight, activityLevel, primaryGoal } = req.body;

    // 2. Initialize an object to hold only the fields we intend to update in the database
    const profileFields = {};
    if (age !== undefined) profileFields.age = age;
    if (gender !== undefined) profileFields.gender = gender;
    if (height !== undefined) profileFields.height = height;
    if (weight !== undefined) profileFields.weight = weight;
    if (activityLevel !== undefined) profileFields.activityLevel = activityLevel;
    if (primaryGoal !== undefined) profileFields.primaryGoal = primaryGoal;

    try {
        // 3. Find the existing user data first.
        // We need this to fill in any gaps if the user doesn't submit all fields at once,
        // and crucially, to provide the necessary inputs for the TDEE calculation.
        let user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // --- THIS IS THE FIX ---
        // 4. Create the temporary object for calculation *before* we try to use it.
        // It merges the potentially new data from the request with the existing user data.
        const userDataForCalc = {
            weight: weight !== undefined ? Number(weight) : user.weight,
            height: height !== undefined ? Number(height) : user.height,
            age: age !== undefined ? Number(age) : user.age,
            gender: gender || user.gender,
            activityLevel: activityLevel || user.activityLevel,
        };
        // --- END OF FIX ---

        // 5. Perform the TDEE and Protein Goal calculations using the complete data.
        // Check if we have all the necessary information before attempting the calculation.
        if (userDataForCalc.weight && userDataForCalc.height && userDataForCalc.age && userDataForCalc.gender && userDataForCalc.activityLevel) {
            profileFields.tdee = calculateTDEE(userDataForCalc); // Use the accurate calculation
            profileFields.proteinGoal = calculateProteinGoal(userDataForCalc.weight); // Use the standard calculation
        } else {
             // Optionally log a warning if calculation couldn't be performed yet
             console.warn(`User ${user.email} profile incomplete, skipping initial TDEE/Protein calculation.`);
        }

        // 6. Update the user document in the database with all new profile fields and calculated goals.
        user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: profileFields },
            // `new: true` returns the modified document.
            // `runValidators: true` ensures schema rules (like email format, enums) are checked.
            { new: true, runValidators: true }
        ).select('-password'); // Exclude password from the returned object

        // 7. Send the complete, updated user profile back to the frontend.
        res.json(user);

    } catch (err) {
        // Handle potential errors, including Mongoose validation errors.
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ msg: messages.join('. ') });
        }
        console.error("Error updating profile:", err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Delete a user's profile, auth data, and all their logs
// @route   DELETE /api/profile
// @access  Private
exports.deleteUserAccount = async (req, res) => {
    try {
        // Delete associated logs first to prevent orphaned data
        await DailyLog.deleteMany({ user: req.user.id });
        
        // Then delete the user document itself
        await User.findByIdAndDelete(req.user.id);

        res.json({ msg: 'Your account has been permanently deleted.' });
    } catch (err) {
        console.error("Error deleting account:", err.message);
        res.status(500).send('Server Error');
    }
};