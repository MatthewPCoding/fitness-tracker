const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true
  },
  
  // Physical Profile
  profile: {
    height: { type: Number, required: true }, // in inches
    weight: { type: Number, required: true }, // in lbs (current weight)
    age: { type: Number, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    activityLevel: {
      type: String,
      enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
      required: true
    }
  },

  // Fitness Goal
  goal: {
    type: {
      type: String,
      enum: ['slimming', 'bulking', 'maintaining'],
      required: true
    },
    targetWeight: { type: Number }, // optional target weight
    weeklyGoal: { type: Number }, // lbs per week (negative for loss, positive for gain)
    customCalories: { type: Boolean, default: false },
    manualCalorieTarget: { type: Number },
    manualProteinTarget: { type: Number },
    manualCarbTarget: { type: Number },
    manualFatTarget: { type: Number }
  },

  // Calculated Daily Targets (auto-set based on goal)
  dailyTargets: {
    calories: { type: Number },
    protein: { type: Number }, // grams
    carbs: { type: Number },   // grams
    fat: { type: Number }      // grams
  },

  // Stats
  startingWeight: { type: Number },
  weightHistory: [{
    weight: Number,
    date: { type: Date, default: Date.now }
  }],

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before save
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Calculate and set daily targets based on goal
UserSchema.pre('save', function(next) {
  if (this.isModified('profile') || this.isModified('goal')) {
    // If custom calories are set, use those
    if (this.goal.customCalories && this.goal.manualCalorieTarget) {
      this.dailyTargets = {
        calories: this.goal.manualCalorieTarget,
        protein: this.goal.manualProteinTarget || Math.round(this.profile.weight * 0.8),
        carbs: this.goal.manualCarbTarget || Math.round((this.goal.manualCalorieTarget * 0.4) / 4),
        fat: this.goal.manualFatTarget || Math.round((this.goal.manualCalorieTarget * 0.3) / 9)
      };
    } else {
      // Calculate using Mifflin-St Jeor equation
      const { height, weight, age, gender, activityLevel } = this.profile;
      
      // BMR calculation
      let bmr;
      if (gender === 'male') {
        bmr = 10 * (weight * 0.453592) + 6.25 * (height * 2.54) - 5 * age + 5;
      } else {
        bmr = 10 * (weight * 0.453592) + 6.25 * (height * 2.54) - 5 * age - 161;
      }

      // Activity multipliers
      const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9
      };

      const tdee = bmr * activityMultipliers[activityLevel];

      // Adjust calories based on goal
      let targetCalories;
      let proteinMultiplier;
      
      switch (this.goal.type) {
        case 'slimming':
          // 500-750 calorie deficit for 1-1.5 lbs/week loss
          targetCalories = tdee - 500;
          proteinMultiplier = 1.0; // Higher protein to preserve muscle
          break;
        case 'bulking':
          // 300-500 calorie surplus for lean gains
          targetCalories = tdee + 400;
          proteinMultiplier = 1.0; // High protein for muscle building
          break;
        case 'maintaining':
          targetCalories = tdee;
          proteinMultiplier = 0.8; // Moderate protein
          break;
        default:
          targetCalories = tdee;
          proteinMultiplier = 0.8;
      }

      // Calculate macros
      const protein = Math.round(weight * proteinMultiplier);
      const proteinCalories = protein * 4;
      
      // Fat: 25-30% of calories
      const fatCalories = targetCalories * 0.28;
      const fat = Math.round(fatCalories / 9);
      
      // Carbs: remaining calories
      const carbCalories = targetCalories - proteinCalories - fatCalories;
      const carbs = Math.round(carbCalories / 4);

      this.dailyTargets = {
        calories: Math.round(targetCalories),
        protein,
        carbs,
        fat
      };
    }
  }
  next();
});

// Sign JWT
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Match password
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
