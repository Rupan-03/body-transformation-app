import React, { useState } from 'react';
import axios from 'axios';
import { LogOut, BarChart3, TrendingUp, AlertTriangle, Edit } from 'lucide-react'; 
import DailyLog from './DailyLog';

const PROFILE_API_URL = `${import.meta.env.VITE_API_URL}/profile`;

export default function DashboardPage({ user, handleLogout, onNavigate, onUpdateUser}) {
        // --- DYNAMIC CALORIE CALCULATION ---
    const calorieTarget = user.primaryGoal === 'muscle_gain' 
        ? (user.maintenanceCalories || 0) + 500 
        : (user.maintenanceCalories || 0) - 500;

    // --- STATE FOR THE NEW "EDIT GOAL" MODAL ---
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [newGoal, setNewGoal] = useState(user.primaryGoal);
    const [isSaving, setIsSaving] = useState(false);

     // --- NEW STATE for the custom DELETE confirmation modal ---
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [confirmText, setConfirmText] = useState("");
    const [deleteError, setDeleteError] = useState("");

    const handleGoalSave = async () => {
        setIsSaving(true);
        try {
            const res = await axios.put(PROFILE_API_URL, { primaryGoal: newGoal });
            onUpdateUser(res.data); // Update the user state in App.jsx
            setIsGoalModalOpen(false);
        } catch (err) {
            alert("Could not save new goal. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };
    
     // This function now just opens the delete modal
    const handleDeleteAccountClick = () => {
        setIsDeleteModalOpen(true);
        setDeleteError(""); // Clear any previous errors
    };

    // This new function handles the actual deletion from within the modal
    const handleConfirmDelete = async () => {
        if (confirmText !== "DELETE") {
            setDeleteError("Confirmation text does not match. Please type DELETE.");
            return;
        }
        
        try {
            await axios.delete(PROFILE_API_URL);
            // We use alert here just once as a final confirmation before logging out.
            // In a larger app, this could be a success toast notification.
            alert('Your account has been successfully deleted.');
            handleLogout(); // Log the user out after successful deletion
        } catch (err) {
            setDeleteError('Failed to delete your account. Please try again later.');
        }
    };

return (
    <>
        <div className="min-h-screen p-4 bg-gray-50 sm:p-6 md:p-8">
            <div className="max-w-5xl mx-auto animate-in fade-in">
                <header className="flex flex-col items-center justify-between gap-4 pb-4 mb-8 border-b sm:flex-row">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Welcome, {user.name}!</h1>
                        <p className="text-sm text-gray-500">Your personal dashboard is ready.</p>
                    </div>
                    <div className="flex items-center self-stretch gap-2 sm:self-auto">
                        <button onClick={() => onNavigate('weeklyProgress')} className="flex items-center justify-center flex-1 gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 transition-colors">
                            <BarChart3 size={16} />
                            Weekly Progress
                        </button>
                        <button onClick={handleLogout} className="flex items-center justify-center flex-1 gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-100 transition-colors">
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>
                </header>

                <main className="space-y-8">
                        <section>
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-800">Your Stats & Goals</h2>
                                {/* --- NEW EDIT GOAL BUTTON --- */}
                                <button onClick={() => setIsGoalModalOpen(true)} className="flex items-center gap-2 px-3 py-1 text-xs font-medium text-gray-600 bg-white border rounded-md hover:bg-gray-100 transition-colors">
                                    <Edit size={12} /> Edit Goal
                                </button>
                            </div>
                             <div className="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-2 lg:grid-cols-4">
                                <StatCard title="Current Weight" value={`${user.weight} kg`} icon={<TrendingUp />} />
                                <StatCard title="Maintenance" value={`${user.maintenanceCalories} kcal`} />
                                {/* --- UPDATED DYNAMIC STAT CARD --- */}
                                <StatCard 
                                    title={user.primaryGoal === 'muscle_gain' ? 'Muscle Gain Target' : 'Fat Loss Target'} 
                                    value={`${calorieTarget} kcal`} 
                                />
                                <StatCard title="Protein Goal" value={`${user.proteinGoal} g`} />
                             </div>
                        </section>
                    
                    <section>
                        <DailyLog />
                    </section>
                    
                    {/* --- NEW ACCOUNT SETTINGS (DANGER ZONE) SECTION --- */}
                    <section>
                        <div className="p-6 bg-white border border-red-200 rounded-lg shadow-sm">
                            <h2 className="text-lg font-semibold text-red-800">Danger Zone</h2>
                            <div className="flex flex-col items-start gap-4 mt-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h3 className="font-medium text-gray-800">Delete Your Account</h3>
                                    <p className="mt-1 text-sm text-gray-600">Permanently remove your account and all associated data. This action is irreversible.</p>
                                </div>
                                {/* This button now calls the new handler to open the modal */}
                                <button onClick={handleDeleteAccountClick} className="flex items-center justify-center gap-2 px-4 py-2 font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 transition-transform duration-200 hover:scale-105 active:scale-100">
                                    <AlertTriangle size={16} />
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </section>
                </main>
            </div>

            {/* --- NEW EDIT GOAL MODAL --- */}
            {isGoalModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-in fade-in">
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

            {/* --- NEW: The Custom Delete Confirmation Modal --- */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 animate-in fade-in">
                    <div className="w-full max-w-md p-6 mx-4 bg-white rounded-lg shadow-xl animate-in fade-in slide-up">
                        <h2 className="text-xl font-bold text-gray-900">Are you absolutely sure?</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            This action is permanent and cannot be undone. This will permanently delete your account and all of your logged data.
                        </p>
                        <p className="mt-4 text-sm font-medium text-gray-700">
                            Please type <strong className="text-red-600">DELETE</strong> to confirm.
                        </p>
                        <input 
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            className="w-full px-3 py-2 mt-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                        />
                        {deleteError && <p className="mt-2 text-sm text-red-600">{deleteError}</p>}
                        <div className="flex justify-end gap-4 mt-6">
                            <button 
                                onClick={() => setIsDeleteModalOpen(false)} 
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleConfirmDelete}
                                disabled={confirmText !== 'DELETE'}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:bg-red-300 disabled:cursor-not-allowed"
                            >
                                I understand, delete my account
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </>
    );
}

function StatCard({ title, value, icon }) {
    return (
        <div className="p-4 bg-white border rounded-lg shadow-sm transition-transform duration-300 hover:scale-105 hover:shadow-md animate-in fade-in slide-up">
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
        </div>
    );
}