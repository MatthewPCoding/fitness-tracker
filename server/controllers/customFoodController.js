const CustomFood = require('../models/CustomFood');

// @desc    Get user's custom foods
// @route   GET /api/foods
// @access  Private
exports.getCustomFoods = async (req, res) => {
  try {
    const { category, favorite, search } = req.query;
    
    const query = { user: req.user.id };
    
    if (category) query.category = category;
    if (favorite === 'true') query.isFavorite = true;
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const foods = await CustomFood.find(query)
      .sort({ useCount: -1, name: 1 });

    res.status(200).json({
      success: true,
      count: foods.length,
      data: foods
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Create custom food
// @route   POST /api/foods
// @access  Private
exports.createCustomFood = async (req, res) => {
  try {
    const foodData = {
      ...req.body,
      user: req.user.id
    };

    const food = await CustomFood.create(foodData);

    res.status(201).json({
      success: true,
      data: food
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Update custom food
// @route   PUT /api/foods/:id
// @access  Private
exports.updateCustomFood = async (req, res) => {
  try {
    let food = await CustomFood.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        error: 'Food not found'
      });
    }

    if (food.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized'
      });
    }

    food = await CustomFood.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: food });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Delete custom food
// @route   DELETE /api/foods/:id
// @access  Private
exports.deleteCustomFood = async (req, res) => {
  try {
    const food = await CustomFood.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        error: 'Food not found'
      });
    }

    if (food.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized'
      });
    }

    await food.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Toggle favorite
// @route   PUT /api/foods/:id/favorite
// @access  Private
exports.toggleFavorite = async (req, res) => {
  try {
    const food = await CustomFood.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        error: 'Food not found'
      });
    }

    if (food.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized'
      });
    }

    food.isFavorite = !food.isFavorite;
    await food.save();

    res.status(200).json({ success: true, data: food });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Increment use count (called when food is logged)
// @route   PUT /api/foods/:id/use
// @access  Private
exports.incrementUseCount = async (req, res) => {
  try {
    const food = await CustomFood.findById(req.params.id);

    if (!food || food.user.toString() !== req.user.id) {
      return res.status(404).json({
        success: false,
        error: 'Food not found'
      });
    }

    food.useCount += 1;
    food.lastUsed = new Date();
    await food.save();

    res.status(200).json({ success: true, data: food });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
