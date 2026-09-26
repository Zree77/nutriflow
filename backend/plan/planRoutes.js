import express from 'express';
import {
  getAllPlans,
  getWeeklyMenu,
  getPlanById,
  getDayAlternatives,
} from './planController.js';

const router = express.Router();

router.get('/', getAllPlans);
router.get('/weekly-menu', getWeeklyMenu);
router.get('/:planId/day-options', getDayAlternatives);
router.get('/:id', getPlanById);

export default router;
