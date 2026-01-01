const axios = require('axios');

// Open Food Facts API - completely free, no API key needed
const OFF_BASE_URL = 'https://world.openfoodfacts.org';

// Search for foods
exports.searchFoods = async (query) => {
  try {
    const response = await axios.get(`${OFF_BASE_URL}/cgi/search.pl`, {
      params: {
        search_terms: query,
        search_simple: 1,
        action: 'process',
        json: 1,
        page_size: 10,
        fields: 'code,product_name,brands,nutriments,image_small_url,serving_size'
      }
    });
    
    const products = response.data.products || [];
    
    return products
      .filter(p => p.product_name && p.nutriments)
      .map(product => ({
        source: 'api',
        apiId: product.code,
        name: product.product_name,
        brand: product.brands || '',
        calories: Math.round(product.nutriments['energy-kcal_100g'] || product.nutriments['energy-kcal'] || 0),
        protein: Math.round(product.nutriments.proteins_100g || product.nutriments.proteins || 0),
        carbs: Math.round(product.nutriments.carbohydrates_100g || product.nutriments.carbohydrates || 0),
        fat: Math.round(product.nutriments.fat_100g || product.nutriments.fat || 0),
        fiber: Math.round(product.nutriments.fiber_100g || product.nutriments.fiber || 0),
        sugar: Math.round(product.nutriments.sugars_100g || product.nutriments.sugars || 0),
        servingSize: 1,
        servingUnit: product.serving_size || '100g',
        photoUrl: product.image_small_url,
        type: 'product'
      }));
  } catch (error) {
    console.error('Open Food Facts search error:', error.message);
    throw new Error('Failed to search foods');
  }
};

// Get detailed nutrition info by barcode/id
exports.getFoodById = async (barcode) => {
  try {
    const response = await axios.get(`${OFF_BASE_URL}/api/v0/product/${barcode}.json`);
    
    if (response.data.status !== 1) return null;
    
    const product = response.data.product;
    const n = product.nutriments || {};
    
    return {
      source: 'api',
      apiId: product.code,
      name: product.product_name,
      brand: product.brands || '',
      servingSize: 1,
      servingUnit: product.serving_size || '100g',
      calories: Math.round(n['energy-kcal_100g'] || n['energy-kcal'] || 0),
      protein: Math.round(n.proteins_100g || n.proteins || 0),
      carbs: Math.round(n.carbohydrates_100g || n.carbohydrates || 0),
      fat: Math.round(n.fat_100g || n.fat || 0),
      fiber: Math.round(n.fiber_100g || n.fiber || 0),
      sugar: Math.round(n.sugars_100g || n.sugars || 0),
      photoUrl: product.image_url || product.image_small_url
    };
  } catch (error) {
    console.error('Open Food Facts product error:', error.message);
    throw new Error('Failed to get food details');
  }
};

// Alias for compatibility
exports.getNutrients = exports.getFoodById;
exports.getBrandedItem = exports.getFoodById;
