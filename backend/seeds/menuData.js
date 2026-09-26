// Helper parsing functions
const parseRemovableIngredients = (ingredients) => {
  if (!ingredients || !Array.isArray(ingredients)) return [];
  return ingredients.map((ing) => ({ name: ing }));
};

const parseOptionalAddons = (addons) => {
  if (!addons || !Array.isArray(addons)) return [];
  return addons.map((addon) => {
    const regex = /(.+?)\s*\(\+₹(\d+)\)/;
    const match = addon.match(regex);
    if (match) {
      return {
        name: match[1].trim(),
        extraPrice: Number(match[2]),
      };
    }
    return { name: addon, extraPrice: 0 };
  });
};

const generateDietaryTags = (dietType, goalCategory) => {
  const tags = [];
  if (dietType) {
    tags.push(dietType);
  }
  if (goalCategory === 'High Protein') {
    tags.push('High-Protein');
  } else if (goalCategory === 'Weight Loss') {
    tags.push('Low-Calorie');
  } else if (goalCategory === 'Diabetic Friendly') {
    tags.push('Diabetic-Friendly');
  }
  return tags;
};

// Raw JSON menu data
const rawMenuData = [
  {
    itemId: "HP001",
    goalCategory: "High Protein",
    mealCategory: "Sandwich",
    menuName: "Herb Grilled Chicken Sandwich",
    dietType: "Non-Veg",
    nutrition: { calories: 425, protein: 38, carbs: 34, fat: 12 },
    ingredients: ["Bread 70g", "Chicken 120g", "Greek yogurt 20g", "Lettuce"],
    removableIngredients: ["Lettuce"],
    availableAddOns: ["Extra Cheese (+₹30)", "Extra Chicken (+₹50)", "Avocado (+₹60)", "Grilled Mushrooms (+₹40)", "Olives (+₹20)"],
    allergens: ["Gluten"],
    menuInfo: "Juicy herb-marinated grilled chicken packed into a soft bread with creamy Greek yogurt and fresh lettuce."
  },
  {
    itemId: "HP002",
    goalCategory: "High Protein",
    mealCategory: "Sandwich",
    menuName: "Peri Peri Chicken Sandwich",
    dietType: "Non-Veg",
    nutrition: { calories: 430, protein: 38, carbs: 35, fat: 12 },
    ingredients: ["Bread 70g", "Chicken 120g", "Greek yogurt 20g", "Lettuce"],
    removableIngredients: ["Lettuce"],
    availableAddOns: ["Extra Cheese (+₹30)", "Extra Chicken (+₹50)", "Avocado (+₹60)", "Grilled Mushrooms (+₹40)", "Olives (+₹20)"],
    allergens: ["Gluten"],
    menuInfo: "Spicy peri peri flavored grilled chicken in a soft bun with Greek yogurt sauce and fresh lettuce."
  },
  {
    itemId: "HP003",
    goalCategory: "High Protein",
    mealCategory: "Sandwich",
    menuName: "Herbed Paneer Sandwich",
    dietType: "Veg",
    nutrition: { calories: 415, protein: 31, carbs: 33, fat: 17 },
    ingredients: ["Bread 70g", "Paneer 120g", "Greek yogurt 20g", "Lettuce"],
    removableIngredients: ["Lettuce"],
    availableAddOns: ["Extra Cheese (+₹30)", "Extra Paneer (+₹40)", "Avocado (+₹60)", "Grilled Mushrooms (+₹40)", "Olives (+₹20)"],
    allergens: ["Gluten", "Milk"],
    menuInfo: "Herb-seasoned paneer slices with creamy Greek yogurt and crisp lettuce in a soft bread."
  },
  {
    itemId: "HP004",
    goalCategory: "High Protein",
    mealCategory: "Sandwich",
    menuName: "Tandoori Paneer Sandwich",
    dietType: "Veg",
    nutrition: { calories: 420, protein: 31, carbs: 34, fat: 17 },
    ingredients: ["Bread 70g", "Paneer 130g", "Greek yogurt 30g", "Spinach"],
    removableIngredients: ["Spinach"],
    availableAddOns: ["Extra Cheese (+₹30)", "Extra Paneer (+₹40)", "Avocado (+₹60)", "Grilled Mushrooms (+₹40)", "Olives (+₹20)"],
    allergens: ["Gluten", "Milk"],
    menuInfo: "Smoky tandoori paneer with thick Greek yogurt marinade and wilted spinach on toasted bread."
  },
  {
    itemId: "HP005",
    goalCategory: "High Protein",
    mealCategory: "Sandwich",
    menuName: "Smoky Tofu Sandwich",
    dietType: "Veg",
    nutrition: { calories: 395, protein: 29, carbs: 33, fat: 14 },
    ingredients: ["Bread 70g", "Tofu 130g", "Greek yogurt 20g", "Tomato 20g"],
    removableIngredients: ["Tomato 20g"],
    availableAddOns: ["Extra Cheese (+₹30)", "Extra Tofu (+₹30)", "Avocado (+₹60)", "Grilled Mushrooms (+₹40)", "Olives (+₹20)"],
    allergens: ["Gluten"],
    menuInfo: "Smoky pan-seared tofu with tangy Greek yogurt and fresh tomato slices in a soft bread."
  },
  {
    itemId: "HP006",
    goalCategory: "High Protein",
    mealCategory: "Sandwich",
    menuName: "Chicken Egg Sandwich",
    dietType: "Non-Veg",
    nutrition: { calories: 445, protein: 40, carbs: 34, fat: 15 },
    ingredients: ["Bread 70g", "Chicken 90g", "Egg 1", "Greek yogurt 20g", "Lettuce"],
    removableIngredients: ["Lettuce"],
    availableAddOns: ["Extra Cheese (+₹30)", "Extra Chicken (+₹50)", "Avocado (+₹60)", "Grilled Mushrooms (+₹40)", "Olives (+₹20)"],
    allergens: ["Gluten", "Egg"],
    menuInfo: "Double protein punch — grilled chicken and a whole egg with Greek yogurt and fresh lettuce."
  },
  {
    itemId: "HP007",
    goalCategory: "High Protein",
    mealCategory: "Salad",
    menuName: "Herb Chicken Salad",
    dietType: "Non-Veg",
    nutrition: { calories: 380, protein: 36, carbs: 14, fat: 16 },
    ingredients: ["Chicken 120g", "Lettuce 60g", "Tomato 20g", "Cucumber 20g"],
    removableIngredients: ["Lettuce 60g", "Tomato 20g", "Cucumber 20g"],
    availableAddOns: ["Feta Cheese (+₹40)", "Boiled Egg (+₹20)", "Almonds (+₹30)", "Quinoa (+₹40)", "Extra Chicken (+₹60)"],
    allergens: ["None Major"],
    menuInfo: "Light herb-seasoned grilled chicken on a fresh bed of lettuce, tomato, and cucumber."
  },
  {
    itemId: "HP008",
    goalCategory: "High Protein",
    mealCategory: "Salad",
    menuName: "Mediterranean Paneer Salad",
    dietType: "Veg",
    nutrition: { calories: 390, protein: 30, carbs: 16, fat: 22 },
    ingredients: ["Paneer 120g", "Lettuce 60g", "Tomato 40g", "Cucumber 20g"],
    removableIngredients: ["Lettuce 60g", "Tomato 40g", "Cucumber 20g"],
    availableAddOns: ["Feta Cheese (+₹40)", "Boiled Egg (+₹20)", "Almonds (+₹30)", "Quinoa (+₹40)", "Grilled Tofu (+₹40)"],
    allergens: ["Milk"],
    menuInfo: "Mediterranean-style fresh paneer cubes tossed with crisp lettuce, ripe tomatoes, and cucumber."
  },
  {
    itemId: "HP009",
    goalCategory: "High Protein",
    mealCategory: "Salad",
    menuName: "Chicken Garden Salad",
    dietType: "Non-Veg",
    nutrition: { calories: 370, protein: 35, carbs: 15, fat: 14 },
    ingredients: ["Chicken 120g", "Lettuce 50g", "Tomato 30g", "Carrot 30g"],
    removableIngredients: ["Lettuce 50g", "Tomato 30g", "Carrot 30g"],
    availableAddOns: ["Feta Cheese (+₹40)", "Boiled Egg (+₹20)", "Almonds (+₹30)", "Quinoa (+₹40)", "Extra Chicken (+₹60)"],
    allergens: ["None Major"],
    menuInfo: "Grilled chicken breast over a colourful garden salad of lettuce, tomato, and fresh carrots."
  },
  {
    itemId: "HP010",
    goalCategory: "High Protein",
    mealCategory: "Salad",
    menuName: "Nutty Paneer Salad",
    dietType: "Veg",
    nutrition: { calories: 400, protein: 29, carbs: 17, fat: 24 },
    ingredients: ["Paneer 100g", "Pumpkin seeds 10g", "Lettuce 50g", "Almonds 20g"],
    removableIngredients: ["Pumpkin seeds 10g", "Lettuce 50g", "Almonds 20g"],
    availableAddOns: ["Feta Cheese (+₹40)", "Boiled Egg (+₹20)", "Walnuts (+₹30)", "Quinoa (+₹40)", "Grilled Tofu (+₹40)"],
    allergens: ["Milk"],
    menuInfo: "Soft paneer cubes tossed with crunchy pumpkin seeds, roasted almonds, and fresh lettuce leaves."
  },
  {
    itemId: "HP011",
    goalCategory: "High Protein",
    mealCategory: "Bowl",
    menuName: "Greek Yogurt Protein Bowl",
    dietType: "Veg",
    nutrition: { calories: 410, protein: 31, carbs: 38, fat: 13 },
    ingredients: ["Greek yogurt 180g", "Oats 40g", "Banana 70g", "Chia seeds 10g"],
    removableIngredients: ["Chia seeds 10g"],
    availableAddOns: ["Almonds (+₹30)", "Fresh Berries (+₹40)", "Maple Syrup (+₹30)", "Dark Chocolate Chips (+₹20)", "Walnuts (+₹30)"],
    allergens: ["Milk"],
    menuInfo: "Thick Greek yogurt base topped with rolled oats, ripe banana slices, and nutritious chia seeds."
  },
  {
    itemId: "HP012",
    goalCategory: "High Protein",
    mealCategory: "Bowl",
    menuName: "Peanut Butter Oats Bowl",
    dietType: "Veg",
    nutrition: { calories: 440, protein: 30, carbs: 39, fat: 16 },
    ingredients: ["Greek yogurt 40g", "Oats 40g", "Peanut butter 13g", "Banana"],
    removableIngredients: ["Peanut butter 13g"],
    availableAddOns: ["Almonds (+₹30)", "Chia Seeds (+₹20)", "Maple Syrup (+₹30)", "Dark Chocolate Chips (+₹20)", "Fresh Berries (+₹40)"],
    allergens: ["Peanut", "Gluten (may contain)"],
    menuInfo: "Hearty oats bowl with creamy peanut butter drizzle, Greek yogurt, and fresh banana."
  },
  {
    itemId: "HP013",
    goalCategory: "High Protein",
    mealCategory: "Smoothie",
    menuName: "Banana Protein Smoothie",
    dietType: "Veg",
    nutrition: { calories: 400, protein: 30, carbs: 37, fat: 13 },
    ingredients: ["Greek yogurt 150g", "Banana 80g", "Oats 20g", "Peanut butter"],
    removableIngredients: ["Peanut butter"],
    availableAddOns: ["Whey Protein (+₹60)", "Chia Seeds (+₹20)", "Flax Seeds (+₹15)", "Almonds (+₹30)", "Strawberries (+₹30)"],
    allergens: ["None Major"],
    menuInfo: "Creamy blended smoothie with banana, Greek yogurt, oats, and a hint of peanut butter."
  },
  {
    itemId: "HP014",
    goalCategory: "High Protein",
    mealCategory: "Smoothie",
    menuName: "Chocolate Protein Smoothie",
    dietType: "Veg",
    nutrition: { calories: 415, protein: 31, carbs: 36, fat: 14 },
    ingredients: ["Greek yogurt 150g", "Banana 70g", "Cocoa powder 6g"],
    removableIngredients: ["Cocoa powder 6g"],
    availableAddOns: ["Whey Protein (+₹60)", "Chia Seeds (+₹20)", "Flax Seeds (+₹15)", "Almonds (+₹30)", "Peanut Butter (+₹20)"],
    allergens: ["None Major"],
    menuInfo: "Rich chocolate-flavored protein smoothie made with Greek yogurt, banana, and natural cocoa."
  },
  {
    itemId: "HP015",
    goalCategory: "High Protein",
    mealCategory: "Smoothie",
    menuName: "Coffee Protein Smoothie",
    dietType: "Veg",
    nutrition: { calories: 405, protein: 30, carbs: 35, fat: 13 },
    ingredients: ["Greek yogurt 150g", "Banana 70g", "Oats 20g", "Coffee 2g"],
    removableIngredients: ["Coffee 2g"],
    availableAddOns: ["Whey Protein (+₹60)", "Chia Seeds (+₹20)", "Flax Seeds (+₹15)", "Almonds (+₹30)", "Peanut Butter (+₹20)"],
    allergens: ["None Major"],
    menuInfo: "A refreshing morning boost — Greek yogurt blended with banana, oats, and a touch of coffee."
  },
  {
    itemId: "WL001",
    goalCategory: "Weight Loss",
    mealCategory: "Sandwich",
    menuName: "Lean Herb Chicken Sandwich",
    dietType: "Non-Veg",
    nutrition: { calories: 320, protein: 31, carbs: 31, fat: 8 },
    ingredients: ["Bread 70g", "Chicken 100g", "Greek yogurt 20g", "Lettuce"],
    removableIngredients: ["Lettuce"],
    availableAddOns: ["Extra Cheese (+₹30)", "Extra Chicken (+₹50)", "Avocado (+₹60)", "Grilled Mushrooms (+₹40)", "Olives (+₹20)"],
    allergens: ["Gluten"],
    menuInfo: "A lighter take on the classic — lean grilled chicken with Greek yogurt spread and crisp lettuce."
  },
  {
    itemId: "WL002",
    goalCategory: "Weight Loss",
    mealCategory: "Sandwich",
    menuName: "Egg White Spinach Sandwich",
    dietType: "Non-Veg",
    nutrition: { calories: 305, protein: 28, carbs: 29, fat: 6 },
    ingredients: ["Bread 70g", "Egg whites 120g", "Greek yogurt 20g", "Spinach"],
    removableIngredients: ["Spinach"],
    availableAddOns: ["Extra Cheese (+₹30)", "Extra Egg Whites (+₹25)", "Avocado (+₹60)", "Grilled Mushrooms (+₹40)", "Olives (+₹20)"],
    allergens: ["Gluten", "Egg"],
    menuInfo: "Fluffy egg whites with fresh spinach and Greek yogurt — a clean, low-fat breakfast sandwich."
  },
  {
    itemId: "WL003",
    goalCategory: "Weight Loss",
    mealCategory: "Sandwich",
    menuName: "Spinach Paneer Sandwich",
    dietType: "Veg",
    nutrition: { calories: 330, protein: 24, carbs: 30, fat: 11 },
    ingredients: ["Bread 70g", "Paneer 90g", "Greek yogurt 20g", "Spinach 20g"],
    removableIngredients: ["Spinach 20g"],
    availableAddOns: ["Extra Cheese (+₹30)", "Extra Paneer (+₹40)", "Avocado (+₹60)", "Grilled Mushrooms (+₹40)", "Olives (+₹20)"],
    allergens: ["Gluten", "Milk"],
    menuInfo: "Lightly grilled paneer with iron-rich spinach and a cooling Greek yogurt spread in soft bread."
  },
  {
    itemId: "WL004",
    goalCategory: "Weight Loss",
    mealCategory: "Sandwich",
    menuName: "Hummus Veg Sandwich",
    dietType: "Veg",
    nutrition: { calories: 315, protein: 13, carbs: 34, fat: 10 },
    ingredients: ["Bread 70g", "Hummus 40g", "Lettuce 50g", "Tomato 40g", "Cucumber"],
    removableIngredients: ["Lettuce 50g", "Tomato 40g", "Cucumber"],
    availableAddOns: ["Extra Cheese (+₹30)", "Extra Hummus (+₹30)", "Avocado (+₹60)", "Grilled Mushrooms (+₹40)", "Olives (+₹20)"],
    allergens: ["Gluten"],
    menuInfo: "Creamy hummus spread on soft bread layered with fresh lettuce, tomato, and cucumber."
  },
  {
    itemId: "WL005",
    goalCategory: "Weight Loss",
    mealCategory: "Sandwich",
    menuName: "Herbed Tofu Sandwich",
    dietType: "Veg",
    nutrition: { calories: 320, protein: 22, carbs: 29, fat: 9 },
    ingredients: ["Bread 70g", "Tofu 100g", "Greek yogurt 20g", "Spinach 20g"],
    removableIngredients: ["Spinach 20g"],
    availableAddOns: ["Extra Cheese (+₹30)", "Extra Tofu (+₹30)", "Avocado (+₹60)", "Grilled Mushrooms (+₹40)", "Olives (+₹20)"],
    allergens: ["Gluten"],
    menuInfo: "Herb-marinated tofu slices with fresh spinach and creamy Greek yogurt in soft bread."
  },
  {
    itemId: "WL006",
    goalCategory: "Weight Loss",
    mealCategory: "Sandwich",
    menuName: "Smoky Chicken Sandwich",
    dietType: "Non-Veg",
    nutrition: { calories: 325, protein: 32, carbs: 30, fat: 8 },
    ingredients: ["Bread 70g", "Chicken 100g", "Greek yogurt 20g", "Tomato"],
    removableIngredients: ["Tomato"],
    availableAddOns: ["Extra Cheese (+₹30)", "Extra Chicken (+₹50)", "Avocado (+₹60)", "Grilled Mushrooms (+₹40)", "Olives (+₹20)"],
    allergens: ["Gluten"],
    menuInfo: "Smoky char-grilled chicken breast with fresh tomato slices and a light Greek yogurt dressing."
  },
  {
    itemId: "WL007",
    goalCategory: "Weight Loss",
    mealCategory: "Salad",
    menuName: "Garden Crunch Salad",
    dietType: "Veg",
    nutrition: { calories: 230, protein: 6, carbs: 18, fat: 9 },
    ingredients: ["Lettuce 80g", "Cucumber 40g", "Tomato 30g", "Carrot 20g"],
    removableIngredients: ["Lettuce 80g", "Cucumber 40g", "Tomato 30g", "Carrot 20g"],
    availableAddOns: ["Feta Cheese (+₹40)", "Boiled Egg (+₹20)", "Almonds (+₹30)", "Quinoa (+₹40)", "Grilled Tofu (+₹40)"],
    allergens: ["None Major"],
    menuInfo: "A refreshing mix of garden-fresh vegetables — low in calories and high in fiber."
  },
  {
    itemId: "WL008",
    goalCategory: "Weight Loss",
    mealCategory: "Salad",
    menuName: "Paneer Garden Salad",
    dietType: "Veg",
    nutrition: { calories: 295, protein: 22, carbs: 13, fat: 14 },
    ingredients: ["Paneer 90g", "Lettuce 60g", "Tomato 30g", "Cucumber 30g"],
    removableIngredients: ["Lettuce 60g", "Tomato 30g", "Cucumber 30g"],
    availableAddOns: ["Feta Cheese (+₹40)", "Boiled Egg (+₹20)", "Almonds (+₹30)", "Quinoa (+₹40)", "Grilled Tofu (+₹40)"],
    allergens: ["Milk"],
    menuInfo: "Soft paneer cubes over a fresh bed of lettuce, tomato, and cucumber — simple and wholesome."
  },
  {
    itemId: "WL009",
    goalCategory: "Weight Loss",
    mealCategory: "Salad",
    menuName: "Chicken Garden Salad",
    dietType: "Non-Veg",
    nutrition: { calories: 300, protein: 31, carbs: 12, fat: 10 },
    ingredients: ["Chicken 100g", "Lettuce 50g", "Tomato 30g", "Cucumber 30g"],
    removableIngredients: ["Lettuce 50g", "Tomato 30g", "Cucumber 30g"],
    availableAddOns: ["Feta Cheese (+₹40)", "Boiled Egg (+₹20)", "Almonds (+₹30)", "Quinoa (+₹40)", "Extra Chicken (+₹60)"],
    allergens: ["None Major"],
    menuInfo: "Lean grilled chicken over crisp garden vegetables — high protein and very low calorie."
  },
  {
    itemId: "WL010",
    goalCategory: "Weight Loss",
    mealCategory: "Salad",
    menuName: "Egg Spinach Salad",
    dietType: "Non-Veg",
    nutrition: { calories: 290, protein: 23, carbs: 9, fat: 15 },
    ingredients: ["Egg 3", "Spinach 40g", "Lettuce 50g", "Tomato 40g"],
    removableIngredients: ["Spinach 40g", "Lettuce 50g", "Tomato 40g"],
    availableAddOns: ["Feta Cheese (+₹40)", "Extra Boiled Egg (+₹20)", "Almonds (+₹30)", "Quinoa (+₹40)", "Extra Chicken (+₹60)"],
    allergens: ["Egg"],
    menuInfo: "Boiled eggs with fresh spinach, lettuce, and tomato — a nutrient-dense, low-carb breakfast salad."
  },
  {
    itemId: "WL011",
    goalCategory: "Weight Loss",
    mealCategory: "Bowl",
    menuName: "Apple Cinnamon Overnight Oats",
    dietType: "Veg",
    nutrition: { calories: 330, protein: 21, carbs: 37, fat: 8 },
    ingredients: ["Greek yogurt 180g", "Oats 40g", "Apple 70g", "Cinnamon 2g"],
    removableIngredients: ["Cinnamon 2g"],
    availableAddOns: ["Almonds (+₹30)", "Chia Seeds (+₹20)", "Maple Syrup (+₹30)", "Dark Chocolate Chips (+₹20)", "Fresh Berries (+₹40)"],
    allergens: ["Gluten (may contain)"],
    menuInfo: "Overnight oats soaked in Greek yogurt with fresh apple slices and a warming cinnamon touch."
  },
  {
    itemId: "WL012",
    goalCategory: "Weight Loss",
    mealCategory: "Bowl",
    menuName: "Greek Yogurt Apple Bowl",
    dietType: "Veg",
    nutrition: { calories: 310, protein: 20, carbs: 24, fat: 11 },
    ingredients: ["Greek yogurt 160g", "Apple 40g", "Chia seeds 10g", "Oats 30g"],
    removableIngredients: ["Chia seeds 10g"],
    availableAddOns: ["Almonds (+₹30)", "Fresh Berries (+₹40)", "Maple Syrup (+₹30)", "Dark Chocolate Chips (+₹20)", "Walnuts (+₹30)"],
    allergens: ["Milk"],
    menuInfo: "Creamy Greek yogurt bowl topped with fresh apple chunks, chia seeds, and rolled oats."
  },
  {
    itemId: "WL013",
    goalCategory: "Weight Loss",
    mealCategory: "Smoothie",
    menuName: "Green Boost Smoothie",
    dietType: "Veg",
    nutrition: { calories: 210, protein: 16, carbs: 18, fat: 6 },
    ingredients: ["Greek yogurt 150g", "Spinach 30g", "Apple 50g", "Chia seeds 10g"],
    removableIngredients: ["Spinach 30g", "Chia seeds 10g"],
    availableAddOns: ["Whey Protein (+₹60)", "Flax Seeds (+₹15)", "Almonds (+₹30)", "Peanut Butter (+₹20)", "Banana (+₹20)"],
    allergens: ["None Major"],
    menuInfo: "A vibrant green smoothie blended with Greek yogurt, fresh spinach, apple, and chia seeds."
  },
  {
    itemId: "WL014",
    goalCategory: "Weight Loss",
    mealCategory: "Smoothie",
    menuName: "Apple Cinnamon Smoothie",
    dietType: "Veg",
    nutrition: { calories: 250, protein: 16, carbs: 30, fat: 6 },
    ingredients: ["Greek yogurt 150g", "Apple 80g", "Cinnamon 2g"],
    removableIngredients: ["Cinnamon 2g"],
    availableAddOns: ["Whey Protein (+₹60)", "Chia Seeds (+₹20)", "Flax Seeds (+₹15)", "Almonds (+₹30)", "Peanut Butter (+₹20)"],
    allergens: ["None Major"],
    menuInfo: "A light and comforting smoothie of Greek yogurt, fresh apple, and warming cinnamon."
  },
  {
    itemId: "WL015",
    goalCategory: "Weight Loss",
    mealCategory: "Smoothie",
    menuName: "Cucumber Mint Smoothie",
    dietType: "Veg",
    nutrition: { calories: 180, protein: 15, carbs: 12, fat: 5 },
    ingredients: ["Greek yogurt 150g", "Cucumber 80g", "Mint leaves 5g", "Lemon 1"],
    removableIngredients: ["Mint leaves 5g", "Lemon 1"],
    availableAddOns: ["Whey Protein (+₹60)", "Chia Seeds (+₹20)", "Flax Seeds (+₹15)", "Almonds (+₹30)", "Banana (+₹20)"],
    allergens: ["None Major"],
    menuInfo: "Ultra-refreshing cucumber and mint smoothie with Greek yogurt and a squeeze of fresh lemon."
  },
  {
    itemId: "WG001",
    goalCategory: "Weight Gain",
    mealCategory: "Sandwich",
    menuName: "Chicken Cheese Sandwich",
    dietType: "Non-Veg",
    nutrition: { calories: 540, protein: 39, carbs: 36, fat: 23 },
    ingredients: ["Bread 70g", "Chicken 120g", "Cheese 20g", "Greek yogurt 20g"],
    removableIngredients: ["Cheese 20g"],
    availableAddOns: ["Extra Cheese (+₹30)", "Extra Chicken (+₹50)", "Avocado (+₹60)", "Grilled Mushrooms (+₹40)", "Olives (+₹20)"],
    allergens: ["Gluten", "Milk"],
    menuInfo: "Grilled chicken topped with melted cheese and a Greek yogurt spread — calorie-dense and protein-rich."
  },
  {
    itemId: "WG002",
    goalCategory: "Weight Gain",
    mealCategory: "Sandwich",
    menuName: "Egg Cheese Sandwich",
    dietType: "Non-Veg",
    nutrition: { calories: 510, protein: 30, carbs: 34, fat: 24 },
    ingredients: ["Bread 70g", "Egg 2", "Cheese 20g", "Greek yogurt 20g", "Tomato"],
    removableIngredients: ["Cheese 20g", "Tomato"],
    availableAddOns: ["Extra Cheese (+₹30)", "Extra Egg (+₹20)", "Avocado (+₹60)", "Grilled Mushrooms (+₹40)", "Olives (+₹20)"],
    allergens: ["Gluten", "Milk", "Egg"],
    menuInfo: "Double eggs with melted cheese and fresh tomato on toasted bread — a classic high-calorie breakfast."
  },
  {
    itemId: "WG003",
    goalCategory: "Weight Gain",
    mealCategory: "Sandwich",
    menuName: "Peanut Butter Banana Sandwich",
    dietType: "Veg",
    nutrition: { calories: 525, protein: 18, carbs: 55, fat: 25 },
    ingredients: ["Bread 70g", "Peanut butter 35g", "Banana 80g", "Honey 10g"],
    removableIngredients: ["Honey 10g"],
    availableAddOns: ["Extra Cheese (+₹30)", "Extra Peanut Butter (+₹20)", "Avocado (+₹60)", "Grilled Mushrooms (+₹40)", "Olives (+₹20)"],
    allergens: ["Gluten", "Peanut"],
    menuInfo: "Thick peanut butter with ripe banana slices and a drizzle of honey — sweet, dense, and energising."
  },
  {
    itemId: "WG004",
    goalCategory: "Weight Gain",
    mealCategory: "Sandwich",
    menuName: "Paneer Cheese Sandwich",
    dietType: "Veg",
    nutrition: { calories: 535, protein: 29, carbs: 35, fat: 27 },
    ingredients: ["Bread 70g", "Paneer 130g", "Cheese 20g", "Tomato 30g"],
    removableIngredients: ["Cheese 20g", "Tomato 30g"],
    availableAddOns: ["Extra Cheese (+₹30)", "Extra Paneer (+₹40)", "Avocado (+₹60)", "Grilled Mushrooms (+₹40)", "Olives (+₹20)"],
    allergens: ["Gluten", "Milk"],
    menuInfo: "Generous paneer slices layered with melted cheese and fresh tomato in toasted bread."
  },
  {
    itemId: "WG005",
    goalCategory: "Weight Gain",
    mealCategory: "Sandwich",
    menuName: "Corn Veg Sandwich",
    dietType: "Veg",
    nutrition: { calories: 495, protein: 20, carbs: 46, fat: 22 },
    ingredients: ["Bread 70g", "Corn 60g", "Cheese 30g", "Greek yogurt 20g"],
    removableIngredients: ["Cheese 30g"],
    availableAddOns: ["Extra Cheese (+₹30)", "Extra Corn (+₹20)", "Avocado (+₹60)", "Grilled Mushrooms (+₹40)", "Olives (+₹20)"],
    allergens: ["Gluten"],
    menuInfo: "Sweet corn kernels with melted cheese and Greek yogurt in soft bread — comforting and calorie-rich."
  },
  {
    itemId: "WG006",
    goalCategory: "Weight Gain",
    mealCategory: "Sandwich",
    menuName: "Tandoori Chicken Sandwich",
    dietType: "Non-Veg",
    nutrition: { calories: 530, protein: 38, carbs: 35, fat: 21 },
    ingredients: ["Bread 70g", "Chicken 120g", "Greek yogurt 30g", "Tandoori spices"],
    removableIngredients: ["Tandoori spices"],
    availableAddOns: ["Extra Cheese (+₹30)", "Extra Chicken (+₹50)", "Avocado (+₹60)", "Grilled Mushrooms (+₹40)", "Olives (+₹20)"],
    allergens: ["Gluten"],
    menuInfo: "Boldly spiced tandoori chicken with thick Greek yogurt marinade in a hearty bread."
  },
  {
    itemId: "WG007",
    goalCategory: "Weight Gain",
    mealCategory: "Salad",
    menuName: "Chicken Corn Salad",
    dietType: "Non-Veg",
    nutrition: { calories: 440, protein: 36, carbs: 28, fat: 18 },
    ingredients: ["Chicken 120g", "Corn 70g", "Lettuce 50g", "Tomato 20g", "Cucumber"],
    removableIngredients: ["Lettuce 50g", "Tomato 20g", "Cucumber"],
    availableAddOns: ["Feta Cheese (+₹40)", "Boiled Egg (+₹20)", "Almonds (+₹30)", "Quinoa (+₹40)", "Extra Chicken (+₹60)"],
    allergens: ["None Major"],
    menuInfo: "Grilled chicken with sweet corn and fresh vegetables — higher-carb salad for muscle fuelling."
  },
  {
    itemId: "WG008",
    goalCategory: "Weight Gain",
    mealCategory: "Salad",
    menuName: "Nutty Paneer Salad",
    dietType: "Veg",
    nutrition: { calories: 455, protein: 24, carbs: 30, fat: 24 },
    ingredients: ["Paneer 110g", "Pumpkin seeds 10g", "Lettuce 50g", "Almonds 20g", "Olive oil 5g"],
    removableIngredients: ["Pumpkin seeds 10g", "Lettuce 50g", "Almonds 20g", "Olive oil 5g"],
    availableAddOns: ["Feta Cheese (+₹40)", "Boiled Egg (+₹20)", "Walnuts (+₹30)", "Quinoa (+₹40)", "Grilled Tofu (+₹40)"],
    allergens: ["Milk"],
    menuInfo: "Paneer cubes with roasted almonds, pumpkin seeds, and a drizzle of olive oil for healthy calorie surplus."
  },
  {
    itemId: "WG009",
    goalCategory: "Weight Gain",
    mealCategory: "Salad",
    menuName: "Cottage Cheese Salad",
    dietType: "Veg",
    nutrition: { calories: 430, protein: 25, carbs: 18, fat: 22 },
    ingredients: ["Paneer 100g", "Lettuce 50g", "Tomato 30g", "Cucumber 30g", "Olive oil 10g"],
    removableIngredients: ["Lettuce 50g", "Tomato 30g", "Cucumber 30g", "Olive oil 10g"],
    availableAddOns: ["Feta Cheese (+₹40)", "Boiled Egg (+₹20)", "Almonds (+₹30)", "Quinoa (+₹40)", "Grilled Tofu (+₹40)"],
    allergens: ["Milk"],
    menuInfo: "Soft cottage cheese over a fresh salad base with a light olive oil drizzle for extra calories."
  },
  {
    itemId: "WG010",
    goalCategory: "Weight Gain",
    mealCategory: "Salad",
    menuName: "Herb Chicken Salad",
    dietType: "Non-Veg",
    nutrition: { calories: 435, protein: 38, carbs: 15, fat: 20 },
    ingredients: ["Chicken 120g", "Lettuce 60g", "Tomato 30g", "Olive oil 15g", "Almonds 20g"],
    removableIngredients: ["Lettuce 60g", "Tomato 30g", "Olive oil 15g", "Almonds 20g"],
    availableAddOns: ["Feta Cheese (+₹40)", "Boiled Egg (+₹20)", "Walnuts (+₹30)", "Quinoa (+₹40)", "Extra Chicken (+₹60)"],
    allergens: ["None Major"],
    menuInfo: "Herb-grilled chicken on fresh greens with crunchy almonds and olive oil — calorie-dense yet clean."
  },
  {
    itemId: "WG011",
    goalCategory: "Weight Gain",
    mealCategory: "Bowl",
    menuName: "Banana Nut Oats Bowl",
    dietType: "Veg",
    nutrition: { calories: 520, protein: 24, carbs: 52, fat: 22 },
    ingredients: ["Greek yogurt 180g", "Oats 40g", "Banana 80g", "Peanut butter 20g"],
    removableIngredients: ["Peanut butter 20g"],
    availableAddOns: ["Almonds (+₹30)", "Chia Seeds (+₹20)", "Maple Syrup (+₹30)", "Dark Chocolate Chips (+₹20)", "Fresh Berries (+₹40)"],
    allergens: ["Gluten (may contain)"],
    menuInfo: "A hearty bowl of oats and Greek yogurt topped with ripe banana and creamy peanut butter."
  },
  {
    itemId: "WG012",
    goalCategory: "Weight Gain",
    mealCategory: "Bowl",
    menuName: "Peanut Butter Oats Bowl",
    dietType: "Veg",
    nutrition: { calories: 510, protein: 23, carbs: 49, fat: 21 },
    ingredients: ["Greek yogurt 40g", "Oats 40g", "Peanut butter 20g", "Banana 80g", "Honey 10g"],
    removableIngredients: ["Peanut butter 20g", "Honey 10g"],
    availableAddOns: ["Almonds (+₹30)", "Chia Seeds (+₹20)", "Maple Syrup (+₹30)", "Dark Chocolate Chips (+₹20)", "Fresh Berries (+₹40)"],
    allergens: ["Peanut", "Gluten (may contain)"],
    menuInfo: "Thick oats bowl drizzled with peanut butter, fresh banana, and honey for a calorie-rich start."
  },
  {
    itemId: "WG013",
    goalCategory: "Weight Gain",
    mealCategory: "Smoothie",
    menuName: "Peanut Butter Oats Smoothie",
    dietType: "Veg",
    nutrition: { calories: 510, protein: 21, carbs: 52, fat: 22 },
    ingredients: ["Greek yogurt 150g", "Banana 80g", "Oats 20g", "Peanut butter 20g"],
    removableIngredients: ["Peanut butter 20g"],
    availableAddOns: ["Whey Protein (+₹60)", "Chia Seeds (+₹20)", "Flax Seeds (+₹15)", "Almonds (+₹30)", "Strawberry (+₹30)"],
    allergens: ["Peanut", "Gluten (may contain)"],
    menuInfo: "A thick, calorie-packed smoothie with peanut butter, oats, banana, and Greek yogurt."
  },
  {
    itemId: "WG014",
    goalCategory: "Weight Gain",
    mealCategory: "Smoothie",
    menuName: "Banana Almond Smoothie",
    dietType: "Veg",
    nutrition: { calories: 500, protein: 20, carbs: 50, fat: 20 },
    ingredients: ["Greek yogurt 150g", "Banana 80g", "Almonds 10g", "Oats 20g"],
    removableIngredients: ["Almonds 10g"],
    availableAddOns: ["Whey Protein (+₹60)", "Chia Seeds (+₹20)", "Flax Seeds (+₹15)", "Peanut Butter (+₹20)", "Strawberry (+₹30)"],
    allergens: ["None Major"],
    menuInfo: "Creamy banana and almond smoothie blended with Greek yogurt and oats for sustained energy."
  },
  {
    itemId: "WG015",
    goalCategory: "Weight Gain",
    mealCategory: "Smoothie",
    menuName: "Chocolate Protein Smoothie",
    dietType: "Veg",
    nutrition: { calories: 495, protein: 22, carbs: 48, fat: 20 },
    ingredients: ["Greek yogurt 150g", "Banana 70g", "Oats 20g", "Cocoa powder 5g"],
    removableIngredients: ["Cocoa powder 5g"],
    availableAddOns: ["Whey Protein (+₹60)", "Chia Seeds (+₹20)", "Flax Seeds (+₹15)", "Almonds (+₹30)", "Peanut Butter (+₹20)"],
    allergens: ["None Major"],
    menuInfo: "Rich chocolate smoothie with oats and banana blended into Greek yogurt — delicious and calorie-dense."
  },
  {
    itemId: "DF001",
    goalCategory: "Diabetic Friendly",
    mealCategory: "Sandwich",
    menuName: "Grilled Chicken Sandwich",
    dietType: "Non-Veg",
    nutrition: { calories: 340, protein: 33, carbs: 28, fat: 9 },
    ingredients: ["Bread 70g", "Chicken 120g", "Greek yogurt 20g", "Lettuce", "Tomato"],
    removableIngredients: ["Lettuce", "Tomato"],
    availableAddOns: ["Extra Cheese (+₹30)", "Extra Chicken (+₹50)", "Avocado (+₹60)", "Grilled Mushrooms (+₹40)", "Olives (+₹20)"],
    allergens: ["Gluten"],
    menuInfo: "Herb-marinated grilled chicken with creamy Greek yogurt and fresh lettuce — low GI and protein-rich."
  },
  {
    itemId: "DF002",
    goalCategory: "Diabetic Friendly",
    mealCategory: "Sandwich",
    menuName: "Egg White Spinach Sandwich",
    dietType: "Non-Veg",
    nutrition: { calories: 305, protein: 28, carbs: 27, fat: 6 },
    ingredients: ["Bread 70g", "Egg whites 120g", "Spinach 30g", "Greek yogurt 20g", "Tomato 20g"],
    removableIngredients: ["Spinach 30g", "Tomato 20g"],
    availableAddOns: ["Extra Cheese (+₹30)", "Extra Egg Whites (+₹25)", "Avocado (+₹60)", "Grilled Mushrooms (+₹40)", "Olives (+₹20)"],
    allergens: ["Gluten", "Egg"],
    menuInfo: "Fluffy egg whites with iron-rich spinach and Greek yogurt — a clean, low-fat, blood-sugar-friendly sandwich."
  },
  {
    itemId: "DF003",
    goalCategory: "Diabetic Friendly",
    mealCategory: "Sandwich",
    menuName: "Spinach Paneer Sandwich",
    dietType: "Veg",
    nutrition: { calories: 335, protein: 24, carbs: 29, fat: 11 },
    ingredients: ["Bread 70g", "Paneer 100g", "Spinach 30g", "Greek yogurt 20g"],
    removableIngredients: ["Spinach 30g"],
    availableAddOns: ["Extra Cheese (+₹30)", "Extra Paneer (+₹40)", "Avocado (+₹60)", "Grilled Mushrooms (+₹40)", "Olives (+₹20)"],
    allergens: ["Gluten", "Milk"],
    menuInfo: "Lightly grilled paneer with iron-rich spinach and a cooling Greek yogurt spread — steady energy, no sugar spike."
  },
  {
    itemId: "DF004",
    goalCategory: "Diabetic Friendly",
    mealCategory: "Sandwich",
    menuName: "Herbed Tofu Sandwich",
    dietType: "Veg",
    nutrition: { calories: 315, protein: 22, carbs: 29, fat: 9 },
    ingredients: ["Bread 70g", "Tofu 100g", "Spinach 20g", "Greek yogurt 20g"],
    removableIngredients: ["Spinach 20g"],
    availableAddOns: ["Extra Cheese (+₹30)", "Extra Tofu (+₹30)", "Avocado (+₹60)", "Grilled Mushrooms (+₹40)", "Olives (+₹20)"],
    allergens: ["Gluten"],
    menuInfo: "Herb-marinated tofu with fresh spinach and creamy Greek yogurt — a plant-based, blood-sugar-friendly option."
  },
  {
    itemId: "DF005",
    goalCategory: "Diabetic Friendly",
    mealCategory: "Sandwich",
    menuName: "Hummus Veg Sandwich",
    dietType: "Veg",
    nutrition: { calories: 310, protein: 12, carbs: 34, fat: 10 },
    ingredients: ["Bread 70g", "Hummus 40g", "Lettuce 50g", "Tomato 30g", "Cucumber 30g"],
    removableIngredients: ["Lettuce 50g", "Tomato 30g", "Cucumber 30g"],
    availableAddOns: ["Extra Cheese (+₹30)", "Extra Hummus (+₹30)", "Avocado (+₹60)", "Grilled Mushrooms (+₹40)", "Olives (+₹20)"],
    allergens: ["Gluten"],
    menuInfo: "Creamy hummus layered with fresh lettuce, tomato, and cucumber — fibre-rich and gentle on blood sugar."
  },
  {
    itemId: "DF006",
    goalCategory: "Diabetic Friendly",
    mealCategory: "Sandwich",
    menuName: "Smoky Chicken Sandwich",
    dietType: "Non-Veg",
    nutrition: { calories: 330, protein: 31, carbs: 28, fat: 8 },
    ingredients: ["Bread 70g", "Chicken 100g", "Lettuce 30g", "Cucumber 20g", "Greek yogurt 20g"],
    removableIngredients: ["Lettuce 30g", "Cucumber 20g"],
    availableAddOns: ["Extra Cheese (+₹30)", "Extra Chicken (+₹50)", "Avocado (+₹60)", "Grilled Mushrooms (+₹40)", "Olives (+₹20)"],
    allergens: ["Gluten"],
    menuInfo: "Lean smoky grilled chicken with crunchy lettuce and cucumber in a light Greek yogurt dressing."
  },
  {
    itemId: "DF007",
    goalCategory: "Diabetic Friendly",
    mealCategory: "Salad",
    menuName: "Herb Chicken Salad",
    dietType: "Non-Veg",
    nutrition: { calories: 300, protein: 35, carbs: 10, fat: 11 },
    ingredients: ["Chicken 120g", "Lettuce 60g", "Tomato 20g", "Cucumber 20g"],
    removableIngredients: ["Lettuce 60g", "Tomato 20g", "Cucumber 20g"],
    availableAddOns: ["Feta Cheese (+₹40)", "Boiled Egg (+₹20)", "Almonds (+₹30)", "Quinoa (+₹40)", "Extra Chicken (+₹60)"],
    allergens: ["None Major"],
    menuInfo: "Light herb-seasoned grilled chicken on a bed of fresh lettuce, tomato, and cucumber — zero added sugar."
  },
  {
    itemId: "DF008",
    goalCategory: "Diabetic Friendly",
    mealCategory: "Salad",
    menuName: "Paneer Garden Salad",
    dietType: "Veg",
    nutrition: { calories: 290, protein: 22, carbs: 13, fat: 14 },
    ingredients: ["Lettuce 80g", "Cucumber 40g", "Tomato 30g", "Carrot 20g", "Pumpkin seeds 10g"],
    removableIngredients: ["Lettuce 80g", "Cucumber 40g", "Tomato 30g", "Carrot 20g", "Pumpkin seeds 10g"],
    availableAddOns: ["Feta Cheese (+₹40)", "Boiled Egg (+₹20)", "Almonds (+₹30)", "Quinoa (+₹40)", "Grilled Tofu (+₹40)"],
    allergens: ["Milk"],
    menuInfo: "A fibre-packed mix of garden vegetables with crunchy pumpkin seeds — ideal for steady blood glucose."
  },
  {
    itemId: "DF009",
    goalCategory: "Diabetic Friendly",
    mealCategory: "Salad",
    menuName: "Sprouts Garden Salad",
    dietType: "Veg",
    nutrition: { calories: 250, protein: 16, carbs: 18, fat: 9 },
    ingredients: ["Sprouts 60g", "Lettuce 50g", "Tomato 30g", "Carrot 30g", "Cucumber 20g"],
    removableIngredients: ["Lettuce 50g", "Tomato 30g", "Carrot 30g", "Cucumber 20g"],
    availableAddOns: ["Feta Cheese (+₹40)", "Boiled Egg (+₹20)", "Almonds (+₹30)", "Quinoa (+₹40)", "Grilled Tofu (+₹40)"],
    allergens: ["None Major"],
    menuInfo: "A vibrant sprouts salad loaded with crunchy vegetables, offering sustained energy and essential fiber."
  },
  {
    itemId: "DF010",
    goalCategory: "Diabetic Friendly",
    mealCategory: "Salad",
    menuName: "Egg Spinach Salad",
    dietType: "Non-Veg",
    nutrition: { calories: 285, protein: 23, carbs: 9, fat: 15 },
    ingredients: ["Egg 3", "Spinach 40g", "Lettuce 50g", "Tomato 40g"],
    removableIngredients: ["Spinach 40g", "Lettuce 50g", "Tomato 40g"],
    availableAddOns: ["Feta Cheese (+₹40)", "Extra Boiled Egg (+₹20)", "Almonds (+₹30)", "Quinoa (+₹40)", "Extra Chicken (+₹60)"],
    allergens: ["Egg"],
    menuInfo: "Hard-boiled egg wedges served over a bed of baby spinach, cherry tomatoes, and cucumber."
  },
  {
    itemId: "DF011",
    goalCategory: "Diabetic Friendly",
    mealCategory: "Bowl",
    menuName: "Mixed Seed Yogurt Bowl",
    dietType: "Veg",
    nutrition: { calories: 320, protein: 22, carbs: 18, fat: 16 },
    ingredients: ["Greek yogurt 180g", "Pumpkin seeds 5g", "Chia seeds 5g", "Sunflower seeds 5g", "Flax seeds 5g"],
    removableIngredients: ["Pumpkin seeds 5g", "Chia seeds 5g", "Sunflower seeds 5g", "Flax seeds 5g"],
    availableAddOns: ["Almonds (+₹30)", "Fresh Berries (+₹40)", "Maple Syrup (+₹30)", "Dark Chocolate Chips (+₹20)", "Walnuts (+₹30)"],
    allergens: ["Milk", "Seeds"],
    menuInfo: "Thick Greek yogurt topped with a blend of pumpkin, chia, sunflower, and flax seeds."
  },
  {
    itemId: "DF012",
    goalCategory: "Diabetic Friendly",
    mealCategory: "Bowl",
    menuName: "Chia Cinnamon Oats Bowl",
    dietType: "Veg",
    nutrition: { calories: 330, protein: 20, carbs: 30, fat: 11 },
    ingredients: ["Greek yogurt 160g", "Oats 30g", "Chia seeds 10g", "Apple 40g", "Cinnamon 2g"],
    removableIngredients: ["Chia seeds 10g", "Cinnamon 2g"],
    availableAddOns: ["Almonds (+₹30)", "Fresh Berries (+₹40)", "Maple Syrup (+₹30)", "Dark Chocolate Chips (+₹20)", "Walnuts (+₹30)"],
    allergens: ["Gluten (may contain)", "Seeds"],
    menuInfo: "Fiber-rich oats bowl infused with ground cinnamon and chia seeds, topped with fresh apple."
  },
  {
    itemId: "DF013",
    goalCategory: "Diabetic Friendly",
    mealCategory: "Smoothie",
    menuName: "Cucumber Mint Smoothie",
    dietType: "Veg",
    nutrition: { calories: 180, protein: 10, carbs: 14, fat: 6 },
    ingredients: ["Greek yogurt 150g", "Cucumber 80g", "Mint leaves 5g", "Lemon 1"],
    removableIngredients: ["Mint leaves 5g", "Lemon 1"],
    availableAddOns: ["Whey Protein (+₹60)", "Chia Seeds (+₹20)", "Flax Seeds (+₹15)", "Almonds (+₹30)", "Banana (+₹20)"],
    allergens: ["None Major"],
    menuInfo: "A refreshing cucumber and mint smoothie with Greek yogurt and lemon — very low sugar and hydrating."
  },
  {
    itemId: "DF014",
    goalCategory: "Diabetic Friendly",
    mealCategory: "Smoothie",
    menuName: "Apple Cinnamon Smoothie",
    dietType: "Veg",
    nutrition: { calories: 235, protein: 14, carbs: 28, fat: 6 },
    ingredients: ["Greek yogurt 150g", "Apple 80g", "Cinnamon 2g"],
    removableIngredients: ["Cinnamon 2g"],
    availableAddOns: ["Whey Protein (+₹60)", "Chia Seeds (+₹20)", "Flax Seeds (+₹15)", "Almonds (+₹30)", "Peanut Butter (+₹20)"],
    allergens: ["None Major"],
    menuInfo: "A comforting blend of Greek yogurt, fresh apple, and ground cinnamon."
  },
  {
    itemId: "DF015",
    goalCategory: "Diabetic Friendly",
    mealCategory: "Smoothie",
    menuName: "Mixed Seed Smoothie",
    dietType: "Veg",
    nutrition: { calories: 210, protein: 15, carbs: 18, fat: 7 },
    ingredients: ["Greek yogurt 150g", "Banana 50g", "Chia seeds 5g", "Flax seeds 5g"],
    removableIngredients: ["Chia seeds 5g", "Flax seeds 5g"],
    availableAddOns: ["Whey Protein (+₹60)", "Almonds (+₹30)", "Peanut Butter (+₹20)", "Strawberry (+₹30)", "Oats (+₹15)"],
    allergens: ["Seeds"],
    menuInfo: "Nutrient-rich smoothie with banana, Greek yogurt, chia seeds, and flax seeds."
  },
  {
    itemId: "BD001",
    goalCategory: "Balanced Diet",
    mealCategory: "Sandwich",
    menuName: "Mediterranean Veg Sandwich",
    dietType: "Veg",
    nutrition: { calories: 365, protein: 20, carbs: 34, fat: 14 },
    ingredients: ["Bread 70g", "Paneer 70g", "Lettuce 20g", "Tomato 20g", "Cucumber 20g"],
    removableIngredients: ["Lettuce 20g", "Tomato 20g", "Cucumber 20g"],
    availableAddOns: ["Extra Cheese (+₹30)", "Extra Paneer (+₹40)", "Avocado (+₹60)", "Grilled Mushrooms (+₹40)", "Olives (+₹20)"],
    allergens: ["Gluten"],
    menuInfo: "Mediterranean-style sandwich layered with fresh paneer, crisp lettuce, tomato, and cucumber."
  },
  {
    itemId: "BD002",
    goalCategory: "Balanced Diet",
    mealCategory: "Sandwich",
    menuName: "Garden Herb Chicken Sandwich",
    dietType: "Non-Veg",
    nutrition: { calories: 370, protein: 33, carbs: 31, fat: 11 },
    ingredients: ["Bread 70g", "Chicken 100g", "Greek yogurt 20g", "Lettuce"],
    removableIngredients: ["Lettuce"],
    availableAddOns: ["Extra Cheese (+₹30)", "Extra Chicken (+₹50)", "Avocado (+₹60)", "Grilled Mushrooms (+₹40)", "Olives (+₹20)"],
    allergens: ["Gluten"],
    menuInfo: "Lean grilled chicken with a light Greek yogurt spread and fresh garden lettuce in soft bread."
  },
  {
    itemId: "BD003",
    goalCategory: "Balanced Diet",
    mealCategory: "Sandwich",
    menuName: "Herbed Paneer Sandwich",
    dietType: "Veg",
    nutrition: { calories: 380, protein: 27, carbs: 32, fat: 15 },
    ingredients: ["Bread 70g", "Paneer 90g", "Greek yogurt 20g", "Tomato 20g"],
    removableIngredients: ["Tomato 20g"],
    availableAddOns: ["Extra Cheese (+₹30)", "Extra Paneer (+₹40)", "Avocado (+₹60)", "Grilled Mushrooms (+₹40)", "Olives (+₹20)"],
    allergens: ["Gluten", "Milk"],
    menuInfo: "Herb-seasoned paneer slices with creamy Greek yogurt and fresh tomato in toasted bread."
  },
  {
    itemId: "BD004",
    goalCategory: "Balanced Diet",
    mealCategory: "Sandwich",
    menuName: "Egg Cheese Sandwich",
    dietType: "Non-Veg",
    nutrition: { calories: 390, protein: 24, carbs: 30, fat: 16 },
    ingredients: ["Bread 70g", "Egg 2", "Cheese 15g", "Tomato 20g"],
    removableIngredients: ["Cheese 15g", "Tomato 20g"],
    availableAddOns: ["Extra Cheese (+₹30)", "Extra Egg (+₹20)", "Avocado (+₹60)", "Grilled Mushrooms (+₹40)", "Olives (+₹20)"],
    allergens: ["Gluten", "Milk", "Egg"],
    menuInfo: "Delicious double egg sandwich with melted cheese and fresh tomato slices."
  },
  {
    itemId: "BD005",
    goalCategory: "Balanced Diet",
    mealCategory: "Sandwich",
    menuName: "Corn Veg Sandwich",
    dietType: "Veg",
    nutrition: { calories: 355, protein: 16, carbs: 38, fat: 13 },
    ingredients: ["Bread 70g", "Corn 50g", "Cheese 15g", "Tomato 20g", "Capsicum 20g"],
    removableIngredients: ["Cheese 15g", "Tomato 20g", "Capsicum 20g"],
    availableAddOns: ["Extra Cheese (+₹30)", "Extra Corn (+₹20)", "Avocado (+₹60)", "Grilled Mushrooms (+₹40)", "Olives (+₹20)"],
    allergens: ["Gluten"],
    menuInfo: "Sweet corn kernels with melted cheese, fresh tomato, and crisp capsicum in soft bread."
  },
  {
    itemId: "BD006",
    goalCategory: "Balanced Diet",
    mealCategory: "Sandwich",
    menuName: "Smoky Chicken Sandwich",
    dietType: "Non-Veg",
    nutrition: { calories: 375, protein: 34, carbs: 30, fat: 11 },
    ingredients: ["Bread 70g", "Chicken 100g", "Greek yogurt 20g", "Tomato"],
    removableIngredients: ["Tomato"],
    availableAddOns: ["Extra Cheese (+₹30)", "Extra Chicken (+₹50)", "Avocado (+₹60)", "Grilled Mushrooms (+₹40)", "Olives (+₹20)"],
    allergens: ["Gluten"],
    menuInfo: "Smoky char-grilled chicken breast with fresh tomato slices and a light Greek yogurt dressing."
  },
  {
    itemId: "BD007",
    goalCategory: "Balanced Diet",
    mealCategory: "Salad",
    menuName: "Mediterranean Paneer Salad",
    dietType: "Veg",
    nutrition: { calories: 320, protein: 22, carbs: 14, fat: 18 },
    ingredients: ["Paneer 80g", "Lettuce 50g", "Tomato 30g", "Cucumber 30g"],
    removableIngredients: ["Lettuce 50g", "Tomato 30g", "Cucumber 30g"],
    availableAddOns: ["Feta Cheese (+₹40)", "Boiled Egg (+₹20)", "Almonds (+₹30)", "Quinoa (+₹40)", "Grilled Tofu (+₹40)"],
    allergens: ["Milk"],
    menuInfo: "Mediterranean-style fresh paneer cubes tossed with crisp lettuce, ripe tomatoes, and cucumber."
  },
  {
    itemId: "BD008",
    goalCategory: "Balanced Diet",
    mealCategory: "Salad",
    menuName: "Cottage Cheese Salad",
    dietType: "Veg",
    nutrition: { calories: 330, protein: 24, carbs: 12, fat: 20 },
    ingredients: ["Paneer 90g", "Lettuce 50g", "Tomato 30g", "Cucumber 30g"],
    removableIngredients: ["Lettuce 50g", "Tomato 30g", "Cucumber 30g"],
    availableAddOns: ["Feta Cheese (+₹40)", "Boiled Egg (+₹20)", "Almonds (+₹30)", "Quinoa (+₹40)", "Grilled Tofu (+₹40)"],
    allergens: ["Milk"],
    menuInfo: "Soft cottage cheese cubes over a fresh salad base of lettuce, tomatoes, and cucumber."
  },
  {
    itemId: "BD009",
    goalCategory: "Balanced Diet",
    mealCategory: "Salad",
    menuName: "Herb Chicken Salad",
    dietType: "Non-Veg",
    nutrition: { calories: 325, protein: 34, carbs: 11, fat: 12 },
    ingredients: ["Chicken 120g", "Lettuce 50g", "Tomato 20g", "Olive oil 5ml"],
    removableIngredients: ["Lettuce 50g", "Tomato 20g", "Olive oil 5ml"],
    availableAddOns: ["Feta Cheese (+₹40)", "Boiled Egg (+₹20)", "Almonds (+₹30)", "Quinoa (+₹40)", "Extra Chicken (+₹60)"],
    allergens: ["None Major"],
    menuInfo: "Herb-grilled chicken on fresh greens with a light drizzle of olive oil."
  },
  {
    itemId: "BD010",
    goalCategory: "Balanced Diet",
    mealCategory: "Salad",
    menuName: "Chicken Garden Salad",
    dietType: "Non-Veg",
    nutrition: { calories: 320, protein: 33, carbs: 12, fat: 11 },
    ingredients: ["Chicken 100g", "Lettuce 50g", "Tomato 30g", "Cucumber 30g"],
    removableIngredients: ["Lettuce 50g", "Tomato 30g", "Cucumber 30g"],
    availableAddOns: ["Feta Cheese (+₹40)", "Boiled Egg (+₹20)", "Almonds (+₹30)", "Quinoa (+₹40)", "Extra Chicken (+₹60)"],
    allergens: ["None Major"],
    menuInfo: "Lean grilled chicken over a colorful garden salad of lettuce, tomato, and cucumber."
  },
  {
    itemId: "BD011",
    goalCategory: "Balanced Diet",
    mealCategory: "Bowl",
    menuName: "Classic Overnight Oats",
    dietType: "Veg",
    nutrition: { calories: 330, protein: 21, carbs: 37, fat: 8 },
    ingredients: ["Greek yogurt 180g", "Oats 40g", "Apple 70g", "Cinnamon 2g"],
    removableIngredients: ["Cinnamon 2g"],
    availableAddOns: ["Almonds (+₹30)", "Fresh Berries (+₹40)", "Maple Syrup (+₹30)", "Dark Chocolate Chips (+₹20)", "Walnuts (+₹30)"],
    allergens: ["Gluten (may contain)"],
    menuInfo: "A classic, well-balanced bowl of overnight oats soaked in Greek yogurt for sustained morning energy."
  },
  {
    itemId: "BD012",
    goalCategory: "Balanced Diet",
    mealCategory: "Bowl",
    menuName: "Banana Nut Oats Bowl",
    dietType: "Veg",
    nutrition: { calories: 520, protein: 24, carbs: 52, fat: 22 },
    ingredients: ["Greek yogurt 180g", "Oats 40g", "Banana 80g", "Peanut butter 20g"],
    removableIngredients: ["Peanut butter 20g"],
    availableAddOns: ["Almonds (+₹30)", "Chia Seeds (+₹20)", "Maple Syrup (+₹30)", "Dark Chocolate Chips (+₹20)", "Fresh Berries (+₹40)"],
    allergens: ["Gluten (may contain)", "Peanut"],
    menuInfo: "A hearty bowl of oats and Greek yogurt topped with ripe banana and creamy peanut butter."
  },
  {
    itemId: "BD013",
    goalCategory: "Balanced Diet",
    mealCategory: "Smoothie",
    menuName: "Banana Protein Smoothie",
    dietType: "Veg",
    nutrition: { calories: 400, protein: 30, carbs: 37, fat: 13 },
    ingredients: ["Greek yogurt 150g", "Banana 80g", "Oats 20g", "Peanut butter"],
    removableIngredients: ["Peanut butter"],
    availableAddOns: ["Whey Protein (+₹60)", "Chia Seeds (+₹20)", "Flax Seeds (+₹15)", "Almonds (+₹30)", "Strawberries (+₹30)"],
    allergens: ["None Major"],
    menuInfo: "Creamy blended smoothie with banana, Greek yogurt, oats, and a hint of peanut butter."
  },
  {
    itemId: "BD014",
    goalCategory: "Balanced Diet",
    mealCategory: "Smoothie",
    menuName: "Apple Cinnamon Smoothie",
    dietType: "Veg",
    nutrition: { calories: 250, protein: 16, carbs: 30, fat: 6 },
    ingredients: ["Greek yogurt 150g", "Apple 80g", "Cinnamon 2g"],
    removableIngredients: ["Cinnamon 2g"],
    availableAddOns: ["Whey Protein (+₹60)", "Chia Seeds (+₹20)", "Flax Seeds (+₹15)", "Almonds (+₹30)", "Peanut Butter (+₹20)"],
    allergens: ["None Major"],
    menuInfo: "A light and comforting smoothie of Greek yogurt, fresh apple, and warming cinnamon."
  },
  {
    itemId: "BD015",
    goalCategory: "Balanced Diet",
    mealCategory: "Smoothie",
    menuName: "Cucumber Mint Smoothie",
    dietType: "Veg",
    nutrition: { calories: 180, protein: 15, carbs: 12, fat: 5 },
    ingredients: ["Greek yogurt 150g", "Cucumber 80g", "Mint leaves 5g", "Lemon 1"],
    removableIngredients: ["Mint leaves 5g", "Lemon 1"],
    availableAddOns: ["Whey Protein (+₹60)", "Chia Seeds (+₹20)", "Flax Seeds (+₹15)", "Almonds (+₹30)", "Banana (+₹20)"],
    allergens: ["None Major"],
    menuInfo: "Ultra-refreshing cucumber and mint smoothie with Greek yogurt and a squeeze of fresh lemon."
  },
  // --- New Non-Veg Items (2 per goal × 5 goals = 10 items) ---
  {
    itemId: "HP016", menuName: "Chicken Egg Protein Bowl", goalCategory: "High Protein", mealCategory: "Bowl", dietType: "Non-Veg",
    nutrition: { calories: 450, protein: 42, carbs: 32, fat: 14 },
    ingredients: ["Chicken 120g", "Egg 2", "Quinoa 80g", "Spinach"],
    removableIngredients: ["Spinach"],
    availableAddOns: ["Extra Chicken (+₹50)", "Extra Cheese (+₹30)", "Boiled Egg (+₹20)"],
    allergens: ["Egg"], menuInfo: "Grilled chicken and boiled eggs over quinoa — a high-protein power bowl."
  },
  {
    itemId: "HP017", menuName: "Egg Vanilla Protein Smoothie", goalCategory: "High Protein", mealCategory: "Smoothie", dietType: "Non-Veg",
    nutrition: { calories: 420, protein: 35, carbs: 30, fat: 16 },
    ingredients: ["Greek yogurt 150g", "Egg 1", "Banana 60g", "Vanilla extract 2ml"],
    removableIngredients: ["Vanilla extract 2ml"],
    availableAddOns: ["Whey Protein (+₹60)", "Peanut Butter (+₹20)", "Almonds (+₹30)"],
    allergens: ["Egg"], menuInfo: "Rich protein smoothie with whole egg, Greek yogurt, and banana."
  },
  {
    itemId: "WL016", menuName: "Egg White Quinoa Bowl", goalCategory: "Weight Loss", mealCategory: "Bowl", dietType: "Non-Veg",
    nutrition: { calories: 280, protein: 24, carbs: 28, fat: 6 },
    ingredients: ["Egg whites 150g", "Quinoa 40g", "Spinach 30g", "Tomato 20g"],
    removableIngredients: ["Spinach 30g", "Tomato 20g"],
    availableAddOns: ["Feta Cheese (+₹40)", "Boiled Egg (+₹20)", "Almonds (+₹30)"],
    allergens: ["Egg"], menuInfo: "Fluffy egg whites over light quinoa — low-calorie and protein-rich."
  },
  {
    itemId: "WL017", menuName: "Egg White Berry Smoothie", goalCategory: "Weight Loss", mealCategory: "Smoothie", dietType: "Non-Veg",
    nutrition: { calories: 200, protein: 22, carbs: 16, fat: 4 },
    ingredients: ["Egg whites 120g", "Greek yogurt 80g", "Mixed berries 60g"],
    removableIngredients: [],
    availableAddOns: ["Whey Protein (+₹60)", "Chia Seeds (+₹20)", "Almonds (+₹30)"],
    allergens: ["Egg"], menuInfo: "Light fruity protein smoothie with egg whites and mixed berries."
  },
  {
    itemId: "WG016", menuName: "Chicken Egg Rice Bowl", goalCategory: "Weight Gain", mealCategory: "Bowl", dietType: "Non-Veg",
    nutrition: { calories: 560, protein: 38, carbs: 42, fat: 22 },
    ingredients: ["Chicken 120g", "Egg 2", "Rice 60g", "Greek yogurt 40g"],
    removableIngredients: ["Rice 60g"],
    availableAddOns: ["Extra Chicken (+₹50)", "Cheese (+₹30)", "Honey (+₹20)"],
    allergens: ["Egg"], menuInfo: "Chicken and double eggs over rice — calorie-dense muscle-building bowl."
  },
  {
    itemId: "WG017", menuName: "Peanut Butter Egg Smoothie", goalCategory: "Weight Gain", mealCategory: "Smoothie", dietType: "Non-Veg",
    nutrition: { calories: 530, protein: 30, carbs: 48, fat: 22 },
    ingredients: ["Greek yogurt 150g", "Banana 80g", "Egg 1", "Peanut butter 15g", "Oats 20g"],
    removableIngredients: ["Peanut butter 15g"],
    availableAddOns: ["Whey Protein (+₹60)", "Honey (+₹20)", "Almonds (+₹30)"],
    allergens: ["Egg", "Peanut"], menuInfo: "Heavy-calorie smoothie with egg, banana, peanut butter, and oats."
  },
  {
    itemId: "DF016", menuName: "Lean Chicken Egg Bowl", goalCategory: "Diabetic Friendly", mealCategory: "Bowl", dietType: "Non-Veg",
    nutrition: { calories: 310, protein: 28, carbs: 20, fat: 10 },
    ingredients: ["Egg whites 150g", "Chicken shreds 60g", "Quinoa 30g", "Cucumber 20g"],
    removableIngredients: ["Cucumber 20g"],
    availableAddOns: ["Feta Cheese (+₹40)", "Almonds (+₹30)", "Chia Seeds (+₹20)"],
    allergens: ["Egg"], menuInfo: "Lean egg whites with shredded chicken over quinoa — low GI, blood-sugar friendly."
  },
  {
    itemId: "DF017", menuName: "Cucumber Egg White Smoothie", goalCategory: "Diabetic Friendly", mealCategory: "Smoothie", dietType: "Non-Veg",
    nutrition: { calories: 220, protein: 24, carbs: 14, fat: 6 },
    ingredients: ["Greek yogurt 150g", "Egg white 80g", "Cucumber 40g", "Mint leaves 3g"],
    removableIngredients: ["Mint leaves 3g"],
    availableAddOns: ["Whey Protein (+₹60)", "Chia Seeds (+₹20)", "Almonds (+₹30)"],
    allergens: ["Egg"], menuInfo: "Protein-rich, low-sugar smoothie with egg whites, cucumber, and mint."
  },
  {
    itemId: "BD016", menuName: "Chicken Egg Oats Bowl", goalCategory: "Balanced Diet", mealCategory: "Bowl", dietType: "Non-Veg",
    nutrition: { calories: 400, protein: 30, carbs: 34, fat: 14 },
    ingredients: ["Chicken 100g", "Egg 1", "Oats 40g", "Greek yogurt 40g", "Apple 40g"],
    removableIngredients: ["Apple 40g"],
    availableAddOns: ["Extra Chicken (+₹50)", "Cheese (+₹30)", "Almonds (+₹30)"],
    allergens: ["Egg"], menuInfo: "Grilled chicken and egg with oats and Greek yogurt — balanced non-veg power bowl."
  },
  {
    itemId: "BD017", menuName: "Balanced Egg Protein Smoothie", goalCategory: "Balanced Diet", mealCategory: "Smoothie", dietType: "Non-Veg",
    nutrition: { calories: 320, protein: 24, carbs: 30, fat: 10 },
    ingredients: ["Greek yogurt 150g", "Egg 1", "Banana 60g", "Oats 15g"],
    removableIngredients: [],
    availableAddOns: ["Whey Protein (+₹60)", "Peanut Butter (+₹20)", "Almonds (+₹30)"],
    allergens: ["Egg"], menuInfo: "Balanced non-veg smoothie with egg protein, banana, and oats."
  },
];

const PREMIUM_ITEM_IDS = new Set([
  'HP002', 'HP006', 'HP007', 'HP009', 'HP004', 'HP008', 'HP010', 'HP012',
  'WL002', 'WL006', 'WL009', 'WL010', 'WL004', 'WL008', 'WL012', 'WL014',
  'WG002', 'WG006', 'WG007', 'WG010', 'WG004', 'WG008', 'WG012', 'WG014',
  'DF002', 'DF006', 'DF007', 'DF010', 'DF004', 'DF008', 'DF012', 'DF014',
  'BD002', 'BD004', 'BD009', 'BD010', 'BD007', 'BD008', 'BD012', 'BD014',
]);

const CHEF_SPECIAL_IDS = new Set([
  'HP002', 'HP008', 'HP016', 'WL002', 'WL010', 'WL016',
  'WG002', 'WG006', 'WG016', 'DF002', 'DF009', 'DF016', 'BD002', 'BD007', 'BD016',
]);

const CATEGORY_PRICES = { 'Sandwich': 149, 'Salad': 129, 'Bowl': 139, 'Smoothie': 119 };
const CATEGORY_IMAGES = {
  'Sandwich': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&h=400&fit=crop',
  'Salad': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop',
  'Bowl': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop',
  'Smoothie': 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=600&h=400&fit=crop',
};

const FRONTEND_IMAGE_BASE_URL = process.env.FRONTEND_IMAGE_BASE_URL || 'http://localhost:5173';

const UPLOADED_IMAGE_FILENAMES = {
  "Apple Cinnamon Overnight Oats": "Apple Cinnamon Overnight Oats.png",
  "Apple Cinnamon Smoothie": "Apple Cinnamon Smoothie.png",
  "Banana Almond Smoothie": "Banana Almond Smoothie.png",
  "Banana Nut Oats Bowl": "Banana Nut Oats Bowl.png",
  "Banana Protein Smoothie": "Banana Protein Smoothie.png",
  "Chia Cinnamon Oats Bowl": "Chia Cinnamon Oats Bowl.png",
  "Chicken Cheese Sandwich": "Chicken Cheese Sandwich.png",
  "Chicken Corn Salad": "Chicken Corn Salad.png",
  "Chicken Egg Sandwich": "Chicken Egg Sandwich.png",
  "Chicken Garden Salad": "Chicken Garden Salad.png",
  "Chocolate Protein Smoothie": "Chocolate Protein Smoothie.png",
  "Coffee Protein Smoothie": "Coffee Protein Smoothie.png",
  "Corn Veg Sandwich": "Corn Veg Sandwich.png",
  "Cottage Cheese Salad": "Cottage Cheese Salad.png",
  "Cucumber Mint Smoothie": "Cucumber Mint Smoothie.png",
  "Egg Spinach Salad": "Egg Spinach Salad.png",
  "Egg White Spinach Sandwich": "Egg White Spinach Sandwich.png",
  "Garden Crunch Salad": "Garden Crunch Salad.png",
  "Greek Yogurt Protein Bowl": "Greek Yogurt Protein Bowl.png",
  "Green Boost Smoothie": "Green Boost Smoothie.png",
  "Grilled Chicken Sandwich": "Grilled Chicken Sandwich.png",
  "Herb Chicken Salad": "Herb Chicken Salad.png",
  "Herb Grilled Chicken Sandwich": "Herb Grilled Chicken Sandwich.png",
  "Herbed Tofu Sandwich": "Herbed Tofu Sandwich.png",
  "Hummus Veg Sandwich": "Hummus Veg Sandwich.png",
  "Lean Herb Chicken Sandwich": "Lean Herb Chicken Sandwich.png",
  "Mediterranean Paneer Salad": "Mediterranean Paneer Salad.png",
  "Mixed Seed Yogurt Bowl": "Mixed Seed Yogurt Bowl.png",
  "Nutty Paneer Salad": "Nutty Paneer Salad.png",
  "Paneer Cheese Sandwich": "Paneer Cheese Sandwich.png",
  "Paneer Garden Salad": "Paneer Garden Salad.png",
  "Peanut Butter Banana Sandwich": "Peanut Butter Banana Sandwich.png",
  "Peanut Butter Oats Bowl": "Peanut Butter Oats Bowl.png",
  "Peanut Butter Oats Smoothie": "Peanut Butter Oats Smoothie.png",
  "Peri Peri Chicken Sandwich": "Peri Peri Chicken Sandwich.png",
  "Smoky Chicken Sandwich": "Smoky Chicken Sandwich.png",
  "Smoky Tofu Sandwich": "Smoky Tofu Sandwich.png",
  "Spinach Paneer Sandwich": "Spinach Paneer Sandwich.png",
  "Tandoori Chicken Sandwich": "Tandoori Chicken Sandwich.png",
  "Tandoori Paneer Sandwich": "Tandoori Paneer Sandwich.png",
  "Herbed Paneer Sandwich": "Balanced Diet - Herbed Paneer Sandwich.png",
  "Egg Cheese Sandwich": "Balanced Diet - Egg Cheese Sandwich.png",
  "Garden Herb Chicken Sandwich": "Balanced Diet - Garden Herb Chicken Sandwich.png",
  "Mediterranean Veg Sandwich": "Balanced diet - Mediterranean Veg Sandwich.png",
  "Classic Overnight Oats": "Balanced diet- classic overnight oats.png",
  "Mixed Seed Smoothie": "Diabetic Friendly- Mixed Seed Smoothie.png",
  "Sprouts Garden Salad": "Diabetic Friendly - Sprouts Garden Salad.png"
};

const getImageForDish = (item) => {
  const localImage = UPLOADED_IMAGE_FILENAMES[item.menuName];
  if (localImage) {
    return `${FRONTEND_IMAGE_BASE_URL}/${encodeURIComponent(localImage)}`;
  }
  return CATEGORY_IMAGES[item.mealCategory] || '';
};

const formattedMenuData = rawMenuData.map(item => {
  const isPremium = PREMIUM_ITEM_IDS.has(item.itemId);
  const isChefSpecial = CHEF_SPECIAL_IDS.has(item.itemId);

  return {
    menuId: item.itemId,
    name: item.menuName,
    description: item.menuInfo,
    category: item.mealCategory,
    goalCategory: [item.goalCategory],
    vegNonVeg: item.dietType === 'Non-Veg' ? 'Non-Veg' : 'Veg',
    tier: isPremium ? 'Premium' : 'Standard',
    isChefSpecial: isChefSpecial,
    isAvailable: true,
    availableForSubscription: true,
    nutrition: item.nutrition,
    ingredients: item.ingredients,
    removableIngredients: parseRemovableIngredients(item.removableIngredients),
    optionalAddons: parseOptionalAddons(item.availableAddOns),
    dietaryTags: generateDietaryTags(item.dietType, item.goalCategory),
    price: CATEGORY_PRICES[item.mealCategory] || 0,
    image: getImageForDish(item),
    isActive: true,
  };
});

export default formattedMenuData;