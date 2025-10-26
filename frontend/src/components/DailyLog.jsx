import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Calendar, ChevronDown, Trash2, Edit, Dumbbell, Zap, Coffee, Utensils, AlertCircle } from 'lucide-react';
import AutocompleteInput from './AutocompleteInput'; // We assume this component exists in the same folder

const LOGS_API_URL = `${import.meta.env.VITE_API_URL}/logs`;

// --- Helper Functions ---
const getStartOfWeek = (date) => {
    const d = new Date(date);
    d.setDate(d.getDate() - d.getDay()); // Set to Sunday
    d.setHours(0, 0, 0, 0);
    return d;
};

const groupLogsByWeek = (logs) => {
    const grouped = logs.reduce((acc, log) => {
        const weekStartDate = getStartOfWeek(log.date);
        const weekKey = weekStartDate.toISOString();
        if (!acc[weekKey]) acc[weekKey] = [];
        acc[weekKey].push(log);
        return acc;
    }, {});
    // Sort weeks with newest first
    return Object.entries(grouped).sort((a, b) => new Date(b[0]) - new Date(a[0]));
};

const formatWeekHeader = (weekKey, index) => {
    const today = new Date();
    const currentWeekStart = getStartOfWeek(today).toISOString();
    if (weekKey === currentWeekStart) return "This Week";
    if (index === 1) return "Last Week";
    return `Week of ${new Date(weekKey).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}`;
};
// --- End Helper Functions ---

// Initial state for both Add and Edit forms
const initialFormData = {
    weight: '',
    calorieIntake: '',
    proteinIntake: '',
    workoutSplit: '',
    strengthExercises: [], // Start empty
    cardioExercises: [],  // Start empty
};

// --- Main Component ---
export default function DailyLog({ strengthNameSuggestions = [], cardioNameSuggestions = [] }) {
    const [logs, setLogs] = useState([]);
    const [formData, setFormData] = useState(initialFormData);
    const [error, setError] = useState('');
    const [formErrors, setFormErrors] = useState({}); // For inline validation
    const [loading, setLoading] = useState(true);
    const [activeWeekKey, setActiveWeekKey] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [logToDelete, setLogToDelete] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [logToEdit, setLogToEdit] = useState(null);
    const [editFormData, setEditFormData] = useState(initialFormData);
    const [editError, setEditError] = useState('');
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    const weeklyLogs = groupLogsByWeek(logs);

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            try {
                const res = await axios.get(LOGS_API_URL);
                setLogs(res.data);
                const grouped = groupLogsByWeek(res.data);
                if (grouped.length > 0 && !activeWeekKey) {
                    setActiveWeekKey(grouped[0][0]);
                }
            } catch (err) { setError('Could not fetch log history.'); }
            setLoading(false);
        };
        fetchLogs();
    }, []);

    // --- Add Form Handlers ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };
    
    const handleStrengthChange = (exIndex, field, value) => {
        const updated = [...formData.strengthExercises];
        updated[exIndex][field] = value;
        setFormData(prev => ({ ...prev, strengthExercises: updated }));
    };
    const handleSetChange = (exIndex, setIndex, field, value) => {
        const updated = [...formData.strengthExercises];
        updated[exIndex].sets[setIndex][field] = value;
        setFormData(prev => ({ ...prev, strengthExercises: updated }));
    };
    const addExercise = () => setFormData(prev => ({ ...prev, strengthExercises: [...prev.strengthExercises, { name: '', sets: [{ reps: '', weight: '' }] }] }));
    const removeExercise = (exIndex) => setFormData(prev => ({ ...prev, strengthExercises: prev.strengthExercises.filter((_, i) => i !== exIndex) }));
    const addSet = (exIndex) => {
        const updated = [...formData.strengthExercises];
        updated[exIndex].sets.push({ reps: '', weight: '' });
        setFormData(prev => ({ ...prev, strengthExercises: updated }));
    };
    const removeSet = (exIndex, setIndex) => {
        const updated = [...formData.strengthExercises];
        updated[exIndex].sets = updated[exIndex].sets.filter((_, i) => i !== setIndex);
        setFormData(prev => ({ ...prev, strengthExercises: updated }));
    };
    const handleCardioChange = (index, field, value) => {
        const updated = [...formData.cardioExercises];
        updated[index][field] = value;
        setFormData(prev => ({ ...prev, cardioExercises: updated }));
    };
    const addCardio = () => setFormData(prev => ({ ...prev, cardioExercises: [...prev.cardioExercises, { type: '', duration: '' }] }));
    const removeCardio = (index) => setFormData(prev => ({ ...prev, cardioExercises: prev.cardioExercises.filter((_, i) => i !== index) }));

    // --- Submit Add Form (with custom validation) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setFormErrors({});

        // Custom Validation
        const newErrors = {};
        if (!formData.weight) newErrors.weight = 'Weight is required.';
        if (!formData.calorieIntake) newErrors.calorieIntake = 'Calories are required.';
        if (!formData.proteinIntake) newErrors.proteinIntake = 'Protein is required.';

        if (Object.keys(newErrors).length > 0) {
            setFormErrors(newErrors);
            setError('Please fill out all required nutrition fields.');
            return;
        }

        try {
            const filteredStrength = formData.strengthExercises
                .map(ex => ({ ...ex, sets: ex.sets.filter(s => s.reps && s.weight) }))
                .filter(ex => ex.name && ex.sets.length > 0);
            const filteredCardio = formData.cardioExercises.filter(c => c.type && c.duration);

            const payload = {
                weight: formData.weight,
                calorieIntake: formData.calorieIntake,
                proteinIntake: formData.proteinIntake,
                workoutSplit: formData.workoutSplit && filteredStrength.length > 0 ? formData.workoutSplit : undefined,
                strengthExercises: filteredStrength.length > 0 ? filteredStrength : undefined,
                cardioExercises: filteredCardio.length > 0 ? filteredCardio : undefined,
            };

            await axios.post(LOGS_API_URL, payload);
            const res = await axios.get(LOGS_API_URL);
            setLogs(res.data);
            setFormData(initialFormData);
            setFormErrors({});
        } catch (err) {
            setError(err.response?.data?.msg || 'Could not save log entry.');
        }
    };

    // --- History Accordion Toggle ---
    const handleWeekToggle = (weekKey) => {
        setActiveWeekKey(prevKey => (prevKey === weekKey ? null : weekKey));
    };

    // --- Delete Log Handlers (with custom modal) ---
    const handleDeleteLogClick = (logId) => {
        setLogToDelete(logId);
        setIsDeleteModalOpen(true);
    };
    const handleConfirmDelete = async () => {
        if (!logToDelete) return;
        try {
            await axios.delete(`${LOGS_API_URL}/${logToDelete}`);
            setLogs(currentLogs => currentLogs.filter(log => log._id !== logToDelete));
            setError('');
        } catch (err) {
            setError('Failed to delete log entry. Please try again.');
        } finally {
            setIsDeleteModalOpen(false);
            setLogToDelete(null);
        }
    };

    // --- Edit Modal Handlers ---
    const handleEditLogClick = (log) => {
        setLogToEdit(log);
        const deepCopyStrength = log.strengthExercises?.map(ex => ({...ex, sets: ex.sets.map(s => ({...s}))})) || [];
        const deepCopyCardio = log.cardioExercises?.map(c => ({...c})) || [];
        setEditFormData({
            weight: log.weight || '',
            calorieIntake: log.calorieIntake || '',
            proteinIntake: log.proteinIntake || '',
            workoutSplit: log.workoutSplit || '',
            strengthExercises: deepCopyStrength.length > 0 ? deepCopyStrength : [],
            cardioExercises: deepCopyCardio.length > 0 ? deepCopyCardio : [],
        });
        setEditError('');
        setIsEditModalOpen(true);
    };

    const handleEditChange = (e) => setEditFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleEditStrengthChange = (exIndex, field, value) => {
        setEditFormData(prev => {
            const updated = [...prev.strengthExercises];
            updated[exIndex] = { ...updated[exIndex], [field]: value };
            return { ...prev, strengthExercises: updated };
        });
    };
    const handleEditSetChange = (exIndex, setIndex, field, value) => {
        setEditFormData(prev => {
            const updated = [...prev.strengthExercises];
            if (updated[exIndex]?.sets?.[setIndex]) {
                 updated[exIndex].sets[setIndex] = { ...updated[exIndex].sets[setIndex], [field]: value };
            }
            return { ...prev, strengthExercises: updated };
        });
    };
    const addEditExercise = () => setEditFormData(prev => ({ ...prev, strengthExercises: [...prev.strengthExercises, { name: '', sets: [{ reps: '', weight: '' }] }] }));
    const removeEditExercise = (exIndex) => setEditFormData(prev => ({ ...prev, strengthExercises: prev.strengthExercises.filter((_, i) => i !== exIndex) }));
    const addEditSet = (exIndex) => {
        setEditFormData(prev => {
            const updated = [...prev.strengthExercises];
             if (updated[exIndex]?.sets) {
                updated[exIndex].sets = [...updated[exIndex].sets, { reps: '', weight: '' }];
             }
             return { ...prev, strengthExercises: updated };
        });
    };
    const removeEditSet = (exIndex, setIndex) => {
         setEditFormData(prev => {
            const updated = [...prev.strengthExercises];
             if (updated[exIndex]?.sets) {
                updated[exIndex].sets = updated[exIndex].sets.filter((_, i) => i !== setIndex);
             }
             return { ...prev, strengthExercises: updated };
         });
    };
    const handleEditCardioChange = (index, field, value) => {
        setEditFormData(prev => {
            const updated = [...prev.cardioExercises];
             if (updated[index]) {
                updated[index] = { ...updated[index], [field]: value };
             }
             return { ...prev, cardioExercises: updated };
        });
    };
    const addEditCardio = () => setEditFormData(prev => ({ ...prev, cardioExercises: [...prev.cardioExercises, { type: '', duration: '' }] }));
    const removeEditCardio = (index) => setEditFormData(prev => ({ ...prev, cardioExercises: prev.cardioExercises.filter((_, i) => i !== index) }));

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!logToEdit) return;
        setIsSavingEdit(true);
        setEditError('');

        // Custom Validation for Edit
        if (!editFormData.weight || !editFormData.calorieIntake || !editFormData.proteinIntake) {
            setEditError('Please fill out all required nutrition fields.');
            setIsSavingEdit(false);
            return;
        }

        try {
            const filteredStrength = editFormData.strengthExercises.map(ex => ({ ...ex, sets: ex.sets.filter(s => s.reps && s.weight) })).filter(ex => ex.name && ex.sets.length > 0);
            const filteredCardio = editFormData.cardioExercises.filter(c => c.type && c.duration);
            const payload = {
                weight: editFormData.weight,
                calorieIntake: editFormData.calorieIntake,
                proteinIntake: editFormData.proteinIntake,
                workoutSplit: editFormData.workoutSplit && filteredStrength.length > 0 ? editFormData.workoutSplit : undefined,
                strengthExercises: filteredStrength.length > 0 ? filteredStrength : undefined,
                cardioExercises: filteredCardio.length > 0 ? filteredCardio : undefined,
            };
            const res = await axios.put(`${LOGS_API_URL}/${logToEdit._id}`, payload);
            setLogs(currentLogs => currentLogs.map(log => log._id === logToEdit._id ? res.data : log));
            setIsEditModalOpen(false);
            setLogToEdit(null);
            setEditError('');
        } catch (err) {
            setEditError(err.response?.data?.msg || 'Failed to update log entry. Ensure all fields are valid.');
        } finally {
            setIsSavingEdit(false);
        }
    };

    // --- RENDER SECTION ---
    return (
        <>
            <div className="p-4 space-y-8 bg-white border rounded-lg shadow-sm sm:p-6">
                <h2 className="text-xl font-semibold text-gray-800">Log Today's Progress</h2>

                {/* --- ADD LOG FORM --- */}
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                    {/* --- Nutrition Section --- */}
                    <section>
                        <h3 className="flex items-center gap-2 mb-3 text-lg font-medium text-gray-700">
                           <Utensils size={20} className="text-orange-500"/> Nutrition (Required)
                        </h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                                <input name="weight" type="number" step="0.1" value={formData.weight} onChange={handleChange} className={`w-full px-3 py-2 mt-1 border rounded-md ${formErrors.weight ? 'border-red-500' : 'border-gray-300'}`}/>
                                {formErrors.weight && <p className="flex items-center gap-1 mt-1 text-sm text-red-600"><AlertCircle size={14} /> {formErrors.weight}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Calories (kcal)</label>
                                <input name="calorieIntake" type="number" value={formData.calorieIntake} onChange={handleChange} className={`w-full px-3 py-2 mt-1 border rounded-md ${formErrors.calorieIntake ? 'border-red-500' : 'border-gray-300'}`}/>
                                {formErrors.calorieIntake && <p className="flex items-center gap-1 mt-1 text-sm text-red-600"><AlertCircle size={14} /> {formErrors.calorieIntake}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Protein (g)</label>
                                <input name="proteinIntake" type="number" value={formData.proteinIntake} onChange={handleChange} className={`w-full px-3 py-2 mt-1 border rounded-md ${formErrors.proteinIntake ? 'border-red-500' : 'border-gray-300'}`}/>
                                {formErrors.proteinIntake && <p className="flex items-center gap-1 mt-1 text-sm text-red-600"><AlertCircle size={14} /> {formErrors.proteinIntake}</p>}
                            </div>
                        </div>
                    </section>
                    <hr className="border-gray-200"/>
                    
                    {/* --- Workout Section (Always Visible) --- */}
                    <section>
                         <h3 className="flex items-center gap-2 mb-3 text-lg font-medium text-gray-700">
                           <Dumbbell size={20} className="text-blue-500"/> Workout Details (Optional)
                        </h3>
                        <div className="p-4 space-y-4 border rounded-md bg-gray-50/70">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Workout Split</label>
                                <input name="workoutSplit" type="text" placeholder="e.g., Push, Pull, Legs, Full Body" value={formData.workoutSplit} onChange={handleChange} className="w-full px-3 py-2 mt-1 border rounded-md" autoComplete="off"/>
                            </div>
                            {formData.strengthExercises.length === 0 && (
                                 <button type="button" onClick={addExercise} className="flex items-center justify-center w-full gap-2 py-3 text-sm font-medium text-gray-500 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 hover:text-gray-700 transition-colors">
                                     <PlusCircle size={16} />
                                     Add First Exercise
                                 </button>
                            )}
                            {formData.strengthExercises.map((ex, exIndex) => (
                                <div key={exIndex} className="p-3 space-y-2 border rounded bg-white shadow-sm">
                                    <div className="flex justify-between items-center">
                                        <AutocompleteInput 
                                            value={ex.name}
                                            onChange={(value) => handleStrengthChange(exIndex, 'name', value)}
                                            suggestions={strengthNameSuggestions}
                                            placeholder={`Exercise ${exIndex + 1} Name`}
                                        />
                                        <button type="button" onClick={() => removeExercise(exIndex)} className="ml-2 p-1 text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                                    </div>
                                    {ex.sets.map((set, setIndex) => (
                                         <div key={setIndex} className="flex items-center gap-2 pl-2"><span className="text-sm font-semibold text-gray-500 w-10">Set {setIndex + 1}:</span><input type="number" placeholder="Reps" value={set.reps} onChange={(e) => handleSetChange(exIndex, setIndex, 'reps', e.target.value)} className="w-20 px-2 py-1 border rounded text-sm"/><input type="number" step="0.1" placeholder="Weight" value={set.weight} onChange={(e) => handleSetChange(exIndex, setIndex, 'weight', e.target.value)} className="w-20 px-2 py-1 border rounded text-sm"/><span className="text-sm text-gray-500">kg</span>{ex.sets.length > 1 && <button type="button" onClick={() => removeSet(exIndex, setIndex)} className="text-red-500 hover:text-red-700 ml-auto p-1 rounded-full hover:bg-red-50"><Trash2 size={14}/></button>}</div>
                                    ))}
                                    <button type="button" onClick={() => addSet(exIndex)} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors">
                                        <PlusCircle size={14} /> Add Set
                                    </button>
                                </div>
                            ))}
                            {formData.strengthExercises.length > 0 && (
                                <button type="button" onClick={addExercise} className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors">
                                    <PlusCircle size={14} /> Add Another Exercise
                                </button>
                            )}
                        </div>
                    </section>
                    <hr className="border-gray-200"/>
                    
                    {/* --- Cardio Section (Always Visible) --- */}
                    <section>
                         <h3 className="flex items-center gap-2 mb-3 text-lg font-medium text-gray-700">
                           <Zap size={20} className="text-green-500"/> Cardio Details (Optional)
                        </h3>
                         <div className="p-4 space-y-3 border rounded-md bg-gray-50/70">
                             {formData.cardioExercises.length === 0 && (
                                <button type="button" onClick={addCardio} className="flex items-center justify-center w-full gap-2 py-3 text-sm font-medium text-gray-500 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 hover:text-gray-700 transition-colors">
                                    <PlusCircle size={16} />
                                    Add First Cardio Activity
                                </button>
                             )}
                             {formData.cardioExercises.map((cardio, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <AutocompleteInput 
                                        value={cardio.type}
                                        onChange={(value) => handleCardioChange(index, 'type', value)}
                                        suggestions={cardioNameSuggestions}
                                        placeholder="Cardio Type (e.g., Run, Bike)"
                                    />
                                    <input type="number" placeholder="Mins" value={cardio.duration} onChange={(e) => handleCardioChange(index, 'duration', e.target.value)} className="w-20 px-2 py-1 border rounded text-sm"/>
                                    <button type="button" onClick={() => removeCardio(index)} className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50"><Trash2 size={16}/></button>
                                </div>
                             ))}
                              {formData.cardioExercises.length > 0 && (
                                <button type="button" onClick={addCardio} className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors">
                                    <PlusCircle size={14} /> Add Another Cardio
                                </button>
                              )}
                         </div>
                    </section>
                    
                    {/* Submit Button */}
                    <div className="pt-4 border-t">
                        <button type="submit" className="flex items-center justify-center w-full gap-2 px-4 py-2 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors">
                            <PlusCircle size={18} /> Save Today's Log
                        </button>
                        {error && <p className="mt-2 text-sm text-red-600 text-center">{error}</p>}
                    </div>
                </form>
                {/* --- END ADD LOG FORM --- */}

                {/* --- HISTORY SECTION --- */}
                <div className="mt-12">
                     <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">History</h3>
                    {loading ? <p className="p-4 text-center text-gray-500">Loading history...</p> :
                     weeklyLogs.length === 0 ? <p className="p-4 mt-2 text-center text-gray-500 bg-gray-50 rounded-md">No logs yet.</p> :
                     <div className="mt-4 space-y-3">
                        {weeklyLogs.map(([weekKey, weekLogs], index) => {
                            const isOpen = activeWeekKey === weekKey;
                            return (
                                <div key={weekKey} className="overflow-hidden border rounded-lg bg-gray-50/50 shadow-sm animate-in fade-in">
                                    <button onClick={() => handleWeekToggle(weekKey)} className="flex items-center justify-between w-full p-4 text-left hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300">
                                        <div className="flex items-center gap-3"><Calendar size={18} className="text-gray-500" /><span className="font-semibold text-gray-800">{formatWeekHeader(weekKey, index)}</span></div>
                                        <ChevronDown size={20} className={`text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    <div style={{ maxHeight: isOpen ? '5000px' : '0px', transition: 'max-height 0.7s ease-in-out' }} className={`overflow-hidden border-t border-gray-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
                                        <ul className="divide-y divide-gray-100">
                                            {weekLogs.sort((a,b) => new Date(b.date) - new Date(a.date)).map(log => {
                                                const isRestDay = (!log.strengthExercises || log.strengthExercises.length === 0) && (!log.cardioExercises || log.cardioExercises.length === 0);
                                                return (
                                                    <li key={log._id} className="p-4 bg-white shadow-sm transition-colors hover:bg-gray-50">
                                                        <div className="flex items-center justify-between">
                                                            <div className="font-semibold text-gray-900 text-lg">{new Date(log.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</div>
                                                            <div className="flex items-center gap-2">
                                                                <button onClick={() => handleEditLogClick(log)} title="Edit" className="p-1 text-gray-400 hover:text-blue-600"><Edit size={16} /></button>
                                                                <button onClick={() => handleDeleteLogClick(log._id)} title="Delete" className="p-1 text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="mt-4">
                                                            <h4 className="flex items-center gap-2 text-sm font-semibold text-orange-600"><Utensils size={14} /> Nutrition</h4>
                                                            <div className="grid grid-cols-3 gap-4 p-3 mt-2 text-sm text-gray-600 bg-gray-50 rounded-md">
                                                                <div><span className="block text-xs text-gray-500">Weight</span> <span className="font-medium text-gray-800">{log.weight}</span> kg</div>
                                                                <div><span className="block text-xs text-gray-500">Calories</span> <span className="font-medium text-gray-800">{log.calorieIntake}</span> kcal</div>
                                                                <div><span className="block text-xs text-gray-500">Protein</span> <span className="font-medium text-gray-800">{log.proteinIntake}</span> g</div>
                                                            </div>
                                                        </div>

                                                        {log.strengthExercises && log.strengthExercises.length > 0 && (
                                                            <div className="mt-4">
                                                                <h4 className="flex items-center gap-2 text-sm font-semibold text-blue-600"><Dumbbell size={14} /> Workout</h4>
                                                                <div className="p-3 mt-2 text-gray-600 bg-gray-50 rounded-md">
                                                                    <div className="text-sm font-medium text-gray-800">{log.workoutSplit || 'Strength Training'}</div>
                                                                    <ul className="mt-2 text-xs list-disc list-inside space-y-1">
                                                                        {log.strengthExercises.map((ex, i) => (
                                                                            <li key={i}><span className="font-medium text-gray-700">{ex.name}:</span> {ex.sets.map(s => `${s.weight}kg x ${s.reps}reps`).join(', ')}</li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {log.cardioExercises && log.cardioExercises.length > 0 && (
                                                            <div className="mt-4">
                                                                <h4 className="flex items-center gap-2 text-sm font-semibold text-green-600"><Zap size={14} /> Cardio</h4>
                                                                <div className="p-3 mt-2 text-gray-600 bg-gray-50 rounded-md">
                                                                    <ul className="text-xs list-disc list-inside space-y-1">
                                                                        {log.cardioExercises.map((ex, i) => (
                                                                            <li key={i}><span className="font-medium text-gray-700">{ex.type}:</span> {ex.duration} minutes</li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {isRestDay && (
                                                            <div className="mt-4">
                                                                <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-500"><Coffee size={14} /> Activity</h4>
                                                                <div className="p-3 mt-2 text-sm text-gray-700 bg-gray-50 rounded-md">Rest Day</div>
                                                            </div>
                                                        )}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                </div>
                            )
                        })}
                     </div>
                    }
                </div>
            </div>

            {/* --- CUSTOM Delete Confirmation Modal --- */}
            {isDeleteModalOpen && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 animate-in fade-in">
                    <div className="w-full max-w-sm p-6 mx-4 bg-white rounded-lg shadow-xl animate-in fade-in slide-up">
                        <h2 className="text-lg font-bold text-gray-900">Delete Log Entry?</h2>
                        <p className="mt-2 text-sm text-gray-600">Are you sure you want to permanently delete this log entry? This action cannot be undone.</p>
                        <div className="flex justify-end gap-4 mt-6">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
                            <button onClick={handleConfirmDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">Yes, Delete</button>
                        </div>
                    </div>
                 </div>
             )}

            {/* --- CUSTOM Edit Log Modal --- */}
            {isEditModalOpen && logToEdit && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 animate-in fade-in">
                    <div className="w-full max-w-3xl p-6 mx-4 bg-white rounded-lg shadow-xl animate-in fade-in slide-up max-h-[90vh] overflow-y-auto">
                        <h2 className="text-lg font-bold text-gray-900">Edit Log for {new Date(logToEdit.date).toLocaleDateString()}</h2>
                        {editError && <p className="mt-2 text-sm text-red-600">{editError}</p>}
                        <form onSubmit={handleEditSubmit} className="mt-4 space-y-6">
                             {/* Edit Nutrition Section */}
                             <section><h3 className="flex items-center gap-2 mb-3 text-lg font-medium text-gray-700"><Utensils size={20}/> Nutrition</h3>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <div><label className="block text-sm font-medium text-gray-700">Weight (kg)</label><input type="number" step="0.1" name="weight" value={editFormData.weight} onChange={handleEditChange} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"/></div>
                                    <div><label className="block text-sm font-medium text-gray-700">Calories (kcal)</label><input type="number" name="calorieIntake" value={editFormData.calorieIntake} onChange={handleEditChange} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"/></div>
                                    <div><label className="block text-sm font-medium text-gray-700">Protein (g)</label><input type="number" name="proteinIntake" value={editFormData.proteinIntake} onChange={handleEditChange} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"/></div>
                                </div>
                             </section>
                             <hr className="border-gray-200"/>
                             {/* Edit Workout Section */}
                             <section><h3 className="flex items-center gap-2 mb-3 text-lg font-medium text-gray-700"><Dumbbell size={20}/> Workout (Optional)</h3>
                                <div className="p-4 space-y-4 border rounded-md bg-gray-50/70">
                                    <div><label className="block text-sm font-medium text-gray-700">Workout Split</label><input name="workoutSplit" type="text" placeholder="e.g., Push, Pull, Legs" value={editFormData.workoutSplit} onChange={handleEditChange} className="w-full px-3 py-2 mt-1 border rounded-md" autoComplete="off"/></div>
                                    {editFormData.strengthExercises.length === 0 && (<button type="button" onClick={addEditExercise} className="flex items-center justify-center w-full gap-2 py-3 text-sm font-medium text-gray-500 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 hover:text-gray-700 transition-colors"><PlusCircle size={16} /> Add First Exercise</button>)}
                                    {editFormData.strengthExercises.map((ex, exIndex) => (
                                        <div key={exIndex} className="p-3 space-y-2 border rounded bg-white shadow-sm">
                                            <div className="flex justify-between items-center">
                                                <AutocompleteInput 
                                                    value={ex.name}
                                                    onChange={(value) => handleEditStrengthChange(exIndex, 'name', value)}
                                                    suggestions={strengthNameSuggestions}
                                                    placeholder={`Exercise ${exIndex + 1} Name`}
                                                />
                                                <button type="button" onClick={() => removeEditExercise(exIndex)} className="ml-2 p-1 text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                                            </div>
                                            {ex.sets.map((set, setIndex) => (
                                                 <div key={setIndex} className="flex items-center gap-2 pl-2"><span className="text-sm font-semibold text-gray-500 w-10">Set {setIndex + 1}:</span><input type="number" placeholder="Reps" value={set.reps} onChange={(e) => handleEditSetChange(exIndex, setIndex, 'reps', e.target.value)} className="w-20 px-2 py-1 border rounded text-sm"/><input type="number" step="0.1" placeholder="Weight" value={set.weight} onChange={(e) => handleEditSetChange(exIndex, setIndex, 'weight', e.target.value)} className="w-20 px-2 py-1 border rounded text-sm"/><span className="text-sm text-gray-500">kg</span>{ex.sets.length > 1 && <button type="button" onClick={() => removeEditSet(exIndex, setIndex)} className="text-red-500 hover:text-red-700 ml-auto p-1 rounded-full hover:bg-red-50"><Trash2 size={14}/></button>}</div>
                                            ))}
                                            <button type="button" onClick={() => addEditSet(exIndex)} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors">
                                                <PlusCircle size={14} /> Add Set
                                            </button>
                                        </div>
                                    ))}
                                    {editFormData.strengthExercises.length > 0 && (
                                        <button type="button" onClick={addEditExercise} className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors">
                                            <PlusCircle size={14} /> Add Another Exercise
                                        </button>
                                    )}
                                </div>
                             </section>
                              <hr className="border-gray-200"/>
                             {/* Edit Cardio Section */}
                             <section><h3 className="flex items-center gap-2 mb-3 text-lg font-medium text-gray-700"><Zap size={20}/> Cardio (Optional)</h3>
                                <div className="p-4 space-y-3 border rounded-md bg-gray-50/70">
                                    {editFormData.cardioExercises.length === 0 && (<button type="button" onClick={addEditCardio} className="flex items-center justify-center w-full gap-2 py-3 text-sm font-medium text-gray-500 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 hover:text-gray-700 transition-colors"><PlusCircle size={16} /> Add First Cardio Activity</button>)}
                                     {editFormData.cardioExercises.map((cardio, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <AutocompleteInput 
                                                value={cardio.type}
                                                onChange={(value) => handleEditCardioChange(index, 'type', value)}
                                                suggestions={cardioNameSuggestions}
                                                placeholder="Cardio Type (e.g., Run)"
                                            />
                                            <input type="number" placeholder="Mins" value={cardio.duration} onChange={(e) => handleEditCardioChange(index, 'duration', e.target.value)} className="w-20 px-2 py-1 border rounded text-sm"/>
                                            <button type="button" onClick={() => removeEditCardio(index)} className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50"><Trash2 size={16}/></button>
                                        </div>
                                     ))}
                                     {editFormData.cardioExercises.length > 0 && (
                                        <button type="button" onClick={addEditCardio} className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors">
                                            <PlusCircle size={14} /> Add Another Cardio
                                        </button>
                                     )}
                                </div>
                             </section>
                            {/* Modal Action Buttons */}
                            <div className="flex justify-end gap-4 pt-4 border-t">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
                                <button type="submit" disabled={isSavingEdit} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300">
                                    {isSavingEdit ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                 </div>
             )}
        </>
    );
}

// This helper component is no longer used in this file as it was related to the old 'dayType' logic
// const DayTypeRadio = ({ value, label, icon, checked, onChange }) => ( ... );