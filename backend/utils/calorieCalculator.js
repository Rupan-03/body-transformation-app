// backend/utils/calorieCalculator.js

// This file centralizes the new, accurate calorie calculation logic.

/**
 * Calculates the Basal Metabolic Rate (BMR) using the Mifflin-St Jeor Equation.
 * @param {object} user - A user object containing weight(kg), height(cm), age(yrs), and gender('male'/'female').
 * @returns {number} The calculated BMR.
 */
function calculateBMR(user) {
    // --- Step 1: Calculate BMR ---
    if (!user || !user.weight || !user.height || !user.age || !user.gender) {
        console.error("Incomplete user data for BMR calculation:", user);
        return 0; // Return 0 or handle error if data is missing
    }
    if (user.gender === 'male') {
        return (10 * user.weight) + (6.25 * user.height) - (5 * user.age) + 5;
    } else { // 'female'
        return (10 * user.weight) + (6.25 * user.height) - (5 * user.age) - 161;
    }
}

/**
 * Calculates the Total Daily Energy Expenditure (TDEE), or "Maintenance Calories".
 * @param {object} user - A user object containing BMR calculable fields + activityLevel.
 * @returns {number} The calculated TDEE, rounded.
 */
function calculateTDEE(user) {
    const bmr = calculateBMR(user);
    if (bmr === 0) return 0; // Avoid multiplying errors

    // --- Step 2: Calculate TDEE ---
    const activityFactors = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9 // Corresponds to "Super active"
    };

    const factor = activityFactors[user.activityLevel] || 1.2; // Default to sedentary
    return Math.round(bmr * factor);
}

/**
 * Calculates the user's daily protein goal.
 * @param {number} weight - The user's weight in kg.
 * @returns {number} The calculated protein goal in grams, rounded.
 */
function calculateProteinGoal(weight) {
    if (!weight) return 0;
    return Math.round(weight * 1.7);
}

module.exports = {
    calculateTDEE,
    calculateProteinGoal
};