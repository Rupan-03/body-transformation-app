// This script updates existing user documents to use the new 'tdee' field name.
// Run this ONCE after deploying the new backend code.

require('dotenv').config(); // Load environment variables
const mongoose = require('mongoose');
const User = require('./models/User'); // Adjust path if needed

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for migration...');

        // Find all users that still have the old 'maintenanceCalories' field
        const result = await User.updateMany(
            { maintenanceCalories: { $exists: true } }, // Filter: Find documents with the old field
            [ // Pipeline: Define the update operations
                { 
                    $set: { 
                        tdee: "$maintenanceCalories" // Set 'tdee' to the value of 'maintenanceCalories'
                    } 
                },
                { 
                    $unset: "maintenanceCalories" // Remove the old 'maintenanceCalories' field
                } 
            ]
        );

        console.log(`Migration complete. Matched ${result.matchedCount} documents, Modified ${result.modifiedCount} documents.`);

    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        await mongoose.connection.close();
        console.log('MongoDB connection closed.');
    }
};

migrate();