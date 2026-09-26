import { body, validationResult } from 'express-validator';

/**
 * Common middleware to format and return validation errors
 */
const checkValidationResult = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    next();
};

/**
 * Validate phone number for sending OTP
 */
export const validateSendOTP = [
    body('phone')
        .trim()
        .exists().withMessage('Phone number is required.')
        .notEmpty().withMessage('Phone number cannot be empty.')
        .isLength({ min: 10, max: 10 }).withMessage('Phone number must be exactly 10 digits.')
        .matches(/^[6-9][0-9]{9}$/).withMessage('Phone number must be a valid 10-digit Indian number starting with 6-9.'),
    checkValidationResult
];

/**
 * Validate inputs for verifying OTP
 */
export const validateVerifyOTP = [
    body('verificationId')
        .trim()
        .exists().withMessage('Verification ID is required.')
        .notEmpty().withMessage('Verification ID cannot be empty.'),
    body('otp')
        .exists().withMessage('OTP is required.')
        .isLength({ min: 4, max: 6 }).withMessage('OTP must be between 4 and 6 characters.'),
    body('name')
        .optional({ checkFalsy: true })
        .isString().withMessage('Name must be a string.')
        .trim()
        .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters.'),
    checkValidationResult
];