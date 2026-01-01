const mongoose = require('mongoose');

const MealSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true
  },
  foods: [{
    // Food source - API or custom
    source: {
      type: String,
      enum: ['api', 'custom'],
      default: 'custom'
    },
    
    // API food data (from Nutritionix)
    apiId: String,
    
    // Food details
    name: {
      type: String,
      required: true
    },
    servingSize: {
      type: Number,
      default: 1
    },
    servingUnit: {
      type: String,
      default: 'serving'
    },
    
    // Macros per serving
    calories: {
      type: Number,
      required: true
    },
    protein: {
      type: Number,
      default: 0
    },
    carbs: {
      type: Number,
      default: 0
    },
    fat: {
      type: Number,
      required: true
    },
    fiber: {
      type: Number,
      default: 0
    },
    sugar: {
      type: Number,
      default: 0
    },
    
    // Photo from API
    photoUrl: String
  }],
  
  // Meal totals (calculated)
  totals: {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 }
  },
  
  notes: String
}, {
  timestamps: true
});

// Calculate totals before save
MealSchema.pre('save', function(next) {
  this.totals = this.foods.reduce((acc, food) => ({
    calories: acc.calories + (food.calories * food.servingSize),
    protein: acc.protein + (food.protein * food.servingSize),
    carbs: acc.carbs + (food.carbs * food.servingSize),
    fat: acc.fat + (food.fat * food.servingSize)
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  
  next();
});

// Index for efficient date queries
MealSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model('Meal', MealSchema);
