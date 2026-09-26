import Joi from 'joi';

export const createOrderValidator = Joi.object({
  amount: Joi.number().min(0).optional().messages({
    'number.base': 'Amount must be a number.',
    'number.min': 'Amount cannot be negative.',
  }),
  orderId: Joi.string().hex().length(24).optional().messages({
    'string.base': 'Order ID must be a string.',
    'string.hex': 'Order ID must be a valid 24-character hex string.',
    'string.length': 'Order ID must be exactly 24 characters.',
  }),
  subscriptionId: Joi.string().optional().messages({
    'string.base': 'Subscription ID must be a string.',
  }),
}).custom((value, helpers) => {
  if (!value.orderId && !value.subscriptionId) {
    return helpers.error('any.custom', { message: 'Either orderId or subscriptionId is required.' });
  }
  if (value.orderId && value.subscriptionId) {
    return helpers.error('any.custom', { message: 'Provide either orderId or subscriptionId, not both.' });
  }
  return value;
}).messages({ 'any.custom': '{{#message}}' });

export const verifyValidator = Joi.object({
  gatewayOrderId: Joi.string().required().messages({
    'any.required': 'gatewayOrderId is required.',
    'string.empty': 'gatewayOrderId cannot be empty.',
  }),
  gatewayPaymentId: Joi.string().optional(),
  gatewaySignature: Joi.string().optional(),
  paymentMethod: Joi.string()
    .valid('UPI', 'Credit Card', 'Debit Card')
    .required()
    .messages({
      'any.required': 'Payment method is required.',
      'any.only': 'paymentMethod must be one of UPI, Credit Card, or Debit Card.',
    }),
});

export const paymentHistoryValidator = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    'number.base': 'page must be a number.',
    'number.integer': 'page must be an integer.',
    'number.min': 'page must be at least 1.',
  }),
  limit: Joi.number().integer().min(1).max(50).default(10).messages({
    'number.base': 'limit must be a number.',
    'number.integer': 'limit must be an integer.',
    'number.min': 'limit must be at least 1.',
    'number.max': 'limit cannot exceed 50.',
  }),
  status: Joi.string()
    .valid('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED')
    .optional()
    .messages({
      'any.only': 'status must be one of PENDING, SUCCESS, FAILED, or REFUNDED.',
    }),
});

export const getPaymentByIdValidator = Joi.object({
  paymentId: Joi.string().required().messages({
    'any.required': 'paymentId is required.',
    'string.empty': 'paymentId cannot be empty.',
    'string.base': 'paymentId must be a string.',
  }),
});

export const adminPaymentsValidator = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    'number.base': 'page must be a number.',
    'number.integer': 'page must be an integer.',
    'number.min': 'page must be at least 1.',
  }),
  limit: Joi.number().integer().min(1).max(100).default(20).messages({
    'number.base': 'limit must be a number.',
    'number.integer': 'limit must be an integer.',
    'number.min': 'limit must be at least 1.',
    'number.max': 'limit cannot exceed 100.',
  }),
  status: Joi.string()
    .valid('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED')
    .optional()
    .messages({
      'any.only': 'status must be one of PENDING, SUCCESS, FAILED, or REFUNDED.',
    }),
});
