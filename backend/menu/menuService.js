import Menu from '../models/Menu.js';
import mongoose from 'mongoose';

// Validation helper functions
const validateRemovableIngredients = (removableIngredients) => {
    if (removableIngredients !== undefined && removableIngredients !== null) {
        if (!Array.isArray(removableIngredients)) {
            return { valid: false, message: 'removableIngredients must be an array.' };
        }
        for (const item of removableIngredients) {
            if (typeof item !== 'object' || item === null) {
                return { valid: false, message: 'Every item in removableIngredients must be an object.' };
            }
            if (typeof item.name !== 'string' || item.name.trim() === '') {
                return { valid: false, message: 'Every item in removableIngredients must have a valid string "name".' };
            }
        }
    }
    return { valid: true };
};

const validateOptionalAddons = (optionalAddons) => {
    if (optionalAddons !== undefined && optionalAddons !== null) {
        if (!Array.isArray(optionalAddons)) {
            return { valid: false, message: 'optionalAddons must be an array.' };
        }
        for (const item of optionalAddons) {
            if (typeof item !== 'object' || item === null) {
                return { valid: false, message: 'Every item in optionalAddons must be an object.' };
            }
            if (typeof item.name !== 'string' || item.name.trim() === '') {
                return { valid: false, message: 'Every item in optionalAddons must have a valid string "name".' };
            }
            if (item.extraPrice === undefined || item.extraPrice === null) {
                return { valid: false, message: 'Every item in optionalAddons must have an "extraPrice".' };
            }
            const extraPriceNum = Number(item.extraPrice);
            if (isNaN(extraPriceNum) || extraPriceNum < 0) {
                return { valid: false, message: 'Every item in optionalAddons must have a valid non-negative number for "extraPrice".' };
            }
        }
    }
    return { valid: true };
};


// SERVICE FUNCTIONS


/*
 * Get all menu items with filtering and search
 */
export const getMenuItemsService = async (query) => {
    try {
        const {
            category,
            vegNonVeg,
            goalCategory,
            dietaryTags,
            search,
            isAvailable,
            availableForDailyOrder,
            availableForSubscription
        } = query;

        const filter = {};

        // Category filter
        if (category) {
            filter.category = category;
        }

        // Veg/Non-Veg filter
        if (vegNonVeg) {
            filter.vegNonVeg = vegNonVeg;
        }

        // Goal Category filter (supports array or comma-separated string)
        if (goalCategory) {
            const goals = Array.isArray(goalCategory)
                ? goalCategory
                : goalCategory.split(',').map(g => g.trim());
            filter.goalCategory = { $in: goals };
        }

        // Dietary Tags filter (supports array or comma-separated string)
        if (dietaryTags) {
            const tags = Array.isArray(dietaryTags)
                ? dietaryTags
                : dietaryTags.split(',').map(t => t.trim());
            filter.dietaryTags = { $in: tags };
        }

        // Text search across name and description
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Availability filters
        if (isAvailable !== undefined) {
            filter.isAvailable = isAvailable === 'true';
        }
        if (availableForDailyOrder !== undefined) {
            filter.availableForDailyOrder = availableForDailyOrder === 'true';
        }
        if (availableForSubscription !== undefined) {
            filter.availableForSubscription = availableForSubscription === 'true';
        }

        const menuItems = await Menu.find(filter);
        return {
            success: true,
            status: 200,
            count: menuItems.length,
            data: menuItems
        };
    } catch (error) {
        console.error('[Menu Service Error] getMenuItemsService failed:', error);
        return {
            success: false,
            status: 500,
            message: 'Server Error fetching menu items',
            error: error.message
        };
    }
};

/*
 * Get a single menu item by ID or custom menuId
 */
export const getMenuItemByIdService = async (id) => {
    try {
        let menuItem;

        // Check if the parameter is a valid MongoDB ObjectId
        if (mongoose.Types.ObjectId.isValid(id)) {
            menuItem = await Menu.findById(id);
        } else {
            // Otherwise try to find by the custom menuId field (e.g. 'HP001')
            menuItem = await Menu.findOne({ menuId: id });
        }

        if (!menuItem) {
            return {
                success: false,
                status: 404,
                message: `Menu item not found with ID/menuId of ${id}`
            };
        }

        return {
            success: true,
            status: 200,
            data: menuItem
        };
    } catch (error) {
        console.error('[Menu Service Error] getMenuItemByIdService failed:', error);
        return {
            success: false,
            status: 500,
            message: 'Server Error retrieving menu item',
            error: error.message
        };
    }
};

/*
 * Create a new menu item
 */
export const createMenuItemService = async (body) => {
    try {
        const { menuId, name, category, vegNonVeg, price, removableIngredients, optionalAddons } = body;

        // Validate required fields
        if (!menuId || !name || !category || !vegNonVeg || price === undefined) {
            return {
                success: false,
                status: 400,
                message: 'Please provide all required fields: menuId, name, category, vegNonVeg, price'
            };
        }

        // Validate premium customization fields structure
        const removableValidation = validateRemovableIngredients(removableIngredients);
        if (!removableValidation.valid) {
            return {
                success: false,
                status: 400,
                message: removableValidation.message
            };
        }

        const addonsValidation = validateOptionalAddons(optionalAddons);
        if (!addonsValidation.valid) {
            return {
                success: false,
                status: 400,
                message: addonsValidation.message
            };
        }

        // Check if menuId already exists
        const existingItem = await Menu.findOne({
            $or: [
                { menuId },
                { name }
            ]
        });

        if (existingItem) {
            return {
                success: false,
                status: 400,
                message: `Menu item with menuId ${menuId} or name ${name} already exists`
            };
        }

        const menuItem = await Menu.create(body);
        return {
            success: true,
            status: 201,
            data: menuItem
        };
    } catch (error) {
        console.error('[Menu Service Error] createMenuItemService failed:', error);
        return {
            success: false,
            status: 500,
            message: 'Server Error creating menu item',
            error: error.message
        };
    }
};

/*
 * Update an existing menu item
 */
export const updateMenuItemService = async (value, body) => {
    try {
        const { removableIngredients, optionalAddons } = body;

        // Validate premium customization fields structure
        const removableValidation = validateRemovableIngredients(removableIngredients);
        if (!removableValidation.valid) {
            return {
                success: false,
                status: 400,
                message: removableValidation.message
            };
        }

        const addonsValidation = validateOptionalAddons(optionalAddons);
        if (!addonsValidation.valid) {
            return {
                success: false,
                status: 400,
                message: addonsValidation.message
            };
        }

        let menuItem;

        if (mongoose.Types.ObjectId.isValid(value)) {
            menuItem = await Menu.findByIdAndUpdate(
                value,
                body,
                {
                    new: true,
                    runValidators: true
                }
            );
        } else {
            menuItem = await Menu.findOneAndUpdate(
                {
                    $or: [
                        { menuId: value },
                        { name: value }
                    ]
                },
                body,
                {
                    new: true,
                    runValidators: true
                }
            );
        }

        if (!menuItem) {
            return {
                success: false,
                status: 404,
                message: `Menu item not found with ${value}`
            };
        }

        return {
            success: true,
            status: 200,
            data: menuItem
        };
    } catch (error) {
        console.error('[Menu Service Error] updateMenuItemService failed:', error);
        return {
            success: false,
            status: 500,
            message: "Server Error updating menu item",
            error: error.message
        };
    }
};

/*
 * Delete a menu item
 */
export const deleteMenuItemService = async (id) => {
    try {
        let menuItem;

        if (mongoose.Types.ObjectId.isValid(id)) {
            menuItem = await Menu.findByIdAndDelete(id);
        } else {
            menuItem = await Menu.findOneAndDelete({ menuId: id });
        }

        if (!menuItem) {
            return {
                success: false,
                status: 404,
                message: `Menu item not found with ID/menuId of ${id}`
            };
        }

        return {
            success: true,
            status: 200,
            message: 'Menu item deleted successfully'
        };
    } catch (error) {
        console.error('[Menu Service Error] deleteMenuItemService failed:', error);
        return {
            success: false,
            status: 500,
            message: 'Server Error deleting menu item',
            error: error.message
        };
    }
};
