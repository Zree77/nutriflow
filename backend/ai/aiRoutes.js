// ai/aiRoutes.js
import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import upload from './upload.js';
import {
  chatSchema,
  mealRecommendationSchema,
  planRecommendationSchema,
  analyzeDietSchema,
  dailyTipSchema
} from './aiValidator.js';
import {
  chat,
  mealRecommendation,
  planRecommendation,
  scanFood,
  analyzeDiet,
  dailyTip,
  weeklyReport
} from './aiController.js';

const router = Router();

// 1. POST /chat (protect, chatSchema)
router.post('/chat', validate(chatSchema), chat);

// 2. POST /meal-recommendation (protect, mealRecommendationSchema)
router.post('/meal-recommendation', protect, validate(mealRecommendationSchema), mealRecommendation);

// 3. POST /plan-recommendation (NONE, planRecommendationSchema)
router.post('/plan-recommendation', validate(planRecommendationSchema), planRecommendation);

// 4. POST /scan-food (protect, custom upload wrapper, manual checks in controller)
router.post(
  '/scan-food',
  protect,
  (req, res, next) => {
    upload.single('image')(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next({ statusCode: 400, message: 'Image must be under 5MB' });
        }
        return next({ statusCode: 400, message: err.message || 'File upload failed' });
      }
      next();
    });
  },
  scanFood
);

// 5. POST /analyze-diet (protect, analyzeDietSchema)
router.post('/analyze-diet', protect, validate(analyzeDietSchema), analyzeDiet);

// 6. GET /daily-tip (NONE, dailyTipSchema)
router.get('/daily-tip', validate(dailyTipSchema), dailyTip);

// 7. GET /weekly-report (protect)
router.get('/weekly-report', protect, weeklyReport);

export default router;
