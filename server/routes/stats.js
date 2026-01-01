const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getDashboard,
  getWeeklyStats,
  getMonthlyStats,
  getWeightHistory,
  getCalorieHistory
} = require('../controllers/statsController');

router.use(protect);

router.get('/dashboard', getDashboard);
router.get('/weekly', getWeeklyStats);
router.get('/monthly', getMonthlyStats);
router.get('/weight', getWeightHistory);
router.get('/calories', getCalorieHistory);

module.exports = router;
