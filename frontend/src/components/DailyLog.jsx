// ===========================================================
// 🧭 SECTION: Imports & Initialization
// ===========================================================

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  PlusCircle,
  Calendar,
  ChevronDown,
  Trash2,
  Edit,
  Dumbbell,
  Zap,
  Utensils,
  AlertCircle,
} from "lucide-react";
import AutocompleteInput from "./AutocompleteInput";

// ===========================================================
// 🧮 SECTION: Constants & Helpers
// ===========================================================

const LOGS_API_URL = `${import.meta.env.VITE_API_URL}/logs`;

// Get start of week for grouping
const getStartOfWeek = (date) => {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay()); // start Sunday
  d.setHours(0, 0, 0, 0);
  return d;
};

// Group logs by week
const groupLogsByWeek = (logs) => {
  const grouped = logs.reduce((acc, log) => {
    const weekStart = getStartOfWeek(log.date || log.dateString || new Date());
    const key = weekStart.toISOString();
    if (!acc[key]) acc[key] = [];
    acc[key].push(log);
    return acc;
  }, {});
  return Object.entries(grouped).sort((a, b) => new Date(b[0]) - new Date(a[0]));
};

// Format week header for display
const formatWeekHeader = (weekKey, index) => {
  const today = new Date();
  const currWeek = getStartOfWeek(today).toISOString();
  if (weekKey === currWeek) return "This Week";
  if (index === 1) return "Last Week";
  const d = new Date(weekKey);
  return `Week of ${d.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
  })}`;
};

// ===========================================================
// 🧩 SECTION: Initial States
// ===========================================================

const initialFormData = {
  weight: "",
  nutrition: {
    breakfast: { calories: "", protein: "", fat: "", carbs: "" },
    lunch: { calories: "", protein: "", fat: "", carbs: "" },
    dinner: { calories: "", protein: "", fat: "", carbs: "" },
  },
  workoutSplit: "",
  strengthExercises: [], // { name, sets: [{reps, weight}] }
  cardioExercises: [], // { type, duration, distance }
};

// ===========================================================
// ⚙️ SECTION: Component Start
// ===========================================================

export default function DailyLog() {
  // -------------------- Basic State --------------------
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState("");
  const [activeWeekKey, setActiveWeekKey] = useState(null);

  // -------------------- Edit Modal --------------------
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [logToEdit, setLogToEdit] = useState(null);
  const [editFormData, setEditFormData] = useState(initialFormData);
  const [editError, setEditError] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // -------------------- Delete Modal --------------------
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [logToDelete, setLogToDelete] = useState(null);

  // -------------------- Suggestions --------------------
  const [exerciseSuggestions, setExerciseSuggestions] = useState([]);
  const [cardioSuggestions, setCardioSuggestions] = useState([]);
  const [workoutSplitSuggestions, setWorkoutSplitSuggestions] = useState([]);

  // ===========================================================
// ⚙️ SECTION: Suggestion Logic & Fetching
// ===========================================================

// 🧩 Extract unique suggestions (exercises, cardio types, workout splits)
const refreshSuggestions = (logsData) => {
  const exSet = new Set();
  const cardioSet = new Set();
  const splitSet = new Set();

  (logsData || []).forEach((log) => {
    // From sessions array
    (log.sessions || []).forEach((s) => {
      if (!s) return;
      if (s.type === "workout") {
        if (s.name) splitSet.add(String(s.name).trim());
        (s.exercises || []).forEach((ex) => {
          if (ex?.name) exSet.add(String(ex.name).trim());
        });
      }
      if (s.type === "cardio" && s.name)
        cardioSet.add(String(s.name).trim());
    });

    // From old strength/cardio arrays
    if (Array.isArray(log.strengthExercises)) {
      log.strengthExercises.forEach(
        (ex) => ex?.name && exSet.add(ex.name.trim())
      );
    }
    if (Array.isArray(log.cardioExercises)) {
      log.cardioExercises.forEach(
        (c) => c?.type && cardioSet.add(c.type.trim())
      );
    }

    // From top-level split
    if (log.workoutSplit) splitSet.add(String(log.workoutSplit).trim());
  });

  setExerciseSuggestions([...exSet]);
  setCardioSuggestions([...cardioSet]);
  setWorkoutSplitSuggestions([...splitSet]);
};

// ===========================================================
// 🔄 SECTION: Fetch & Refresh Logs
// ===========================================================

useEffect(() => {
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(LOGS_API_URL);
      const data = Array.isArray(res.data) ? res.data : [];
      setLogs(data);
      refreshSuggestions(data);
      const grouped = groupLogsByWeek(data);
      if (grouped.length > 0) setActiveWeekKey(grouped[0][0]);
    } catch (err) {
      console.error(err);
      setError("Could not fetch logs.");
    } finally {
      setLoading(false);
    }
  };
  fetchLogs();
}, []);

// Refresh after Add/Edit/Delete
const refreshLogsAfterChange = async () => {
  try {
    const res = await axios.get(LOGS_API_URL);
    const updated = Array.isArray(res.data) ? res.data : [];
    setLogs(updated);
    refreshSuggestions(updated);
  } catch (err) {
    console.error("Failed to refresh logs:", err);
  }
};

// ===========================================================
// 🧠 SECTION: Data Utilities
// ===========================================================

// Build sessions payload from UI (workout + cardio)
const buildSessionsFromUI = ({
  strengthExercises,
  cardioExercises,
  workoutSplit,
}) => {
  const sessions = [];

  if (Array.isArray(strengthExercises) && strengthExercises.length > 0) {
    sessions.push({
      type: "workout",
      name: workoutSplit || "Strength Training",
      exercises: strengthExercises.map((ex) => ({
        name: ex.name || "",
        sets: (ex.sets || []).map((s) => ({
          reps: Number(s.reps) || 0,
          weight: Number(s.weight) || 0,
        })),
      })),
    });
  }

  if (Array.isArray(cardioExercises) && cardioExercises.length > 0) {
    cardioExercises.forEach((c) => {
      sessions.push({
        type: "cardio",
        name: c.type || "Cardio",
        durationMinutes: c.duration ? Number(c.duration) : undefined,
        distanceKm: c.distance ? Number(c.distance) : undefined,
      });
    });
  }

  return sessions;
};

// ===========================================================
// 🧱 SECTION: Form Helper Builders
// ===========================================================

// Builds partial payload (only filled fields)
const buildPartialPayloadFromForm = (fd) => {
  const payload = {};

  if (fd.weight !== "" && fd.weight !== null) {
    payload.weight = Number(fd.weight);
  }

  // Nutrition
  const nutritionPayload = {};
  ["breakfast", "lunch", "dinner"].forEach((meal) => {
    const m = fd.nutrition?.[meal];
    if (!m) return;
    const hasValue = ["calories", "protein", "fat", "carbs"].some(
      (k) => m[k] !== "" && m[k] !== null && typeof m[k] !== "undefined"
    );
    if (hasValue) {
      nutritionPayload[meal] = {
        calories: m.calories ? Number(m.calories) : 0,
        protein: m.protein ? Number(m.protein) : 0,
        fat: m.fat ? Number(m.fat) : 0,
        carbs: m.carbs ? Number(m.carbs) : 0,
      };
    }
  });
  if (Object.keys(nutritionPayload).length > 0) {
    payload.nutrition = nutritionPayload;
  }

  // Sessions
  const sessions = buildSessionsFromUI({
    strengthExercises: fd.strengthExercises || [],
    cardioExercises: fd.cardioExercises || [],
    workoutSplit: fd.workoutSplit || "",
  });
  if (sessions.length > 0) payload.sessions = sessions;

  return payload;
};

// Clear submitted fields so form remains partially filled
const clearSubmittedFields = (fd, submittedPayload) => {
  const next = { ...fd };
  if ("weight" in submittedPayload) next.weight = "";
  if (submittedPayload.nutrition) {
    for (const meal of Object.keys(submittedPayload.nutrition)) {
      next.nutrition[meal] = {
        calories: "",
        protein: "",
        fat: "",
        carbs: "",
      };
    }
  }
  if ("sessions" in submittedPayload) {
    next.strengthExercises = [];
    next.cardioExercises = [];
    next.workoutSplit = "";
  }
  return next;
};

// ===========================================================
// ✍️ SECTION: Form Handlers (Add / Edit / Delete)
// ===========================================================

// -------------------- Nutrition Change --------------------
const handleNutritionChange = (meal, field, value) => {
  setFormData((prev) => ({
    ...prev,
    nutrition: {
      ...prev.nutrition,
      [meal]: { ...prev.nutrition[meal], [field]: value },
    },
  }));
};

// -------------------- Strength (Workout) Handlers --------------------
const addExercise = () => {
  setFormData((prev) => ({
    ...prev,
    strengthExercises: [
      ...prev.strengthExercises,
      { name: "", sets: [{ reps: "", weight: "" }] },
    ],
  }));
};

const removeExercise = (exIndex) => {
  setFormData((prev) => ({
    ...prev,
    strengthExercises: prev.strengthExercises.filter((_, i) => i !== exIndex),
  }));
};

const handleStrengthChange = (exIndex, field, value) => {
  setFormData((prev) => {
    const updated = [...prev.strengthExercises];
    updated[exIndex] = { ...updated[exIndex], [field]: value };
    return { ...prev, strengthExercises: updated };
  });
};

// 🧱 Add a new set (fixed double-add issue)
const addSet = (exIndex) => {
  setFormData((prev) => {
    const updated = prev.strengthExercises.map((ex, i) =>
      i === exIndex
        ? { ...ex, sets: [...(ex.sets || []), { reps: '', weight: '' }] }
        : ex
    );

    return { ...prev, strengthExercises: updated };
  });
};

// ❌ Remove a set safely
const removeSet = (exIndex, setIndex) => {
  setFormData((prev) => {
    const updated = prev.strengthExercises.map((ex, i) =>
      i === exIndex
        ? { ...ex, sets: ex.sets.filter((_, j) => j !== setIndex) }
        : ex
    );

    return { ...prev, strengthExercises: updated };
  });
};


const handleSetChange = (exIndex, setIndex, field, value) => {
  setFormData((prev) => {
    const updated = [...prev.strengthExercises];
    updated[exIndex].sets[setIndex] = {
      ...updated[exIndex].sets[setIndex],
      [field]: value,
    };
    return { ...prev, strengthExercises: updated };
  });
};

// -------------------- Cardio Handlers --------------------
const addCardio = () =>
  setFormData((prev) => ({
    ...prev,
    cardioExercises: [
      ...prev.cardioExercises,
      { type: "", duration: "", distance: "" },
    ],
  }));

const removeCardio = (index) =>
  setFormData((prev) => ({
    ...prev,
    cardioExercises: prev.cardioExercises.filter((_, i) => i !== index),
  }));

const handleCardioChange = (index, field, value) => {
  setFormData((prev) => {
    const updated = [...prev.cardioExercises];
    updated[index] = { ...updated[index], [field]: value };
    return { ...prev, cardioExercises: updated };
  });
};

// ===========================================================
// 🧾 SECTION: Form Submission - Add New Log
// ===========================================================
const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  const payload = buildPartialPayloadFromForm(formData);
  if (Object.keys(payload).length === 0) {
    setError("Please enter at least one field to save.");
    return;
  }

  try {
    await axios.post(LOGS_API_URL, payload);
    await refreshLogsAfterChange(); // ✅ Refresh logs and suggestions
    setFormData((prev) => clearSubmittedFields(prev, payload));
  } catch (err) {
    console.error("Error saving log:", err);
    setError(err.response?.data?.msg || "Could not save log entry.");
  }
};

// ===========================================================
// 🧱 SECTION: Edit Handlers
// ===========================================================

// ===========================================================
// ✏️ SECTION: Edit Modal Logic (Open, Handlers, Submit)
// ===========================================================

// 🧩 Open edit modal and populate all fields (nutrition, workout, cardio)
const openEditModal = (log) => {
  // Normalize structure for consistency
  const norm = {
    ...log,
    sessions: Array.isArray(log.sessions) ? log.sessions : [],
  };

  let workoutSplit = log.workoutSplit || "";
  let strengthExercises = log.strengthExercises || [];
  let cardioExercises = log.cardioExercises || [];

  // ✅ Extract sessions if they exist (backend often stores here)
  if (norm.sessions.length > 0) {
    const workouts = norm.sessions.filter((s) => s.type === "workout");
    const cardios = norm.sessions.filter((s) => s.type === "cardio");

    if (workouts.length > 0) {
      workoutSplit = workouts[0].name || workoutSplit;
      strengthExercises = workouts.flatMap((w) =>
        (w.exercises || []).map((ex) => ({
          name: ex.name || "",
          sets: Array.isArray(ex.sets)
            ? ex.sets.map((set) => ({
                reps: set.reps ?? "",
                weight: set.weight ?? "",
              }))
            : [],
        }))
      );
    }

    if (cardios.length > 0) {
      cardioExercises = cardios.map((c) => ({
        type: c.name || c.type || "",
        duration: c.durationMinutes ?? c.duration ?? "",
        distance: c.distanceKm ?? c.distance ?? "",
      }));
    }
  }

  setLogToEdit(log);
  setEditFormData({
    weight: log.weight || "",
    nutrition: log.nutrition || initialFormData.nutrition,
    workoutSplit,
    strengthExercises,
    cardioExercises,
  });
  setEditError("");
  setIsEditModalOpen(true);
};

// 🧠 Nutrition input change
const handleEditNutritionChange = (meal, field, value) => {
  setEditFormData((prev) => ({
    ...prev,
    nutrition: {
      ...prev.nutrition,
      [meal]: { ...prev.nutrition[meal], [field]: value },
    },
  }));
};

// 🏋️‍♂️ Workout (strength) management
const addEditExercise = () =>
  setEditFormData((prev) => ({
    ...prev,
    strengthExercises: [
      ...prev.strengthExercises,
      { name: "", sets: [{ reps: "", weight: "" }] },
    ],
  }));

const removeEditExercise = (i) =>
  setEditFormData((prev) => ({
    ...prev,
    strengthExercises: prev.strengthExercises.filter((_, idx) => idx !== i),
  }));

const handleEditStrengthChange = (exIndex, field, value) => {
  setEditFormData((prev) => {
    const updated = [...prev.strengthExercises];
    updated[exIndex] = { ...updated[exIndex], [field]: value };
    return { ...prev, strengthExercises: updated };
  });
};


const addEditSet = (exIndex) => {
  setEditFormData((prev) => {
    const updated = prev.strengthExercises.map((ex, i) =>
      i === exIndex
        ? {
            ...ex,
            sets: [...(ex.sets || []), { reps: "", weight: "" }],
          }
        : ex
    );

    return {
      ...prev,
      strengthExercises: updated,
    };
  });
};


const removeEditSet = (exIndex, setIndex) =>
  setEditFormData((prev) => {
    const updated = [...prev.strengthExercises];
    updated[exIndex].sets = updated[exIndex].sets.filter(
      (_, i) => i !== setIndex
    );
    return { ...prev, strengthExercises: updated };
  });

const handleEditSetChange = (exIndex, setIndex, field, value) => {
  setEditFormData((prev) => {
    const updated = [...prev.strengthExercises];
    updated[exIndex].sets[setIndex] = {
      ...updated[exIndex].sets[setIndex],
      [field]: value,
    };
    return { ...prev, strengthExercises: updated };
  });
};

// 🏃‍♂️ Cardio management
const addEditCardio = () =>
  setEditFormData((prev) => ({
    ...prev,
    cardioExercises: [
      ...prev.cardioExercises,
      { type: "", duration: "", distance: "" },
    ],
  }));

const removeEditCardio = (i) =>
  setEditFormData((prev) => ({
    ...prev,
    cardioExercises: prev.cardioExercises.filter((_, idx) => idx !== i),
  }));

const handleEditCardioChange = (i, field, value) =>
  setEditFormData((prev) => {
    const updated = [...prev.cardioExercises];
    updated[i] = { ...updated[i], [field]: value };
    return { ...prev, cardioExercises: updated };
  });

// ===========================================================
// 💾 SECTION: Edit Submit (Save Changes)
// ===========================================================
const handleEditSubmit = async (e) => {
  e.preventDefault();
  if (!logToEdit) return;

  setIsSavingEdit(true);
  setEditError("");

  // buildPartialPayloadFromForm already converts data correctly for backend
  const payload = buildPartialPayloadFromForm(editFormData);

  if (Object.keys(payload).length === 0) {
    setEditError("Please change at least one field before saving.");
    setIsSavingEdit(false);
    return;
  }

  try {
    await axios.put(`${LOGS_API_URL}/${logToEdit._id}`, payload);
    await refreshLogsAfterChange(); // ✅ refresh UI after update
    setIsEditModalOpen(false);
    setLogToEdit(null);
  } catch (err) {
    console.error("❌ Edit Save Error:", err);
    setEditError(err.response?.data?.msg || "Failed to update log entry.");
  } finally {
    setIsSavingEdit(false);
  }
};


// ===========================================================
// 🗑️ SECTION: Delete Handlers
// ===========================================================
const confirmDelete = (logId) => {
  setLogToDelete(logId);
  setIsDeleteModalOpen(true);
};

const handleConfirmDelete = async () => {
  if (!logToDelete) return;
  try {
    await axios.delete(`${LOGS_API_URL}/${logToDelete}`);
    await refreshLogsAfterChange(); // ✅ Refresh logs and suggestions
  } catch (err) {
    setError("Failed to delete log. Try again.");
  } finally {
    setIsDeleteModalOpen(false);
    setLogToDelete(null);
  }
};

// ===========================================================
// 🧩 SECTION: Render - Form UI
// ===========================================================
const grouped = Array.isArray(logs) ? groupLogsByWeek(logs) : [];

return (
  <div className="p-4 bg-white rounded-lg shadow">
    {/* ------------------------------------------------------- */}
    {/* 🏋️‍♂️ HEADER */}
    {/* ------------------------------------------------------- */}
    <h2 className="text-xl font-semibold mb-4">Daily Log</h2>

    {/* ------------------------------------------------------- */}
    {/* 🧾 ADD LOG FORM */}
    {/* ------------------------------------------------------- */}
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* -------------------- WEIGHT -------------------- */}
      <div>
        <label className="block text-sm font-medium">Weight (kg)</label>
        <input
          type="number"
          value={formData.weight}
          onChange={(e) =>
            setFormData({ ...formData, weight: e.target.value })
          }
          className="w-full border rounded px-3 py-2 mt-1"
        />
      </div>

      {/* -------------------- NUTRITION -------------------- */}
      <section>
        <h3 className="flex items-center gap-2 text-lg font-medium text-gray-700">
          <Utensils size={20} /> Nutrition
        </h3>
        <div className="grid sm:grid-cols-3 gap-3 mt-2">
          {["breakfast", "lunch", "dinner"].map((meal) => (
            <div
              key={meal}
              className="border p-3 rounded-md bg-gray-50 shadow-sm"
            >
              <h4 className="font-semibold capitalize mb-2 text-gray-700">
                {meal}
              </h4>
              {["calories", "protein", "fat", "carbs"].map((f) => (
                <input
                  key={f}
                  type="number"
                  placeholder={f}
                  value={formData.nutrition[meal][f]}
                  onChange={(e) =>
                    handleNutritionChange(meal, f, e.target.value)
                  }
                  className="w-full border rounded px-2 py-1 text-sm mt-1 focus:ring focus:ring-blue-200"
                />
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* -------------------- WORKOUT -------------------- */}
      <section>
        <h3 className="flex items-center gap-2 text-lg font-medium text-gray-700">
          <Dumbbell size={20} /> Workout
        </h3>

        {/* Workout Split */}
        <AutocompleteInput
          value={formData.workoutSplit}
          onChange={(val) =>
            setFormData({ ...formData, workoutSplit: val })
          }
          suggestions={workoutSplitSuggestions}
          placeholder="Workout Split (e.g., Push, Pull, Legs)"
        />

        {/* Exercises */}
        {formData.strengthExercises.map((ex, i) => (
          <div key={i} className="p-3 border rounded mt-2 bg-gray-50">
            <div className="flex justify-between items-center">
              <AutocompleteInput
                value={ex.name}
                onChange={(val) =>
                  handleStrengthChange(i, "name", val)
                }
                suggestions={exerciseSuggestions}
                placeholder={`Exercise ${i + 1} Name`}
              />
              <button
                type="button"
                onClick={() => removeExercise(i)}
                className="text-red-500 text-xs font-medium ml-2 hover:underline"
              >
                Remove
              </button>
            </div>

            {(ex.sets || []).map((s, j) => (
              <div key={j} className="flex gap-2 mt-2">
                <input
                  type="number"
                  placeholder="Reps"
                  value={s.reps}
                  onChange={(e) =>
                    handleSetChange(i, j, "reps", e.target.value)
                  }
                  className="w-1/2 border rounded px-2 py-1 text-sm"
                />
                <input
                  type="number"
                  placeholder="Weight"
                  value={s.weight}
                  onChange={(e) =>
                    handleSetChange(i, j, "weight", e.target.value)
                  }
                  className="w-1/2 border rounded px-2 py-1 text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeSet(i, j)}
                  className="text-red-500 text-xs ml-1 hover:underline"
                >
                  ✕
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => addSet(i)}
              className="mt-2 text-blue-600 text-sm flex items-center gap-1"
            >
              <PlusCircle size={14} /> Add Set
            </button>
          </div>
        ))}

        {/* Add Exercise Button */}
        <button
          type="button"
          onClick={addExercise}
          className="mt-2 flex items-center gap-1 text-blue-600 text-sm"
        >
          <PlusCircle size={16} /> Add Exercise
        </button>
      </section>

      {/* -------------------- CARDIO -------------------- */}
      <section>
        <h3 className="flex items-center gap-2 text-lg font-medium text-gray-700">
          <Zap size={20} /> Cardio
        </h3>

        {formData.cardioExercises.map((c, i) => (
          <div key={i} className="flex flex-col sm:flex-row gap-2 mt-2">
            <AutocompleteInput
              value={c.type}
              onChange={(val) =>
                handleCardioChange(i, "type", val)
              }
              suggestions={cardioSuggestions}
              placeholder="Cardio Type (e.g., Run, Cycle)"
            />
            <input
              type="number"
              placeholder="Duration (min)"
              value={c.duration}
              onChange={(e) =>
                handleCardioChange(i, "duration", e.target.value)
              }
              className="w-full sm:w-24 border rounded px-2 py-1 text-sm"
            />
            <input
              type="number"
              placeholder="Distance (km)"
              value={c.distance}
              onChange={(e) =>
                handleCardioChange(i, "distance", e.target.value)
              }
              className="w-full sm:w-24 border rounded px-2 py-1 text-sm"
            />
            <button
              type="button"
              onClick={() => removeCardio(i)}
              className="text-red-500 text-xs font-medium hover:underline"
            >
              Remove
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addCardio}
          className="mt-2 flex items-center gap-1 text-blue-600 text-sm"
        >
          <PlusCircle size={16} /> Add Cardio
        </button>
      </section>

      {/* -------------------- SUBMIT BUTTON -------------------- */}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white rounded py-2 hover:bg-blue-700 transition"
      >
        Save Log
      </button>

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}
    </form>

    {/* (Next Section → History Accordion View) */}
    {/* =========================================================== */}
    {/*  // 🕓 SECTION: Render - Log History (Accordion) */  }
    {/*  // =========================================================== */}

    {/* ------------------------------------------------------- */}
    {/* 📜 LOG HISTORY */}
    {/* ------------------------------------------------------- */}
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-3">History</h3>

      {loading ? (
        <div className="text-gray-500">Loading logs...</div>
      ) : grouped.length === 0 ? (
        <div className="text-gray-500 text-sm">No logs found yet.</div>
      ) : (
        grouped.map(([weekKey, weekLogs], index) => (
          <div
            key={weekKey}
            className="mb-3 border border-gray-200 rounded-md overflow-hidden"
          >
            {/* Week Header */}
            <button
              onClick={() =>
                setActiveWeekKey((prev) => (prev === weekKey ? null : weekKey))
              }
              className="flex justify-between w-full p-3 text-left bg-gray-50 hover:bg-gray-100 transition"
            >
              <span className="font-medium text-gray-800">
                {formatWeekHeader(weekKey, index)}
              </span>
              <ChevronDown
                size={18}
                className={`transition-transform ${
                  activeWeekKey === weekKey ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Week Logs */}
            {activeWeekKey === weekKey && (
              <div className="p-4 bg-white space-y-3">
                {weekLogs.map((log) => (
                  <div
                    key={log._id}
                    className="border border-gray-100 rounded-md p-3 hover:shadow-sm transition"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-semibold text-gray-800">
                        {new Date(log.date).toLocaleDateString()}
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => openEditModal(log)}
                          className="flex items-center gap-1 text-blue-600 text-sm hover:underline"
                        >
                          <Edit size={14} /> Edit
                        </button>
                        <button
                          onClick={() => confirmDelete(log._id)}
                          className="flex items-center gap-1 text-red-600 text-sm hover:underline"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>

                    {/* Nutrition Summary */}
                    <div className="grid grid-cols-3 gap-3 text-sm text-gray-600 bg-gray-50 p-2 rounded-md mb-2">
                      <div>
                        <span className="block text-xs text-gray-500">
                          Weight
                        </span>
                        <span className="font-medium text-gray-800">
                          {log.weight ?? "-"} kg
                        </span>
                      </div>
                      <div>
                        <span className="block text-xs text-gray-500">
                          Calories
                        </span>
                        <span className="font-medium text-gray-800">
                          {(
                            (log.nutrition?.breakfast?.calories || 0) +
                            (log.nutrition?.lunch?.calories || 0) +
                            (log.nutrition?.dinner?.calories || 0)
                          ).toFixed(0) || "-"}{" "}
                          kcal
                        </span>
                      </div>
                      <div>
                        <span className="block text-xs text-gray-500">
                          Protein
                        </span>
                        <span className="font-medium text-gray-800">
                          {(
                            (log.nutrition?.breakfast?.protein || 0) +
                            (log.nutrition?.lunch?.protein || 0) +
                            (log.nutrition?.dinner?.protein || 0)
                          ).toFixed(0) || "-"}{" "}
                          g
                        </span>
                      </div>
                    </div>

                    {/* Workout Sessions */}
                    {log.sessions?.some((s) => s.type === "workout") && (
                      <div className="mt-2">
                        <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                          <Dumbbell size={14} /> Workout
                        </h4>
                        {(log.sessions || [])
                          .filter((s) => s.type === "workout")
                          .map((s, i) => (
                            <div
                              key={i}
                              className="bg-gray-50 mt-1 p-2 rounded text-xs"
                            >
                              <div className="font-medium text-gray-800">
                                {s.name || "Workout"}
                              </div>
                              <ul className="list-disc list-inside text-gray-600">
                                {(s.exercises || []).map((ex, j) => (
                                  <li key={j}>
                                    <span className="font-medium">
                                      {ex.name}
                                    </span>
                                    :{" "}
                                    {(ex.sets || [])
                                      .map(
                                        (set) =>
                                          `${set.weight}kg x ${set.reps}reps`
                                      )
                                      .join(", ")}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                      </div>
                    )}

                    {/* Cardio Sessions */}
                    {log.sessions?.some((s) => s.type === "cardio") && (
                      <div className="mt-2">
                        <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                          <Zap size={14} /> Cardio
                        </h4>
                        {(log.sessions || [])
                          .filter((s) => s.type === "cardio")
                          .map((s, i) => (
                            <div
                              key={i}
                              className="bg-gray-50 mt-1 p-2 rounded text-xs text-gray-700"
                            >
                              <div>
                                {s.name || "Cardio"}{" "}
                                {s.durationMinutes
                                  ? `- ${s.durationMinutes} min`
                                  : ""}
                                {s.distanceKm ? ` · ${s.distanceKm} km` : ""}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>

    {/* (Next Section → Edit & Delete Modals) */}

    {/* ------------------------------------------------------- */}
    {/* ✏️ EDIT MODAL */}
    {/* ------------------------------------------------------- */}
    {isEditModalOpen && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Edit Log</h3>

          <form onSubmit={handleEditSubmit} className="space-y-6">
            {/* Weight */}
            <div>
              <label className="block text-sm font-medium">Weight (kg)</label>
              <input
                type="number"
                value={editFormData.weight}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    weight: e.target.value,
                  })
                }
                className="w-full border rounded px-3 py-2 mt-1"
              />
            </div>

            {/* Nutrition */}
            <section>
              <h4 className="flex items-center gap-2 text-lg font-medium text-gray-700">
                <Utensils size={20} /> Nutrition
              </h4>
              <div className="grid sm:grid-cols-3 gap-3 mt-2">
                {["breakfast", "lunch", "dinner"].map((meal) => (
                  <div
                    key={meal}
                    className="border p-3 rounded-md bg-gray-50 shadow-sm"
                  >
                    <h5 className="font-semibold capitalize mb-2 text-gray-700">
                      {meal}
                    </h5>
                    {["calories", "protein", "fat", "carbs"].map((f) => (
                      <input
                        key={f}
                        type="number"
                        placeholder={f}
                        value={editFormData.nutrition?.[meal]?.[f] || ""}
                        onChange={(e) =>
                          handleEditNutritionChange(meal, f, e.target.value)
                        }
                        className="w-full border rounded px-2 py-1 text-sm mt-1 focus:ring focus:ring-blue-200"
                      />
                    ))}
                  </div>
                ))}
              </div>
            </section>

            {/* Workout */}
            <section>
              <h4 className="flex items-center gap-2 text-lg font-medium text-gray-700">
                <Dumbbell size={20} /> Workout
              </h4>

              <AutocompleteInput
                value={editFormData.workoutSplit}
                onChange={(val) =>
                  setEditFormData({ ...editFormData, workoutSplit: val })
                }
                suggestions={workoutSplitSuggestions}
                placeholder="Workout Split (e.g., Push, Pull)"
              />

              {editFormData.strengthExercises.map((ex, i) => (
                <div
                  key={i}
                  className="p-3 border rounded mt-2 bg-gray-50 relative"
                >
                  <AutocompleteInput
                    value={ex.name}
                    onChange={(val) => handleEditStrengthChange(i, "name", val)}
                    suggestions={exerciseSuggestions}
                    placeholder={`Exercise ${i + 1} Name`}
                  />

                  {(ex.sets || []).map((s, j) => (
                    <div key={j} className="flex gap-2 mt-2">
                      <input
                        type="number"
                        placeholder="Reps"
                        value={s.reps}
                        onChange={(e) =>
                          handleEditSetChange(i, j, "reps", e.target.value)
                        }
                        className="w-1/2 border rounded px-2 py-1 text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Weight"
                        value={s.weight}
                        onChange={(e) =>
                          handleEditSetChange(i, j, "weight", e.target.value)
                        }
                        className="w-1/2 border rounded px-2 py-1 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeEditSet(i, j)}
                        className="text-red-500 text-xs font-medium hover:underline"
                      >
                        Remove Set
                      </button>
                    </div>
                  ))}

                  {/* ✅ Use your helper function now */}
                  <button
                    type="button"
                    onClick={() => addEditSet(i)}
                    className="mt-2 text-blue-600 text-sm flex items-center gap-1"
                  >
                    <PlusCircle size={14} /> Add Set
                  </button>

                  <button
                    type="button"
                    onClick={() => removeEditExercise(i)}
                    className="absolute top-2 right-2 text-red-500 text-xs font-medium hover:underline"
                  >
                    Remove Exercise
                  </button>
                </div>
              ))}
              {/* 🆕 ✅ Add Exercise Button */}
                  <button
                    type="button"
                    onClick={addEditExercise}
                    className="text-blue-600 text-sm flex items-center gap-1 mt-3"
                  >
                    <PlusCircle size={14} /> Add Exercise
                  </button>
            </section>

            {/* Cardio */}
            <section>
              <h4 className="flex items-center gap-2 text-lg font-medium text-gray-700">
                <Zap size={20} /> Cardio
              </h4>
              {editFormData.cardioExercises.map((c, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row gap-2 mt-2 relative"
                >
                  <AutocompleteInput
                    value={c.type}
                    onChange={(val) => handleEditCardioChange(i, "type", val)}
                    suggestions={cardioSuggestions}
                    placeholder="Cardio Type (e.g., Run, Cycle)"
                  />
                  <input
                    type="number"
                    placeholder="Duration (min)"
                    value={c.duration}
                    onChange={(e) =>
                      handleEditCardioChange(i, "duration", e.target.value)
                    }
                    className="w-full sm:w-24 border rounded px-2 py-1 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Distance (km)"
                    value={c.distance}
                    onChange={(e) =>
                      handleEditCardioChange(i, "distance", e.target.value)
                    }
                    className="w-full sm:w-24 border rounded px-2 py-1 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeEditCardio(i)}
                    className="absolute top-2 right-2 text-red-500 text-xs font-medium hover:underline"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addEditCardio}
                className="mt-2 flex items-center gap-1 text-blue-600 text-sm"
              >
                <PlusCircle size={16} /> Add Cardio
              </button>
            </section>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {isSavingEdit ? "Saving..." : "Save Changes"}
              </button>
            </div>

            {editError && (
              <div className="text-red-600 text-sm mt-2">{editError}</div>
            )}
          </form>
        </div>
      </div>
    )}

    {/* ------------------------------------------------------- */}
    {/* 🗑️ DELETE MODAL */}
    {/* ------------------------------------------------------- */}
    {isDeleteModalOpen && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm text-center">
          <h3 className="text-lg font-semibold mb-3">Confirm Delete</h3>
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete this log?
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
}





