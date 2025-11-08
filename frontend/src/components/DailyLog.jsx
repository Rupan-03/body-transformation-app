// components/DailyLog.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import DailyLogForm from "./DailyLogForm";
import DailyLogHistory from "./DailyLogHistory";
import DailyLogModals from "./DailyLogModals";

const LOGS_API_URL = `${import.meta.env.VITE_API_URL}/logs`;

/* ----------------------------- date utilities ---------------------------- */
const getStartOfWeek = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay()); // Sunday-based week
  return d;
};
const weekKeyISO = (date) => getStartOfWeek(date).toISOString();
const formatWeekHeader = (weekKey, index) => {
  if (index === 0) return "This Week";
  if (index === 1) return "Last Week";
  const d = new Date(weekKey);
  return `Week of ${d.toLocaleDateString(undefined, { month: "long", day: "numeric" })}`;
};

/* --------------------------------- state --------------------------------- */
const initialFormData = {
  weight: "",
  nutrition: {
    breakfast: { calories: "", protein: "", fat: "", carbs: "" },
    lunch: { calories: "", protein: "", fat: "", carbs: "" },
    dinner: { calories: "", protein: "", fat: "", carbs: "" },
  },
  workoutSplit: "",
  strengthExercises: [],
  cardioExercises: [],
};

export default function DailyLog({
  strengthNameSuggestions = [],
  cardioNameSuggestions = [],
  /** NEW: control what parts to render (for page-level toggles) */
  showForm = true,
  showHistory = true,
}) {
  /* ------------------------------ local states ----------------------------- */
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState("");

  // history accordion
  const [activeWeekKey, setActiveWeekKey] = useState(null);

  // suggestions
  const [exerciseSuggestions, setExerciseSuggestions] = useState(strengthNameSuggestions);
  const [cardioSuggestions, setCardioSuggestions] = useState(cardioNameSuggestions);
  const [workoutSplitSuggestions, setWorkoutSplitSuggestions] = useState([]);

  // edit + delete modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [logToEdit, setLogToEdit] = useState(null);
  const [logToDelete, setLogToDelete] = useState(null);

  const [editFormData, setEditFormData] = useState(initialFormData);
  const [editError, setEditError] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  /* -------------------------------- effects -------------------------------- */
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data } = await axios.get(LOGS_API_URL);
        const arr = Array.isArray(data) ? data : [];
        setLogs(arr);
        refreshSuggestions(arr);
        const grouped = groupLogsByWeek(arr);
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

  const refreshLogsAfterChange = async () => {
    try {
      const { data } = await axios.get(LOGS_API_URL);
      const arr = Array.isArray(data) ? data : [];
      setLogs(arr);
      refreshSuggestions(arr);
    } catch (e) {
      console.error(e);
    }
  };

  /* ----------------------------- suggestions ----------------------------- */
  const refreshSuggestions = (logsData) => {
    const exSet = new Set();
    const cardioSet = new Set();
    const splitSet = new Set();

    (logsData || []).forEach((log) => {
      (log.sessions || []).forEach((s) => {
        if (!s) return;
        if (s.type === "workout") {
          if (s.name) splitSet.add(String(s.name).trim());
          (s.exercises || []).forEach((ex) => ex?.name && exSet.add(String(ex.name).trim()));
        }
        if (s.type === "cardio" && s.name) cardioSet.add(String(s.name).trim());
      });

      // legacy shapes
      if (Array.isArray(log.strengthExercises)) {
        log.strengthExercises.forEach((ex) => ex?.name && exSet.add(String(ex.name).trim()));
      }
      if (Array.isArray(log.cardioExercises)) {
        log.cardioExercises.forEach((c) => c?.type && cardioSet.add(String(c.type).trim()));
      }
      if (log.workoutSplit) splitSet.add(String(log.workoutSplit).trim());
    });

    strengthNameSuggestions.forEach((s) => s && exSet.add(String(s).trim()));
    cardioNameSuggestions.forEach((s) => s && cardioSet.add(String(s).trim()));

    setExerciseSuggestions([...exSet].slice(0, 50));
    setCardioSuggestions([...cardioSet].slice(0, 50));
    setWorkoutSplitSuggestions([...splitSet].slice(0, 50));
  };

  /* ------------------------------ data shaping ----------------------------- */
  const buildSessionsFromUI = ({ strengthExercises, cardioExercises, workoutSplit }) => {
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
          durationMinutes: Number(c.duration) || 0,
          distanceKm: Number(c.distance) || 0,
        });
      });
    }
    return sessions;
  };

  const numericOrEmpty = (v) =>
    v === "" || v === null || typeof v === "undefined" ? "" : Number(v) || 0;

  const buildPartialPayloadFromForm = (data) => {
    const payload = {};
    if (data.weight !== "" && data.weight !== null) payload.weight = Number(data.weight);

    const meals = ["breakfast", "lunch", "dinner"];
    const nutr = {};
    let hasNutrition = false;
    meals.forEach((m) => {
      const meal = data.nutrition?.[m] || {};
      const any = meal.calories || meal.protein || meal.fat || meal.carbs || meal.cal;
      if (any || any === 0) {
        hasNutrition = true;
        nutr[m] = {
          calories: numericOrEmpty(meal.calories),
          protein: numericOrEmpty(meal.protein),
          fat: numericOrEmpty(meal.fat),
          carbs: numericOrEmpty(meal.carbs),
        };
      }
    });
    if (hasNutrition) payload.nutrition = nutr;

    const sessions = buildSessionsFromUI(data);
    if (sessions.length > 0) payload.sessions = sessions;

    return payload;
  };

  const resetFormFieldsThatWereSubmitted = (submittedPayload) => {
    const next = { ...formData };
    if ("weight" in submittedPayload) next.weight = "";
    if ("nutrition" in submittedPayload) next.nutrition = { ...initialFormData.nutrition };
    if ("sessions" in submittedPayload) {
      next.strengthExercises = [];
      next.cardioExercises = [];
      next.workoutSplit = "";
    }
    setFormData(next);
  };

  /* ------------------------------ create flow ------------------------------ */
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
      await refreshLogsAfterChange();
      resetFormFieldsThatWereSubmitted(payload);
    } catch (err) {
      console.error(err);
      setError("Failed to save your log. Please try again.");
    }
  };

  /* ------------------------------- edit flow ------------------------------- */
  const openEdit = (log) => {
    const workout = (log.sessions || []).find((s) => s.type === "workout");
    const strengthExercises = (workout?.exercises || []).map((ex) => ({
      name: ex.name || "",
      sets: (ex.sets || []).map((s) => ({ reps: s.reps ?? "", weight: s.weight ?? "" })),
    }));

    const cardioExercises = (log.sessions || [])
      .filter((s) => s.type === "cardio")
      .map((c) => ({ type: c.name || "", duration: c.durationMinutes ?? "", distance: c.distanceKm ?? "" }));

    const workoutSplit = workout?.name || "";

    setLogToEdit(log);
    setEditFormData({
      weight: log.weight ?? "",
      nutrition: log.nutrition || initialFormData.nutrition,
      workoutSplit,
      strengthExercises,
      cardioExercises,
    });
    setEditError("");
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e?.preventDefault(); // defensive
    if (!logToEdit) return;
    setIsSavingEdit(true);
    setEditError("");

    const payload = buildPartialPayloadFromForm(editFormData);
    if (Object.keys(payload).length === 0) {
      setEditError("Please change at least one field before saving.");
      setIsSavingEdit(false);
      return;
    }
    try {
      await axios.put(`${LOGS_API_URL}/${logToEdit._id}`, payload);
      await refreshLogsAfterChange();
      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
      setEditError("Failed to save changes. Please try again.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  /* ------------------------------ delete flow ------------------------------ */
  const openDelete = (id) => {
    setLogToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!logToDelete) return;
    try {
      await axios.delete(`${LOGS_API_URL}/${logToDelete}`);
      await refreshLogsAfterChange();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleteModalOpen(false);
      setLogToDelete(null);
    }
  };

  /* ----------------------- today form change handlers ---------------------- */
  const handleNutritionChange = (meal, field, value) => {
    setFormData((prev) => ({
      ...prev,
      nutrition: { ...prev.nutrition, [meal]: { ...prev.nutrition[meal], [field]: value } },
    }));
  };
  const addExercise = () =>
    setFormData((prev) => ({
      ...prev,
      strengthExercises: [...prev.strengthExercises, { name: "", sets: [{ reps: "", weight: "" }] }],
    }));
  const removeExercise = (exIndex) =>
    setFormData((prev) => ({
      ...prev,
      strengthExercises: prev.strengthExercises.filter((_, i) => i !== exIndex),
    }));
  const handleStrengthChange = (exIndex, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.strengthExercises];
      updated[exIndex] = { ...updated[exIndex], [field]: value };
      return { ...prev, strengthExercises: updated };
    });
  };
  const addSet = (exIndex) => {
    setFormData((prev) => {
      const updated = prev.strengthExercises.map((ex, i) =>
        i === exIndex ? { ...ex, sets: [...(ex.sets || []), { reps: "", weight: "" }] } : ex
      );
      return { ...prev, strengthExercises: updated };
    });
  };
  const removeSet = (exIndex, setIndex) => {
    setFormData((prev) => {
      const updated = prev.strengthExercises.map((ex, i) =>
        i === exIndex ? { ...ex, sets: (ex.sets || []).filter((_, j) => j !== setIndex) } : ex
      );
      return { ...prev, strengthExercises: updated };
    });
  };
  const handleSetChange = (exIndex, setIndex, field, value) => {
    setFormData((prev) => {
      const updated = prev.strengthExercises.map((ex, i) => {
        if (i !== exIndex) return ex;
        const sets = [...(ex.sets || [])];
        sets[setIndex] = { ...sets[setIndex], [field]: value };
        return { ...ex, sets };
      });
      return { ...prev, strengthExercises: updated };
    });
  };

  const addCardio = () =>
    setFormData((prev) => ({
      ...prev,
      cardioExercises: [...prev.cardioExercises, { type: "", duration: "", distance: "" }],
    }));
  const removeCardio = (i) =>
    setFormData((prev) => ({
      ...prev,
      cardioExercises: prev.cardioExercises.filter((_, idx) => idx !== i),
    }));
  const handleCardioChange = (i, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.cardioExercises];
      updated[i] = { ...updated[i], [field]: value };
      return { ...prev, cardioExercises: updated };
    });
  };

  /* ---------------------------- edit form handlers ---------------------------- */
  const handleEditNutritionChange = (meal, field, value) => {
    setEditFormData((prev) => ({
      ...prev,
      nutrition: { ...prev.nutrition, [meal]: { ...prev.nutrition[meal], [field]: value } },
    }));
  };
  const addEditExercise = () =>
    setEditFormData((prev) => ({
      ...prev,
      strengthExercises: [...prev.strengthExercises, { name: "", sets: [{ reps: "", weight: "" }] }],
    }));
  const removeEditExercise = (exIndex) =>
    setEditFormData((prev) => ({
      ...prev,
      strengthExercises: prev.strengthExercises.filter((_, i) => i !== exIndex),
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
        i === exIndex ? { ...ex, sets: [...(ex.sets || []), { reps: "", weight: "" }] } : ex
      );
      return { ...prev, strengthExercises: updated };
    });
  };
  const removeEditSet = (exIndex, setIndex) => {
    setEditFormData((prev) => {
      const updated = prev.strengthExercises.map((ex, i) =>
        i === exIndex ? { ...ex, sets: (ex.sets || []).filter((_, j) => j !== setIndex) } : ex
      );
      return { ...prev, strengthExercises: updated };
    });
  };
  const handleEditSetChange = (exIndex, setIndex, field, value) => {
    setEditFormData((prev) => {
      const updated = prev.strengthExercises.map((ex, i) => {
        if (i !== exIndex) return ex;
        const sets = [...(ex.sets || [])];
        sets[setIndex] = { ...sets[setIndex], [field]: value };
        return { ...ex, sets };
      });
      return { ...prev, strengthExercises: updated };
    });
  };
  const addEditCardio = () =>
    setEditFormData((prev) => ({
      ...prev,
      cardioExercises: [...prev.cardioExercises, { type: "", duration: "", distance: "" }],
    }));
  const removeEditCardio = (i) =>
    setEditFormData((prev) => ({
      ...prev,
      cardioExercises: prev.cardioExercises.filter((_, idx) => idx !== i),
    }));
  const handleEditCardioChange = (i, field, value) => {
    setEditFormData((prev) => {
      const updated = [...prev.cardioExercises];
      updated[i] = { ...updated[i], [field]: value };
      return { ...prev, cardioExercises: updated };
    });
  };

  /* ---------------------------- grouping & stats ---------------------------- */
  const groupLogsByWeek = (arr) => {
    const map = new Map();
    (arr || []).forEach((log) => {
      const key = weekKeyISO(log.date || new Date());
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(log);
    });
    for (const [, items] of map) {
      items.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    }
    return Array.from(map.entries()).sort((a, b) => new Date(b[0]) - new Date(a[0]));
  };
  const grouped = groupLogsByWeek(logs);

  /* ---------------------------------- UI ---------------------------------- */
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
          Daily Log
        </h2>
        <p className="text-slate-600">Track your nutrition, workouts, and progress</p>
      </div>

      {/* Today's Log (create) */}
      {showForm && (
        <DailyLogForm
          formData={formData}
          setFormData={setFormData}
          error={error}
          onSubmit={handleSubmit}
          onNutritionChange={handleNutritionChange}
          onStrengthChange={handleStrengthChange}
          onSetChange={handleSetChange}
          onCardioChange={handleCardioChange}
          addExercise={addExercise}
          removeExercise={removeExercise}
          addSet={addSet}
          removeSet={removeSet}
          addCardio={addCardio}
          removeCardio={removeCardio}
          exerciseSuggestions={exerciseSuggestions}
          cardioSuggestions={cardioSuggestions}
          workoutSplitSuggestions={workoutSplitSuggestions}
        />
      )}

      {/* History */}
      {showHistory && (
        <DailyLogHistory
          loading={loading}
          grouped={grouped}
          activeWeekKey={activeWeekKey}
          setActiveWeekKey={setActiveWeekKey}
          formatWeekHeader={formatWeekHeader}
          onEdit={openEdit}
          onDelete={openDelete}
        />
      )}

      {/* Modals (safe to keep even if history hidden) */}
      <DailyLogModals
        isEditModalOpen={isEditModalOpen}
        setIsEditModalOpen={setIsEditModalOpen}
        isDeleteModalOpen={isDeleteModalOpen}
        setIsDeleteModalOpen={setIsDeleteModalOpen}
        editFormData={editFormData}
        setEditFormData={setEditFormData}
        editError={editError}
        isSavingEdit={isSavingEdit}
        onEditSubmit={handleEditSubmit}
        onConfirmDelete={handleConfirmDelete}
        onEditNutritionChange={handleEditNutritionChange}
        onEditStrengthChange={handleEditStrengthChange}
        onEditSetChange={handleEditSetChange}
        onEditCardioChange={handleEditCardioChange}
        addEditExercise={addEditExercise}
        removeEditExercise={removeEditExercise}
        addEditSet={addEditSet}
        removeEditSet={removeEditSet}
        addEditCardio={addEditCardio}
        removeEditCardio={removeEditCardio}
        exerciseSuggestions={exerciseSuggestions}
        cardioSuggestions={cardioSuggestions}
        workoutSplitSuggestions={workoutSplitSuggestions}
      />
    </motion.div>
  );
}
