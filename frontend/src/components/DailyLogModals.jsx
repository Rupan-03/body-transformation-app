// components/DailyLogModals.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader2, AlertCircle, Weight, Dumbbell, Zap, Utensils, PlusCircle, Trash2 } from 'lucide-react';
import AutocompleteInput from './AutocompleteInput';

// Animation variants
const modalVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 }
};

// Nutrition Section Component (Reusable)
const NutritionSection = ({ formData, onNutritionChange }) => (
  <section>
    <h3 className="flex items-center gap-3 text-lg font-semibold text-slate-800 mb-4">
      <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
        <Utensils size={20} />
      </div>
      Nutrition Tracking
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {['breakfast', 'lunch', 'dinner'].map((meal) => (
        <div key={meal} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
          <h4 className="font-semibold capitalize mb-3 text-slate-700 text-sm uppercase tracking-wide">
            {meal}
          </h4>
          <div className="space-y-3">
            {['calories', 'protein', 'fat', 'carbs'].map((field) => (
              <div key={field}>
                <label className="block text-xs font-medium text-slate-600 mb-1 capitalize">
                  {field}
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={formData.nutrition?.[meal]?.[field] || ''}
                  onChange={(e) => onNutritionChange(meal, field, e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </section>
);

// Exercise Set Component
const ExerciseSet = ({ set, setIndex, onSetChange, onRemoveSet, exerciseIndex }) => (
  <div className="flex gap-2 items-center">
    <input
      type="number"
      placeholder="Reps"
      value={set.reps}
      onChange={(e) => onSetChange(exerciseIndex, setIndex, 'reps', e.target.value)}
      className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
    <input
      type="number"
      placeholder="Weight"
      value={set.weight}
      onChange={(e) => onSetChange(exerciseIndex, setIndex, 'weight', e.target.value)}
      className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
    <button
      type="button"
      onClick={() => onRemoveSet(exerciseIndex, setIndex)}
      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
    >
      <X size={16} />
    </button>
  </div>
);

// Strength Exercise Component
const StrengthExercise = ({
  exercise,
  index,
  onExerciseChange,
  onRemoveExercise,
  onAddSet,
  onSetChange,
  onRemoveSet,
  exerciseSuggestions
}) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-white border border-slate-200 rounded-xl p-4 space-y-4 relative"
  >
    <div className="flex gap-3 items-start">
      <div className="flex-1">
        <AutocompleteInput
          value={exercise.name}
          onChange={(val) => onExerciseChange(index, 'name', val)}
          suggestions={exerciseSuggestions}
          placeholder="Exercise name (e.g., Bench Press)"
        />
      </div>
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

    <button
      type="button"
      onClick={() => onRemoveExercise(index)}
      className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 transition-colors"
    >
      <Trash2 size={18} />
    </button>
  </motion.div>
);

// Edit Modal Component
const EditModal = ({
  isOpen,
  onClose,
  formData,
  onFormChange,
  onNutritionChange,
  onStrengthChange,
  onAddExercise,
  onRemoveExercise,
  onAddSet,
  onRemoveSet,
  onSetChange,
  onCardioChange,
  onAddCardio,
  onRemoveCardio,
  onSubmit,
  error,
  isSaving,
  exerciseSuggestions,
  cardioSuggestions,
  workoutSplitSuggestions
}) => (
  <AnimatePresence>
    {isOpen && (
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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800">Edit Log Entry</h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[70vh] p-6">
            {/* Important: give the form an id so the footer button can submit it */}
            <form id="edit-log-form" onSubmit={onSubmit} className="space-y-8">
              {/* Weight Section */}
              <section>
                <h3 className="flex items-center gap-3 text-lg font-semibold text-slate-800 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <Weight size={20} />
                  </div>
                  Daily Weight
                </h3>
                <div className="max-w-xs">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Enter weight in kg"
                    value={formData.weight}
                    onChange={(e) => onFormChange({ ...formData, weight: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </section>

              {/* Nutrition Section */}
              <NutritionSection formData={formData} onNutritionChange={onNutritionChange} />

              {/* Workout Section */}
              <section className="bg-slate-50 rounded-2xl p-6">
                <h3 className="flex items-center gap-3 text-lg font-semibold text-slate-800 mb-6">
                  <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                    <Dumbbell size={20} />
                  </div>
                  Workout Session
                </h3>

                <div className="space-y-6">
                  {/* Workout Split */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Workout Split</label>
                    <AutocompleteInput
                      value={formData.workoutSplit}
                      onChange={(val) => onFormChange({ ...formData, workoutSplit: val })}
                      suggestions={workoutSplitSuggestions}
                      placeholder="e.g., Push Day, Pull Day, Leg Day"
                    />
                  </div>

                  {/* Exercises */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">Exercises</span>
                      <button
                        type="button"
                        onClick={onAddExercise}
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
                          onRemoveExercise={onRemoveExercise}
                          onAddSet={onAddSet}
                          onSetChange={onSetChange}
                          onRemoveSet={onRemoveSet}
                          exerciseSuggestions={exerciseSuggestions}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Cardio Section */}
              <section className="bg-slate-50 rounded-2xl p-6">
                <h3 className="flex items-center gap-3 text-lg font-semibold text-slate-800 mb-6">
                  <div className="p-2 bg-green-100 rounded-lg text-green-600">
                    <Zap size={20} />
                  </div>
                  Cardio Session
                </h3>

                <div className="space-y-4">
                  {formData.cardioExercises.map((cardio, index) => (
                    <motion.div
                      key={index}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col sm:flex-row gap-3 items-end p-4 bg-white rounded-xl border border-slate-200 relative"
                    >
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
                        <AutocompleteInput
                          value={cardio.type}
                          onChange={(val) => onCardioChange(index, 'type', val)}
                          suggestions={cardioSuggestions}
                          placeholder="e.g., Running, Cycling"
                        />
                      </div>
                      <div className="w-32">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Duration (min)</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={cardio.duration}
                          onChange={(e) => onCardioChange(index, 'duration', e.target.value)}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="w-32">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Distance (km)</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="0.0"
                          value={cardio.distance}
                          onChange={(e) => onCardioChange(index, 'distance', e.target.value)}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveCardio(index)}
                        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </motion.div>
                  ))}

                  <button
                    type="button"
                    onClick={onAddCardio}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <PlusCircle size={16} />
                    Add Cardio Session
                  </button>
                </div>
              </section>

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
            </form>
          </div>

          <div className="flex justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors font-medium"
            >
              Cancel
            </button>
            {/* IMPORTANT: submit the form by id so the event reaches onSubmit */}
            <button
              type="submit"
              form="edit-log-form"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSaving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Delete Modal Component
const DeleteModal = ({ isOpen, onClose, onConfirm }) => (
  <AnimatePresence>
    {isOpen && (
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
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} className="text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Log Entry</h3>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete this log entry? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={onClose}
                className="px-6 py-3 text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium"
              >
                Delete Entry
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Main Modals Component
const DailyLogModals = ({
  isEditModalOpen,
  setIsEditModalOpen,
  isDeleteModalOpen,
  setIsDeleteModalOpen,
  editFormData,
  setEditFormData,
  editError,
  isSavingEdit,
  onEditSubmit,
  onConfirmDelete,
  onEditNutritionChange,
  onEditStrengthChange,
  onEditSetChange,
  onEditCardioChange,
  addEditExercise,
  removeEditExercise,
  addEditSet,
  removeEditSet,
  addEditCardio,
  removeEditCardio,
  exerciseSuggestions,
  cardioSuggestions,
  workoutSplitSuggestions
}) => {
  return (
    <>
      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        formData={editFormData}
        onFormChange={setEditFormData}
        onNutritionChange={onEditNutritionChange}
        onStrengthChange={onEditStrengthChange}
        onAddExercise={addEditExercise}
        onRemoveExercise={removeEditExercise}
        onAddSet={addEditSet}
        onRemoveSet={removeEditSet}
        onSetChange={onEditSetChange}
        onCardioChange={onEditCardioChange}
        onAddCardio={addEditCardio}
        onRemoveCardio={removeEditCardio}
        onSubmit={onEditSubmit}
        error={editError}
        isSaving={isSavingEdit}
        exerciseSuggestions={exerciseSuggestions}
        cardioSuggestions={cardioSuggestions}
        workoutSplitSuggestions={workoutSplitSuggestions}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={onConfirmDelete}
      />
    </>
  );
};

export default DailyLogModals;
