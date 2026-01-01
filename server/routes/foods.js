const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getCustomFoods,
  createCustomFood,
  updateCustomFood,
  deleteCustomFood,
  toggleFavorite,
  incrementUseCount
} = require('../controllers/customFoodController');

router.use(protect);

router.route('/')
  .get(getCustomFoods)
  .post(createCustomFood);

router.route('/:id')
  .put(updateCustomFood)
  .delete(deleteCustomFood);

router.put('/:id/favorite', toggleFavorite);
router.put('/:id/use', incrementUseCount);

module.exports = router;
