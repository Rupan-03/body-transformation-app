// backend/scheduler.js
const cron = require('node-cron');
const User = require('./models/User');
const DailyLog = require('./models/DailyLog');
// --- IMPORT THE NEW UTILITY ---
const { calculateTDEE, calculateProteinGoal } = require('./utils/calorieCalculator');

// This function contains the logic to update a single user's goals
const updateUserGoals = async (user) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastSunday = new Date(today);
    lastSunday.setDate(today.getDate() - today.getDay());

    // Find the user's log entry for the most recent Sunday
    const sundayLog = await DailyLog.findOne({
        user: user._id,
        date: lastSunday
    });

    // If a log exists for last Sunday with a weight, proceed with recalculation
    if (sundayLog && sundayLog.weight) {
        const lastWeeksWeight = sundayLog.weight;

        // Create a user-like object containing all necessary data for the TDEE calculation.
        // It uses the existing user's profile data but overrides the weight with the latest log.
        const userDataForCalc = {
            weight: lastWeeksWeight,
            height: user.height,
            age: user.age,
            gender: user.gender,
            activityLevel: user.activityLevel,
        };

        // --- REPLACE OLD CALCULATION WITH NEW ---
        // Check if we have all the required data before attempting the calculation.
        if (userDataForCalc.weight && userDataForCalc.height && userDataForCalc.age && userDataForCalc.gender && userDataForCalc.activityLevel) {
            
            // Calculate using the imported functions from the utility file.
            const newTDEE = calculateTDEE(userDataForCalc); 
            const newProteinGoal = calculateProteinGoal(lastWeeksWeight); // Protein calculation remains the same

            // Update the user's document in the database with the new values.
            await User.findByIdAndUpdate(user._id, {
                tdee: newTDEE, // Use the new field name 'tdee'
                proteinGoal: newProteinGoal,
                lastWeeklyUpdate: today // Mark that the update ran today
            });
            
            console.log(`Updated goals for user: ${user.name} based on weight ${lastWeeksWeight}kg. New TDEE: ${newTDEE}`);
        } else {
             // Log a message if calculation couldn't be performed due to missing profile info.
             console.log(`Cannot update goals for user ${user.name}, missing profile info needed for calculation.`);
        }
        // --- END REPLACEMENT ---
        
    } else {
        // Log a message if no log was found for the required day.
        console.log(`No log found for last Sunday for user: ${user.name}. Skipping goal update.`);
    }
};

// The cron job scheduling logic remains the same.
const weeklyGoalUpdate = () => {
    // Runs at 3:00 AM every Monday.
    cron.schedule('0 3 * * 1', async () => { 
        console.log('Running weekly goal update job...');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        try {
            // Find users who haven't had their goals updated today.
            const usersToUpdate = await User.find({
                $or: [
                    { lastWeeklyUpdate: { $lt: today } },
                    { lastWeeklyUpdate: { $exists: false } }
                ]
            });
            console.log(`Found ${usersToUpdate.length} users potentially needing goal updates.`);
            // Loop through each user and attempt to update their goals.
            for (const user of usersToUpdate) {
                await updateUserGoals(user);
            }
            console.log('Weekly goal update job finished.');
        } catch (error) {
            console.error('Error running weekly goal update job:', error);
        }
    });
};

module.exports = weeklyGoalUpdate;