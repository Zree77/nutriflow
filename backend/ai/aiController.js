// ai/aiController.js
import {
  chatService,
  mealRecommendationService,
  planRecommendationService,
  scanFoodService,
  analyzeDietService,
  dailyTipService,
  weeklyReportService
} from './aiService.js';

/**
 * Controller: chat
 */
export async function chat(req, res, next) {
  try {
    const data = await chatService(req.body.message);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/**
 * Controller: mealRecommendation
 */
export async function mealRecommendation(req, res, next) {
  try {
    const data = await mealRecommendationService(req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/**
 * Controller: planRecommendation
 */
export async function planRecommendation(req, res, next) {
  try {
    const data = await planRecommendationService(req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/**
 * Controller: scanFood
 */
export async function scanFood(req, res, next) {
  try {
    if (!req.file) {
      throw { statusCode: 400, message: 'Image file is required' };
    }
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      throw { statusCode: 400, message: 'Only JPEG, PNG and WEBP images are supported' };
    }
    const data = await scanFoodService(req.file.buffer, req.file.mimetype);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/**
 * Controller: analyzeDiet
 */
export async function analyzeDiet(req, res, next) {
  try {
    const data = await analyzeDietService(req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/**
 * Controller: dailyTip
 */
export async function dailyTip(req, res, next) {
  try {
    const category = req.query.category || 'general';
    const data = await dailyTipService(category);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/**
 * Controller: weeklyReport
 */
export async function weeklyReport(req, res, next) {
  try {
    const userId = req.user._id;
    const data = await weeklyReportService(userId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
