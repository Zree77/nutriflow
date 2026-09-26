import express from 'express';
import { sendOTP, verifyOTP, getProfile } from '../controllers/authController.js';
import { protect } from '../../middleware/authMiddleware.js';
import { validateSendOTP, validateVerifyOTP } from '../validators/auth.validator.js';

const router = express.Router();


router.post('/', validateSendOTP, sendOTP);


router.post('/verify-otp', validateVerifyOTP, verifyOTP);

// Route to get authenticated user profile
router.get('/profile', protect, getProfile);

export default router;
