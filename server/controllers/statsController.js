const DailyLog = require('../models/DailyLog');
const Meal = require('../models/Meal');
const User = require('../models/User');

// @desc    Get dashboard stats
// @route   GET /api/stats/dashboard
// @access  Private
exports.getDashboard = async (req, res) => {
  try {
    const user = req.user;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get today's log
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);
    
    const todayLog = await DailyLog.findOne({
      user: user._id,
      date: { $gte: today, $lte: todayEnd }
    });

    // Get streak (consecutive days on track)
    const logs = await DailyLog.find({
      user: user._id,
      date: { $lt: today }
    }).sort({ date: -1 }).limit(30);

    let streak = 0;
    for (const log of logs) {
      if (log.onTrack) {
        streak++;
      } else {
        break;
      }
    }

    // Weight progress
    const startWeight = user.startingWeight;
    const currentWeight = user.profile.weight;
    const targetWeight = user.goal.targetWeight;
    
    const weightChange = currentWeight - startWeight;
    const weightProgress = targetWeight 
      ? Math.round(((startWeight - currentWeight) / (startWeight - targetWeight)) * 100)
      : null;

    res.status(200).json({
      success: true,
      data: {
        today: todayLog || {
          consumed: { calories: 0, protein: 0, carbs: 0, fat: 0 },
          targets: user.dailyTargets,
          remaining: user.dailyTargets,
          progress: { calories: 0, protein: 0, carbs: 0, fat: 0 }
        },
        targets: user.dailyTargets,
        goal: user.goal,
        streak,
        weight: {
          current: currentWeight,
          starting: startWeight,
          target: targetWeight,
          change: weightChange,
          progress: weightProgress
        }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Get weekly stats
// @route   GET /api/stats/weekly
// @access  Private
exports.getWeeklyStats = async (req, res) => {
  try {
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    startDate.setHours(0, 0, 0, 0);

    const logs = await DailyLog.find({
      user: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });

    // Calculate averages
    const totals = logs.reduce((acc, log) => ({
      calories: acc.calories + log.consumed.calories,
      protein: acc.protein + log.consumed.protein,
      carbs: acc.carbs + log.consumed.carbs,
      fat: acc.fat + log.consumed.fat,
      daysOnTrack: acc.daysOnTrack + (log.onTrack ? 1 : 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, daysOnTrack: 0 });

    const daysLogged = logs.length || 1;

    const averages = {
      calories: Math.round(totals.calories / daysLogged),
      protein: Math.round(totals.protein / daysLogged),
      carbs: Math.round(totals.carbs / daysLogged),
      fat: Math.round(totals.fat / daysLogged)
    };

    // Get weight trend for the week
    const weightEntries = req.user.weightHistory.filter(
      w => new Date(w.date) >= startDate && new Date(w.date) <= endDate
    );

    res.status(200).json({
      success: true,
      data: {
        logs,
        averages,
        daysLogged,
        daysOnTrack: totals.daysOnTrack,
        compliance: Math.round((totals.daysOnTrack / daysLogged) * 100),
        weightTrend: weightEntries
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Get monthly stats
// @route   GET /api/stats/monthly
// @access  Private
exports.getMonthlyStats = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    const startDate = new Date(year || new Date().getFullYear(), (month || new Date().getMonth()), 1);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0, 23, 59, 59, 999);

    const logs = await DailyLog.find({
      user: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });

    // Group by week
    const weeks = {};
    logs.forEach(log => {
      const weekNum = Math.ceil(log.date.getDate() / 7);
      if (!weeks[weekNum]) {
        weeks[weekNum] = { logs: [], totals: { calories: 0, protein: 0, carbs: 0, fat: 0 } };
      }
      weeks[weekNum].logs.push(log);
      weeks[weekNum].totals.calories += log.consumed.calories;
      weeks[weekNum].totals.protein += log.consumed.protein;
      weeks[weekNum].totals.carbs += log.consumed.carbs;
      weeks[weekNum].totals.fat += log.consumed.fat;
    });

    // Weight trend for month
    const weightEntries = req.user.weightHistory.filter(
      w => new Date(w.date) >= startDate && new Date(w.date) <= endDate
    );

    res.status(200).json({
      success: true,
      data: {
        logs,
        weeks,
        weightTrend: weightEntries,
        startWeight: weightEntries[0]?.weight,
        endWeight: weightEntries[weightEntries.length - 1]?.weight,
        monthlyChange: weightEntries.length >= 2 
          ? weightEntries[weightEntries.length - 1].weight - weightEntries[0].weight 
          : null
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Get weight history
// @route   GET /api/stats/weight
// @access  Private
exports.getWeightHistory = async (req, res) => {
  try {
    const { days } = req.query;
    const limit = parseInt(days) || 30;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - limit);

    const weightHistory = req.user.weightHistory
      .filter(w => new Date(w.date) >= cutoffDate)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    res.status(200).json({
      success: true,
      data: {
        history: weightHistory,
        current: req.user.profile.weight,
        starting: req.user.startingWeight,
        target: req.user.goal.targetWeight,
        goalType: req.user.goal.type
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Get calorie history for charts
// @route   GET /api/stats/calories
// @access  Private
exports.getCalorieHistory = async (req, res) => {
  try {
    const { days } = req.query;
    const limit = parseInt(days) || 14;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - limit);
    cutoffDate.setHours(0, 0, 0, 0);

    const logs = await DailyLog.find({
      user: req.user._id,
      date: { $gte: cutoffDate }
    }).sort({ date: 1 });

    const chartData = logs.map(log => ({
      date: log.date,
      calories: log.consumed.calories,
      target: log.targets.calories,
      protein: log.consumed.protein,
      carbs: log.consumed.carbs,
      fat: log.consumed.fat
    }));

    res.status(200).json({
      success: true,
      data: chartData
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
