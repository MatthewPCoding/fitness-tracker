const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const {
  register,
  login,
  getMe,
  updateProfile,
  updateGoal,
  logWeight
} = require('../controllers/authController');

// Validation rules
const registerValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().withMessage('Name is required'),
  body('profile.height').isNumeric().withMessage('Height is required'),
  body('profile.weight').isNumeric().withMessage('Weight is required'),
  body('profile.age').isNumeric().withMessage('Age is required'),
  body('profile.gender').isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
  body('profile.activityLevel').isIn(['sedentary', 'light', 'moderate', 'active', 'very_active']).withMessage('Invalid activity level'),
  body('goal.type').isIn(['slimming', 'bulking', 'maintaining']).withMessage('Invalid goal type')
];

router.post('/register', registerValidation, register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/goal', protect, updateGoal);
router.post('/weight', protect, logWeight);

module.exports = router;
