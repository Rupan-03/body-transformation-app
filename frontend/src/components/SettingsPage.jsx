import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  Save, 
  User, 
  Calendar, 
  Ruler, 
  Weight, 
  Activity, 
  LogOut, 
  Trash2, 
  Loader2,
  Settings,
  Shield,
  Venus,
  Mars,
  X
} from 'lucide-react';

const PROFILE_API_URL = `${import.meta.env.VITE_API_URL}/profile`;

export default function SettingsPage({ user, onLogout, onUpdateUser }) {
    // State for the Update Profile Form
    const [formData, setFormData] = useState({
        age: user.age || '',
        gender: user.gender || 'male',
        height: user.height || '',
        weight: user.weight || '',
        activityLevel: user.activityLevel || 'sedentary',
    });
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [profileMessage, setProfileMessage] = useState('');
    const [profileMessageType, setProfileMessageType] = useState('');

    // State for the Delete Account Modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [confirmText, setConfirmText] = useState("");
    const [deleteError, setDeleteError] = useState("");

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.9 }
    };

    // Handlers for Update Profile
    const handleProfileChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setProfileMessage('');
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setIsSavingProfile(true);
        setProfileMessage('');
        setProfileMessageType('');
        try {
            const payload = Object.fromEntries(
                Object.entries(formData).filter(([_, v]) => v !== '')
            );
            const res = await axios.put(PROFILE_API_URL, payload);
            onUpdateUser(res.data);
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
            onLogout();
        } catch (err) {
            setDeleteError('Failed to delete your account. Please try again later.');
        }
    };

    const activityLevels = [
        { value: 'sedentary', label: 'Sedentary', description: 'Office job, little exercise' },
        { value: 'light', label: 'Lightly Active', description: '1-2 workouts per week' },
        { value: 'moderate', label: 'Moderately Active', description: '3-5 workouts per week' },
        { value: 'active', label: 'Very Active', description: '6-7 workouts per week' },
        { value: 'very_active', label: 'Extra Active', description: 'Physical job + daily exercise' }
    ];

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Account Settings
                </h1>
                <p className="text-slate-600">Manage your profile and account preferences</p>
            </motion.div>

            {/* Profile Update Section */}
            <motion.section variants={itemVariants} className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                <h2 className="flex items-center gap-3 text-xl font-semibold text-slate-800 mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        <User size={20} />
                    </div>
                    Update Your Profile
                </h2>
                
                <p className="text-slate-600 mb-6">
                    Changes here will recalculate your TDEE and Protein Goal based on your updated information.
                </p>

                {profileMessage && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex items-center gap-3 p-4 mb-6 rounded-xl ${
                            profileMessageType === 'success' 
                                ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                                : 'bg-red-50 border border-red-200 text-red-700'
                        }`}
                    >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                            profileMessageType === 'success' ? 'bg-emerald-100' : 'bg-red-100'
                        }`}>
                            {profileMessageType === 'success' ? <Save size={14} /> : <AlertTriangle size={14} />}
                        </div>
                        <span className="font-medium text-sm">{profileMessage}</span>
                    </motion.div>
                )}

                <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Age */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Age
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                <input 
                                    name="age" 
                                    type="number" 
                                    value={formData.age} 
                                    onChange={handleProfileChange} 
                                    required 
                                    className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Gender */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Gender
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setFormData({...formData, gender: 'male'})}
                                    className={`flex items-center justify-center gap-2 p-3 border-2 rounded-xl transition-all ${
                                        formData.gender === 'male' 
                                            ? 'border-blue-400 bg-blue-50 ring-2 ring-blue-200' 
                                            : 'border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                    <Mars size={18} className={formData.gender === 'male' ? 'text-blue-600' : 'text-slate-400'} />
                                    <span className={`font-medium ${
                                        formData.gender === 'male' ? 'text-blue-700' : 'text-slate-600'
                                    }`}>
                                        Male
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({...formData, gender: 'female'})}
                                    className={`flex items-center justify-center gap-2 p-3 border-2 rounded-xl transition-all ${
                                        formData.gender === 'female' 
                                            ? 'border-pink-400 bg-pink-50 ring-2 ring-pink-200' 
                                            : 'border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                    <Venus size={18} className={formData.gender === 'female' ? 'text-pink-600' : 'text-slate-400'} />
                                    <span className={`font-medium ${
                                        formData.gender === 'female' ? 'text-pink-700' : 'text-slate-600'
                                    }`}>
                                        Female
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Height */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Height (cm)
                            </label>
                            <div className="relative">
                                <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                <input 
                                    name="height" 
                                    type="number" 
                                    value={formData.height} 
                                    onChange={handleProfileChange} 
                                    required 
                                    className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Weight */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Current Weight (kg)
                            </label>
                            <div className="relative">
                                <Weight className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                <input 
                                    name="weight" 
                                    type="number" 
                                    step="0.1"
                                    value={formData.weight} 
                                    onChange={handleProfileChange} 
                                    required 
                                    className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Activity Level */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-4">
                            Activity Level
                        </label>
                        <div className="space-y-3">
                            {activityLevels.map((level) => (
                                <motion.label 
                                    key={level.value}
                                    whileHover={{ scale: 1.01 }}
                                    className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                        formData.activityLevel === level.value
                                            ? 'border-orange-400 bg-orange-50 ring-2 ring-orange-200'
                                            : 'border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="activityLevel"
                                        value={level.value}
                                        checked={formData.activityLevel === level.value}
                                        onChange={handleProfileChange}
                                        className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                                    />
                                    <div className="ml-3">
                                        <div className="font-medium text-slate-800">{level.label}</div>
                                        <div className="text-sm text-slate-600">{level.description}</div>
                                    </div>
                                </motion.label>
                            ))}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-4">
                        <button 
                            type="submit" 
                            disabled={isSavingProfile}
                            className="flex items-center gap-3 px-6 py-3 font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                        >
                            {isSavingProfile ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Saving Changes...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Save Profile Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </motion.section>

            {/* Account Actions Section */}
            <motion.section variants={itemVariants} className="space-y-6">
                {/* Sign Out */}
                <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                    <h2 className="flex items-center gap-3 text-xl font-semibold text-slate-800 mb-4">
                        <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                            <LogOut size={20} />
                        </div>
                        Session
                    </h2>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h3 className="font-medium text-slate-800">Sign Out</h3>
                            <p className="text-slate-600 text-sm mt-1">End your current session and return to the login screen</p>
                        </div>
                        <button 
                            onClick={onLogout}
                            className="flex items-center gap-2 px-6 py-3 font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                        >
                            <LogOut size={18} />
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-red-50 rounded-2xl border border-red-200 p-6 shadow-sm">
                    <h2 className="flex items-center gap-3 text-xl font-semibold text-red-800 mb-4">
                        <div className="p-2 bg-red-100 rounded-lg text-red-600">
                            <Shield size={20} />
                        </div>
                        Danger Zone
                    </h2>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h3 className="font-medium text-red-800">Delete Your Account</h3>
                            <p className="text-red-600 text-sm mt-1">
                                Permanently remove your account and all associated data. This action is irreversible.
                            </p>
                        </div>
                        <button 
                            onClick={handleDeleteAccountClick}
                            className="flex items-center gap-2 px-6 py-3 font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors"
                        >
                            <Trash2 size={18} />
                            Delete Account
                        </button>
                    </div>
                </div>
            </motion.section>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {isDeleteModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="bg-red-500 text-white p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                                            <AlertTriangle size={20} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold">Delete Account</h2>
                                            <p className="text-red-100 text-sm">This action cannot be undone</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setIsDeleteModalOpen(false)}
                                        className="p-2 text-red-100 hover:text-white transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6">
                                <p className="text-slate-700 mb-4">
                                    This will permanently delete your account and remove all your data from our servers. 
                                    Please be certain as this action cannot be reversed.
                                </p>
                                
                                <div className="space-y-4">
                                    <label className="block text-sm font-medium text-slate-700">
                                        Type <span className="font-bold text-red-600">DELETE</span> to confirm:
                                    </label>
                                    <input 
                                        type="text" 
                                        value={confirmText} 
                                        onChange={(e) => setConfirmText(e.target.value)} 
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                        placeholder="Type DELETE here..."
                                    />
                                    
                                    {deleteError && (
                                        <motion.p 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-sm text-red-600 flex items-center gap-2"
                                        >
                                            <AlertTriangle size={16} />
                                            {deleteError}
                                        </motion.p>
                                    )}
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button 
                                        onClick={() => setIsDeleteModalOpen(false)}
                                        className="flex-1 py-3 font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleConfirmDelete} 
                                        disabled={confirmText !== 'DELETE'}
                                        className="flex-1 py-3 font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={18} />
                                        Delete Account
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}