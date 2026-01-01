const mongoose = require('mongoose');

const DailyLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  
  // Weight log (optional, not everyone weighs daily)
  weight: Number,
  
  // Daily totals (aggregated from meals)
  consumed: {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 }
  },
  
  // Targets for this day (snapshot from user profile)
  targets: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number
  },
  
  // Remaining (targets - consumed)
  remaining: {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 }
  },
  
  // Goal progress percentage
  progress: {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 }
  },
  
  // Water intake (glasses)
  waterIntake: {
    type: Number,
    default: 0
  },
  
  // Notes
  notes: String,
  
  // Streak tracking
  onTrack: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Unique constraint for one log per user per day
DailyLogSchema.index({ user: 1, date: 1 }, { unique: true });

// Method to recalculate from meals
DailyLogSchema.methods.recalculate = async function(meals) {
  const totals = meals.reduce((acc, meal) => ({
    calories: acc.calories + meal.totals.calories,
    protein: acc.protein + meal.totals.protein,
    carbs: acc.carbs + meal.totals.carbs,
    fat: acc.fat + meal.totals.fat
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  
  this.consumed = totals;
  
  // Calculate remaining
  this.remaining = {
    calories: Math.max(0, this.targets.calories - totals.calories),
    protein: Math.max(0, this.targets.protein - totals.protein),
    carbs: Math.max(0, this.targets.carbs - totals.carbs),
    fat: Math.max(0, this.targets.fat - totals.fat)
  };
  
  // Calculate progress percentages
  this.progress = {
    calories: Math.round((totals.calories / this.targets.calories) * 100),
    protein: Math.round((totals.protein / this.targets.protein) * 100),
    carbs: Math.round((totals.carbs / this.targets.carbs) * 100),
    fat: Math.round((totals.fat / this.targets.fat) * 100)
  };
  
  // On track if within 10% of calorie target
  const calorieVariance = Math.abs(totals.calories - this.targets.calories) / this.targets.calories;
  this.onTrack = calorieVariance <= 0.1;
  
  return this;
};

module.exports = mongoose.model('DailyLog', DailyLogSchema);
