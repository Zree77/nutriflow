import * as orderService from './orderService.js';

/*
 * Place a new order
 * route   POST /nutriflow/orders
 * access  Private
 */
export const placeOrder = async (req, res) => {
    try {
        const result = await orderService.placeOrderService(
            req.user._id,
            req.body,
            req.user.isSubscribed
        );

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
        console.error('[Order Controller Error] placeOrder failed:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error.',
            error: error.message
        });
    }
};

/*
 * Get all orders of the logged-in user (with pagination)
 * route   GET /nutriflow/orders
 * access  Private
 */
export const getMyOrders = async (req, res) => {
    try {
        const result = await orderService.getMyOrdersService(req.user._id, req.query);

        if (!result.success) {
            return res.status(result.status).json({
                success: false,
                message: result.message
            });
        }

        return res.status(result.status).json({
            success: true,
            data: result.data,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('[Order Controller Error] getMyOrders failed:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error.',
            error: error.message
        });
    }
};

/*
 * Get a single order by ID
 * route   GET /nutriflow/orders/:id
 * access  Private
 */
export const getOrderById = async (req, res) => {
    try {
        const result = await orderService.getOrderByIdService(
            req.params.id,
            req.user._id,
            req.user.role
        );

        if (!result.success) {
            return res.status(result.status).json({
                success: false,
                message: result.message
            });
        }

        return res.status(result.status).json({
            success: true,
            data: result.data
        });
    } catch (error) {
        console.error('[Order Controller Error] getOrderById failed:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error.',
            error: error.message
        });
    }
};

/*
 * Cancel an order
 * route   PUT /nutriflow/orders/:id/cancel
 * access  Private
 */
export const cancelOrder = async (req, res) => {
    try {
        const result = await orderService.cancelOrderService(
            req.params.id,
            req.user._id,
            req.user.role,
            req.body.reason
        );

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
        console.error('[Order Controller Error] cancelOrder failed:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error.',
            error: error.message
        });
    }
};

/**
 * Get all orders (Admin only) with pagination and filters
 * route   GET /nutriflow/orders/admin
 * access  Private/Admin
 */
export const getAllOrders = async (req, res) => {
    try {
        const result = await orderService.getAllOrdersService(req.query);

        if (!result.success) {
            return res.status(result.status).json({
                success: false,
                message: result.message
            });
        }

        return res.status(result.status).json({
            success: true,
            data: result.data,
            pagination: result.pagination,
            filters: result.filters
        });
    } catch (error) {
        console.error('[Order Controller Error] getAllOrders failed:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error.',
            error: error.message
        });
    }
};

/*
 * Update order status (Admin only) with transition validation
 * route   PUT /nutriflow/orders/admin/:id/status
 * access  Private/Admin
 */
export const updateOrderStatus = async (req, res) => {
    try {
        const result = await orderService.updateOrderStatusService(
            req.params.id,
            req.body.status,
            req.body.note
        );

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
        console.error('[Order Controller Error] updateOrderStatus failed:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error.',
            error: error.message
        });
    }
};

/*
 * Get order statistics (Admin only)
 * route   GET /nutriflow/orders/admin/stats
 * access  Private/Admin
 */
export const getOrderStats = async (req, res) => {
    try {
        const result = await orderService.getOrderStatsService();

        if (!result.success) {
            return res.status(result.status).json({
                success: false,
                message: result.message
            });
        }

        return res.status(result.status).json({
            success: true,
            data: result.data
        });
    } catch (error) {
        console.error('[Order Controller Error] getOrderStats failed:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error.',
            error: error.message
        });
    }
};
