import React, { useState } from 'react';
import axios from 'axios';
import { Edit, TrendingUp, Target, Flame, Beef } from 'lucide-react';

const PROFILE_API_URL = `${import.meta.env.VITE_API_URL}/profile`;

// A reusable UI component for displaying a single statistic on the dashboard.
function StatCard({ title, value, icon, color = 'blue' }) {
    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        orange: 'bg-orange-100 text-orange-600',
        red: 'bg-red-100 text-red-600',
    };

    return (
        <div className="flex items-center p-4 bg-white border rounded-lg shadow-sm transition-transform duration-300 hover:scale-105 hover:shadow-md">
            <div className={`p-3 mr-4 rounded-full ${colorClasses[color]}`}>
                {icon}
            </div>
            <div>
                <h3 className="text-sm font-medium text-gray-500">{title}</h3>
                <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );
}

// The main DashboardPage component.
export default function DashboardPage({ user, onUpdateUser }) {
    // Dynamically calculate the user's daily calorie target based on their primary goal.
    const calorieTarget = user.primaryGoal === 'muscle_gain' 
        ? (user.maintenanceCalories || 0) + 500 
        : (user.maintenanceCalories || 0) - 500;

    // State management for the "Edit Goal" modal.
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [newGoal, setNewGoal] = useState(user.primaryGoal);
    const [isSaving, setIsSaving] = useState(false);

    // Handles saving the user's new primary goal.
    const handleGoalSave = async () => {
        setIsSaving(true);
        try {
            const res = await axios.put(PROFILE_API_URL, { primaryGoal: newGoal });
            onUpdateUser(res.data); // Update the main user state in App.jsx
            setIsGoalModalOpen(false); // Close the modal on success
        } catch (err) {
            // A simple alert for errors; could be replaced with a toast notification.
            alert("Could not save new goal. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
             <div className="space-y-8 animate-in fade-in">
                {/* --- REDESIGNED HEADER SECTION --- */}
                <section>
                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                            <p className="mt-1 text-gray-500">Here's your "at-a-glance" progress for today.</p>
                        </div>
                        <button 
                            onClick={() => setIsGoalModalOpen(true)} 
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
                        >
                            <Edit size={16} /> Edit Primary Goal
                        </button>
                    </div>
                </section>
                
                {/* --- REDESIGNED STATS & GOALS GRID --- */}
                <section>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard title="Current Weight" value={`${user.weight} kg`} icon={<TrendingUp size={24} />} color="blue" />
                        <StatCard title="Maintenance" value={`${user.maintenanceCalories} kcal`} icon={<Flame size={24} />} color="orange" />
                        <StatCard 
                            title={user.primaryGoal === 'muscle_gain' ? 'Muscle Gain Target' : 'Fat Loss Target'} 
                            value={`${calorieTarget} kcal`}
                            icon={<Target size={24} />}
                            color="green"
                        />
                        <StatCard title="Protein Goal" value={`${user.proteinGoal} g`} icon={<Beef size={24} />} color="red" />
                    </div>
                </section>
                
                {/* Placeholder for future components */}
                <section>
                    <div className="p-8 text-center bg-white border rounded-lg">
                        <h3 className="text-lg font-medium text-gray-700">Future Components</h3>
                        <p className="mt-2 text-sm text-gray-500">Charts and visualizations will go here.</p>
                    </div>
                </section>
            </div>


            {/* --- Edit Goal Modal --- */}
            {isGoalModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 animate-in fade-in">
                    <div className="w-full max-w-md p-6 mx-4 bg-white rounded-lg shadow-xl animate-in fade-in slide-up">
                        <h2 className="text-xl font-bold text-gray-900">Change Your Primary Goal</h2>
                        <div className="flex gap-4 mt-4">
                            <label className="flex items-center p-3 border rounded-md cursor-pointer flex-1 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-400">
                                <input type="radio" name="primaryGoal" value="fat_loss" checked={newGoal === 'fat_loss'} onChange={(e) => setNewGoal(e.target.value)} className="w-4 h-4 text-blue-600" />
                                <span className="ml-3 text-sm font-medium text-gray-700">Fat Loss</span>
                            </label>
                            <label className="flex items-center p-3 border rounded-md cursor-pointer flex-1 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-400">
                                <input type="radio" name="primaryGoal" value="muscle_gain" checked={newGoal === 'muscle_gain'} onChange={(e) => setNewGoal(e.target.value)} className="w-4 h-4 text-blue-600" />
                                <span className="ml-3 text-sm font-medium text-gray-700">Muscle Gain</span>
                            </label>
                        </div>
                        <div className="flex justify-end gap-4 mt-6">
                            <button onClick={() => setIsGoalModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
                            <button onClick={handleGoalSave} disabled={isSaving} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300">
                                {isSaving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}