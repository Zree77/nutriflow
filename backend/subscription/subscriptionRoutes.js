import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';


import {
  viewPlans,
  viewDefaultMenu,
  createSubscription,
  getMySubscription,
  getHistory,
  pauseMySubscription,
  resumeMySubscription,
  getAllSubscriptions,
  getActiveSubscribers,
  getCustomerDetails,
  pauseSubscription,
  resumeSubscription,
  getKitchenDashboard,
  getStatistics,
  getPauseableDays,
  pauseMeal,
  resumeMeal,
  getPauseStatus,
  quickPauseMeal,
  quickResumeMeal,
} from './subscriptionController.js';

import {
  getPlansValidator,
  getDefaultMenuValidator,
  createSubscriptionValidator,
  getMySubscriptionValidator,
  pauseMySubscriptionValidator,
  resumeMySubscriptionValidator,
  getSubscriptionHistoryValidator,
  getAllSubscriptionsValidator,
  getActiveSubscribersValidator,
  getCustomerDetailsValidator,
  pauseSubscriptionValidator,
  resumeSubscriptionValidator,
  getKitchenDashboardValidator,
  getStatisticsValidator,
  getPauseableDaysValidator,
  pauseMealValidator,
  resumeMealValidator,
  getPauseStatusValidator,
  quickPauseMealValidator,
  quickResumeMealValidator,
} from './subscriptionValidator.js';




const router = Router();

// User Routes

router.get('/plans', validate(getPlansValidator), viewPlans);
router.get('/default-menu', validate(getDefaultMenuValidator), viewDefaultMenu);
router.post('/', protect, validate(createSubscriptionValidator), createSubscription);
router.get('/my', protect, validate(getMySubscriptionValidator), getMySubscription);
router.get('/history', protect, validate(getSubscriptionHistoryValidator), getHistory);
router.post('/pause', protect, validate(pauseMySubscriptionValidator), pauseMySubscription);
router.post('/resume', protect, validate(resumeMySubscriptionValidator), resumeMySubscription);
router.get('/pauseable-days', protect, validate(getPauseableDaysValidator), getPauseableDays);
router.post('/pause-meal', protect, validate(pauseMealValidator), pauseMeal);
router.post('/resume-meal', protect, validate(resumeMealValidator), resumeMeal);

// Primary pause routes — use proper service functions that accept subscriptionId
router.get('/pauses/status', protect, validate(getPauseableDaysValidator), getPauseableDays);
router.post('/pauses', protect, validate(pauseMealValidator), pauseMeal);
router.post('/pauses/resume', protect, validate(resumeMealValidator), resumeMeal);

// Admin Routes

router.get('/admin/all', protect, adminOnly, validate(getAllSubscriptionsValidator), getAllSubscriptions);
router.get('/admin/active-subscribers', protect, adminOnly, validate(getActiveSubscribersValidator), getActiveSubscribers);
router.get('/admin/customer/:userId', protect, adminOnly, validate(getCustomerDetailsValidator), getCustomerDetails);
router.post('/admin/:id/pause', protect, adminOnly, validate(pauseSubscriptionValidator), pauseSubscription);
router.post('/admin/:id/resume', protect, adminOnly, validate(resumeSubscriptionValidator), resumeSubscription);
router.get('/admin/kitchen-dashboard', protect, adminOnly, validate(getKitchenDashboardValidator), getKitchenDashboard);
router.get('/admin/statistics', protect, adminOnly, validate(getStatisticsValidator), getStatistics);

export default router;
