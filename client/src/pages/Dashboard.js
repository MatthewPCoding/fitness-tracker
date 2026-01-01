import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { statsAPI, mealsAPI } from '../api';
import ProgressBar from '../components/common/ProgressBar';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    try {
      const [dashRes, suggestRes] = await Promise.all([statsAPI.getDashboard(), mealsAPI.getSuggestions()]);
      setDashboard(dashRes.data.data);
      setSuggestions(suggestRes.data.data.suggestions);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  const { today, targets, goal, streak, weight } = dashboard || {};
  const consumed = today?.consumed || { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const remaining = today?.remaining || targets;

  return (
    <div className="page">
      <div className="container">
        <div className="flex justify-between items-center mb-4">
          <div><h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Hey, {user?.name?.split(' ')[0]}! 👋</h1><p className="text-muted">Let's crush your goals today</p></div>
          <span className={`goal-badge ${goal?.type}`}>{goal?.type}</span>
        </div>
        <div className="dashboard-grid">
          <div className="card">
            <div className="card-header"><span className="card-title">Today's Calories</span><span className="text-muted">{remaining?.calories || 0} left</span></div>
            <div style={{ textAlign: 'center', margin: '1.5rem 0' }}><div className="stat-value">{consumed.calories}</div><div className="text-muted">of {targets?.calories || 0} kcal</div></div>
            <ProgressBar value={consumed.calories} max={targets?.calories || 1} type="calories" showLabel={false} />
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title">Macros</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div><div className="flex justify-between text-sm mb-1"><span>🥩 Protein</span><span>{consumed.protein}g / {targets?.protein}g</span></div><ProgressBar value={consumed.protein} max={targets?.protein || 1} type="protein" showLabel={false} /></div>
              <div><div className="flex justify-between text-sm mb-1"><span>🍞 Carbs</span><span>{consumed.carbs}g / {targets?.carbs}g</span></div><ProgressBar value={consumed.carbs} max={targets?.carbs || 1} type="carbs" showLabel={false} /></div>
              <div><div className="flex justify-between text-sm mb-1"><span>🥑 Fat</span><span>{consumed.fat}g / {targets?.fat}g</span></div><ProgressBar value={consumed.fat} max={targets?.fat || 1} type="fat" showLabel={false} /></div>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title">Your Stats</span></div>
            <div className="macro-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              <div className="macro-item"><div className="macro-value">🔥 {streak || 0}</div><div className="macro-label">Streak</div></div>
              <div className="macro-item"><div className="macro-value">{weight?.current || '-'}</div><div className="macro-label">Current</div></div>
              <div className="macro-item"><div className="macro-value" style={{ color: weight?.change < 0 ? 'var(--secondary)' : 'var(--danger)' }}>{weight?.change > 0 ? '+' : ''}{weight?.change?.toFixed(1) || '0'}</div><div className="macro-label">Change</div></div>
              <div className="macro-item"><div className="macro-value">{weight?.target || '-'}</div><div className="macro-label">Target</div></div>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title">Quick Actions</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link to="/meals" className="btn btn-primary" style={{ width: '100%' }}>➕ Log a Meal</Link>
              <Link to="/progress" className="btn btn-secondary" style={{ width: '100%' }}>📊 View Progress</Link>
              <Link to="/profile" className="btn btn-secondary" style={{ width: '100%' }}>⚙️ Update Goals</Link>
            </div>
          </div>
        </div>
        {suggestions.length > 0 && (
          <div className="card mt-4">
            <div className="card-header"><span className="card-title">💡 Suggested Foods</span></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.75rem' }}>
              {suggestions.slice(0, 6).map((food, idx) => (
                <div key={idx} className="suggestion-card"><div><div style={{ fontWeight: 500 }}>{food.name}</div><div className="text-sm text-muted">{food.calories} cal • {food.protein}p • {food.carbs}c • {food.fat}f</div></div></div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
