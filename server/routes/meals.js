const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  searchFoods,
  getFoodDetails,
  logMeal,
  getMealsByDate,
  updateMeal,
  deleteMeal,
  getSuggestions,
  getMealPlan
} = require('../controllers/mealController');

// All routes require authentication
router.use(protect);

// Food search and details
router.get('/search', searchFoods);
router.get('/food/:id', getFoodDetails);

// Meal suggestions
router.get('/suggestions', getSuggestions);
router.get('/meal-plan', getMealPlan);

// Meal CRUD
router.post('/', logMeal);
router.get('/date/:date', getMealsByDate);
router.put('/:id', updateMeal);
router.delete('/:id', deleteMeal);

module.exports = router;
