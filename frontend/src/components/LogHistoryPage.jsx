// src/components/LogHistoryPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock } from "lucide-react";
import DailyLog from "./DailyLog";
import LoadingSpinner from "./LoadingSpinner";

// Skeletons (shown while exercise name suggestions load)
import {
  LogFormSkeleton,
  HistoryListSkeleton,
} from "./LoadingSkeletons";

const EXERCISE_LIST_URL = `${import.meta.env.VITE_API_URL}/logs/exerciselist`;

export default function LogHistoryPage() {
  const [exerciseLists, setExerciseLists] = useState({
    strengthNames: [],
    cardioNames: [],
  });
  const [listLoading, setListLoading] = useState(true);
  // "today" | "history"
  const [activeView, setActiveView] = useState("today");

  useEffect(() => {
    const fetchExerciseLists = async () => {
      try {
        const res = await axios.get(EXERCISE_LIST_URL);
        setExerciseLists(res.data || { strengthNames: [], cardioNames: [] });
      } catch (err) {
        // Non-fatal; page still works without suggestions
        console.error("Could not fetch exercise lists", err);
      } finally {
        setListLoading(false);
      }
    };
    fetchExerciseLists();
  }, []);

  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
  };

  const renderSkeletonForView = () =>
    activeView === "today" ? <LogFormSkeleton /> : <HistoryListSkeleton />;

  const renderDailyLogForView = () =>
    activeView === "today" ? (
      <DailyLog
        key="today-view"
        strengthNameSuggestions={exerciseLists.strengthNames}
        cardioNameSuggestions={exerciseLists.cardioNames}
        showForm={true}
        showHistory={false}
      />
    ) : (
      <DailyLog
        key="history-view"
        strengthNameSuggestions={exerciseLists.strengthNames}
        cardioNameSuggestions={exerciseLists.cardioNames}
        showForm={false}
        showHistory={true}
      />
    );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header + Toggle */}
      <motion.div variants={itemVariants} className="flex flex-col gap-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Daily Log History
            </h1>
            <div className="mt-2 flex items-center gap-3 text-slate-600">
              <span>Add a new entry for today or review your past progress.</span>
              {listLoading && (
                <LoadingSpinner inline size="sm" label="Loading suggestions…" />
              )}
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setActiveView("today")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeView === "today"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock size={16} />
                Today’s Log
              </div>
            </button>
            <button
              onClick={() => setActiveView("history")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeView === "history"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                History
              </div>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main Content (toggle-controlled) */}
      <motion.div variants={itemVariants}>
        <AnimatePresence mode="wait">
          <motion.div
            key={listLoading ? `skeleton-${activeView}` : activeView}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {listLoading ? renderSkeletonForView() : renderDailyLogForView()}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
