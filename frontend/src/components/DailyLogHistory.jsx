// components/DailyLogHistory.jsx
import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  ChevronDown,
  Weight,
  Utensils,
  Dumbbell,
  Zap,
  Edit,
  Trash2,
} from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";

/* ------------------------------- Utilities ------------------------------- */
const fmtDate = (d) =>
  new Date(d).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

const ymd = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, "0");
  const dd = String(x.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
};

/* ------------------------------- Animations ------------------------------ */
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

/* --------------------------------- Cards --------------------------------- */
const StatCard = ({ label, value, icon: Icon }) => (
  <div className="flex items-center gap-4 bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm">
    <div className="p-2.5 rounded-xl bg-slate-50 text-slate-700">
      <Icon size={20} />
    </div>
    <div>
      <div className="text-slate-500 text-sm">{label}</div>
      <div className="text-xl font-semibold text-slate-900">{value}</div>
    </div>
  </div>
);

/* --------------------------------- Items --------------------------------- */
const LogItem = ({ log, onEdit, onDelete }) => {
  const weight = log.weight;
  const meals = log.nutrition || {};
  const sessions = Array.isArray(log.sessions) ? log.sessions : [];

  const workout = sessions.find((s) => s.type === "workout");
  const cardio = sessions.filter((s) => s.type === "cardio");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-700">
          <Calendar size={18} />
          <span className="font-semibold">{fmtDate(log.date || Date.now())}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(log)}
            className="px-3 py-1.5 text-sm rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1"
          >
            <Edit size={16} />
            Edit
          </button>
          <button
            onClick={() => onDelete(log._id)}
            className="px-3 py-1.5 text-sm rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors flex items-center gap-1"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-4">
        {/* Weight */}
        {typeof weight !== "undefined" && weight !== "" && (
          <div className="flex items-center gap-2 text-slate-700">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Weight size={16} />
            </span>
            <span className="font-medium">Weight:</span>
            <span>{weight} kg</span>
          </div>
        )}

        {/* Nutrition */}
        {(meals.breakfast || meals.lunch || meals.dinner) && (
          <div>
            <div className="flex items-center gap-2 mb-2 text-slate-700">
              <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                <Utensils size={16} />
              </span>
              <span className="font-medium">Nutrition</span>
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              {["breakfast", "lunch", "dinner"].map((m) => {
                const meal = meals[m];
                if (!meal) return null;
                return (
                  <div
                    key={m}
                    className="rounded-lg border border-slate-200 p-3 bg-slate-50"
                  >
                    <div className="text-xs uppercase tracking-wide text-slate-600 mb-1">
                      {m}
                    </div>
                    <div className="text-sm text-slate-700">
                      <span className="font-medium">{meal.calories ?? 0}</span>{" "}
                      cal • P {meal.protein ?? 0} • C {meal.carbs ?? 0} • F{" "}
                      {meal.fat ?? 0}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Workout */}
        {workout && (
          <div>
            <div className="flex items-center gap-2 mb-2 text-slate-700">
              <span className="p-1.5 rounded-lg bg-orange-50 text-orange-600">
                <Dumbbell size={16} />
              </span>
              <span className="font-medium">
                {workout.name || "Workout Session"}
              </span>
            </div>
            <div className="space-y-2">
              {(workout.exercises || []).map((ex, i) => (
                <div key={i} className="text-sm text-slate-700">
                  <span className="font-medium">{ex.name}</span>
                  {Array.isArray(ex.sets) && ex.sets.length > 0 && (
                    <span className="text-slate-500 ml-2">
                      {ex.sets
                        .map(
                          (s) =>
                            `${s.reps ?? 0}x${
                              typeof s.weight === "number"
                                ? s.weight
                                : s.weight ?? 0
                            }`
                        )
                        .join(", ")}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cardio */}
        {cardio.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2 text-slate-700">
              <span className="p-1.5 rounded-lg bg-green-50 text-green-600">
                <Zap size={16} />
              </span>
              <span className="font-medium">Cardio</span>
            </div>
            <div className="grid gap-2">
              {cardio.map((c, i) => (
                <div key={i} className="text-sm text-slate-700">
                  <span className="font-medium">{c.name || "Cardio"}</span>
                  <span className="text-slate-500 ml-2">
                    {c.durationMinutes ?? 0} min
                    {typeof c.distanceKm !== "undefined" && c.distanceKm !== "" && (
                      <> • {c.distanceKm} km</>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

/* ---------------------------- Week Accordion ----------------------------- */
const WeekGroup = ({
  weekKey,
  weekLogs,
  index,
  formatWeekHeader,
  activeWeekKey,
  setActiveWeekKey,
  onEdit,
  onDelete,
}) => {
  const open = activeWeekKey === weekKey;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/60 overflow-hidden">
      <button
        type="button"
        onClick={() => setActiveWeekKey(open ? null : weekKey)}
        className="w-full flex items-center justify-between px-4 sm:px-5 py-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
            <Calendar size={18} />
          </div>
          <div className="text-left">
            <div className="text-sm text-slate-500">Log History</div>
            <div className="text-base sm:text-lg font-semibold text-slate-900">
              {formatWeekHeader(weekKey, index)}
            </div>
          </div>
        </div>
        <ChevronDown
          size={18}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 sm:px-5 pb-5"
          >
            <div className="grid gap-4">
              {weekLogs.map((log) => (
                <LogItem
                  key={log._id}
                  log={log}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ------------------------------ Main Component --------------------------- */
const DailyLogHistory = ({
  loading = false,
  grouped = [],
  activeWeekKey,
  setActiveWeekKey,
  formatWeekHeader,
  onEdit,
  onDelete,
}) => {
  /* ------------------------------- Top Stats ------------------------------ */
  const { currentStreak, monthlyCount, lastEntry } = useMemo(() => {
    const all = grouped.flatMap(([, arr]) => arr) || [];
    if (all.length === 0)
      return { currentStreak: 0, monthlyCount: 0, lastEntry: null };

    const dates = all
      .map((l) => new Date(l.date || Date.now()))
      .sort((a, b) => b - a);

    const latest = dates[0];

    // streak
    const set = new Set(dates.map(ymd));
    let cur = ymd(new Date());
    let cnt = 0;
    // If there's no log for today, start from yesterday
    if (!set.has(cur)) {
      const t = new Date();
      t.setDate(t.getDate() - 1);
      cur = ymd(t);
    }
    while (set.has(cur)) {
      cnt += 1;
      const d = new Date(cur);
      d.setDate(d.getDate() - 1);
      cur = ymd(d);
    }

    // monthly count
    const now = new Date();
    const m = now.getMonth();
    const y = now.getFullYear();
    const monthly = all.filter((l) => {
      const d = new Date(l.date || Date.now());
      return d.getMonth() === m && d.getFullYear() === y;
    }).length;

    return {
      currentStreak: cnt,
      monthlyCount: monthly,
      lastEntry: latest,
    };
  }, [grouped]);

  /* -------------------------------- Render ------------------------------- */
  return (
    <motion.section
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Top summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Current Streak" value={`${currentStreak} days`} icon={Calendar} />
        <StatCard label="Monthly Logs" value={`${monthlyCount} entries`} icon={Calendar} />
        <StatCard
          label="Last Entry"
          value={
            lastEntry
              ? (() => {
                  const todayYmd = ymd(new Date());
                  const yest = new Date();
                  yest.setDate(yest.getDate() - 1);
                  const yestYmd = ymd(yest);
                  const lastYmd = ymd(lastEntry);
                  if (lastYmd === todayYmd) return "Today";
                  if (lastYmd === yestYmd) return "Yesterday";
                  return fmtDate(lastEntry);
                })()
              : "—"
          }
          icon={Calendar}
        />
      </div>

      {/* History list */}
      {loading ? (
        <LoadingSpinner fullScreen label="Fetching your history…" />
      ) : grouped.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-300 rounded-2xl bg-slate-50">
          <div className="text-2xl font-semibold text-slate-800 mb-2">
            Log History
          </div>
          <p className="text-slate-600">
            You don’t have any entries yet. Start by filling out today’s log!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(([weekKey, weekLogs], index) => (
            <WeekGroup
              key={weekKey}
              weekKey={weekKey}
              weekLogs={weekLogs}
              index={index}
              formatWeekHeader={formatWeekHeader}
              activeWeekKey={activeWeekKey}
              setActiveWeekKey={setActiveWeekKey}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </motion.section>
  );
};

export default DailyLogHistory;
