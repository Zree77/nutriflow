import Joi from 'joi';


const deliveryAddressSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100).required(),
  phone: Joi.string()
    .trim()
    .regex(/^[6-9]\d{9}$/)
    .message('Phone must be a valid 10-digit Indian number')
    .required(),
  houseNo: Joi.string().trim().min(1).required(),
  buildingName: Joi.string().trim().min(1).required(),
  street: Joi.string().trim().min(1).required(),
  area: Joi.string().trim().min(1).required(),
  city: Joi.string().trim().min(1).required(),
  state: Joi.string().trim().min(1).required(),
  pincode: Joi.string()
    .trim()
    .regex(/^\d{6}$/)
    .message('Pincode must be exactly 6 digits')
    .required(),
  landmark: Joi.string().trim().allow('', null).optional(),
  deliveryInstructions: Joi.string().trim().allow('', null).optional(),
});

const mealScheduleItemSchema = Joi.object({
  day: Joi.string()
    .valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday')
    .required(),
  menuItemId: Joi.string().hex().length(24).required(),
  removedIngredients: Joi.array().items(Joi.string().trim()).default([]),
  addedAddons: Joi.array().items(
    Joi.object({
      addonId: Joi.string().required(),
      addonName: Joi.string().trim().required(),
      addonPrice: Joi.number().min(0).required(),
    })
  ).default([]),
  isCustomized: Joi.boolean().default(false),
});

//User-facing Validators

export const getPlansValidator = Joi.object({});

export const getDefaultMenuValidator = Joi.object({
  planId: Joi.string().hex().length(24).required(),
});



export const createSubscriptionValidator = Joi.object({
  planId: Joi.string().hex().length(24).required(),
  startDate: Joi.date()
    .iso()
    .greater('now')
    .required()
    .messages({ 'date.greater': 'Start date must be a future date' }),
  deliveryAddress: deliveryAddressSchema.required(),
  mealSchedule: Joi.array()
    .items(mealScheduleItemSchema)
    .length(5)
    .required()
    .messages({ 'array.length': 'Meal schedule must contain exactly 5 days' }),
  paymentMethod: Joi.string()
    .valid('UPI', 'Credit Card', 'Debit Card')
    .required()
    .messages({
      'any.only':
        'COD is not allowed for subscriptions. Use UPI, Credit Card, or Debit Card.',
    }),
  paymentStatus: Joi.string().valid('Pending', 'Success', 'Failed').default('Pending'),
});

export const getMySubscriptionValidator = Joi.object({});

export const getSubscriptionHistoryValidator = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  status: Joi.string()
    .valid('Pending Payment', 'Active', 'Paused', 'Cancelled', 'Expired')
    .optional(),
});


export const pauseMySubscriptionValidator = Joi.object({});

export const resumeMySubscriptionValidator = Joi.object({});


//Admin-facing Validators 

export const getAllSubscriptionsValidator = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  status: Joi.string()
    .valid('Pending Payment', 'Active', 'Paused', 'Cancelled', 'Expired')
    .optional(),
});

export const getActiveSubscribersValidator = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

export const getCustomerDetailsValidator = Joi.object({
  userId: Joi.string().hex().length(24).required(),
});

export const pauseSubscriptionValidator = Joi.object({
  id: Joi.string().required()
});

export const resumeSubscriptionValidator = Joi.object({
  id: Joi.string().required()
});

export const getKitchenDashboardValidator = Joi.object({
  date: Joi.date().iso().optional(),
  view: Joi.string().valid('daily', 'weekly').default('daily'),
});

export const getStatisticsValidator = Joi.object({});

export const getPauseableDaysValidator = Joi.object({
  subscriptionId: Joi.string().required().messages({
    'any.required': 'Subscription ID is required.',
    'string.empty': 'Subscription ID cannot be empty.',
    'string.base': 'Subscription ID must be a string.'
  })
});

export const pauseMealValidator = Joi.object({
  subscriptionId: Joi.string().required().messages({
    'any.required': 'Subscription ID is required.',
    'string.empty': 'Subscription ID cannot be empty.',
    'string.base': 'Subscription ID must be a string.'
  }),
  originalDate: Joi.date().iso().required().messages({
    'any.required': 'Original date is required.',
    'date.base': 'Original date must be a valid date.',
    'date.format': 'Original date must be in ISO format.'
  }),
  rescheduledDate: Joi.date().iso().required().messages({
    'any.required': 'Rescheduled date is required.',
    'date.base': 'Rescheduled date must be a valid date.',
    'date.format': 'Rescheduled date must be in ISO format.'
  })
});

export const resumeMealValidator = Joi.object({
  subscriptionId: Joi.string().required().messages({
    'any.required': 'Subscription ID is required.',
    'string.empty': 'Subscription ID cannot be empty.',
    'string.base': 'Subscription ID must be a string.'
  }),
  originalDate: Joi.date().iso().required().messages({
    'any.required': 'Original date is required.',
    'date.base': 'Original date must be a valid date.',
    'date.format': 'Original date must be in ISO format.'
  })
});
export const getPauseStatusValidator = Joi.object({});

export const quickPauseMealValidator = Joi.object({
  pauseDate: Joi.string().isoDate().required().messages({
    'any.required': 'Pause date is required.',
    'string.isoDate': 'Pause date must be a valid ISO date string (YYYY-MM-DD).'
  }),
  rescheduledDate: Joi.string().isoDate().optional().messages({
    'string.isoDate': 'Rescheduled date must be a valid ISO date string (YYYY-MM-DD).'
  })
});

export const quickResumeMealValidator = Joi.object({
  pauseDate: Joi.string().isoDate().required().messages({
    'any.required': 'Pause date is required.',
    'string.isoDate': 'Pause date must be a valid ISO date string (YYYY-MM-DD).'
  })
});
