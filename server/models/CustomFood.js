const mongoose = require('mongoose');

const CustomFoodSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide a food name'],
    trim: true
  },
  brand: String,
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
    required: [true, 'Please provide calories']
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
    required: [true, 'Please provide fat content']
  },
  fiber: {
    type: Number,
    default: 0
  },
  sugar: {
    type: Number,
    default: 0
  },
  
  // How often this food is used (for suggestions)
  useCount: {
    type: Number,
    default: 0
  },
  lastUsed: Date,
  
  // Category for organization
  category: {
    type: String,
    enum: ['protein', 'carbs', 'fats', 'vegetables', 'fruits', 'dairy', 'beverages', 'snacks', 'other'],
    default: 'other'
  },
  
  isFavorite: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for quick user food lookups
CustomFoodSchema.index({ user: 1, name: 'text' });

module.exports = mongoose.model('CustomFood', CustomFoodSchema);
