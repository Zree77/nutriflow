import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import mongoose from 'mongoose';
import { DELIVERY_CHARGE, GST_PERCENT, VALID_BREAKFAST_SLOTS, ORDER_CUTOFF_HOUR, ORDER_CUTOFF_MINUTE, CANCEL_MIN_SECONDS, CANCEL_MAX_SECONDS } from '../config/constants.js';
import { calculateDelivery, MAX_DELIVERY_RADIUS_KM } from '../helpers/deliveryHelper.js';

// VALIDATION CONSTANTS

export const VALID_ORDER_TYPES = ['order', 'subscription'];
export const VALID_PAYMENT_METHODS = ['COD', 'UPI', 'Credit Card', 'Debit Card', 'Net Banking'];
export const VALID_PAYMENT_STATUSES = ['Pending', 'Paid', 'Failed', 'Refunded'];
export const VALID_ORDER_STATUSES = ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];

// Valid status transitions map
export const VALID_TRANSITIONS = {
    'Pending': ['Confirmed', 'Cancelled'],
    'Confirmed': ['Preparing', 'Cancelled'],
    'Preparing': ['Out for Delivery', 'Cancelled'],
    'Out for Delivery': ['Delivered'],
    'Delivered': [],
    'Cancelled': []
};

// HELPER FUNCTIONS

/*
 * Validate delivery address structure
 */
export const validateDeliveryAddress = (address) => {
    if (!address || typeof address !== 'object') {
        return { valid: false, message: 'Delivery address is required and must contain structured details.' };
    }

    const {
        fullName, phone, houseNo, buildingName, street, area, city, state, pincode, landmark, deliveryInstructions, latitude, longitude
    } = address;

    const requiredFields = { fullName, phone, houseNo, buildingName, street, area, city, state, pincode };
    const emptyField = Object.entries(requiredFields).find(([key, value]) => !value || value.trim() === '');

    if (emptyField) {
        return {
            valid: false,
            message: `Delivery address field "${emptyField[0]}" is required.`
        };
    }

    return {
        valid: true,
        cleanAddress: {
            fullName: fullName.trim(),
            phone: phone.trim(),
            houseNo: houseNo.trim(),
            buildingName: buildingName.trim(),
            street: street.trim(),
            area: area.trim(),
            landmark: (landmark || '').trim(),
            city: city.trim(),
            state: state.trim(),
            pincode: pincode.trim(),
            deliveryInstructions: (deliveryInstructions || '').trim(),
            latitude,
            longitude
        }
    };
};

/*
 * Check if a status transition is valid
 */
export const isValidTransition = (currentStatus, newStatus) => {
    const allowed = VALID_TRANSITIONS[currentStatus] || [];
    return allowed.includes(newStatus);
};

//SERVICE FUNCTIONS

/*
 * Place a new order
 */
export const placeOrderService = async (userId, body, userIsSubscribed) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const {
            orderType = 'order',
            deliveryAddress,
            paymentMethod,
            paymentId = '',
            discount = 0,
            couponCode = '',
            notes = '',
            deliveryDate,
            deliverySlot,
            preferredDeliverySlot
        } = body;

        // Validate Order Type
        if (!VALID_ORDER_TYPES.includes(orderType)) {
            const error = new Error(`Invalid orderType. Must be one of: ${VALID_ORDER_TYPES.join(', ')}`);
            error.status = 400;
            throw error;
        }

        // Validate Payment Method
        if (!paymentMethod || !VALID_PAYMENT_METHODS.includes(paymentMethod)) {
            const error = new Error(`Invalid paymentMethod. Must be one of: ${VALID_PAYMENT_METHODS.join(', ')}`);
            error.status = 400;
            throw error;
        }

        // Subscription COD constraint
        if (orderType === 'subscription' && paymentMethod === 'COD') {
            const error = new Error('Cash on Delivery (COD) is not allowed for subscription orders.');
            error.status = 400;
            throw error;
        }

        // Validate Delivery Address
        const addressValidation = validateDeliveryAddress(deliveryAddress);
        if (!addressValidation.valid) {
            const error = new Error(addressValidation.message);
            error.status = 400;
            throw error;
        }
        const cleanDeliveryAddress = addressValidation.cleanAddress;

        // Validate Delivery Details by Order Type
        let finalDeliveryDate = null;
        let finalDeliverySlot = null;
        let finalPreferredSlot = null;

        // Get current time
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        // Check if current time is BEFORE 9:30 AM
        const isBeforeCutoff = (currentHour < ORDER_CUTOFF_HOUR) ||
            (currentHour === ORDER_CUTOFF_HOUR && currentMinute < ORDER_CUTOFF_MINUTE);

        // Get exact dates (normalized to midnight for comparison)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const dayAfterTomorrow = new Date(today);
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

        if (orderType === 'order') {
            // DELIVERY SLOT VALIDATION

            if (!VALID_BREAKFAST_SLOTS.includes(deliverySlot?.trim())) {
                const error = new Error(`Invalid slot. We only deliver breakfast between 8:00 AM and 9:30 AM.`);
                error.status = 400;
                throw error;
            }
            finalDeliverySlot = deliverySlot.trim();

            // DELIVERY DATE VALIDATION (ORDER NOW)
            if (!deliveryDate) {
                const error = new Error('Delivery date is required.');
                error.status = 400;
                throw error;
            }

            const inputDate = new Date(deliveryDate);
            if (isNaN(inputDate.getTime())) {
                const error = new Error('Invalid delivery date format.');
                error.status = 400;
                throw error;
            }

            const inputDateOnly = new Date(inputDate);
            inputDateOnly.setHours(0, 0, 0, 0);

            // Rule: Before 9:30 AM -> Today is allowed. After 9:30 AM -> Only Tomorrow is allowed.
            const minAllowedDate = isBeforeCutoff ? today : tomorrow;

            if (inputDateOnly < minAllowedDate) {
                const formattedDate = minAllowedDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
                const error = new Error(`Order cutoff passed. Earliest available delivery is ${formattedDate} morning (8:00 AM - 9:30 AM).`);
                error.status = 400;
                throw error;
            }

            finalDeliveryDate = inputDate;

        } else {
            // SUBSCRIPTION LOGIC
            if (!VALID_BREAKFAST_SLOTS.includes(preferredDeliverySlot?.trim())) {
                const error = new Error(`Invalid slot. We only deliver breakfast between 8:00 AM and 9:30 AM.`);
                error.status = 400;
                throw error;
            }
            finalPreferredSlot = preferredDeliverySlot.trim();

            // Rule: Before 9:30 AM -> Starts Tomorrow. After 9:30 AM -> Starts Day After Tomorrow.
            const subscriptionStartDate = isBeforeCutoff ? tomorrow : dayAfterTomorrow;
            finalDeliveryDate = subscriptionStartDate;
        }

        // Retrieve Cart or construct from payload items
        let cartItemsToProcess = [];
        const cart = await Cart.findOne({ user: userId })
            .populate('items.menuItem')
            .session(session);

        if (cart && cart.items && cart.items.length > 0) {
            cartItemsToProcess = cart.items;
        } else if (body.items && Array.isArray(body.items) && body.items.length > 0) {
            const Menu = mongoose.model('Menu');
            for (const item of body.items) {
                if (!item.menuItemId || !mongoose.Types.ObjectId.isValid(item.menuItemId)) {
                    const error = new Error('Invalid menu item, please refresh and try again.');
                    error.status = 400;
                    throw error;
                }
                const menuItem = await Menu.findById(item.menuItemId).session(session);
                if (menuItem) {
                    cartItemsToProcess.push({
                        menuItem,
                        quantity: item.quantity || 1,
                        adjustedPrice: item.price !== undefined ? item.price : menuItem.price,
                        customizations: { removedIngredients: [], addedAddons: [] }
                    });
                }
            }
        }

        if (cartItemsToProcess.length === 0) {
            const error = new Error('Your cart is empty. Add items to place an order.');
            error.status = 400;
            throw error;
        }

        // STRICT LOOP BEFORE PRICING MATH TO CHECK IF ANY CART ITEM HAS CUSTOMIZATIONS.
        // If it does, and userIsSubscribed === false, throw a 403 error blocking the order.
        for (const item of cartItemsToProcess) {
            const hasCustomizations = (item.customizations?.removedIngredients?.length > 0) || (item.customizations?.addedAddons?.length > 0);
            if (hasCustomizations && !userIsSubscribed) {
                const error = new Error('Customization is a premium feature available only for subscribed users.');
                error.status = 403;
                throw error;
            }
        }

        // Calculate Pricing & Map Items
        let subtotal = 0;
        const orderItems = [];

        for (const item of cartItemsToProcess) {
            if (!item.menuItem) {
                const error = new Error('One or more items in your cart are no longer available.');
                error.status = 400;
                throw error;
            }

            // Check if item is still active/available
            if (item.menuItem.isActive === false) {
                const error = new Error(`"${item.menuItem.name}" is currently unavailable.`);
                error.status = 400;
                throw error;
            }

            // Remove fallback to menuItem.price. It MUST strictly be item.adjustedPrice.
            // If it is missing (undefined/null), throw an error.
            if (item.adjustedPrice === undefined || item.adjustedPrice === null) {
                const error = new Error('Item adjusted price is missing.');
                error.status = 400;
                throw error;
            }
            const itemPrice = item.adjustedPrice;
            subtotal += itemPrice * item.quantity;

            orderItems.push({
                menuItem: item.menuItem._id,
                quantity: item.quantity,
                price: itemPrice,
                menuName: item.menuItem.name,
                image: item.menuItem.image || '',
                customizations: {
                    removedIngredients: item.customizations?.removedIngredients || [],
                    addedAddons: item.customizations?.addedAddons || []
                }
            });
        }

        // Calculate charges
        const { latitude, longitude } = cleanDeliveryAddress;
        if (!latitude || !longitude) { const error = new Error('Delivery address must include latitude and longitude.'); error.status = 400; throw error; }
        const deliveryResult = calculateDelivery(orderType === 'subscription' ? true : userIsSubscribed, parseFloat(latitude), parseFloat(longitude));
        if (!deliveryResult.isInRange) { const error = new Error(`Delivery not available. You are ${deliveryResult.distanceKm} km away. Maximum range is ${MAX_DELIVERY_RADIUS_KM} km.`); error.status = 403; throw error; }
        const deliveryCharge = deliveryResult.deliveryCharge;
        const tax = parseFloat((subtotal * (GST_PERCENT / 100)).toFixed(2));

        // Validate and clean discount
        const cleanDiscount = Math.max(0, parseFloat(discount) || 0);
        if (cleanDiscount > subtotal) {
            const error = new Error('Discount cannot be greater than subtotal.');
            error.status = 400;
            throw error;
        }

        // Calculate total
        const totalAmount = parseFloat((subtotal + deliveryCharge + tax - cleanDiscount).toFixed(2));

        // Determine initial payment status
        const paymentStatus = (paymentMethod !== 'COD' && paymentId) ? 'Paid' : 'Pending';

        // 8. Create Order Document
        const order = new Order({
            user: userId,
            items: orderItems,
            orderType,
            subtotal,
            deliveryCharge,
            tax,
            discount: cleanDiscount,
            totalAmount,
            paymentMethod,
            paymentStatus,
            paymentId: paymentId.trim(),
            deliveryAddress: cleanDeliveryAddress,
            couponCode: couponCode.trim(),
            notes: notes.trim(),
            status: 'Pending',
            //  SUBSCRIPTION DATE
            deliveryDate: finalDeliveryDate,
            deliverySlot: orderType === 'order' ? finalDeliverySlot : '',
            preferredDeliverySlot: orderType === 'subscription' ? finalPreferredSlot : ''
        });

        await order.save({ session });

        //  Clear User's Cart
        cart.items = [];
        await cart.save({ session });

        // Commit Transaction
        await session.commitTransaction();

        // Return Created Order (outside transaction)
        const populatedOrder = await Order.findById(order._id)
            .populate('items.menuItem')
            .lean();

        return {
            success: true,
            status: 201,
            message: 'Order placed successfully.',
            data: populatedOrder
        };

    } catch (error) {
        await session.abortTransaction();
        console.error('[Order Service Error] placeOrderService failed:', error);
        return {
            success: false,
            status: error.status || 500,
            message: error.message || 'Internal Server Error.'
        };
    } finally {
        session.endSession();
    }
};

/*
 * Get all orders of the logged-in user (with pagination)
 */
export const getMyOrdersService = async (userId, query) => {
    try {
        // Pagination parameters
        const page = Math.max(1, parseInt(query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(query.limit) || 10));
        const skip = (page - 1) * limit;

        // Optional filters
        const { status, orderType } = query;
        const filter = { user: userId };

        if (status && VALID_ORDER_STATUSES.includes(status)) {
            filter.status = status;
        }

        if (orderType && VALID_ORDER_TYPES.includes(orderType)) {
            filter.orderType = orderType;
        }

        // Execute queries in parallel
        const [orders, total] = await Promise.all([
            Order.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('items.menuItem')
                .lean(),
            Order.countDocuments(filter)
        ]);

        return {
            success: true,
            status: 200,
            data: orders,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        };

    } catch (error) {
        console.error('[Order Service Error] getMyOrdersService failed:', error);
        return {
            success: false,
            status: 500,
            message: 'Internal Server Error.',
            error: error.message
        };
    }
};

/*
 * Get  single order by ID
 */
export const getOrderByIdService = async (id, userId, userRole) => {
    try {
        // Validate Order ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return {
                success: false,
                status: 400,
                message: 'Invalid Order ID.'
            };
        }

        // Find the order
        const order = await Order.findById(id)
            .populate('items.menuItem')
            .lean();

        if (!order) {
            return {
                success: false,
                status: 404,
                message: 'Order not found.'
            };
        }

        // Authorization check
        const isOwner = order.user.toString() === userId.toString();
        const isAdmin = userRole === 'admin';

        if (!isOwner && !isAdmin) {
            return {
                success: false,
                status: 403,
                message: 'Not authorized to view this order.'
            };
        }

        return {
            success: true,
            status: 200,
            data: order
        };

    } catch (error) {
        console.error('[Order Service Error] getOrderByIdService failed:', error);
        return {
            success: false,
            status: 500,
            message: 'Internal Server Error.',
            error: error.message
        };
    }
};

/*
 * Cancel an order
 */
export const cancelOrderService = async (id, userId, userRole, reason = '') => {
    try {
        // Validate Order ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return {
                success: false,
                status: 400,
                message: 'Invalid Order ID.'
            };
        }

        // Find the order
        const order = await Order.findById(id);
        if (!order) {
            return {
                success: false,
                status: 404,
                message: 'Order not found.'
            };
        }

        // Authorization check
        const isOwner = order.user.toString() === userId.toString();
        const isAdmin = userRole === 'admin';

        if (!isOwner && !isAdmin) {
            return {
                success: false,
                status: 403,
                message: 'Not authorized to cancel this order.'
            };
        }

        // Check if already cancelled
        if (order.status === 'Cancelled') {
            return {
                success: false,
                status: 400,
                message: 'Order is already cancelled.'
            };
        }

        // STRICT TIME WINDOW CHECK (Order Now)
        if (order.orderType === 'order') {
            const orderTime = new Date(order.createdAt).getTime();
            const currentTime = Date.now();
            const elapsedSeconds = Math.floor((currentTime - orderTime) / 1000);

            // Check minimum time
            if (elapsedSeconds < CANCEL_MIN_SECONDS) {
                const waitTime = CANCEL_MIN_SECONDS - elapsedSeconds;
                return {
                    success: false,
                    status: 400,
                    message: `Please wait ${waitTime} more seconds before attempting to cancel.`
                };
            }

            // Check maximum time
            if (elapsedSeconds > CANCEL_MAX_SECONDS) {
                return {
                    success: false,
                    status: 400,
                    message: `Cancellation window expired. Standard orders can only be cancelled within ${CANCEL_MAX_SECONDS / 60} minutes of placing.`
                };
            }
        }

        //Validate order status for cancellation
        const cancellableStatuses = ['Pending', 'Confirmed', 'Preparing'];
        if (!cancellableStatuses.includes(order.status)) {
            return {
                success: false,
                status: 400,
                message: `Cannot cancel order at this stage. Current status is: ${order.status}`
            };
        }

        // Update status to Cancelled
        order.status = 'Cancelled';

        // Handle payment refund if applicable
        if (order.paymentStatus === 'Paid' && order.paymentMethod !== 'COD') {
            order.paymentStatus = 'Refunded';
        }

        // Append cancellation reason to notes if provided
        if (reason && reason.trim()) {
            const cancelNote = `[Cancelled] ${reason.trim()}`;
            order.notes = order.notes ? `${order.notes}\n${cancelNote}` : cancelNote;
        }

        await order.save();

        // Return updated order
        const populatedOrder = await Order.findById(order._id)
            .populate('items.menuItem')
            .lean();

        return {
            success: true,
            status: 200,
            message: 'Order cancelled successfully.',
            data: populatedOrder
        };

    } catch (error) {
        console.error('[Order Service Error] cancelOrderService failed:', error);
        return {
            success: false,
            status: 500,
            message: 'Internal Server Error.',
            error: error.message
        };
    }
};

/*
 * Get all orders (Admin only) with pagination and filters
 */
export const getAllOrdersService = async (query) => {
    try {
        // Pagination parameters
        const page = Math.max(1, parseInt(query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
        const skip = (page - 1) * limit;

        // Build filter object
        const filter = {};

        // Filter by status
        if (query.status && VALID_ORDER_STATUSES.includes(query.status)) {
            filter.status = query.status;
        }

        // Filter by order type
        if (query.orderType && VALID_ORDER_TYPES.includes(query.orderType)) {
            filter.orderType = query.orderType;
        }

        // Filter by payment status
        if (query.paymentStatus && VALID_PAYMENT_STATUSES.includes(query.paymentStatus)) {
            filter.paymentStatus = query.paymentStatus;
        }

        // Filter by payment method
        if (query.paymentMethod && VALID_PAYMENT_METHODS.includes(query.paymentMethod)) {
            filter.paymentMethod = query.paymentMethod;
        }

        // Filter by date range
        if (query.startDate || query.endDate) {
            filter.createdAt = {};
            if (query.startDate) {
                filter.createdAt.$gte = new Date(query.startDate);
            }
            if (query.endDate) {
                const endDate = new Date(query.endDate);
                endDate.setHours(23, 59, 59, 999); // End of day
                filter.createdAt.$lte = endDate;
            }
        }

        // Filter by search (order number or user details)
        if (query.search && query.search.trim()) {
            const searchRegex = new RegExp(query.search.trim(), 'i');
            filter.$or = [
                { orderNumber: searchRegex },
                { 'deliveryAddress.phone': searchRegex },
                { 'deliveryAddress.fullName': searchRegex }
            ];
        }

        // Execute queries in parallel
        const [orders, total] = await Promise.all([
            Order.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('user', 'name email phone')
                .populate('items.menuItem')
                .lean(),
            Order.countDocuments(filter)
        ]);

        return {
            success: true,
            status: 200,
            data: orders,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            },
            filters: {
                status: query.status || null,
                orderType: query.orderType || null,
                paymentStatus: query.paymentStatus || null,
                paymentMethod: query.paymentMethod || null,
                startDate: query.startDate || null,
                endDate: query.endDate || null,
                search: query.search || null
            }
        };

    } catch (error) {
        console.error('[Order Service Error] getAllOrdersService failed:', error);
        return {
            success: false,
            status: 500,
            message: 'Internal Server Error.',
            error: error.message
        };
    }
};

/*
 * Update order status (Admin only) with transition validation
 */
export const updateOrderStatusService = async (id, status, note = '') => {
    try {
        // Validate Order ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return {
                success: false,
                status: 400,
                message: 'Invalid Order ID.'
            };
        }

        // Validate status parameter
        if (!status || !VALID_ORDER_STATUSES.includes(status)) {
            return {
                success: false,
                status: 400,
                message: `Invalid status. Must be one of: ${VALID_ORDER_STATUSES.join(', ')}`
            };
        }

        // Find the order
        const order = await Order.findById(id);
        if (!order) {
            return {
                success: false,
                status: 404,
                message: 'Order not found.'
            };
        }

        // Check if status is already the same
        if (order.status === status) {
            return {
                success: false,
                status: 400,
                message: `Order is already in "${status}" status.`
            };
        }

        // Validate status transition
        if (!isValidTransition(order.status, status)) {
            return {
                success: false,
                status: 400,
                message: `Cannot transition from "${order.status}" to "${status}". Valid transitions from "${order.status}": ${VALID_TRANSITIONS[order.status].join(', ') || 'None'}`
            };
        }

        // Update status
        const previousStatus = order.status;
        order.status = status;

        // Auto-set deliveredAt timestamp when status is "Delivered"
        if (status === 'Delivered') {
            order.deliveredAt = new Date();
        }

        // Handle payment refund if order is being cancelled
        if (status === 'Cancelled' && order.paymentStatus === 'Paid' && order.paymentMethod !== 'COD') {
            order.paymentStatus = 'Refunded';
        }

        // Append admin note if provided
        if (note && note.trim()) {
            const adminNote = `[${status}] ${note.trim()}`;
            order.notes = order.notes ? `${order.notes}\n${adminNote}` : adminNote;
        }

        await order.save();

        // Return updated order
        const populatedOrder = await Order.findById(order._id)
            .populate('user', 'name email phone')
            .populate('items.menuItem')
            .lean();

        return {
            success: true,
            status: 200,
            message: `Order status updated from "${previousStatus}" to "${status}".`,
            data: populatedOrder
        };

    } catch (error) {
        console.error('[Order Service Error] updateOrderStatusService failed:', error);
        return {
            success: false,
            status: 500,
            message: 'Internal Server Error.',
            error: error.message
        };
    }
};

/*
 * Get order statistics (Admin only)
 */
export const getOrderStatsService = async () => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);

        // Run all aggregation queries in parallel
        const [
            totalOrders,
            todayOrders,
            thisMonthOrders,
            lastMonthOrders,
            statusBreakdown,
            revenueStats,
            orderTypeBreakdown
        ] = await Promise.all([
            // Total orders count
            Order.countDocuments(),

            // Today's orders count
            Order.countDocuments({ createdAt: { $gte: today } }),

            // This month's orders count
            Order.countDocuments({ createdAt: { $gte: startOfMonth } }),

            // Last month's orders count
            Order.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),

            // Status breakdown
            Order.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]),

            // Revenue stats (only for paid/delivered orders)
            Order.aggregate([
                {
                    $match: {
                        paymentStatus: 'Paid',
                        status: { $ne: 'Cancelled' }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: '$totalAmount' },
                        averageOrderValue: { $avg: '$totalAmount' },
                        totalDiscountGiven: { $sum: '$discount' }
                    }
                }
            ]),

            // Order type breakdown
            Order.aggregate([
                {
                    $group: {
                        _id: '$orderType',
                        count: { $sum: 1 },
                        revenue: { $sum: '$totalAmount' }
                    }
                }
            ])
        ]);

        // Format status breakdown
        const formattedStatusBreakdown = {};
        statusBreakdown.forEach(item => {
            formattedStatusBreakdown[item._id] = item.count;
        });

        // Format order type breakdown
        const formattedOrderTypeBreakdown = {};
        orderTypeBreakdown.forEach(item => {
            formattedOrderTypeBreakdown[item._id] = {
                count: item.count,
                revenue: item.revenue
            };
        });

        // Calculate growth percentage
        const growthPercentage = lastMonthOrders > 0
            ? parseFloat((((thisMonthOrders - lastMonthOrders) / lastMonthOrders) * 100).toFixed(1))
            : 0;

        return {
            success: true,
            status: 200,
            data: {
                counts: {
                    total: totalOrders,
                    today: todayOrders,
                    thisMonth: thisMonthOrders,
                    lastMonth: lastMonthOrders,
                    growthPercentage
                },
                statusBreakdown: formattedStatusBreakdown,
                orderTypeBreakdown: formattedOrderTypeBreakdown,
                revenue: revenueStats[0] ? {
                    total: revenueStats[0].totalRevenue,
                    average: parseFloat(revenueStats[0].averageOrderValue.toFixed(2)),
                    totalDiscountGiven: revenueStats[0].totalDiscountGiven
                } : {
                    total: 0,
                    average: 0,
                    totalDiscountGiven: 0
                }
            }
        };

    } catch (error) {
        console.error('[Order Service Error] getOrderStatsService failed:', error);
        return {
            success: false,
            status: 500,
            message: 'Internal Server Error.',
            error: error.message
        };
    }
};
