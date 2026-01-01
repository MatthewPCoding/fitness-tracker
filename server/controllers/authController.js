const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password, name, profile, goal } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      name,
      profile,
      goal,
      startingWeight: profile.weight,
      weightHistory: [{ weight: profile.weight, date: new Date() }]
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { profile, goal, name } = req.body;
    
    const updateFields = {};
    if (name) updateFields.name = name;
    if (profile) updateFields.profile = { ...req.user.profile, ...profile };
    if (goal) updateFields.goal = { ...req.user.goal, ...goal };

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Update goal type (switch between slimming/bulking/maintaining)
// @route   PUT /api/auth/goal
// @access  Private
exports.updateGoal = async (req, res) => {
  try {
    const { type, customCalories, manualCalorieTarget, manualProteinTarget, manualCarbTarget, manualFatTarget, targetWeight, weeklyGoal } = req.body;

    if (!['slimming', 'bulking', 'maintaining'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid goal type'
      });
    }

    const user = await User.findById(req.user.id);
    
    user.goal = {
      type,
      targetWeight: targetWeight || user.goal.targetWeight,
      weeklyGoal: weeklyGoal || user.goal.weeklyGoal,
      customCalories: customCalories || false,
      manualCalorieTarget,
      manualProteinTarget,
      manualCarbTarget,
      manualFatTarget
    };

    await user.save(); // This triggers the pre-save hook to recalculate targets

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Log weight
// @route   POST /api/auth/weight
// @access  Private
exports.logWeight = async (req, res) => {
  try {
    const { weight } = req.body;

    if (!weight) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a weight'
      });
    }

    const user = await User.findById(req.user.id);
    
    // Update current weight
    user.profile.weight = weight;
    
    // Add to history
    user.weightHistory.push({ weight, date: new Date() });

    await user.save();

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Helper to send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  // Remove password from output
  const userData = user.toObject();
  delete userData.password;

  res.status(statusCode).json({
    success: true,
    token,
    data: userData
  });
};
