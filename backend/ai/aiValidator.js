import Joi from 'joi';

// Schema for chat endpoint body validation
export const chatSchema = Joi.object({
  message: Joi.string().trim().min(2).max(1000).required(),
});

// Schema for meal recommendation endpoint body validation
export const mealRecommendationSchema = Joi.object({
  preference: Joi.string().trim().min(2).max(500).required(),
  mealType: Joi.string().valid('breakfast', 'lunch', 'dinner', 'snack').optional(),
  goal: Joi.string().valid('weight_loss', 'muscle_gain', 'maintenance', 'lean_fitness', 'healthy_eating').optional(),
});

// Schema for plan recommendation endpoint body validation
export const planRecommendationSchema = Joi.object({
  age: Joi.number().integer().min(13).max(100).required(),
  height: Joi.number().positive().max(300).required(),
  weight: Joi.number().positive().max(500).required(),
  gender: Joi.string().valid('male', 'female', 'other').required(),
  goal: Joi.string().valid('weight_loss', 'muscle_gain', 'maintenance', 'lean_fitness', 'healthy_eating').required(),
  activityLevel: Joi.string().valid('sedentary', 'light', 'moderate', 'active', 'very_active').required(),
});

// Schema for analyze diet endpoint body validation
export const analyzeDietSchema = Joi.object({
  meals: Joi.string().trim().min(5).max(2000).required(),
});

// Schema for daily tip endpoint query validation
export const dailyTipSchema = Joi.object({
  category: Joi.string().valid('weight_loss', 'muscle_gain', 'healthy_eating', 'general', 'hydration', 'protein', 'breakfast').optional(),
});
