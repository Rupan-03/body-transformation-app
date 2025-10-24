import React, { useState } from 'react';
import axios from 'axios';

const PROFILE_API_URL = `${import.meta.env.VITE_API_URL}/profile`;

// --- ADD GoalRadio helper component here ---
const GoalRadio = ({ value, label, checked, onChange }) => (
    <label className={`flex items-center p-3 text-sm border rounded-md cursor-pointer transition-colors ${checked ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-300' : 'hover:bg-gray-50'}`}>
        <input type="radio" name="primaryGoal" value={value} checked={checked} onChange={onChange} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
        <span className="ml-3 font-medium text-gray-700">{label}</span>
    </label>
);
// --- END ADDITION ---

export default function ProfilePage({ onProfileSave }) {
    const [formData, setFormData] = useState({
        age: '', gender: 'male', height: '', weight: '', activityLevel: 'sedentary', primaryGoal: 'moderate_loss'
    });
    const [error, setError] = useState('');

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await axios.put(PROFILE_API_URL, formData);
            onProfileSave(res.data);
        } catch (err) {
            setError(err.response?.data?.msg || 'Could not save profile.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900">Complete Your Profile</h1>
                    <p className="text-gray-500">This information helps us tailor your goals.</p>
                </div>
                 {error && <p className="p-3 text-sm text-red-700 bg-red-100 rounded-md">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Age</label>
                            <input name="age" type="number" required onChange={handleChange} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"/>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Gender</label>
                            <select name="gender" onChange={handleChange} value={formData.gender} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md">
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Height (cm)</label>
                            <input name="height" type="number" required onChange={handleChange} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"/>
                        </div>
                         <div>
                            <label className="text-sm font-medium text-gray-700">Weight (kg)</label>
                            <input name="weight" type="number" required onChange={handleChange} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"/>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Activity Level</label>
                        <select name="activityLevel" onChange={handleChange} value={formData.activityLevel} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md">
                            <option value="sedentary">Sedentary (office job)</option>
                            <option value="light">Lightly Active (1-2 days/week)</option>
                            <option value="moderate">Moderately Active (3-5 days/week)</option>
                            <option value="active">Very Active (6-7 days/week)</option>
                            <option value="very_active">Extra Active (physical job)</option>
                        </select>
                    </div>
                    {/* --- NEW GOAL SELECTION SECTION --- */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Finally, what is your primary goal?</label>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <GoalRadio value="moderate_loss" label="Moderate Loss (-500 kcal)" checked={formData.primaryGoal === 'moderate_loss'} onChange={handleChange} />
                            <GoalRadio value="light_loss" label="Light Loss (-250 kcal)" checked={formData.primaryGoal === 'light_loss'} onChange={handleChange} />
                            <GoalRadio value="moderate_gain" label="Moderate Gain (+500 kcal)" checked={formData.primaryGoal === 'moderate_gain'} onChange={handleChange} />
                            <GoalRadio value="light_gain" label="Light Gain (+250 kcal)" checked={formData.primaryGoal === 'light_gain'} onChange={handleChange} />
                        </div>
                    </div>
                    {/* --- END NEW SECTION --- */}
                    <button type="submit" className="w-full py-2 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700">Save Profile & Continue</button>
                </form>
            </div>
        </div>
    );
}