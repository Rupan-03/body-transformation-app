// components/DailyLogForm.jsx
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  PlusCircle,
  Dumbbell,
  Zap,
  Utensils,
  Weight,
  Save,
  AlertCircle,
  Trash2,
  X,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import AutocompleteInput from "./AutocompleteInput";

/* Animations */
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

/* ───────────────────────── Modern Date Picker (No deps) ─────────────────── */
function pad(n) {
  return String(n).padStart(2, "0");
}
function formatYmd(d) {
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  return `${y}-${m}-${day}`;
}
function parseYmd(ymd) {
  if (!ymd) return null;
  const [y, m, d] = ymd.split("-").map((x) => parseInt(x, 10));
  if (!y || !m || !d) return null;
  const dt = new Date(y, m - 1, d);
  dt.setHours(0, 0, 0, 0);
  return dt;
}
function startOfMonth(d) {
  const dt = new Date(d.getFullYear(), d.getMonth(), 1);
  dt.setHours(0, 0, 0, 0);
  return dt;
}
function endOfMonth(d) {
  const dt = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  dt.setHours(0, 0, 0, 0);
  return dt;
}
function addMonths(d, n) {
  const dt = new Date(d);
  dt.setMonth(dt.getMonth() + n);
  return dt;
}
function isSameDay(a, b) {
  return (
    a &&
    b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function getMonthMatrix(d) {
  const first = startOfMonth(d);
  const startWeekday = (first.getDay() + 7) % 7; // 0=Sun
  const start = new Date(first);
  start.setDate(first.getDate() - startWeekday);

  const cells = [];
  for (let i = 0; i < 42; i++) {
    const cell = new Date(start);
    cell.setDate(start.getDate() + i);
    cell.setHours(0, 0, 0, 0);
    cells.push(cell);
  }
  return cells;
}

const ModernDatePicker = ({
  value, // "YYYY-MM-DD"
  onChange,
  max, // "YYYY-MM-DD" (today)
  label = "Choose a date (past only)",
}) => {
  const [open, setOpen] = useState(false);
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const maxDate = useMemo(() => parseYmd(max) || today, [max, today]);
  const selectedDate = useMemo(() => parseYmd(value), [value]);

  const [viewDate, setViewDate] = useState(() => selectedDate || today);

  useEffect(() => {
    if (selectedDate) setViewDate(selectedDate);
  }, [selectedDate]);

  const monthCells = useMemo(() => getMonthMatrix(viewDate), [viewDate]);

  const monthLabel = useMemo(
    () =>
      viewDate.toLocaleString(undefined, {
        month: "long",
        year: "numeric",
      }),
    [viewDate]
  );

  const dayNames = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(undefined, { weekday: "short" });
    const base = new Date(2025, 0, 5); // Sunday
    return [...Array(7)].map((_, i) =>
      formatter.format(new Date(base.getFullYear(), base.getMonth(), base.getDate() + i))
    );
  }, []);

  const handleSelect = (d) => {
    if (d.getTime() > maxDate.getTime()) return;
    onChange(formatYmd(d));
    setOpen(false);
  };

  const nextMonth = useMemo(() => addMonths(viewDate, 1), [viewDate]);

  return (
    <div className="relative">
      <label htmlFor="log-date" className="block text-sm font-medium text-slate-700 mb-2">
        {label}
      </label>

      {/* Display field */}
      <button
        id="log-date"
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between rounded-xl border border-slate-300 bg-white/80 backdrop-blur px-4 py-2.5 text-sm shadow-sm hover:shadow transition-all focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="text-slate-800">
          {selectedDate ? formatYmd(selectedDate) : formatYmd(today)}
        </span>
        <Calendar size={18} className="text-slate-500" />
      </button>

      {/* Popover */}
      {open && (
        <div
          role="dialog"
          aria-label="Calendar"
          className="absolute z-50 mt-2 w-[20rem] rounded-2xl border border-slate-200 bg-white/90 backdrop-blur shadow-xl p-3"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-2 py-1">
            <button
              type="button"
              onClick={() => setViewDate((d) => addMonths(d, -1))}
              className="p-2 rounded-lg hover:bg-slate-100 active:scale-95 transition"
              aria-label="Previous month"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="font-semibold text-slate-800">{monthLabel}</div>
            <button
              type="button"
              onClick={() => setViewDate((d) => addMonths(d, 1))}
              className="p-2 rounded-lg hover:bg-slate-100 active:scale-95 transition disabled:opacity-30"
              aria-label="Next month"
              /* ✅ FIX: Only disable if the FIRST day of next month is after maxDate */
              disabled={startOfMonth(nextMonth).getTime() > maxDate.getTime()}
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 px-1 pt-2 pb-1 text-xs font-medium text-slate-500">
            {dayNames.map((d) => (
              <div key={d} className="text-center">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1 p-1">
            {monthCells.map((d, idx) => {
              const inThisMonth = d.getMonth() === viewDate.getMonth();
              const isToday = isSameDay(d, today);
              const isSelected = selectedDate && isSameDay(d, selectedDate);
              const disabled = d.getTime() > maxDate.getTime();

              return (
                <button
                  key={`${d.toISOString()}-${idx}`}
                  type="button"
                  onClick={() => handleSelect(d)}
                  disabled={disabled}
                  className={[
                    "h-9 rounded-xl text-sm transition-all focus:outline-none",
                    "flex items-center justify-center",
                    inThisMonth ? "text-slate-700" : "text-slate-400",
                    disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-slate-100 active:scale-95",
                    isSelected ? "bg-violet-600 text-white hover:bg-violet-600" : "",
                    !isSelected && isToday ? "ring-1 ring-violet-400" : "",
                  ].join(" ")}
                  aria-current={isToday ? "date" : undefined}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-2 px-2">
            <button
              type="button"
              onClick={() => {
                onChange(formatYmd(today));
                setViewDate(today);
                setOpen(false);
              }}
              className="text-sm text-violet-600 hover:text-violet-700"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
/* ───────────────────────────── End Date Picker ──────────────────────────── */

/* --------------------------- Nutrition Section --------------------------- */
const NutritionSection = ({ formData, onNutritionChange }) => (
  <motion.section
    variants={itemVariants}
    initial="visible"
    animate="visible"
    className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm"
  >
    <h3 className="flex items-center gap-3 text-lg font-semibold text-slate-800 mb-4">
      <span className="p-2 bg-blue-100 rounded-lg text-blue-600">
        <Utensils size={20} />
      </span>
      Nutrition Tracking
    </h3>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {["breakfast", "lunch", "dinner"].map((meal) => (
        <div
          key={meal}
          className="border border-slate-200 rounded-xl p-4 bg-slate-50/50"
        >
          <h4 className="font-semibold capitalize mb-3 text-slate-700 text-sm uppercase tracking-wide">
            {meal}
          </h4>

          <div className="space-y-3">
            {["calories", "protein", "fat", "carbs"].map((field) => (
              <div key={field}>
                <label
                  htmlFor={`${meal}-${field}`}
                  className="block text-xs font-medium text-slate-600 mb-1 capitalize"
                >
                  {field}
                </label>
                <input
                  id={`${meal}-${field}`}
                  inputMode="numeric"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  value={formData.nutrition[meal][field]}
                  onChange={(e) =>
                    onNutritionChange(meal, field, e.target.value)
                  }
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </motion.section>
);

/* ---------------------------- Exercise Set Row --------------------------- */
const ExerciseSet = ({
  set,
  setIndex,
  onSetChange,
  onRemoveSet,
  exerciseIndex,
}) => (
  <div className="flex gap-2 items-center">
    <input
      type="number"
      inputMode="numeric"
      min="0"
      step="1"
      placeholder="Reps"
      value={set.reps}
      onChange={(e) =>
        onSetChange(exerciseIndex, setIndex, "reps", e.target.value)
      }
      className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      aria-label="Reps"
    />
    <input
      type="number"
      inputMode="decimal"
      min="0"
      step="0.5"
      placeholder="Weight"
      value={set.weight}
      onChange={(e) =>
        onSetChange(exerciseIndex, setIndex, "weight", e.target.value)
      }
      className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      aria-label="Weight"
    />
    <button
      type="button"
      onClick={() => onRemoveSet(exerciseIndex, setIndex)}
      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
      aria-label="Remove set"
      title="Remove set"
    >
      <X size={16} />
    </button>
  </div>
);

/* ---------------------------- Strength Exercise -------------------------- */
const StrengthExercise = ({
  exercise,
  index,
  onExerciseChange,
  onRemoveExercise,
  onAddSet,
  onSetChange,
  onRemoveSet,
  exerciseSuggestions,
}) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-white border border-slate-200 rounded-xl p-4 space-y-4"
  >
    <div className="flex gap-3 items-start">
      <div className="flex-1">
        <AutocompleteInput
          value={exercise.name}
          onChange={(val) => onExerciseChange(index, "name", val)}
          suggestions={exerciseSuggestions}
          placeholder="Exercise name (e.g., Bench Press)"
        />
      </div>
      <button
        type="button"
        onClick={() => onRemoveExercise(index)}
        className="p-2 text-slate-400 hover:text-red-500 transition-colors mt-1"
        aria-label="Remove exercise"
        title="Remove exercise"
      >
        <Trash2 size={18} />
      </button>
    </div>

    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">Sets</span>
        <button
          type="button"
          onClick={() => onAddSet(index)}
          className="flex items-center gap-1 text-blue-600 text-sm hover:text-blue-700 transition-colors"
        >
          <PlusCircle size={16} />
          Add Set
        </button>
      </div>

      <div className="space-y-2">
        {(exercise.sets || []).map((set, setIndex) => (
          <ExerciseSet
            key={setIndex}
            set={set}
            setIndex={setIndex}
            onSetChange={onSetChange}
            onRemoveSet={onRemoveSet}
            exerciseIndex={index}
          />
        ))}
      </div>
    </div>
  </motion.div>
);

/* ------------------------------- Main Form -------------------------------- */
const DailyLogForm = ({
  formData,
  setFormData,
  error,
  onSubmit,
  onNutritionChange,
  onStrengthChange,
  onSetChange,
  onCardioChange,
  addExercise,
  removeExercise,
  addSet,
  removeSet,
  addCardio,
  removeCardio,
  exerciseSuggestions,
  cardioSuggestions,
  workoutSplitSuggestions,
}) => {
  // Local YYYY-MM-DD for defaulting and max constraint
  const todayLocal = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }, []);

  // Default date to today on mount if absent
  useEffect(() => {
    if (!formData?.date) {
      setFormData({ ...(formData || {}), date: todayLocal });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setFormData, todayLocal]);

  return (
    <motion.form
      variants={itemVariants}
      initial="visible"
      animate="visible"
      onSubmit={onSubmit}
      className="space-y-8"
    >
      {/* ── Modern Date Picker ─────────────────────────────────────────────── */}
      <motion.section
        variants={itemVariants}
        initial="visible"
        animate="visible"
        className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm"
      >
        <h3 className="flex items-center gap-3 text-lg font-semibold text-slate-800 mb-4">
          <span className="p-2 bg-violet-100 rounded-lg text-violet-600">
            <Calendar size={20} />
          </span>
          Log Date
        </h3>

        <div className="max-w-xs">
          <ModernDatePicker
            value={formData?.date || todayLocal}
            onChange={(newYmd) => setFormData({ ...formData, date: newYmd })}
            max={todayLocal}
            label="Choose a date (past only)"
          />
          <p className="mt-2 text-xs text-slate-500">
            You can backfill a previous day. Future dates are disabled.
          </p>
        </div>
      </motion.section>

      {/* Weight */}
      <motion.section
        variants={itemVariants}
        initial="visible"
        animate="visible"
        className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm"
      >
        <h3 className="flex items-center gap-3 text-lg font-semibold text-slate-800 mb-4">
          <span className="p-2 bg-blue-100 rounded-lg text-blue-600">
            <Weight size={20} />
          </span>
          Daily Weight
        </h3>
        <div className="max-w-xs">
          <label htmlFor="weight-input" className="sr-only">
            Weight in kg
          </label>
          <input
            id="weight-input"
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            placeholder="Enter weight in kg"
            value={formData.weight}
            onChange={(e) =>
              setFormData({ ...formData, weight: e.target.value })
            }
            className="w-full border border-slate-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </motion.section>

      {/* Nutrition */}
      <NutritionSection
        formData={formData}
        onNutritionChange={onNutritionChange}
      />

      {/* Workout */}
      <motion.section
        variants={itemVariants}
        initial="visible"
        animate="visible"
        className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm"
      >
        <h3 className="flex items-center gap-3 text-lg font-semibold text-slate-800 mb-6">
          <span className="p-2 bg-orange-100 rounded-lg text-orange-600">
            <Dumbbell size={20} />
          </span>
          Workout Session
        </h3>

        <div className="space-y-6">
          {/* Split */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Workout Split
            </label>
            <AutocompleteInput
              value={formData.workoutSplit}
              onChange={(val) =>
                setFormData({ ...formData, workoutSplit: val })
              }
              suggestions={workoutSplitSuggestions}
              placeholder="e.g., Push Day, Pull Day, Leg Day"
            />
          </div>

          {/* Strength exercises */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">
                Exercises
              </span>
              <button
                type="button"
                onClick={addExercise}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <PlusCircle size={16} />
                Add Exercise
              </button>
            </div>

            <div className="space-y-4">
              {formData.strengthExercises.map((exercise, index) => (
                <StrengthExercise
                  key={index}
                  exercise={exercise}
                  index={index}
                  onExerciseChange={onStrengthChange}
                  onRemoveExercise={removeExercise}
                  onAddSet={addSet}
                  onSetChange={onSetChange}
                  onRemoveSet={removeSet}
                  exerciseSuggestions={exerciseSuggestions}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Cardio */}
      <motion.section
        variants={itemVariants}
        initial="visible"
        animate="visible"
        className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm"
      >
        <h3 className="flex items-center gap-3 text-lg font-semibold text-slate-800 mb-6">
          <span className="p-2 bg-green-100 rounded-lg text-green-600">
            <Zap size={20} />
          </span>
          Cardio Session
        </h3>

        <div className="space-y-4">
          {formData.cardioExercises.map((cardio, index) => (
            <motion.div
              key={index}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col sm:flex-row gap-3 items-end p-4 bg-slate-50 rounded-xl border border-slate-200"
            >
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Type
                </label>
                <AutocompleteInput
                  value={cardio.type}
                  onChange={(val) => onCardioChange(index, "type", val)}
                  suggestions={cardioSuggestions}
                  placeholder="e.g., Running, Cycling"
                />
              </div>

              <div className="w-32">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Duration (min)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1"
                  placeholder="0"
                  value={cardio.duration}
                  onChange={(e) =>
                    onCardioChange(index, "duration", e.target.value)
                  }
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="w-32">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Distance (km)
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.1"
                  placeholder="0.0"
                  value={cardio.distance}
                  onChange={(e) =>
                    onCardioChange(index, "distance", e.target.value)
                  }
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                type="button"
                onClick={() => removeCardio(index)}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                aria-label="Remove cardio session"
                title="Remove cardio session"
              >
                <Trash2 size={18} />
              </button>
            </motion.div>
          ))}

          <button
            type="button"
            onClick={addCardio}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <PlusCircle size={16} />
            Add Cardio Session
          </button>
        </div>
      </motion.section>

      {/* Submit */}
      <motion.div
        variants={itemVariants}
        initial="visible"
        animate="visible"
        className="flex justify-end"
      >
        <button
          type="submit"
          className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold"
        >
          <Save size={20} />
          Save Daily Log
        </button>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700"
        >
          <AlertCircle size={20} />
          <span className="font-medium">{error}</span>
        </motion.div>
      )}
    </motion.form>
  );
};

export default DailyLogForm;
