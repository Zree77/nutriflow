import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import {
    addToCart,
    getCart,
    updateCartItem,
    removeCartItem,
    clearCart
} from '../controllers/cartController.js';

const router = express.Router();

router.use(protect);

// Add item to cart 
router.post('/', addToCart);

// Get user's cart
router.get('/', getCart);

// Update item quantity
router.put('/update-quantity', updateCartItem);

// Remove specific item 
router.post('/remove', removeCartItem);

// Clear entire cart
router.delete('/', clearCart);

export default router;