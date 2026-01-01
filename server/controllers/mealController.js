const Meal = require('../models/Meal');
const DailyLog = require('../models/DailyLog');
const CustomFood = require('../models/CustomFood');
const foodApi = require('../services/foodApi');
const suggestions = require('../services/suggestions');

// Helper to get start and end of day
const getDayBounds = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// Helper to get or create daily log
const getOrCreateDailyLog = async (userId, date, targets) => {
  const { start } = getDayBounds(date);
  
  let dailyLog = await DailyLog.findOne({
    user: userId,
    date: { $gte: start, $lt: new Date(start.getTime() + 24 * 60 * 60 * 1000) }
  });
  
  if (!dailyLog) {
    dailyLog = await DailyLog.create({
      user: userId,
      date: start,
      targets
    });
  }
  
  return dailyLog;
};

// @desc    Search foods (API)
// @route   GET /api/meals/search
// @access  Private
exports.searchFoods = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters'
      });
    }

    // Search Open Food Facts API (free, no key needed)
    const apiResults = await foodApi.searchFoods(q);
    
    // Also search user's custom foods
    const customFoods = await CustomFood.find({
      user: req.user.id,
      name: { $regex: q, $options: 'i' }
    }).limit(5);
    
    const customResults = customFoods.map(f => ({
      ...f.toObject(),
      source: 'custom',
      type: 'custom'
    }));

    res.status(200).json({
      success: true,
      data: {
        api: apiResults,
        custom: customResults
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get food details from API
// @route   GET /api/meals/food/:id
// @access  Private
exports.getFoodDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const food = await foodApi.getFoodById(id);

    if (!food) {
      return res.status(404).json({
        success: false,
        error: 'Food not found'
      });
    }

    res.status(200).json({ success: true, data: food });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Log a meal
// @route   POST /api/meals
// @access  Private
exports.logMeal = async (req, res) => {
  try {
    const { mealType, foods, date, notes } = req.body;
    
    const mealDate = date ? new Date(date) : new Date();

    const meal = await Meal.create({
      user: req.user.id,
      date: mealDate,
      mealType,
      foods,
      notes
    });

    // Update daily log
    const dailyLog = await getOrCreateDailyLog(
      req.user.id,
      mealDate,
      req.user.dailyTargets
    );

    // Get all meals for the day
    const { start, end } = getDayBounds(mealDate);
    const dayMeals = await Meal.find({
      user: req.user.id,
      date: { $gte: start, $lte: end }
    });

    // Recalculate daily totals
    await dailyLog.recalculate(dayMeals);
    await dailyLog.save();

    res.status(201).json({
      success: true,
      data: meal,
      dailyLog
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Get meals for a date
// @route   GET /api/meals/date/:date
// @access  Private
exports.getMealsByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const { start, end } = getDayBounds(new Date(date));

    const meals = await Meal.find({
      user: req.user.id,
      date: { $gte: start, $lte: end }
    }).sort({ mealType: 1 });

    const dailyLog = await DailyLog.findOne({
      user: req.user.id,
      date: { $gte: start, $lte: end }
    });

    res.status(200).json({
      success: true,
      data: {
        meals,
        dailyLog: dailyLog || {
          consumed: { calories: 0, protein: 0, carbs: 0, fat: 0 },
          targets: req.user.dailyTargets,
          remaining: req.user.dailyTargets,
          progress: { calories: 0, protein: 0, carbs: 0, fat: 0 }
        }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Update a meal
// @route   PUT /api/meals/:id
// @access  Private
exports.updateMeal = async (req, res) => {
  try {
    let meal = await Meal.findById(req.params.id);

    if (!meal) {
      return res.status(404).json({
        success: false,
        error: 'Meal not found'
      });
    }

    // Check ownership
    if (meal.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized'
      });
    }

    meal = await Meal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Recalculate daily log
    const { start, end } = getDayBounds(meal.date);
    const dailyLog = await getOrCreateDailyLog(
      req.user.id,
      meal.date,
      req.user.dailyTargets
    );
    
    const dayMeals = await Meal.find({
      user: req.user.id,
      date: { $gte: start, $lte: end }
    });
    
    await dailyLog.recalculate(dayMeals);
    await dailyLog.save();

    res.status(200).json({ success: true, data: meal, dailyLog });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Delete a meal
// @route   DELETE /api/meals/:id
// @access  Private
exports.deleteMeal = async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);

    if (!meal) {
      return res.status(404).json({
        success: false,
        error: 'Meal not found'
      });
    }

    if (meal.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized'
      });
    }

    const mealDate = meal.date;
    await meal.deleteOne();

    // Recalculate daily log
    const { start, end } = getDayBounds(mealDate);
    const dailyLog = await DailyLog.findOne({
      user: req.user.id,
      date: { $gte: start, $lte: end }
    });

    if (dailyLog) {
      const dayMeals = await Meal.find({
        user: req.user.id,
        date: { $gte: start, $lte: end }
      });
      await dailyLog.recalculate(dayMeals);
      await dailyLog.save();
    }

    res.status(200).json({ success: true, data: {}, dailyLog });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Get meal suggestions based on remaining macros
// @route   GET /api/meals/suggestions
// @access  Private
exports.getSuggestions = async (req, res) => {
  try {
    const today = new Date();
    const { start, end } = getDayBounds(today);

    // Get today's daily log
    let dailyLog = await DailyLog.findOne({
      user: req.user.id,
      date: { $gte: start, $lte: end }
    });

    const remaining = dailyLog?.remaining || req.user.dailyTargets;
    const goalType = req.user.goal.type;

    const foodSuggestions = suggestions.getSuggestions(remaining, goalType, 8);

    res.status(200).json({
      success: true,
      data: {
        suggestions: foodSuggestions,
        remaining,
        goalType
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Get daily meal plan suggestions
// @route   GET /api/meals/meal-plan
// @access  Private
exports.getMealPlan = async (req, res) => {
  try {
    const mealPlan = suggestions.getDailyMealPlan(
      req.user.dailyTargets,
      req.user.goal.type
    );

    res.status(200).json({
      success: true,
      data: {
        mealPlan,
        targets: req.user.dailyTargets,
        goalType: req.user.goal.type
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
