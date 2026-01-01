import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mealsAPI, foodsAPI } from '../api';
import Modal from '../components/common/Modal';
import ProgressBar from '../components/common/ProgressBar';
import { format } from 'date-fns';

const Meals = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [meals, setMeals] = useState([]);
  const [dailyLog, setDailyLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [mealType, setMealType] = useState('breakfast');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ api: [], custom: [] });
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customFood, setCustomFood] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '' });

  useEffect(() => { loadMeals(); }, [selectedDate]);

  const loadMeals = async () => {
    try {
      setLoading(true);
      const res = await mealsAPI.getMealsByDate(selectedDate);
      setMeals(res.data.data.meals);
      setDailyLog(res.data.data.dailyLog);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) { setSearchResults({ api: [], custom: [] }); return; }
    try {
      const res = await mealsAPI.search(query);
      setSearchResults(res.data.data);
    } catch (err) { console.error(err); }
  };

  const handleSelectFood = (food) => {
    setSelectedFoods([...selectedFoods, { ...food, servingSize: 1 }]);
    setSearchQuery('');
    setSearchResults({ api: [], custom: [] });
  };

  const handleLogMeal = async () => {
    if (selectedFoods.length === 0) return;
    try {
      await mealsAPI.logMeal({
        mealType, date: selectedDate,
        foods: selectedFoods.map(f => ({ source: f.source || 'custom', apiId: f.apiId, name: f.name, servingSize: f.servingSize, servingUnit: f.servingUnit || 'serving', calories: f.calories, protein: f.protein || 0, carbs: f.carbs || 0, fat: f.fat }))
      });
      setShowModal(false);
      setSelectedFoods([]);
      loadMeals();
    } catch (err) { console.error(err); }
  };

  const handleAddCustomFood = async () => {
    try {
      const res = await foodsAPI.create({ name: customFood.name, calories: parseInt(customFood.calories), protein: parseInt(customFood.protein) || 0, carbs: parseInt(customFood.carbs) || 0, fat: parseInt(customFood.fat) });
      setSelectedFoods([...selectedFoods, { ...res.data.data, servingSize: 1 }]);
      setShowCustomModal(false);
      setCustomFood({ name: '', calories: '', protein: '', carbs: '', fat: '' });
    } catch (err) { console.error(err); }
  };

  const handleDeleteMeal = async (mealId) => {
    if (!window.confirm('Delete this meal?')) return;
    try { await mealsAPI.deleteMeal(mealId); loadMeals(); } catch (err) { console.error(err); }
  };

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
  const targets = user?.dailyTargets || {};
  const consumed = dailyLog?.consumed || { calories: 0, protein: 0, carbs: 0, fat: 0 };

  return (
    <div className="page">
      <div className="container">
        <div className="flex justify-between items-center mb-4">
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Food Log</h1>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="form-input" style={{ width: 'auto' }} />
        </div>
        <div className="card mb-4">
          <div className="macro-grid">
            <div className="macro-item"><div className="macro-value" style={{ color: 'var(--primary)' }}>{consumed.calories}</div><div className="macro-label">Calories</div><ProgressBar value={consumed.calories} max={targets.calories || 1} type="calories" showLabel={false} /></div>
            <div className="macro-item"><div className="macro-value" style={{ color: 'var(--danger)' }}>{consumed.protein}g</div><div className="macro-label">Protein</div><ProgressBar value={consumed.protein} max={targets.protein || 1} type="protein" showLabel={false} /></div>
            <div className="macro-item"><div className="macro-value" style={{ color: 'var(--warning)' }}>{consumed.carbs}g</div><div className="macro-label">Carbs</div><ProgressBar value={consumed.carbs} max={targets.carbs || 1} type="carbs" showLabel={false} /></div>
            <div className="macro-item"><div className="macro-value" style={{ color: 'var(--secondary)' }}>{consumed.fat}g</div><div className="macro-label">Fat</div><ProgressBar value={consumed.fat} max={targets.fat || 1} type="fat" showLabel={false} /></div>
          </div>
        </div>
        {loading ? <div className="loading"><div className="spinner"></div></div> : mealTypes.map(type => {
          const typeMeals = meals.filter(m => m.mealType === type);
          return (
            <div key={type} className="card meal-section">
              <div className="meal-header"><span className="meal-title">{type}</span><button className="btn btn-sm btn-primary" onClick={() => { setMealType(type); setShowModal(true); }}>+ Add</button></div>
              {typeMeals.length === 0 ? <p className="text-muted text-sm">No foods logged</p> : typeMeals.map(meal => (
                <div key={meal._id}>{meal.foods.map((food, idx) => (
                  <div key={idx} className="food-item">
                    <div><div className="food-name">{food.name}</div><div className="food-macros"><span>{Math.round(food.calories * food.servingSize)} cal</span><span>{Math.round(food.protein * food.servingSize)}p</span><span>{Math.round(food.carbs * food.servingSize)}c</span><span>{Math.round(food.fat * food.servingSize)}f</span></div></div>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteMeal(meal._id)}>×</button>
                  </div>
                ))}</div>
              ))}
            </div>
          );
        })}
        <Modal isOpen={showModal} onClose={() => { setShowModal(false); setSelectedFoods([]); }} title={`Add ${mealType}`}>
          <div className="search-container mb-4">
            <input type="text" className="form-input" placeholder="Search foods..." value={searchQuery} onChange={(e) => handleSearch(e.target.value)} />
            {(searchResults.api.length > 0 || searchResults.custom.length > 0) && (
              <div className="search-results">
                {searchResults.custom.map((food, idx) => (<div key={`c-${idx}`} className="search-result-item" onClick={() => handleSelectFood(food)}><div style={{ fontWeight: 500 }}>{food.name}</div><div className="text-sm text-muted">{food.calories} cal • Custom</div></div>))}
                {searchResults.api.map((food, idx) => (<div key={`a-${idx}`} className="search-result-item" onClick={() => handleSelectFood(food)}><div style={{ fontWeight: 500 }}>{food.name}</div><div className="text-sm text-muted">{food.brand && `${food.brand} • `}{food.calories} cal</div></div>))}
              </div>
            )}
          </div>
          <button className="btn btn-secondary btn-sm mb-4" onClick={() => setShowCustomModal(true)}>+ Add Custom Food</button>
          {selectedFoods.length > 0 && (<div className="mb-4"><h4 className="mb-2">Selected Foods</h4>{selectedFoods.map((food, idx) => (
            <div key={idx} className="food-item"><div style={{ flex: 1 }}><div className="food-name">{food.name}</div><div className="food-macros"><span>{Math.round(food.calories * food.servingSize)} cal</span></div></div>
            <input type="number" min="0.25" step="0.25" value={food.servingSize} onChange={(e) => { const u = [...selectedFoods]; u[idx].servingSize = parseFloat(e.target.value) || 1; setSelectedFoods(u); }} className="form-input" style={{ width: '60px', marginRight: '0.5rem' }} />
            <button className="btn btn-sm btn-danger" onClick={() => setSelectedFoods(selectedFoods.filter((_, i) => i !== idx))}>×</button></div>
          ))}</div>)}
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleLogMeal} disabled={selectedFoods.length === 0}>Log Meal ({selectedFoods.reduce((a, f) => a + Math.round(f.calories * f.servingSize), 0)} cal)</button>
        </Modal>
        <Modal isOpen={showCustomModal} onClose={() => setShowCustomModal(false)} title="Add Custom Food">
          <div className="form-group"><label className="form-label">Food Name</label><input type="text" className="form-input" value={customFood.name} onChange={(e) => setCustomFood({ ...customFood, name: e.target.value })} /></div>
          <div className="form-row"><div className="form-group"><label className="form-label">Calories *</label><input type="number" className="form-input" value={customFood.calories} onChange={(e) => setCustomFood({ ...customFood, calories: e.target.value })} /></div><div className="form-group"><label className="form-label">Fat (g) *</label><input type="number" className="form-input" value={customFood.fat} onChange={(e) => setCustomFood({ ...customFood, fat: e.target.value })} /></div></div>
          <div className="form-row"><div className="form-group"><label className="form-label">Protein (g)</label><input type="number" className="form-input" value={customFood.protein} onChange={(e) => setCustomFood({ ...customFood, protein: e.target.value })} /></div><div className="form-group"><label className="form-label">Carbs (g)</label><input type="number" className="form-input" value={customFood.carbs} onChange={(e) => setCustomFood({ ...customFood, carbs: e.target.value })} /></div></div>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleAddCustomFood} disabled={!customFood.name || !customFood.calories || !customFood.fat}>Add Food</button>
        </Modal>
      </div>
    </div>
  );
};

export default Meals;
