// ai/aiService.js
import Menu from '../models/Menu.js';
import Plan from '../models/Plan.js';
import Order from '../models/Order.js';
import Subscription from '../models/Subscription.js';
import { generateText, generateJSON, analyzeImage } from './geminiService.js';
import {
  CHAT_PROMPT,
  MEAL_RECOMMENDATION_PROMPT,
  PLAN_RECOMMENDATION_PROMPT,
  FOOD_SCANNER_PROMPT,
  DIET_ANALYZER_PROMPT,
  DAILY_TIP_PROMPT,
  WEEKLY_REPORT_PROMPT
} from './prompts.js';

const tipCache = new Map();

function getFallbackChatReply(userMessage) {
  const lowerMsg = (userMessage || '').toLowerCase();
  
  if (lowerMsg.includes('hi') || lowerMsg.includes('hello') || lowerMsg.includes('hey')) {
    return "Hello! 👋 I'm NutriBot, your personal NutriFlow nutrition assistant. How can I help you today? You can ask me about our weekly meal plans, dietary goals, calories, or meal deliveries!";
  }
  if (lowerMsg.includes('plan') || lowerMsg.includes('subscription') || lowerMsg.includes('pricing') || lowerMsg.includes('price')) {
    return "NutriFlow offers 5-day weekly meal plans tailored to your goals:\n- **Balanced Diet**: Standard (₹899/wk) & Premium (₹1099/wk)\n- **Weight Loss**: Standard (₹949/wk) & Premium (₹1149/wk)\n- **High Protein**: Standard (₹999/wk) & Premium (₹1199/wk)\n- **Weight Gain**: Standard (₹949/wk) & Premium (₹1149/wk)\n- **Diabetic Friendly**: Standard (₹899/wk) & Premium (₹1099/wk)\n\nAll plans support custom pause & resume options!";
  }
  if (lowerMsg.includes('weight loss') || lowerMsg.includes('lose weight') || lowerMsg.includes('fat loss')) {
    return "For weight loss, we recommend our **Weight Loss Plan**! It focuses on calorie-deficit meals rich in lean proteins and fiber to keep you full while burning fat efficiently. Check out our Standard and Premium Weight Loss plans on the home page!";
  }
  if (lowerMsg.includes('protein') || lowerMsg.includes('muscle') || lowerMsg.includes('gym')) {
    return "Our **High Protein Plan** is packed with macro-dense protein sources like paneer, tofu, legumes for Veg, and lean chicken breast, eggs & fish for Non-Veg! Designed to optimize muscle recovery and growth.";
  }
  if (lowerMsg.includes('veg') || lowerMsg.includes('vegetarian')) {
    return "Yes! NutriFlow provides 100% pure Vegetarian meal plans for all goals (High Protein, Weight Loss, Weight Gain, Balanced Diet, and Diabetic Friendly). You can easily toggle between Veg and Non-Veg on our website!";
  }
  if (lowerMsg.includes('delivery') || lowerMsg.includes('time') || lowerMsg.includes('location') || lowerMsg.includes('kochi') || lowerMsg.includes('kakkanad')) {
    return "NutriFlow delivers fresh, chef-prepared meals every weekday by 6 AM within a 10km radius of Kakkanad, Kochi! 🚚";
  }
  
  return "Thanks for reaching out! I'm NutriBot, your AI nutrition assistant. NutriFlow provides fresh, goal-focused weekday meal plans including High Protein, Weight Loss, Weight Gain, Balanced Diet, and Diabetic Friendly options. Feel free to explore our weekly plans or ask any questions about your nutrition goals! 🥗";
}

/* Feature 1: Nutrition Chat  */

export async function chatService(message) {
  try {
    const reply = await generateText(CHAT_PROMPT, message);
    return { reply };
  } catch (error) {
    console.warn('Gemini AI chat failed, using smart fallback response:', error?.message || error);
    return { reply: getFallbackChatReply(message) };
  }
}

/* ──────────── Feature 2: Meal Recommendation ──────────── */

export async function mealRecommendationService({ preference, mealType, goal }) {
  const query = { isAvailable: true };
  if (mealType) query.mealType = mealType;
  if (goal) query.category = goal;

  const meals = await Menu.find(query)
    .lean()
    .select('name description mealType category calories protein carbohydrates fat fiber nutrition');

  if (!meals || meals.length === 0) {
    throw { statusCode: 404, message: 'No meals available right now' };
  }

  const cleanMeals = meals.map(m => ({
    name: m.name,
    description: m.description || '',
    mealType: m.mealType || '',
    category: m.category,
    calories: m.calories !== undefined ? m.calories : (m.nutrition?.calories || 0),
    protein: m.protein !== undefined ? m.protein : (m.nutrition?.protein || 0),
    carbohydrates: m.carbohydrates !== undefined ? m.carbohydrates : (m.nutrition?.carbs || m.nutrition?.carbohydrates || 0),
    fat: m.fat !== undefined ? m.fat : (m.nutrition?.fats || m.nutrition?.fat || 0),
    fiber: m.fiber !== undefined ? m.fiber : (m.nutrition?.fiber || 0)
  }));

  const userMessage = `User preference: ${preference}\n\nAvailable Menu Items:\n${JSON.stringify(cleanMeals)}`;
  return await generateJSON(MEAL_RECOMMENDATION_PROMPT, userMessage);
}

/* ──────────── Feature 3: Plan Recommendation ──────────── */

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9
};

function getBMICategory(bmi) {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

export async function planRecommendationService({ age, height, weight, gender, goal, activityLevel }) {
  const heightM = height / 100;
  const bmi = Math.round((weight / (heightM * heightM)) * 10) / 10;

  let s = -161;
  if (gender === 'male') s = 5;
  else if (gender === 'other') s = -78;

  const bmr = 10 * weight + 6.25 * height - 5 * age + s;
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.2;
  const dailyCalories = Math.round(bmr * multiplier);

  const plans = await Plan.find({ isActive: true })
    .lean()
    .select('planId name goal tier pricePerDay caloriesPerDay mealsPerDay description weeklyPrice deliveryDays targetNutritionPerDay');

  if (!plans || plans.length === 0) {
    throw { statusCode: 404, message: 'No active plans available' };
  }

  const cleanPlans = plans.map(p => {
    const deliveryDays = p.deliveryDays || 5;
    const pricePerDay = p.pricePerDay !== undefined ? p.pricePerDay : Math.round(p.weeklyPrice / deliveryDays);
    const caloriesPerDay = p.caloriesPerDay !== undefined ? p.caloriesPerDay : (p.targetNutritionPerDay?.calories || 0);
    const mealsPerDay = p.mealsPerDay !== undefined ? p.mealsPerDay : 1;
    const planId = p.planId || p._id.toString();
    return { planId, name: p.name, goal: p.goal, tier: p.tier, pricePerDay, caloriesPerDay, mealsPerDay, description: p.description };
  });

  const metrics = { bmi, bmiCategory: getBMICategory(bmi), bmr, dailyCalories, activityLevel };
  const userMessage = `User health metrics: ${JSON.stringify(metrics)}\nUser goal: ${goal}\n\nAvailable Active Plans:\n${JSON.stringify(cleanPlans)}`;
  const recommendationResult = await generateJSON(PLAN_RECOMMENDATION_PROMPT, userMessage);

  return { metrics, ...recommendationResult };
}

/* ──────────── Feature 4: Food Image Scanner ──────────── */

export async function scanFoodService(imageBuffer, mimeType) {
  const menuItems = await Menu.find({ isAvailable: true })
    .lean()
    .select('name description calories protein nutrition');

  const names = menuItems.map(m => m.name);
  const imageBase64 = imageBuffer.toString('base64');
  const context = `NutriFlow Menu Items for healthier alternatives: ${JSON.stringify(names)}`;

  const analysis = await analyzeImage(FOOD_SCANNER_PROMPT, imageBase64, mimeType, context);
  return { analysis };
}

/* ──────────── Feature 5: Diet Analyzer ──────────── */

export async function analyzeDietService({ meals }) {
  const menuItems = await Menu.find({ isAvailable: true })
    .lean()
    .select('name description mealType category calories protein carbohydrates fat nutrition');

  const cleanMenu = menuItems.map(m => ({
    name: m.name,
    description: m.description || '',
    mealType: m.mealType || '',
    calories: m.calories !== undefined ? m.calories : (m.nutrition?.calories || 0),
    protein: m.protein !== undefined ? m.protein : (m.nutrition?.protein || 0),
    carbohydrates: m.carbohydrates !== undefined ? m.carbohydrates : (m.nutrition?.carbs || m.nutrition?.carbohydrates || 0),
    fat: m.fat !== undefined ? m.fat : (m.nutrition?.fats || m.nutrition?.fat || 0)
  }));

  const userMessage = `User ate today: ${meals}\n\nNutriFlow Menu:\n${JSON.stringify(cleanMenu)}`;
  const analysis = await generateJSON(DIET_ANALYZER_PROMPT, userMessage);
  return { analysis };
}

/* ──────────── Feature 6: Daily Nutrition Tip ──────────── */

export async function dailyTipService(category = 'general') {
  const todayStr = new Date().toISOString().split('T')[0];
  const cacheKey = `${todayStr}-${category}`;

  if (tipCache.has(cacheKey)) {
    return { tip: tipCache.get(cacheKey) };
  }

  for (const key of tipCache.keys()) {
    if (!key.startsWith(todayStr)) {
      tipCache.delete(key);
    }
  }

  let promptMessage = `Provide a daily tip. Today's date is ${todayStr}.`;
  if (category !== 'general') {
    promptMessage += ` The tip should be about: ${category}.`;
  }

  const rawTip = await generateText(DAILY_TIP_PROMPT, promptMessage);
  const tip = rawTip.replace(/^["']|["']$/g, '').trim();

  tipCache.set(cacheKey, tip);
  return { tip };
}

/* ──────────── Feature 7: Weekly Nutrition Report ──────────── */

export async function weeklyReportService(userId) {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  weekAgo.setHours(0, 0, 0, 0);

  const orders = await Order.find({
    user: userId,
    createdAt: { $gte: weekAgo },
    status: { $nin: ['Cancelled', 'cancelled'] }
  })
    .lean()
    .select('orderNumber items deliveryDate createdAt status');

  const subscription = await Subscription.findOne({
    user: userId,
    status: 'active'
  })
    .lean()
    .select('subscriptionId planId startDate endDate pausedMeals goal');

  const mealsConsumed = [];
  for (const order of orders) {
    if (order.items && Array.isArray(order.items)) {
      for (const item of order.items) {
        let mealName = 'Meal';
        if (item.menuName) mealName = item.menuName;
        else if (item.name) mealName = item.name;
        else if (item.menuItem && typeof item.menuItem === 'object' && item.menuItem.name) mealName = item.menuItem.name;

        mealsConsumed.push({
          name: mealName,
          quantity: item.quantity || item.qty || 1,
          calories: item.calories || 0,
          protein: item.protein || 0,
          carbohydrates: item.carbohydrates || item.carbs || 0,
          fat: item.fat || item.fats || 0,
          price: item.price || 0,
          deliveryDate: order.deliveryDate || order.createdAt
        });
      }
    }
  }

  let planInfo = null;
  if (subscription && subscription.planId) {
    planInfo = await Plan.findOne({ planId: subscription.planId }).lean();
  }

  const payload = {
    mealsConsumed,
    ordersCount: orders.length,
    subscription: planInfo ? {
      planId: planInfo.planId || planInfo._id.toString(),
      name: planInfo.name,
      goal: planInfo.goal,
      tier: planInfo.tier,
      targetNutrition: planInfo.targetNutritionPerDay
    } : null,
    pausedMealsCount: subscription?.pausedMeals?.length || 0,
    period: { from: weekAgo.toISOString(), to: new Date().toISOString() }
  };

  const report = await generateJSON(WEEKLY_REPORT_PROMPT, JSON.stringify(payload));

  const cleanedPlanInfo = planInfo ? {
    planId: planInfo.planId || planInfo._id.toString(),
    name: planInfo.name,
    goal: planInfo.goal,
    tier: planInfo.tier,
    pricePerDay: Math.round(planInfo.weeklyPrice / (planInfo.deliveryDays || 5)),
    caloriesPerDay: planInfo.targetNutritionPerDay?.calories || 0,
    mealsPerDay: planInfo.mealsPerDay || 1,
    description: planInfo.description,
    isActive: planInfo.isActive
  } : null;

  return {
    period: { from: weekAgo.toISOString(), to: new Date().toISOString() },
    ordersCount: orders.length,
    subscription: cleanedPlanInfo,
    report
  };
}