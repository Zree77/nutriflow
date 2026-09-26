import Joi from 'joi';

export const updateProfileValidator = Joi.object({
    name: Joi.string().trim().min(2).max(100).optional(),
    email: Joi.string().email().trim().lowercase().optional(),
    profileImage: Joi.string().uri().allow("").optional()
});

export const addAddressValidator = Joi.object({
    label: Joi.string().valid("Home", "Work", "Other").default("Home"),
    fullName: Joi.string().trim().required(),
    phone: Joi.string().trim().regex(/^[0-9]{10}$/).required(),
    houseNo: Joi.string().trim().required(),
    buildingName: Joi.string().trim().required(),
    street: Joi.string().trim().required(),
    area: Joi.string().trim().required(),
    city: Joi.string().trim().required(),
    state: Joi.string().trim().required(),
    pincode: Joi.string().trim().regex(/^[0-9]{6}$/).required(),
    landmark: Joi.string().trim().allow("").default(""),
    deliveryInstructions: Joi.string().trim().allow("").default(""),
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    isDefault: Joi.boolean().default(false)
});

export const updateAddressValidator = Joi.object({
    label: Joi.string().valid("Home", "Work", "Other").optional(),
    fullName: Joi.string().trim().optional(),
    phone: Joi.string().trim().regex(/^[0-9]{10}$/).optional(),
    houseNo: Joi.string().trim().optional(),
    buildingName: Joi.string().trim().optional(),
    street: Joi.string().trim().optional(),
    area: Joi.string().trim().optional(),
    city: Joi.string().trim().optional(),
    state: Joi.string().trim().optional(),
    pincode: Joi.string().trim().regex(/^[0-9]{6}$/).optional(),
    landmark: Joi.string().trim().allow("").optional(),
    deliveryInstructions: Joi.string().trim().allow("").optional(),
    latitude: Joi.number().min(-90).max(90).optional(),
    longitude: Joi.number().min(-180).max(180).optional(),
    isDefault: Joi.boolean().optional()
}).min(1);

export const addressIdValidator = Joi.object({
    id: Joi.string().required()
});
