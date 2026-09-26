// payment/routes/paymentRoutes.js
import { Router } from 'express';
import { protect, adminOnly } from '../../middleware/authMiddleware.js';
import { validate } from '../../middleware/validate.js';

import {
  createOrderValidator,
  verifyValidator,
  paymentHistoryValidator,
  getPaymentByIdValidator,
  adminPaymentsValidator,
} from '../validators/paymentValidator.js';

import {
  createPaymentOrder,
  verifyPayment,
  getPaymentHistory,
  getPaymentById,
  getAllPaymentsAdmin,
  getPaymentByIdAdmin,
} from '../controllers/paymentController.js';

const router = Router();

// ===================== User Routes =====================

router.post('/create-order', protect, validate(createOrderValidator), createPaymentOrder);
router.post('/verify', protect, validate(verifyValidator), verifyPayment);
router.get('/history', protect, validate(paymentHistoryValidator), getPaymentHistory);

// ===================== Admin Routes =====================
// MUST come BEFORE /:paymentId to prevent "admin" being matched as a paymentId param

router.get('/admin/all', protect, adminOnly, validate(adminPaymentsValidator), getAllPaymentsAdmin);
router.get('/admin/:paymentId', protect, adminOnly, validate(getPaymentByIdValidator), getPaymentByIdAdmin);

// ===================== Parameterised User Route (LAST) =====================

router.get('/:paymentId', protect, validate(getPaymentByIdValidator), getPaymentById);

export default router;
