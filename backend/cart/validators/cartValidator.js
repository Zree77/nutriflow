import mongoose from 'mongoose';
import {
    PROVIDE_MENU_ITEM_AND_QUANTITY,
    QUANTITY_GREATER_THAN_ZERO,
    QUANTITY_MUST_BE_NUMBER,
    INVALID_MENU_ID,
    REMOVED_INGREDIENTS_MUST_BE_ARRAY,
    ADDED_ADDONS_MUST_BE_ARRAY,
    ADDON_NAME_REQUIRED,
    CUSTOMIZATIONS_REQUIRED_FOR_REMOVE,
    CUSTOMIZATIONS_REQUIRED_FOR_UPDATE
} from '../constants/cartMessages.js';

/**
 * Shared helper to validate customizations structure
 */
const validateCustomizationsStructure = (customizations, required = false) => {
    // If required (remove/update), null/undefined is strictly rejected
    if (required && (customizations === null || customizations === undefined)) {
        return {
            isValid: false,
            status: 400,
            message: required === 'remove' ? CUSTOMIZATIONS_REQUIRED_FOR_REMOVE : CUSTOMIZATIONS_REQUIRED_FOR_UPDATE
        };
    }

    // If not required (add), null/undefined means "no customization" — valid
    if (!customizations) {
        return { isValid: true };
    }

    // Must be a plain object
    if (typeof customizations !== 'object' || Array.isArray(customizations)) {
        return { isValid: false, status: 400, message: 'customizations must be an object' };
    }

    const { removedIngredients, addedAddons } = customizations;

    // Validate removedIngredients (must be array of strings)
    if (removedIngredients !== undefined) {
        if (!Array.isArray(removedIngredients)) {
            return { isValid: false, status: 400, message: REMOVED_INGREDIENTS_MUST_BE_ARRAY };
        }
        for (let i = 0; i < removedIngredients.length; i++) {
            if (typeof removedIngredients[i] !== 'string') {
                return { isValid: false, status: 400, message: `removedIngredients[${i}] must be a string` };
            }
        }
    }

    // Validate addedAddons (must be array of objects with "name")
    if (addedAddons !== undefined) {
        if (!Array.isArray(addedAddons)) {
            return { isValid: false, status: 400, message: ADDED_ADDONS_MUST_BE_ARRAY };
        }
        for (let i = 0; i < addedAddons.length; i++) {
            const addon = addedAddons[i];
            if (typeof addon !== 'object' || addon === null || !addon.name || typeof addon.name !== 'string') {
                return { isValid: false, status: 400, message: ADDON_NAME_REQUIRED };
            }
        }
    }

    return { isValid: true };
};

/**
 * Validate input for adding item to cart
 */
export const validateAddToCartInput = (menuItemId, quantity, customizations) => {
    if (!menuItemId || quantity === undefined) {
        return { isValid: false, status: 400, message: PROVIDE_MENU_ITEM_AND_QUANTITY };
    }
    if (typeof quantity !== 'number' || quantity <= 0) {
        return { isValid: false, status: 400, message: QUANTITY_GREATER_THAN_ZERO };
    }
    if (!mongoose.Types.ObjectId.isValid(menuItemId)) {
        return { isValid: false, status: 400, message: INVALID_MENU_ID };
    }

    const customCheck = validateCustomizationsStructure(customizations, false);
    if (!customCheck.isValid) return customCheck;

    return { isValid: true };
};

/**
 * Validate input for updating cart item quantity
 */
export const validateUpdateCartItemInput = (menuItemId, quantity, customizations) => {
    if (typeof quantity !== 'number' || quantity <= 0) {
        return { isValid: false, status: 400, message: QUANTITY_MUST_BE_NUMBER };
    }
    if (!mongoose.Types.ObjectId.isValid(menuItemId)) {
        return { isValid: false, status: 400, message: INVALID_MENU_ID };
    }

    const customCheck = validateCustomizationsStructure(customizations, 'update');
    if (!customCheck.isValid) return customCheck;

    return { isValid: true };
};

/**
 * Validate input for removing item from cart
 */
export const validateRemoveCartItemInput = (menuItemId, customizations) => {
    if (!mongoose.Types.ObjectId.isValid(menuItemId)) {
        return { isValid: false, status: 400, message: INVALID_MENU_ID };
    }

    const customCheck = validateCustomizationsStructure(customizations, 'remove');
    if (!customCheck.isValid) return customCheck;

    return { isValid: true };
};