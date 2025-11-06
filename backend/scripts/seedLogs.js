// backend/scripts/seedLogs.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User'); // adjust path if needed
const DailyLog = require('../models/DailyLog'); // adjust path if needed

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/fitnessApp';

const meals = ['breakfast', 'lunch', 'dinner'];
const workoutSplits = ['Push', 'Pull', 'Legs', 'Full Body', 'Upper', 'Lower'];
const cardioTypes = ['Run', 'Cycle', 'Swim', 'Row', 'Walk'];
const exerciseNames = ['Bench Press', 'Squat', 'Deadlift', 'Pull Up', 'Overhead Press', 'Lateral Raise'];

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

async function seedLogs() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const user = await User.findOne(); // assumes at least one user exists
    if (!user) {
      console.log('❌ No user found. Create one first.');
      process.exit(1);
    }

    await DailyLog.deleteMany({ user: user._id });
    console.log('🧹 Cleared old logs');

    const logs = [];

    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      const nutrition = {};
      meals.forEach((meal) => {
        nutrition[meal] = {
          calories: randomInt(300, 900),
          protein: randomInt(20, 60),
          fat: randomInt(10, 30),
          carbs: randomInt(30, 120),
        };
      });

      const sessions = [
        {
          type: 'workout',
          name: workoutSplits[randomInt(0, workoutSplits.length - 1)],
          exercises: Array.from({ length: 3 }, () => ({
            name: exerciseNames[randomInt(0, exerciseNames.length - 1)],
            sets: Array.from({ length: 3 }, () => ({
              reps: randomInt(8, 12),
              weight: randomInt(30, 100),
            })),
          })),
        },
        {
          type: 'cardio',
          name: cardioTypes[randomInt(0, cardioTypes.length - 1)],
          durationMinutes: randomInt(20, 60),
          distanceKm: randomInt(2, 8),
        },
      ];

      logs.push({
        user: user._id,
        date,
        weight: randomInt(65, 85),
        nutrition,
        sessions,
      });
    }

    await DailyLog.insertMany(logs);
    console.log(`✅ Inserted ${logs.length} fake logs`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding logs:', err);
    process.exit(1);
  }
}

seedLogs();
