// Meal suggestions based on remaining macros and fitness goal

const SUGGESTIONS = {
  // High protein, moderate carb, low fat options
  highProtein: [
    { name: 'Grilled chicken breast', calories: 165, protein: 31, carbs: 0, fat: 4, category: 'protein' },
    { name: 'Greek yogurt (non-fat)', calories: 100, protein: 17, carbs: 6, fat: 1, category: 'dairy' },
    { name: 'Egg whites (4)', calories: 68, protein: 14, carbs: 1, fat: 0, category: 'protein' },
    { name: 'Tuna (canned in water)', calories: 100, protein: 22, carbs: 0, fat: 1, category: 'protein' },
    { name: 'Cottage cheese (low fat)', calories: 163, protein: 28, carbs: 6, fat: 2, category: 'dairy' },
    { name: 'Turkey breast (sliced)', calories: 120, protein: 26, carbs: 0, fat: 1, category: 'protein' },
    { name: 'Shrimp', calories: 99, protein: 24, carbs: 0, fat: 0, category: 'protein' },
    { name: 'Protein shake (whey)', calories: 120, protein: 24, carbs: 3, fat: 2, category: 'protein' }
  ],
  
  // Healthy carb options
  healthyCarbs: [
    { name: 'Brown rice (1 cup)', calories: 216, protein: 5, carbs: 45, fat: 2, category: 'carbs' },
    { name: 'Sweet potato (medium)', calories: 103, protein: 2, carbs: 24, fat: 0, category: 'carbs' },
    { name: 'Oatmeal (1 cup)', calories: 158, protein: 6, carbs: 27, fat: 3, category: 'carbs' },
    { name: 'Quinoa (1 cup)', calories: 222, protein: 8, carbs: 39, fat: 4, category: 'carbs' },
    { name: 'Banana', calories: 105, protein: 1, carbs: 27, fat: 0, category: 'fruits' },
    { name: 'Whole wheat bread (2 slices)', calories: 160, protein: 8, carbs: 28, fat: 2, category: 'carbs' },
    { name: 'Black beans (1/2 cup)', calories: 114, protein: 8, carbs: 20, fat: 0, category: 'carbs' }
  ],
  
  // Healthy fat options
  healthyFats: [
    { name: 'Avocado (half)', calories: 161, protein: 2, carbs: 9, fat: 15, category: 'fats' },
    { name: 'Almonds (1 oz)', calories: 164, protein: 6, carbs: 6, fat: 14, category: 'fats' },
    { name: 'Olive oil (1 tbsp)', calories: 119, protein: 0, carbs: 0, fat: 14, category: 'fats' },
    { name: 'Peanut butter (2 tbsp)', calories: 188, protein: 8, carbs: 6, fat: 16, category: 'fats' },
    { name: 'Salmon (4 oz)', calories: 234, protein: 25, carbs: 0, fat: 14, category: 'protein' },
    { name: 'Walnuts (1 oz)', calories: 185, protein: 4, carbs: 4, fat: 18, category: 'fats' },
    { name: 'Chia seeds (2 tbsp)', calories: 138, protein: 5, carbs: 12, fat: 9, category: 'fats' }
  ],
  
  // Low calorie, high volume options (for slimming)
  lowCalorie: [
    { name: 'Mixed salad greens (2 cups)', calories: 20, protein: 2, carbs: 4, fat: 0, category: 'vegetables' },
    { name: 'Cucumber (1 whole)', calories: 16, protein: 1, carbs: 4, fat: 0, category: 'vegetables' },
    { name: 'Celery (4 stalks)', calories: 6, protein: 0, carbs: 1, fat: 0, category: 'vegetables' },
    { name: 'Broccoli (1 cup)', calories: 55, protein: 4, carbs: 11, fat: 0, category: 'vegetables' },
    { name: 'Zucchini (1 medium)', calories: 33, protein: 2, carbs: 6, fat: 1, category: 'vegetables' },
    { name: 'Cherry tomatoes (1 cup)', calories: 27, protein: 1, carbs: 6, fat: 0, category: 'vegetables' },
    { name: 'Cauliflower (1 cup)', calories: 25, protein: 2, carbs: 5, fat: 0, category: 'vegetables' },
    { name: 'Spinach (2 cups)', calories: 14, protein: 2, carbs: 2, fat: 0, category: 'vegetables' }
  ],
  
  // Calorie-dense options (for bulking)
  calorieDense: [
    { name: 'Whole milk (1 cup)', calories: 149, protein: 8, carbs: 12, fat: 8, category: 'dairy' },
    { name: 'Trail mix (1/4 cup)', calories: 175, protein: 5, carbs: 16, fat: 11, category: 'snacks' },
    { name: 'Granola (1/2 cup)', calories: 200, protein: 5, carbs: 32, fat: 6, category: 'carbs' },
    { name: 'Bagel with cream cheese', calories: 350, protein: 11, carbs: 54, fat: 10, category: 'carbs' },
    { name: 'Mass gainer shake', calories: 500, protein: 30, carbs: 80, fat: 8, category: 'protein' },
    { name: 'Pasta (2 cups cooked)', calories: 442, protein: 16, carbs: 86, fat: 3, category: 'carbs' },
    { name: 'Rice and beans bowl', calories: 400, protein: 15, carbs: 70, fat: 5, category: 'carbs' }
  ]
};

// Get suggestions based on remaining macros and goal
exports.getSuggestions = (remaining, goalType, limit = 5) => {
  const suggestions = [];
  
  // Determine what macros are most needed
  const proteinDeficit = remaining.protein > 10;
  const carbDeficit = remaining.carbs > 20;
  const fatDeficit = remaining.fat > 5;
  const calorieDeficit = remaining.calories > 200;
  
  // Goal-specific logic
  if (goalType === 'slimming') {
    // Prioritize high protein, low calorie
    if (proteinDeficit) {
      suggestions.push(...SUGGESTIONS.highProtein.filter(f => f.calories < 200));
    }
    if (calorieDeficit && remaining.calories < 400) {
      // Small calorie budget - suggest low cal options
      suggestions.push(...SUGGESTIONS.lowCalorie);
    }
    if (suggestions.length < limit && carbDeficit) {
      suggestions.push(...SUGGESTIONS.healthyCarbs.filter(f => f.calories < 150));
    }
  } else if (goalType === 'bulking') {
    // Prioritize calorie-dense and high protein
    if (calorieDeficit) {
      suggestions.push(...SUGGESTIONS.calorieDense);
    }
    if (proteinDeficit) {
      suggestions.push(...SUGGESTIONS.highProtein);
    }
    if (carbDeficit) {
      suggestions.push(...SUGGESTIONS.healthyCarbs);
    }
    if (fatDeficit) {
      suggestions.push(...SUGGESTIONS.healthyFats);
    }
  } else {
    // Maintaining - balanced approach
    if (proteinDeficit) {
      suggestions.push(...SUGGESTIONS.highProtein.slice(0, 3));
    }
    if (carbDeficit) {
      suggestions.push(...SUGGESTIONS.healthyCarbs.slice(0, 3));
    }
    if (fatDeficit) {
      suggestions.push(...SUGGESTIONS.healthyFats.slice(0, 3));
    }
  }
  
  // Filter suggestions that fit within remaining macros
  const filtered = suggestions.filter(food => 
    food.calories <= remaining.calories + 50 // Small buffer
  );
  
  // Remove duplicates and limit
  const unique = [...new Map(filtered.map(f => [f.name, f])).values()];
  
  // Score and sort suggestions
  const scored = unique.map(food => {
    let score = 0;
    
    // Prefer foods that help fill macro gaps
    if (proteinDeficit && food.protein > 10) score += 3;
    if (carbDeficit && food.carbs > 15) score += 2;
    if (fatDeficit && food.fat > 5) score += 1;
    
    // For slimming, prefer lower calorie options
    if (goalType === 'slimming') {
      score += (200 - food.calories) / 50;
    }
    
    // For bulking, prefer calorie-dense options
    if (goalType === 'bulking') {
      score += food.calories / 100;
    }
    
    return { ...food, score };
  });
  
  scored.sort((a, b) => b.score - a.score);
  
  return scored.slice(0, limit).map(({ score, ...food }) => food);
};

// Get meal plan suggestions for the day
exports.getDailyMealPlan = (targets, goalType) => {
  const mealPlan = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: []
  };
  
  // Distribute calories across meals
  const distribution = {
    breakfast: 0.25,
    lunch: 0.35,
    dinner: 0.30,
    snacks: 0.10
  };
  
  Object.keys(distribution).forEach(meal => {
    const mealTargets = {
      calories: Math.round(targets.calories * distribution[meal]),
      protein: Math.round(targets.protein * distribution[meal]),
      carbs: Math.round(targets.carbs * distribution[meal]),
      fat: Math.round(targets.fat * distribution[meal])
    };
    
    mealPlan[meal] = exports.getSuggestions(mealTargets, goalType, 3);
  });
  
  return mealPlan;
};
