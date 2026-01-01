import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '', password: '', confirmPassword: '', name: '',
    height: '', weight: '', age: '', gender: 'male', activityLevel: 'moderate',
    goalType: 'maintaining', targetWeight: '', customCalories: false,
    manualCalorieTarget: '', manualProteinTarget: '', manualCarbTarget: '', manualFatTarget: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.email || !formData.password || !formData.name) { setError('Please fill in all fields'); return; }
      if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
      if (formData.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    }
    setError('');
    setStep(step + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const userData = {
      email: formData.email, password: formData.password, name: formData.name,
      profile: { height: parseFloat(formData.height), weight: parseFloat(formData.weight), age: parseInt(formData.age), gender: formData.gender, activityLevel: formData.activityLevel },
      goal: { type: formData.goalType, targetWeight: formData.targetWeight ? parseFloat(formData.targetWeight) : undefined, customCalories: formData.customCalories,
        manualCalorieTarget: formData.manualCalorieTarget ? parseInt(formData.manualCalorieTarget) : undefined,
        manualProteinTarget: formData.manualProteinTarget ? parseInt(formData.manualProteinTarget) : undefined,
        manualCarbTarget: formData.manualCarbTarget ? parseInt(formData.manualCarbTarget) : undefined,
        manualFatTarget: formData.manualFatTarget ? parseInt(formData.manualFatTarget) : undefined }
    };
    const result = await register(userData);
    if (result.success) navigate('/');
    else setError(result.error);
    setLoading(false);
  };

  return (
    <div className="auth-container" style={{ maxWidth: '500px' }}>
      <div className="auth-card">
        <h1 className="auth-title">🏋️ Create Account</h1>
        <p className="text-center text-muted mb-4">Step {step} of 4</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          {step === 1 && (<>
            <div className="form-group"><label className="form-label">Name</label><input type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} required /></div>
            <div className="form-group"><label className="form-label">Email</label><input type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} required /></div>
            <div className="form-group"><label className="form-label">Password</label><input type="password" name="password" className="form-input" value={formData.password} onChange={handleChange} required /></div>
            <div className="form-group"><label className="form-label">Confirm Password</label><input type="password" name="confirmPassword" className="form-input" value={formData.confirmPassword} onChange={handleChange} required /></div>
            <button type="button" onClick={nextStep} className="btn btn-primary" style={{ width: '100%' }}>Next</button>
          </>)}
          {step === 2 && (<>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Height (inches)</label><input type="number" name="height" className="form-input" value={formData.height} onChange={handleChange} required /></div>
              <div className="form-group"><label className="form-label">Weight (lbs)</label><input type="number" name="weight" className="form-input" value={formData.weight} onChange={handleChange} required /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Age</label><input type="number" name="age" className="form-input" value={formData.age} onChange={handleChange} required /></div>
              <div className="form-group"><label className="form-label">Gender</label><select name="gender" className="form-select" value={formData.gender} onChange={handleChange}><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
            </div>
            <div className="form-group"><label className="form-label">Activity Level</label><select name="activityLevel" className="form-select" value={formData.activityLevel} onChange={handleChange}><option value="sedentary">Sedentary</option><option value="light">Light (1-3 days/week)</option><option value="moderate">Moderate (3-5 days/week)</option><option value="active">Active (6-7 days/week)</option><option value="very_active">Very Active</option></select></div>
            <div className="flex gap-2"><button type="button" onClick={() => setStep(1)} className="btn btn-secondary" style={{ flex: 1 }}>Back</button><button type="button" onClick={nextStep} className="btn btn-primary" style={{ flex: 1 }}>Next</button></div>
          </>)}
          {step === 3 && (<>
            <div className="form-group"><label className="form-label">What's your goal?</label>
              {[{ v: 'slimming', l: '🔥 Slimming', d: 'Lose weight' }, { v: 'bulking', l: '💪 Bulking', d: 'Build muscle' }, { v: 'maintaining', l: '⚖️ Maintaining', d: 'Stay balanced' }].map(g => (
                <label key={g.v} className="suggestion-card" style={{ cursor: 'pointer', borderColor: formData.goalType === g.v ? 'var(--primary)' : '', marginBottom: '0.5rem' }}>
                  <div><div style={{ fontWeight: 600 }}>{g.l}</div><div className="text-sm text-muted">{g.d}</div></div>
                  <input type="radio" name="goalType" value={g.v} checked={formData.goalType === g.v} onChange={handleChange} />
                </label>
              ))}
            </div>
            <div className="form-group"><label className="form-label">Target Weight (optional)</label><input type="number" name="targetWeight" className="form-input" value={formData.targetWeight} onChange={handleChange} /></div>
            <div className="flex gap-2"><button type="button" onClick={() => setStep(2)} className="btn btn-secondary" style={{ flex: 1 }}>Back</button><button type="button" onClick={nextStep} className="btn btn-primary" style={{ flex: 1 }}>Next</button></div>
          </>)}
          {step === 4 && (<>
            <div className="form-group"><label className="form-label">Daily targets</label>
              <label className="suggestion-card" style={{ cursor: 'pointer', borderColor: !formData.customCalories ? 'var(--primary)' : '', marginBottom: '0.5rem' }}><div><div style={{ fontWeight: 600 }}>🤖 Automatic</div><div className="text-sm text-muted">Calculate for me</div></div><input type="radio" checked={!formData.customCalories} onChange={() => setFormData(p => ({ ...p, customCalories: false }))} /></label>
              <label className="suggestion-card" style={{ cursor: 'pointer', borderColor: formData.customCalories ? 'var(--primary)' : '' }}><div><div style={{ fontWeight: 600 }}>✏️ Manual</div><div className="text-sm text-muted">Set my own</div></div><input type="radio" checked={formData.customCalories} onChange={() => setFormData(p => ({ ...p, customCalories: true }))} /></label>
            </div>
            {formData.customCalories && (<>
              <div className="form-row"><div className="form-group"><label className="form-label">Calories</label><input type="number" name="manualCalorieTarget" className="form-input" value={formData.manualCalorieTarget} onChange={handleChange} /></div><div className="form-group"><label className="form-label">Protein (g)</label><input type="number" name="manualProteinTarget" className="form-input" value={formData.manualProteinTarget} onChange={handleChange} /></div></div>
              <div className="form-row"><div className="form-group"><label className="form-label">Carbs (g)</label><input type="number" name="manualCarbTarget" className="form-input" value={formData.manualCarbTarget} onChange={handleChange} /></div><div className="form-group"><label className="form-label">Fat (g)</label><input type="number" name="manualFatTarget" className="form-input" value={formData.manualFatTarget} onChange={handleChange} /></div></div>
            </>)}
            <div className="flex gap-2"><button type="button" onClick={() => setStep(3)} className="btn btn-secondary" style={{ flex: 1 }}>Back</button><button type="submit" className="btn btn-success" style={{ flex: 1 }} disabled={loading}>{loading ? 'Creating...' : 'Start Tracking'}</button></div>
          </>)}
        </form>
        <p className="auth-footer">Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
};

export default Register;
