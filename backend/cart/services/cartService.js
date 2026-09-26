import Cart from '../../models/Cart.js';
import Menu from '../../models/Menu.js';
import {
    validateSubscriberOnlyCustomizations,
    validateAndSanitizeCustomizations,
    normalizeTargetCustomizations
} from './customizationService.js';
import { calculateAdjustedPrice } from './pricingService.js';
import { getCustomizationString } from '../utils/cartHelpers.js';
import {
    ITEM_NOT_FOUND,
    CART_NOT_FOUND,
    ITEM_NOT_FOUND_IN_CART,
    ITEM_ADDED_SUCCESSFULLY,
    ITEM_UPDATED_SUCCESSFULLY,
    ITEM_REMOVED_SUCCESSFULLY,
    CART_CLEARED_SUCCESSFULLY
} from '../constants/cartMessages.js';

/*
 * Add an item to the cart
 */
export const addToCart = async (userId, user, menuItemId, quantity, customizations) => {
    // Verify Menu item exists
    const menuItem = await Menu.findById(menuItemId);
    if (!menuItem) {
        return {
            success: false,
            status: 404,
            message: ITEM_NOT_FOUND
        };
    }

    // Validate premium customization rules
    const subCheck = validateSubscriberOnlyCustomizations(user, customizations);
    if (!subCheck.isValid) {
        return {
            success: false,
            status: subCheck.status,
            message: subCheck.message
        };
    }

    // Validate and sanitize the customizations
    const custVal = validateAndSanitizeCustomizations(menuItem, customizations);
    if (!custVal.isValid) {
        return {
            success: false,
            status: custVal.status,
            message: custVal.message
        };
    }

    const normalizedCustomizations = custVal.normalizedCustomizations;
    const adjustedPrice = calculateAdjustedPrice(menuItem.price, normalizedCustomizations.addedAddons, menuItem.optionalAddons);

    // Retrieve or create Cart for user
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
        cart = new Cart({ user: userId, items: [] });
    }

    // Check if item already exists in cart with same customizations
    const itemIndex = cart.items.findIndex(item => {
        return item.menuItem.toString() === menuItemId &&
            getCustomizationString(item.customizations) === getCustomizationString(normalizedCustomizations);
    });

    if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
    } else {
        cart.items.push({
            menuItem: menuItemId,
            quantity,
            customizations: normalizedCustomizations,
            adjustedPrice
        });
    }

    await cart.save();

    // Populate items.menuItem and return updated cart
    const populatedCart = await cart.populate('items.menuItem');

    return {
        success: true,
        status: 200,
        message: ITEM_ADDED_SUCCESSFULLY,
        data: populatedCart
    };
};

/**
 * Get logged-in user's cart
 */
export const getCart = async (userId) => {
    // Retrieve cart and populate items.menuItem
    let cart = await Cart.findOne({ user: userId }).populate('items.menuItem');

    // If no cart exists in database, initialize and return a blank one
    if (!cart) {
        cart = await Cart.create({ user: userId, items: [] });
    }

    return {
        success: true,
        status: 200,
        data: cart
    };
};

/**
 * Update item quantity in cart
 */
export const updateCartItem = async (userId, menuItemId, quantity, customizations) => {
    // Find user's cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
        return {
            success: false,
            status: 404,
            message: CART_NOT_FOUND
        };
    }

    // Find item index inside cart matching customizations if specified
    let itemIndex = -1;
    if (customizations) {
        const targetCustomizations = normalizeTargetCustomizations(customizations);
        itemIndex = cart.items.findIndex(item =>
            item.menuItem.toString() === menuItemId &&
            getCustomizationString(item.customizations) === getCustomizationString(targetCustomizations)
        );
    } else {
        // Fallback: find first matching menuItemId
        itemIndex = cart.items.findIndex(item => item.menuItem.toString() === menuItemId);
    }

    if (itemIndex === -1) {
        return {
            success: false,
            status: 404,
            message: ITEM_NOT_FOUND_IN_CART
        };
    }

    // Update or remove item depending on quantity
    if (quantity <= 0) {
        // Remove the item
        cart.items.splice(itemIndex, 1);
    } else {
        // Update quantity
        cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();

    const populatedCart = await cart.populate('items.menuItem');

    return {
        success: true,
        status: 200,
        message: ITEM_UPDATED_SUCCESSFULLY,
        data: populatedCart
    };
};

/**
 * Remove a single item from cart
 */
export const removeCartItem = async (userId, menuItemId, customizations) => {
    // Find user's cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
        return {
            success: false,
            status: 404,
            message: CART_NOT_FOUND
        };
    }

    // Find item index inside cart matching customizations if specified
    let itemIndex = -1;
    if (customizations) {
        const targetCustomizations = normalizeTargetCustomizations(customizations);
        itemIndex = cart.items.findIndex(item =>
            item.menuItem.toString() === menuItemId &&
            getCustomizationString(item.customizations) === getCustomizationString(targetCustomizations)
        );
    } else {
        // Fallback: find first matching menuItemId
        itemIndex = cart.items.findIndex(item => item.menuItem.toString() === menuItemId);
    }

    if (itemIndex === -1) {
        return {
            success: false,
            status: 404,
            message: ITEM_NOT_FOUND_IN_CART
        };
    }

    // Remove item and save
    cart.items.splice(itemIndex, 1);
    await cart.save();

    const populatedCart = await cart.populate('items.menuItem');

    return {
        success: true,
        status: 200,
        message: ITEM_REMOVED_SUCCESSFULLY,
        data: populatedCart
    };
};

/**
 * Clear the entire cart
 */
export const clearCart = async (userId) => {
    // Find user's cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
        return {
            success: false,
            status: 404,
            message: CART_NOT_FOUND
        };
    }

    // Clear items array
    cart.items = [];
    await cart.save();

    return {
        success: true,
        status: 200,
        message: CART_CLEARED_SUCCESSFULLY,
        data: cart
    };
};
