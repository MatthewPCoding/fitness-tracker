import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { useAuth } from '../context/AuthContext';
import { statsAPI } from '../api';
import { format } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const Progress = () => {
  const { user, logWeight } = useAuth();
  const [weightHistory, setWeightHistory] = useState([]);
  const [calorieHistory, setCalorieHistory] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newWeight, setNewWeight] = useState('');
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => { loadStats(); }, [timeRange]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [wRes, cRes, wsRes] = await Promise.all([statsAPI.getWeightHistory(timeRange), statsAPI.getCalorieHistory(timeRange), statsAPI.getWeekly()]);
      setWeightHistory(wRes.data.data.history);
      setCalorieHistory(cRes.data.data);
      setWeeklyStats(wsRes.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleLogWeight = async (e) => {
    e.preventDefault();
    if (!newWeight) return;
    const result = await logWeight(parseFloat(newWeight));
    if (result.success) { setNewWeight(''); loadStats(); }
  };

  const weightChartData = {
    labels: weightHistory.map(w => format(new Date(w.date), 'MMM d')),
    datasets: [{ label: 'Weight (lbs)', data: weightHistory.map(w => w.weight), borderColor: 'rgb(79, 70, 229)', backgroundColor: 'rgba(79, 70, 229, 0.1)', fill: true, tension: 0.3 },
      user?.goal?.targetWeight && { label: 'Target', data: weightHistory.map(() => user.goal.targetWeight), borderColor: 'rgba(16, 185, 129, 0.5)', borderDash: [5, 5], pointRadius: 0 }].filter(Boolean)
  };

  const calorieChartData = {
    labels: calorieHistory.map(c => format(new Date(c.date), 'MMM d')),
    datasets: [{ label: 'Calories', data: calorieHistory.map(c => c.calories), borderColor: 'rgb(79, 70, 229)', backgroundColor: 'rgba(79, 70, 229, 0.1)', fill: true, tension: 0.3 },
      { label: 'Target', data: calorieHistory.map(c => c.target), borderColor: 'rgba(107, 114, 128, 0.5)', borderDash: [5, 5], pointRadius: 0 }]
  };

  const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: false } } };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <div className="container">
        <div className="flex justify-between items-center mb-4">
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Progress</h1>
          <select value={timeRange} onChange={(e) => setTimeRange(parseInt(e.target.value))} className="form-select" style={{ width: 'auto' }}><option value={7}>7 days</option><option value={14}>14 days</option><option value={30}>30 days</option><option value={90}>90 days</option></select>
        </div>
        <div className="dashboard-grid">
          <div className="card">
            <h3 className="card-title mb-4">Log Today's Weight</h3>
            <form onSubmit={handleLogWeight} className="flex gap-2"><input type="number" step="0.1" className="form-input" placeholder="Weight in lbs" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} /><button type="submit" className="btn btn-primary">Log</button></form>
            <div className="mt-4"><div className="flex justify-between text-sm"><span>Current: <strong>{user?.profile?.weight} lbs</strong></span><span>Started: <strong>{user?.startingWeight} lbs</strong></span></div></div>
          </div>
          <div className="card">
            <h3 className="card-title mb-4">This Week</h3>
            <div className="macro-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              <div className="macro-item"><div className="macro-value">{weeklyStats?.daysLogged || 0}</div><div className="macro-label">Days Logged</div></div>
              <div className="macro-item"><div className="macro-value">{weeklyStats?.compliance || 0}%</div><div className="macro-label">On Track</div></div>
              <div className="macro-item"><div className="macro-value">{weeklyStats?.averages?.calories || 0}</div><div className="macro-label">Avg Cals</div></div>
              <div className="macro-item"><div className="macro-value">{weeklyStats?.averages?.protein || 0}g</div><div className="macro-label">Avg Protein</div></div>
            </div>
          </div>
        </div>
        <div className="card mt-4"><h3 className="card-title mb-4">Weight Trend</h3><div style={{ height: '300px' }}>{weightHistory.length > 0 ? <Line data={weightChartData} options={chartOptions} /> : <div className="text-center text-muted" style={{ paddingTop: '100px' }}>No weight data yet</div>}</div></div>
        <div className="card mt-4"><h3 className="card-title mb-4">Calorie Intake</h3><div style={{ height: '300px' }}>{calorieHistory.length > 0 ? <Line data={calorieChartData} options={chartOptions} /> : <div className="text-center text-muted" style={{ paddingTop: '100px' }}>No meal data yet</div>}</div></div>
      </div>
    </div>
  );
};

export default Progress;
