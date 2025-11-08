// src/components/DashboardPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { Edit, TrendingUp, Target, Flame, Beef, Calendar, Award, Activity, ChevronRight, Weight, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';

const PROFILE_API_URL = `${import.meta.env.VITE_API_URL}/profile`;

// Enhanced Stat Card with animations
function StatCard({ title, value, icon, color = 'blue', subtitle, trend, onClick }) {
  const colorConfig = {
    blue: { bg: 'bg-blue-50', iconBg: 'bg-blue-100', text: 'text-blue-600', accent: 'text-blue-700' },
    green: { bg: 'bg-emerald-50', iconBg: 'bg-emerald-100', text: 'text-emerald-600', accent: 'text-emerald-700' },
    orange: { bg: 'bg-amber-50', iconBg: 'bg-amber-100', text: 'text-amber-600', accent: 'text-amber-700' },
    red: { bg: 'bg-rose-50', iconBg: 'bg-rose-100', text: 'text-rose-600', accent: 'text-rose-700' },
  };

  const config = colorConfig[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={`group relative overflow-hidden bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-lg transition-all duration-300 ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50/50"></div>

      <div className="relative p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-slate-900 mb-2">{value}</p>
            {subtitle && <p className={`text-xs font-medium ${config.accent}`}>{subtitle}</p>}
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <div className={`text-xs px-2 py-1 rounded-full ${config.bg} ${config.text}`}>{trend}</div>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${config.iconBg} ${config.text} group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Enhanced Goal Radio Button
const GoalRadio = ({ value, label, description, checked, onChange }) => (
  <motion.label
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={`flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
      checked ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-200 shadow-sm' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
    }`}
  >
    <div className="flex items-center">
      <input
        type="radio"
        name="primaryGoal"
        value={value}
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
      />
      <span className="ml-3 font-semibold text-slate-800">{label}</span>
    </div>
    {description && <p className="mt-1 ml-7 text-sm text-slate-600">{description}</p>}
  </motion.label>
);

// Quick Action Card
const QuickActionCard = ({ icon, title, description, onClick, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-emerald-500',
    orange: 'bg-amber-500',
    purple: 'bg-purple-500',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex items-center p-4 bg-white rounded-xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200 text-left group w-full"
    >
      <div className={`p-3 rounded-lg ${colors[color]} text-white mr-4 group-hover:scale-110 transition-transform duration-300`}>{icon}</div>
      <div className="flex-1">
        <h3 className="font-semibold text-slate-800">{title}</h3>
        <p className="text-sm text-slate-600 mt-1">{description}</p>
      </div>
      <ChevronRight size={20} className="text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all duration-300" />
    </motion.button>
  );
};

// Recent Activity Component
const RecentActivityItem = ({ icon, title, time, value, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-emerald-100 text-emerald-600',
    orange: 'bg-amber-100 text-amber-600',
    red: 'bg-rose-100 text-rose-600',
  };

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
      <div className={`p-2 rounded-lg ${colors[color]}`}>{icon}</div>
      <div className="flex-1">
        <p className="font-medium text-slate-800">{title}</p>
        <p className="text-sm text-slate-500">{time}</p>
      </div>
      {value && (
        <div className="text-right">
          <p className="font-semibold text-slate-900">{value}</p>
        </div>
      )}
    </motion.div>
  );
};

// Main Dashboard Component
export default function DashboardPage({ user, onUpdateUser, onNavigate }) {
  const getCalorieTarget = () => {
    const tdee = user.tdee || 0;
    switch (user.primaryGoal) {
      case 'light_loss':
        return tdee - 250;
      case 'moderate_loss':
        return tdee - 500;
      case 'light_gain':
        return tdee + 250;
      case 'moderate_gain':
        return tdee + 500;
      default:
        return tdee;
    }
  };

  const calorieTarget = getCalorieTarget();

  const goalConfig = {
    light_loss: { label: 'Light Loss', description: '-250 kcal/day', trend: 'Gradual cut' },
    moderate_loss: { label: 'Moderate Loss', description: '-500 kcal/day', trend: 'Aggressive cut' },
    light_gain: { label: 'Light Gain', description: '+250 kcal/day', trend: 'Lean bulk' },
    moderate_gain: { label: 'Moderate Gain', description: '+500 kcal/day', trend: 'Mass gain' },
  };

  const currentGoal = goalConfig[user.primaryGoal] || { label: 'Calorie Target', description: 'Maintenance' };

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState(user.primaryGoal); // <-- fixed
  const [isSaving, setIsSaving] = useState(false);

  // Mock recent activities - you can replace with real data
  const recentActivities = [
    { icon: <Weight size={16} />, title: 'Weight logged', time: '2 hours ago', value: '75.2 kg', color: 'blue' },
    { icon: <Flame size={16} />, title: 'Calorie target met', time: 'Yesterday', value: '2,150 kcal', color: 'green' },
    { icon: <Beef size={16} />, title: 'Protein goal achieved', time: 'Yesterday', value: '145g', color: 'orange' },
    { icon: <Activity size={16} />, title: 'Workout completed', time: '2 days ago', value: '45 min', color: 'red' },
  ];

  const handleGoalSave = async () => {
    setIsSaving(true);
    try {
      const res = await axios.put(PROFILE_API_URL, { primaryGoal: newGoal });
      onUpdateUser(res.data);
      setIsGoalModalOpen(false);
    } catch (err) {
      alert('Could not save new goal. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Navigation handlers
  const handleLogToday = () => {
    onNavigate('log-history'); // Navigate to the log page with form view
  };

  const handleViewWeeklyProgress = () => {
    onNavigate('weekly-progress'); // Navigate to weekly progress page
  };

  const handleViewStats = () => {
    onNavigate('log-history'); // Navigate to history view
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8 p-6">
        {/* Header Section */}
        <motion.section variants={itemVariants}>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Welcome back, {user.name?.split(' ')[0]}!
              </h1>
              <p className="mt-2 text-slate-600">Here's your transformation progress overview</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsGoalModalOpen(true)}
              className="flex items-center gap-2 px-5 py-3 font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Target size={18} />
              Adjust Goals
            </motion.button>
          </div>
        </motion.section>

        {/* Stats Grid */}
        <motion.section variants={itemVariants}>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Current Weight" value={`${user.weight} kg`} icon={<TrendingUp size={24} />} color="blue" subtitle="Healthy range" onClick={handleViewStats} />
            <StatCard title="TDEE" value={`${user.tdee || 'N/A'} kcal`} icon={<Flame size={24} />} color="orange" subtitle="Maintenance calories" />
            <StatCard title={currentGoal.label} value={`${calorieTarget} kcal`} icon={<Target size={24} />} color="green" subtitle={currentGoal.description} trend={currentGoal.trend} />
            <StatCard title="Protein Goal" value={`${user.proteinGoal || 'N/A'} g`} icon={<Beef size={24} />} color="red" subtitle="Daily target" />
          </div>
        </motion.section>

        {/* Quick Actions & Recent Activity Grid */}
        <motion.section variants={itemVariants}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <QuickActionCard icon={<Calendar size={20} />} title="Log Today's Progress" description="Record your daily nutrition and weight" onClick={handleLogToday} color="blue" />
                <QuickActionCard icon={<Award size={20} />} title="View Weekly Progress" description="See your transformation trends over time" onClick={handleViewWeeklyProgress} color="green" />
                <QuickActionCard icon={<BarChart3 size={20} />} title="Progress History" description="Review your past logs and achievements" onClick={handleViewStats} color="purple" />
                <QuickActionCard icon={<Edit size={20} />} title="Update Profile" description="Adjust your personal information and settings" onClick={() => onNavigate('profile')} color="orange" />
              </div>
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-1">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Recent Activity</h2>
              <div className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-sm">
                <div className="space-y-2">
                  {recentActivities.map((activity, index) => (
                    <RecentActivityItem key={index} icon={activity.icon} title={activity.title} time={activity.time} value={activity.value} color={activity.color} />
                  ))}
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleViewStats} className="w-full mt-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
                  View All Activity
                </motion.button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Motivation Section */}
        <motion.section variants={itemVariants}>
          <div className="p-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl text-center text-white shadow-lg">
            <Activity size={48} className="mx-auto mb-4 opacity-90" />
            <h3 className="text-2xl font-bold mb-2">Keep Going Strong!</h3>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto">
              Consistency is the key to transformation. Every healthy choice brings you closer to your goals.
            </p>
            <div className="mt-6 flex justify-center gap-4 text-sm">
              <div className="bg-white/20 px-3 py-1 rounded-full">Day 12 Streak</div>
              <div className="bg-white/20 px-3 py-1 rounded-full">3.2 kg Progress</div>
            </div>
          </div>
        </motion.section>
      </motion.div>

      {/* Enhanced Goal Modal */}
      <AnimatePresence>
        {isGoalModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl relative"
            >
              {/* Saving overlay */}
              {isSaving && (
                <div className="absolute inset-0 z-10 rounded-2xl bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
                  <LoadingSpinner label="Saving changes…" size="md" />
                </div>
              )}

              <div className="p-6 border-b border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800">Adjust Your Fitness Goal</h2>
                <p className="text-slate-600 mt-1">Choose your preferred calorie adjustment strategy</p>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <GoalRadio value="moderate_loss" label="Moderate Loss" description="-500 kcal/day for faster results" checked={newGoal === 'moderate_loss'} onChange={(e) => setNewGoal(e.target.value)} />
                  <GoalRadio value="light_loss" label="Light Loss" description="-250 kcal/day for steady progress" checked={newGoal === 'light_loss'} onChange={(e) => setNewGoal(e.target.value)} />
                  <GoalRadio value="moderate_gain" label="Moderate Gain" description="+500 kcal/day for muscle growth" checked={newGoal === 'moderate_gain'} onChange={(e) => setNewGoal(e.target.value)} />
                  <GoalRadio value="light_gain" label="Light Gain" description="+250 kcal/day for lean gains" checked={newGoal === 'light_gain'} onChange={(e) => setNewGoal(e.target.value)} />
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-slate-200">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setIsGoalModalOpen(false)} className="px-6 py-2 font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGoalSave}
                  disabled={isSaving}
                  className="px-6 py-2 font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-all duration-300"
                >
                  {isSaving ? 'Saving…' : 'Save Changes'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
