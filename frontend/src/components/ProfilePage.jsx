import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Calendar, Ruler, Weight, Activity, Target, Save, Loader2, Venus, Mars, TrendingUp, TrendingDown } from 'lucide-react';

const PROFILE_API_URL = `${import.meta.env.VITE_API_URL}/profile`;

// Enhanced GoalRadio component with modern design
const GoalRadio = ({ value, label, description, checked, onChange, icon }) => (
    <motion.label 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
            checked 
                ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-200 shadow-sm' 
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
        }`}
    >
        <input 
            type="radio" 
            name="primaryGoal" 
            value={value} 
            checked={checked} 
            onChange={onChange} 
            className="w-4 h-4 text-blue-600 focus:ring-blue-500 mt-1" 
        />
        <div className="ml-3 flex-1">
            <div className="flex items-center gap-2">
                {icon}
                <span className="font-semibold text-slate-800">{label}</span>
            </div>
            {description && (
                <p className="mt-1 text-sm text-slate-600">{description}</p>
            )}
        </div>
    </motion.label>
);

export default function ProfilePage({ onProfileSave }) {
    const [formData, setFormData] = useState({
        age: '', 
        gender: 'male', 
        height: '', 
        weight: '', 
        activityLevel: 'sedentary', 
        primaryGoal: 'moderate_loss'
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        try {
            const res = await axios.put(PROFILE_API_URL, formData);
            onProfileSave(res.data);
        } catch (err) {
            setError(err.response?.data?.msg || 'Could not save profile.');
        } finally {
            setIsLoading(false);
        }
    };

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

    const goalConfig = {
        moderate_loss: { 
            label: 'Moderate Loss', 
            description: '-500 kcal/day for faster results',
            icon: <TrendingDown size={18} className="text-red-500" />
        },
        light_loss: { 
            label: 'Light Loss', 
            description: '-250 kcal/day for steady progress',
            icon: <TrendingDown size={18} className="text-orange-500" />
        },
        moderate_gain: { 
            label: 'Moderate Gain', 
            description: '+500 kcal/day for muscle growth',
            icon: <TrendingUp size={18} className="text-green-500" />
        },
        light_gain: { 
            label: 'Light Gain', 
            description: '+250 kcal/day for lean gains',
            icon: <TrendingUp size={18} className="text-blue-500" />
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center p-4">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-2xl"
            >
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-8 text-center">
                        <motion.div
                            variants={itemVariants}
                            className="flex items-center justify-center gap-3 mb-4"
                        >
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                <User size={24} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">Complete Your Profile</h1>
                                <p className="text-blue-100 mt-1">Let's personalize your transformation journey</p>
                            </div>
                        </motion.div>
                    </div>

                    <div className="p-8">
                        {error && (
                            <motion.div 
                                variants={itemVariants}
                                className="flex items-center gap-3 p-4 mb-6 bg-red-50 border border-red-200 rounded-xl text-red-700"
                            >
                                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <User size={14} />
                                </div>
                                <span className="font-medium text-sm">{error}</span>
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Personal Details Section */}
                            <motion.section variants={itemVariants}>
                                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                        <User size={20} />
                                    </div>
                                    Personal Details
                                </h2>
                                
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
                                                required 
                                                onChange={handleChange}
                                                placeholder="Enter your age"
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
                                                required 
                                                onChange={handleChange}
                                                placeholder="Enter height"
                                                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Weight */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Weight (kg)
                                        </label>
                                        <div className="relative">
                                            <Weight className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                            <input 
                                                name="weight" 
                                                type="number" 
                                                required 
                                                onChange={handleChange}
                                                placeholder="Enter weight"
                                                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.section>

                            {/* Activity Level Section */}
                            <motion.section variants={itemVariants}>
                                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                                    <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                                        <Activity size={20} />
                                    </div>
                                    Activity Level
                                </h2>
                                
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
                                                onChange={handleChange}
                                                className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                                            />
                                            <div className="ml-3">
                                                <div className="font-medium text-slate-800">{level.label}</div>
                                                <div className="text-sm text-slate-600">{level.description}</div>
                                            </div>
                                        </motion.label>
                                    ))}
                                </div>
                            </motion.section>

                            {/* Goal Selection Section */}
                            <motion.section variants={itemVariants}>
                                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                                    <div className="p-2 bg-green-100 rounded-lg text-green-600">
                                        <Target size={20} />
                                    </div>
                                    Your Primary Goal
                                </h2>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <GoalRadio 
                                        value="moderate_loss" 
                                        label={goalConfig.moderate_loss.label}
                                        description={goalConfig.moderate_loss.description}
                                        checked={formData.primaryGoal === 'moderate_loss'} 
                                        onChange={handleChange}
                                        icon={goalConfig.moderate_loss.icon}
                                    />
                                    <GoalRadio 
                                        value="light_loss" 
                                        label={goalConfig.light_loss.label}
                                        description={goalConfig.light_loss.description}
                                        checked={formData.primaryGoal === 'light_loss'} 
                                        onChange={handleChange}
                                        icon={goalConfig.light_loss.icon}
                                    />
                                    <GoalRadio 
                                        value="moderate_gain" 
                                        label={goalConfig.moderate_gain.label}
                                        description={goalConfig.moderate_gain.description}
                                        checked={formData.primaryGoal === 'moderate_gain'} 
                                        onChange={handleChange}
                                        icon={goalConfig.moderate_gain.icon}
                                    />
                                    <GoalRadio 
                                        value="light_gain" 
                                        label={goalConfig.light_gain.label}
                                        description={goalConfig.light_gain.description}
                                        checked={formData.primaryGoal === 'light_gain'} 
                                        onChange={handleChange}
                                        icon={goalConfig.light_gain.icon}
                                    />
                                </div>
                            </motion.section>

                            {/* Submit Button */}
                            <motion.div variants={itemVariants} className="pt-6">
                                <button 
                                    type="submit" 
                                    disabled={isLoading}
                                    className="w-full py-4 font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg hover:shadow-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" />
                                            Saving Your Profile...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={20} />
                                            Start My Transformation Journey
                                        </>
                                    )}
                                </button>
                                
                                <p className="text-center text-slate-600 mt-4 text-sm">
                                    We'll calculate your personalized calorie targets based on this information
                                </p>
                            </motion.div>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}