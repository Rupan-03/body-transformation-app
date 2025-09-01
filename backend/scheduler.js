const cron = require('node-cron');
const User = require('./models/User');
const DailyLog = require('./models/DailyLog');

// This function contains the logic to update a single user's goals
const updateUserGoals = async (user) => {
    // 1. Define the date range for last week (Sunday to Saturday)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find the date of the most recent Sunday
    const lastSunday = new Date(today);
    lastSunday.setDate(today.getDate() - today.getDay());

    // 2. Find the user's log entry for last Sunday
    const sundayLog = await DailyLog.findOne({
        user: user._id,
        date: lastSunday
    });

    // 3. If a log exists for last Sunday, and it has a weight, recalculate
    if (sundayLog && sundayLog.weight) {
        const lastWeeksWeight = sundayLog.weight;

        const newMaintenanceCalories = Math.round(lastWeeksWeight * 1.9 * 14);
        const newProteinGoal = Math.round(lastWeeksWeight * 1.7);
        
        // 4. Update the user's document in the database
        await User.findByIdAndUpdate(user._id, {
            maintenanceCalories: newMaintenanceCalories,
            proteinGoal: newProteinGoal,
            lastWeeklyUpdate: today // Mark that the update ran today
        });
        
        console.log(`Updated goals for user: ${user.name} based on weight ${lastWeeksWeight}kg.`);
    } else {
        console.log(`No log found for last Sunday for user: ${user.name}. Skipping update.`);
    }
};

// Schedule the task to run at 3:00 AM every Monday.
// Cron syntax: 'minute hour day-of-month month day-of-week'
// '0 3 * * 1' means at minute 0 of hour 3 on every day-of-month, every month, on day-of-week 1 (Monday).
const weeklyGoalUpdate = () => {
    cron.schedule('0 3 * * 1', async () => {
        console.log('Running weekly goal update job...');
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        try {
            // Find all users whose goals haven't been updated today
            const usersToUpdate = await User.find({
                // This prevents re-running if the server restarts on the same day
                $or: [
                    { lastWeeklyUpdate: { $lt: today } },
                    { lastWeeklyUpdate: { $exists: false } }
                ]
            });
            
            console.log(`Found ${usersToUpdate.length} users to update.`);
            
            // Loop through each user and update their goals
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