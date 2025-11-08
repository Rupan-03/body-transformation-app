import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  RefreshCw,
  BarChart3,
  Target,
  TrendingUp,
  Calendar,
  Utensils,
  Dumbbell,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const GOALS_API_URL = `${import.meta.env.VITE_API_URL}/goals`;

/* ---------------------------- Progress Stat Card --------------------------- */
const ProgressStat = ({ label, value, goal, unit, icon: Icon, trend }) => {
  const percentage = goal > 0 ? Math.min((value / goal) * 100, 100) : 0;
  const isOver = value > goal;
  const isMet = value >= goal;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-xl ${
              isMet ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
            }`}
          >
            <Icon size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">{label}</h3>
            <p className="text-sm text-slate-600">Weekly average</p>
          </div>
        </div>
        {typeof trend === 'number' && (
          <div
            className={`flex items-center gap-1 text-sm ${
              trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-slate-600'
            }`}
          >
            <TrendingUp size={16} className={trend < 0 ? 'rotate-180' : ''} />
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-baseline">
          <span className="text-2xl font-bold text-slate-900">
            {value}{' '}
            <span className="text-sm font-normal text-slate-600">{unit}</span>
          </span>
          <span
            className={`text-sm font-semibold ${
              isOver ? 'text-red-600' : isMet ? 'text-green-600' : 'text-slate-600'
            }`}
          >
            {isMet ? '🎯 Goal Met!' : `${goal} ${unit} goal`}
          </span>
        </div>

        <div className="space-y-2">
          <div className="w-full bg-slate-200 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-3 rounded-full transition-all duration-500 ${
                isOver ? 'bg-red-500' : isMet ? 'bg-green-500' : 'bg-blue-500'
              }`}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-600">
            <span>Progress</span>
            <span className="font-medium">{Math.round(percentage)}%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ------------------------------ Weekly Summary ---------------------------- */
const WeeklySummaryCard = ({ week, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm"
  >
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-100 rounded-xl text-purple-600">
          <Calendar size={20} />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-lg">
            Week of{' '}
            {new Date(week.weekOf).toLocaleDateString(undefined, {
              month: 'long',
              day: 'numeric'
            })}
          </h3>
          <p className="text-sm text-slate-600">
            End of Week Weight:{' '}
            <span className="font-semibold text-slate-800">
              {week.endOfWeekWeight} kg
            </span>
          </p>
        </div>
      </div>
      <div
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          week.avgCalories >= week.calorieGoal && week.avgProtein >= week.proteinGoal
            ? 'bg-green-100 text-green-800'
            : 'bg-orange-100 text-orange-800'
        }`}
      >
        {week.avgCalories >= week.calorieGoal && week.avgProtein >= week.proteinGoal
          ? 'Goals Met'
          : 'In Progress'}
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ProgressStat
        label="Daily Calories"
        value={week.avgCalories}
        goal={week.calorieGoal}
        unit="kcal"
        icon={Utensils}
        trend={week.calorieTrend}
      />
      <ProgressStat
        label="Daily Protein"
        value={week.avgProtein}
        goal={week.proteinGoal}
        unit="g"
        icon={Dumbbell}
        trend={week.proteinTrend}
      />
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200">
      <div className="text-center">
        <div className="text-2xl font-bold text-slate-900">{week.totalWorkouts || 0}</div>
        <div className="text-xs text-slate-600">Workouts</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-slate-900">{week.totalCardio || 0}</div>
        <div className="text-xs text-slate-600">Cardio Sessions</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-slate-900">{week.consistency || 0}%</div>
        <div className="text-xs text-slate-600">Consistency</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-slate-900">{week.weightChange || 0}kg</div>
        <div className="text-xs text-slate-600">Weight Change</div>
      </div>
    </div>
  </motion.div>
);

/* --------------------------- Weekly Progress Page ------------------------- */
export default function WeeklyProgressPage({ onNavigate, onUpdateUser }) {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${GOALS_API_URL}/weekly-summary`);
      setSummary(res.data);
    } catch (err) {
      setMessage('Could not fetch weekly summary data.');
      setMessageType('error');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleManualUpdate = async () => {
    setUpdating(true);
    setMessage("Updating your goals based on last Sunday's weight...");
    setMessageType('info');

    try {
      const res = await axios.post(`${GOALS_API_URL}/manual-update`);
      onUpdateUser(res.data);
      setMessage('🎉 Your goals have been successfully updated!');
      setMessageType('success');
      await fetchSummary();
    } catch (err) {
      setMessage(err.response?.data?.msg || 'An error occurred during the update.');
      setMessageType('error');
    } finally {
      setUpdating(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 p-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col gap-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl text-white">
              <BarChart3 size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Weekly Progress
              </h1>
              <p className="mt-2 text-slate-600">
                Track your performance trends and goal achievement
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 px-4 py-3 text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors font-medium"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>
        </div>
      </motion.div>

      {/* Goal Update Section */}
      <motion.div variants={itemVariants}>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h2 className="flex items-center gap-3 text-xl font-semibold text-slate-800 mb-2">
                <Target className="text-blue-600" size={24} />
                Goal Recalculation
              </h2>
              <p className="text-slate-600 max-w-2xl">
                Update your Maintenance Calories and Protein Goal using your weight from the most
                recent Sunday. This automatically happens every Monday, but you can trigger it
                manually here.
              </p>
            </div>
            <button
              onClick={handleManualUpdate}
              disabled={updating}
              className="flex items-center justify-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold whitespace-nowrap"
            >
              {updating ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
              {updating ? 'Updating...' : 'Update Goals'}
            </button>
          </div>

          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex items-center gap-3 p-4 mt-4 rounded-xl ${
                  messageType === 'success'
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : messageType === 'error'
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                }`}
              >
                {messageType === 'success' ? (
                  <CheckCircle2 size={20} />
                ) : messageType === 'error' ? (
                  <AlertCircle size={20} />
                ) : (
                  <Loader2 size={20} className="animate-spin" />
                )}
                <span className="font-medium">{message}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Weekly Performance Summary */}
      <motion.div variants={itemVariants} className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">Weekly Performance</h2>

        {loading ? (
          <LoadingSpinner fullScreen label="Loading your progress data…" />
        ) : summary.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50">
            <BarChart3 size={48} className="mx-auto mb-4 text-slate-400" />
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No Data Yet</h3>
            <p className="text-slate-600 max-w-md mx-auto">
              Start logging your daily nutrition and workouts to see your weekly progress here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {summary.map((week, index) => (
              <WeeklySummaryCard key={week.weekOf} week={week} index={index} />
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
