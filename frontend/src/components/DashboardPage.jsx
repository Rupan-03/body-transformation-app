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

const GoalRadio = ({ value, label, checked, onChange }) => (
    <label className={`flex items-center p-3 text-sm border rounded-md cursor-pointer transition-colors ${checked ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-300' : 'hover:bg-gray-50'}`}>
        <input type="radio" name="primaryGoal" value={value} checked={checked} onChange={onChange} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
        <span className="ml-3 font-medium text-gray-700">{label}</span>
    </label>
);

// The main DashboardPage component.
export default function DashboardPage({ user, onUpdateUser }) {
    // --- UPDATED: Calculate dynamic calorie target based on the four goals ---
    const getCalorieTarget = () => {
        const tdee = user.tdee || 0; // Use the new 'tdee' field name
        switch (user.primaryGoal) {
            case 'light_loss': return tdee - 250;
            case 'moderate_loss': return tdee - 500;
            case 'light_gain': return tdee + 250;
            case 'moderate_gain': return tdee + 500;
            default: return tdee; // Should ideally not happen if goal is set
        }
    };
    const calorieTarget = getCalorieTarget();
    
    // --- UPDATED: Map goal keys to user-friendly labels ---
    const goalLabels = {
        light_loss: 'Light Loss Target (-250 kcal)',
        moderate_loss: 'Moderate Loss Target (-500 kcal)',
        light_gain: 'Light Gain Target (+250 kcal)',
        moderate_gain: 'Moderate Gain Target (+500 kcal)',
    };
    const currentGoalLabel = goalLabels[user.primaryGoal] || 'Calorie Target';

    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [newGoal, setNewGoal] = useState(user.primaryGoal);
    const [isSaving, setIsSaving] = useState(false);

    const handleGoalSave = async () => {
        setIsSaving(true);
        try {
            const res = await axios.put(PROFILE_API_URL, { primaryGoal: newGoal });
            onUpdateUser(res.data);
            setIsGoalModalOpen(false);
        } catch (err) {
            alert("Could not save new goal. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <div className="space-y-8 animate-in fade-in">
                <section>
                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                            <p className="mt-1 text-gray-500">Here's your "at-a-glance" progress for today.</p>
                        </div>
                        <button onClick={() => setIsGoalModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 transition-colors">
                            <Edit size={16} /> Edit Primary Goal
                        </button>
                    </div>
                </section>
                
                <section>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard title="Current Weight" value={`${user.weight} kg`} icon={<TrendingUp size={24} />} color="blue" />
                        {/* --- UPDATED: Use 'tdee' instead of 'maintenanceCalories' --- */}
                        <StatCard title="TDEE (Maintenance)" value={`${user.tdee || 'N/A'} kcal`} icon={<Flame size={24} />} color="orange" />
                        <StatCard title={currentGoalLabel} value={`${calorieTarget} kcal`} icon={<Target size={24} />} color="green" />
                        <StatCard title="Protein Goal" value={`${user.proteinGoal || 'N/A'} g`} icon={<Beef size={24} />} color="red" />
                    </div>
                </section>
                
                <section>
                    <div className="p-8 text-center bg-white border rounded-lg">
                        <h3 className="text-lg font-medium text-gray-700">Daily Log & History</h3>
                        <p className="mt-2 text-sm text-gray-500">Navigate to the "Log History" page via the sidebar to add today's entry or review past progress.</p>
                    </div>
                </section>
            </div>

            {/* --- UPDATED: Edit Goal Modal with new options --- */}
            {isGoalModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 animate-in fade-in">
                    <div className="w-full max-w-lg p-6 mx-4 bg-white rounded-lg shadow-xl animate-in fade-in slide-up">
                        <h2 className="text-xl font-bold text-gray-900">Change Your Primary Goal</h2>
                        <div className="grid grid-cols-1 gap-2 mt-4 sm:grid-cols-2">
                            <GoalRadio value="moderate_loss" label="Moderate Loss (-500)" checked={newGoal === 'moderate_loss'} onChange={(e) => setNewGoal(e.target.value)} />
                            <GoalRadio value="light_loss" label="Light Loss (-250)" checked={newGoal === 'light_loss'} onChange={(e) => setNewGoal(e.target.value)} />
                            <GoalRadio value="moderate_gain" label="Moderate Gain (+500)" checked={newGoal === 'moderate_gain'} onChange={(e) => setNewGoal(e.target.value)} />
                            <GoalRadio value="light_gain" label="Light Gain (+250)" checked={newGoal === 'light_gain'} onChange={(e) => setNewGoal(e.target.value)} />
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