import * as cartService from '../services/cartService.js';
import * as cartValidator from '../validators/cartValidator.js';
import { INTERNAL_SERVER_ERROR } from '../constants/cartMessages.js';

/*
 * Add item to cart
 * route = POST /nutriflow/cart
 * access = admin/user
 */
export const addToCart = async (req, res) => {
    try {
        const { menuItemId, quantity, customizations } = req.body;
        const userId = req.user._id;

        const validation = cartValidator.validateAddToCartInput(menuItemId, quantity, customizations);
        if (!validation.isValid) {
            return res.status(validation.status).json({
                success: false,
                message: validation.message
            });
        }

        // Call Service
        const result = await cartService.addToCart(userId, req.user, menuItemId, quantity, customizations);
        if (!result.success) {
            return res.status(result.status).json({
                success: false,
                message: result.message
            });
        }

        return res.status(result.status).json({
            success: true,
            message: result.message,
            data: result.data
        });
    } catch (error) {
        console.error('[Cart Controller Error] addToCart failed:', error);
        return res.status(500).json({
            success: false,
            message: INTERNAL_SERVER_ERROR,
            error: error.message
        });
    }
};

/*
 * Get logged-in user's cart
 * route  = GET /nutriflow/cart
 * access = admin/user
 */
export const getCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const result = await cartService.getCart(userId);

        return res.status(result.status).json({
            success: true,
            data: result.data
        });
    } catch (error) {
        console.error('[Cart Controller Error] getCart failed:', error);
        return res.status(500).json({
            success: false,
            message: INTERNAL_SERVER_ERROR,
            error: error.message
        });
    }
};

/**
 * Update item quantity in cart
 * route = PUT /nutriflow/cart/update-quantity  
 * access = admin/user
 */
export const updateCartItem = async (req, res) => {
    try {
        const { menuItemId, quantity, customizations } = req.body;
        const userId = req.user._id;

        const validation = cartValidator.validateUpdateCartItemInput(menuItemId, quantity, customizations);
        if (!validation.isValid) {
            return res.status(validation.status).json({
                success: false,
                message: validation.message
            });
        }

        // Call Service
        const result = await cartService.updateCartItem(userId, menuItemId, quantity, customizations);
        if (!result.success) {
            return res.status(result.status).json({
                success: false,
                message: result.message
            });
        }

        return res.status(result.status).json({
            success: true,
            message: result.message,
            data: result.data
        });
    } catch (error) {
        console.error('[Cart Controller Error] updateCartItem failed:', error);
        return res.status(500).json({
            success: false,
            message: INTERNAL_SERVER_ERROR,
            error: error.message
        });
    }
};

/*
 * Remove a single item from cart
 * route = POST /nutriflow/cart/remove  ← UPDATED ROUTE
 * access = admin/user
 */
export const removeCartItem = async (req, res) => {
    try {
        const { menuItemId, customizations } = req.body;
        const userId = req.user._id;

        const validation = cartValidator.validateRemoveCartItemInput(menuItemId, customizations);
        if (!validation.isValid) {
            return res.status(validation.status).json({
                success: false,
                message: validation.message
            });
        }

        // Call Service
        const result = await cartService.removeCartItem(userId, menuItemId, customizations);
        if (!result.success) {
            return res.status(result.status).json({
                success: false,
                message: result.message
            });
        }

        return res.status(result.status).json({
            success: true,
            message: result.message,
            data: result.data
        });
    } catch (error) {
        console.error('[Cart Controller Error] removeCartItem failed:', error);
        return res.status(500).json({
            success: false,
            message: INTERNAL_SERVER_ERROR,
            error: error.message
        });
    }
};

/*
 * Clear the entire cart
 * route = DELETE /nutriflow/cart
 * access = admin/user
 */
export const clearCart = async (req, res) => {
    try {
        const userId = req.user._id;

        const result = await cartService.clearCart(userId);
        if (!result.success) {
            return res.status(result.status).json({
                success: false,
                message: result.message
            });
        }

        return res.status(result.status).json({
            success: true,
            message: result.message,
            data: result.data
        });
    } catch (error) {
        console.error('[Cart Controller Error] clearCart failed:', error);
        return res.status(500).json({
            success: false,
            message: INTERNAL_SERVER_ERROR,
            error: error.message
        });
    }
};