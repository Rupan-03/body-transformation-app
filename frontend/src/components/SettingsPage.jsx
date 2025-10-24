import React, { useState } from 'react';
import axios from 'axios';
import { AlertTriangle, Save } from 'lucide-react';

const PROFILE_API_URL = `${import.meta.env.VITE_API_URL}/profile`;

export default function SettingsPage({ user,onLogout, onUpdateUser }) {
    // --- STATE for the Update Profile Form ---
    // Initialize the form with the current user's data
    const [formData, setFormData] = useState({
        age: user.age || '',
        gender: user.gender || 'male',
        height: user.height || '',
        weight: user.weight || '',
        activityLevel: user.activityLevel || 'sedentary',
    });
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [profileMessage, setProfileMessage] = useState('');
    const [profileMessageType, setProfileMessageType] = useState(''); // 'success' or 'error'

    // --- STATE for the Delete Account Modal ---
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [confirmText, setConfirmText] = useState("");
    const [deleteError, setDeleteError] = useState("");

    // --- Handlers for Update Profile ---
    const handleProfileChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setProfileMessage(''); // Clear message on change
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setIsSavingProfile(true);
        setProfileMessage('');
        setProfileMessageType('');
        try {
            // Filter out empty fields before sending, though backend handles this
            const payload = Object.fromEntries(
                Object.entries(formData).filter(([_, v]) => v !== '')
            );
            const res = await axios.put(PROFILE_API_URL, payload);
            onUpdateUser(res.data); // Update the main user state in App.jsx
            setProfileMessage('Profile updated successfully!');
            setProfileMessageType('success');
        } catch (err) {
            setProfileMessage(err.response?.data?.msg || 'Failed to update profile.');
            setProfileMessageType('error');
        } finally {
            setIsSavingProfile(false);
        }
    };

    

    const handleDeleteAccountClick = () => {
        setIsDeleteModalOpen(true);
        setDeleteError("");
    };

    const handleConfirmDelete = async () => {
        if (confirmText !== "DELETE") {
            setDeleteError("Confirmation text does not match. Please type DELETE.");
            return;
        }
        
        try {
            await axios.delete(PROFILE_API_URL);
            alert('Your account has been successfully deleted.');
            onLogout(); // Log the user out after successful deletion
        } catch (err) {
            setDeleteError('Failed to delete your account. Please try again later.');
        }
    };

    return (
        <>
            <div className="space-y-8 animate-in fade-in">
                <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
                
                <section>
                    <div className="p-6 bg-white border rounded-lg shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-800">Update Your Profile</h2>
                        <p className="mt-1 text-sm text-gray-600">Changes here will recalculate your TDEE and Protein Goal.</p>
                        {profileMessage && <p className={`mt-4 text-sm p-3 rounded-md ${profileMessageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{profileMessage}</p>}
                        <form onSubmit={handleProfileSubmit} className="mt-6 space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Age</label>
                                    <input name="age" type="number" value={formData.age} onChange={handleProfileChange} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                                    <select name="gender" value={formData.gender} onChange={handleProfileChange} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md">
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
                                    <input name="height" type="number" value={formData.height} onChange={handleProfileChange} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Current Weight (kg)</label>
                                    <input name="weight" type="number" step="0.1" value={formData.weight} onChange={handleProfileChange} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"/>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Activity Level</label>
                                <select name="activityLevel" value={formData.activityLevel} onChange={handleProfileChange} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md">
                                    <option value="sedentary">Sedentary (office job)</option>
                                    <option value="light">Lightly Active (1-2 days/wk exercise)</option>
                                    <option value="moderate">Moderately Active (3-5 days/wk exercise)</option>
                                    <option value="active">Very Active (6-7 days/wk exercise)</option>
                                    <option value="very_active">Extra Active (physical job + exercise)</option>
                                </select>
                            </div>
                            <div className="text-right">
                                <button type="submit" disabled={isSavingProfile} className="inline-flex items-center justify-center gap-2 px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors">
                                    <Save size={16} />
                                    {isSavingProfile ? 'Saving...' : 'Save Profile Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </section>
                {/* --- END NEW SECTION --- */}

                {/* --- DANGER ZONE SECTION --- */}
                <div className="p-6 bg-white border border-red-200 rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold text-red-800">Danger Zone</h2>
                    <div className="flex flex-col items-start gap-4 mt-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="font-medium text-gray-800">Delete Your Account</h3>
                            <p className="mt-1 text-sm text-gray-600">Permanently remove your account and all associated data. This action is irreversible.</p>
                        </div>
                        <button onClick={handleDeleteAccountClick} className="flex items-center justify-center gap-2 px-4 py-2 font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 transition-transform duration-200 hover:scale-105 active:scale-100">
                            <AlertTriangle size={16} />
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>

            {/* --- The Delete Confirmation Modal --- */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 animate-in fade-in">
                    <div className="w-full max-w-md p-6 mx-4 bg-white rounded-lg shadow-xl animate-in fade-in slide-up">
                        <h2 className="text-xl font-bold text-gray-900">Are you absolutely sure?</h2>
                        <p className="mt-2 text-sm text-gray-600">This action is permanent and will delete all your data.</p>
                        <p className="mt-4 text-sm font-medium text-gray-700">Please type <strong className="text-red-600">DELETE</strong> to confirm.</p>
                        <input type="text" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} className="w-full px-3 py-2 mt-2 border border-gray-300 rounded-md" />
                        {deleteError && <p className="mt-2 text-sm text-red-600">{deleteError}</p>}
                        <div className="flex justify-end gap-4 mt-6">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
                            <button onClick={handleConfirmDelete} disabled={confirmText !== 'DELETE'} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-red-300">I understand, delete my account</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}