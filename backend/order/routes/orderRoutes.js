import express from 'express';
import { protect, adminOnly } from '../../middleware/authMiddleware.js';
import {
    placeOrder,
    getMyOrders,
    getOrderById,
    cancelOrder,
    getAllOrders,
    updateOrderStatus,
    getOrderStats
} from '../orderController.js';
import { checkDeliveryAvailability } from '../../helpers/deliveryHelper.js';

const router = express.Router();

// Public routes
router.get('/delivery-check', (req, res) => {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json({ success: false, message: 'lat and lng query parameters are required.' });
    const result = checkDeliveryAvailability(parseFloat(lat), parseFloat(lng));
    return res.status(result.available ? 200 : 403).json({ success: result.available, data: result });
});

//  auth protection middleware
router.use(protect);


// User and Admin shared/private routes
router.post('/', placeOrder);
router.get('/', getMyOrders);

// Admin-only: Get all orders & Stats 
router.get('/admin', adminOnly, getAllOrders);
router.get('/admin/stats', adminOnly, getOrderStats);

// User and Admin: Retrieve single order / cancel order
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);

// Admin-only: Update order status
router.put('/admin/:id/status', adminOnly, updateOrderStatus);

export default router;