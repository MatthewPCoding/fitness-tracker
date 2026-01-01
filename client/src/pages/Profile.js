import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateProfile, updateGoal } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [profile, setProfile] = useState({ name: user?.name || '', height: user?.profile?.height || '', weight: user?.profile?.weight || '', age: user?.profile?.age || '', gender: user?.profile?.gender || 'male', activityLevel: user?.profile?.activityLevel || 'moderate' });
  const [goal, setGoal] = useState({ type: user?.goal?.type || 'maintaining', targetWeight: user?.goal?.targetWeight || '', customCalories: user?.goal?.customCalories || false, manualCalorieTarget: user?.goal?.manualCalorieTarget || '', manualProteinTarget: user?.goal?.manualProteinTarget || '', manualCarbTarget: user?.goal?.manualCarbTarget || '', manualFatTarget: user?.goal?.manualFatTarget || '' });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await updateProfile({ name: profile.name, profile: { height: parseFloat(profile.height), weight: parseFloat(profile.weight), age: parseInt(profile.age), gender: profile.gender, activityLevel: profile.activityLevel } });
    setMessage({ type: result.success ? 'success' : 'error', text: result.success ? 'Profile updated!' : result.error });
    setLoading(false);
  };

  const handleGoalUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await updateGoal({ type: goal.type, targetWeight: goal.targetWeight ? parseFloat(goal.targetWeight) : undefined, customCalories: goal.customCalories, manualCalorieTarget: goal.manualCalorieTarget ? parseInt(goal.manualCalorieTarget) : undefined, manualProteinTarget: goal.manualProteinTarget ? parseInt(goal.manualProteinTarget) : undefined, manualCarbTarget: goal.manualCarbTarget ? parseInt(goal.manualCarbTarget) : undefined, manualFatTarget: goal.manualFatTarget ? parseInt(goal.manualFatTarget) : undefined });
    setMessage({ type: result.success ? 'success' : 'error', text: result.success ? 'Goal updated!' : result.error });
    setLoading(false);
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '600px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Profile & Settings</h1>
        {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}
        <div className="card mb-4">
          <h3 className="card-title mb-4">Your Daily Targets</h3>
          <div className="macro-grid">
            <div className="macro-item"><div className="macro-value" style={{ color: 'var(--primary)' }}>{user?.dailyTargets?.calories}</div><div className="macro-label">Calories</div></div>
            <div className="macro-item"><div className="macro-value" style={{ color: 'var(--danger)' }}>{user?.dailyTargets?.protein}g</div><div className="macro-label">Protein</div></div>
            <div className="macro-item"><div className="macro-value" style={{ color: 'var(--warning)' }}>{user?.dailyTargets?.carbs}g</div><div className="macro-label">Carbs</div></div>
            <div className="macro-item"><div className="macro-value" style={{ color: 'var(--secondary)' }}>{user?.dailyTargets?.fat}g</div><div className="macro-label">Fat</div></div>
          </div>
        </div>
        <div className="card mb-4">
          <h3 className="card-title mb-4">Fitness Goal</h3>
          <form onSubmit={handleGoalUpdate}>
            <div className="form-group">
              {[{ v: 'slimming', l: '🔥 Slimming' }, { v: 'bulking', l: '💪 Bulking' }, { v: 'maintaining', l: '⚖️ Maintaining' }].map(g => (
                <label key={g.v} className="suggestion-card" style={{ cursor: 'pointer', borderColor: goal.type === g.v ? 'var(--primary)' : '', marginBottom: '0.5rem' }}><div style={{ fontWeight: 600 }}>{g.l}</div><input type="radio" value={g.v} checked={goal.type === g.v} onChange={(e) => setGoal({ ...goal, type: e.target.value })} /></label>
              ))}
            </div>
            <div className="form-group"><label className="form-label">Target Weight</label><input type="number" className="form-input" value={goal.targetWeight} onChange={(e) => setGoal({ ...goal, targetWeight: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Calorie Calculation</label><div className="flex gap-4"><label><input type="radio" checked={!goal.customCalories} onChange={() => setGoal({ ...goal, customCalories: false })} /> Auto</label><label><input type="radio" checked={goal.customCalories} onChange={() => setGoal({ ...goal, customCalories: true })} /> Manual</label></div></div>
            {goal.customCalories && (<><div className="form-row"><div className="form-group"><label className="form-label">Calories</label><input type="number" className="form-input" value={goal.manualCalorieTarget} onChange={(e) => setGoal({ ...goal, manualCalorieTarget: e.target.value })} /></div><div className="form-group"><label className="form-label">Protein</label><input type="number" className="form-input" value={goal.manualProteinTarget} onChange={(e) => setGoal({ ...goal, manualProteinTarget: e.target.value })} /></div></div><div className="form-row"><div className="form-group"><label className="form-label">Carbs</label><input type="number" className="form-input" value={goal.manualCarbTarget} onChange={(e) => setGoal({ ...goal, manualCarbTarget: e.target.value })} /></div><div className="form-group"><label className="form-label">Fat</label><input type="number" className="form-input" value={goal.manualFatTarget} onChange={(e) => setGoal({ ...goal, manualFatTarget: e.target.value })} /></div></div></>)}
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>{loading ? 'Updating...' : 'Update Goal'}</button>
          </form>
        </div>
        <div className="card">
          <h3 className="card-title mb-4">Personal Info</h3>
          <form onSubmit={handleProfileUpdate}>
            <div className="form-group"><label className="form-label">Name</label><input type="text" className="form-input" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></div>
            <div className="form-row"><div className="form-group"><label className="form-label">Height (in)</label><input type="number" className="form-input" value={profile.height} onChange={(e) => setProfile({ ...profile, height: e.target.value })} /></div><div className="form-group"><label className="form-label">Weight (lbs)</label><input type="number" className="form-input" value={profile.weight} onChange={(e) => setProfile({ ...profile, weight: e.target.value })} /></div></div>
            <div className="form-row"><div className="form-group"><label className="form-label">Age</label><input type="number" className="form-input" value={profile.age} onChange={(e) => setProfile({ ...profile, age: e.target.value })} /></div><div className="form-group"><label className="form-label">Gender</label><select className="form-select" value={profile.gender} onChange={(e) => setProfile({ ...profile, gender: e.target.value })}><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div></div>
            <div className="form-group"><label className="form-label">Activity</label><select className="form-select" value={profile.activityLevel} onChange={(e) => setProfile({ ...profile, activityLevel: e.target.value })}><option value="sedentary">Sedentary</option><option value="light">Light</option><option value="moderate">Moderate</option><option value="active">Active</option><option value="very_active">Very Active</option></select></div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>{loading ? 'Updating...' : 'Update Profile'}</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
