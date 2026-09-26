// payment/services/paymentService.js
import Order from '../../models/Order.js';
import Subscription from '../../models/Subscription.js';
import Payment from '../../models/Payment.js';
import {
  generateGatewayOrderId,
  generateGatewayPaymentId,
  generateGatewaySignature,
} from '../utils/idGenerator.js';

// ─────────────────────────────────────────────────────────
// SERVICE 1: Create a PENDING payment order
// ─────────────────────────────────────────────────────────
export async function createPaymentOrder(userId, { orderId, subscriptionId }) {
  let dbAmount;
  let orderRef = null;
  let subscriptionRef = null;

  if (orderId) {
    const order = await Order.findById(orderId).lean();

    if (!order) {
      throw { statusCode: 404, message: 'Order not found.' };
    }
    if (order.user.toString() !== userId.toString()) {
      throw { statusCode: 403, message: 'Unauthorized. This order does not belong to you.' };
    }
    if (order.paymentStatus === 'Success') {
      throw { statusCode: 400, message: 'Order is already paid.' };
    }

    dbAmount = order.totalAmount;
    orderRef = order._id;

  } else if (subscriptionId) {
    const subscription = await Subscription.findById(subscriptionId).lean();

    if (!subscription) {
      throw { statusCode: 404, message: 'Subscription not found.' };
    }
    if (subscription.user.toString() !== userId.toString()) {
      throw { statusCode: 403, message: 'Unauthorized. This subscription does not belong to you.' };
    }
    if (subscription.paymentStatus === 'Success') {
      throw { statusCode: 400, message: 'Subscription is already paid.' };
    }

    dbAmount = subscription.totalPrice;
    subscriptionRef = subscription._id;
  }

  const gatewayOrderId = generateGatewayOrderId();

  const payment = await Payment.create({
    user: userId,
    order: orderRef,
    subscription: subscriptionRef,
    amount: dbAmount,
    gatewayOrderId,
    status: 'PENDING',
  });

  return {
    gatewayOrderId: payment.gatewayOrderId,
    amount: payment.amount,
    currency: payment.currency,
  };
}

// ─────────────────────────────────────────────────────────
// SERVICE 2: Verify payment and mark SUCCESS
// ─────────────────────────────────────────────────────────
export async function verifyPayment(userId, { gatewayOrderId, paymentMethod }) {
  const payment = await Payment.findOne({ gatewayOrderId }).lean();

  if (!payment) {
    throw { statusCode: 404, message: 'Payment order not found.' };
  }

  if (payment.user.toString() !== userId.toString()) {
    throw { statusCode: 403, message: 'Unauthorized.' };
  }

  if (payment.status !== 'PENDING') {
    throw { statusCode: 400, message: 'Payment already processed.' };
  }

  const simulatedPaymentId = generateGatewayPaymentId();
  const simulatedSignature = generateGatewaySignature();

  await Payment.updateOne(
    { gatewayOrderId },
    {
      $set: {
        gatewayPaymentId: simulatedPaymentId,
        gatewaySignature: simulatedSignature,
        paymentMethod,
        status: 'SUCCESS',
      },
    }
  );

  if (payment.order) {
    await Order.updateOne(
      { _id: payment.order },
      {
        $set: {
          paymentStatus: 'Success',
          status: 'Confirmed',
          paymentId: payment.paymentId,
        },
      }
    );
  }

  if (payment.subscription) {
    await Subscription.updateOne(
      { _id: payment.subscription },
      {
        $set: {
          paymentStatus: 'Success',
          status: 'Active',
        },
      }
    );
  }

  const updatedPayment = await Payment.findOne({ gatewayOrderId }).lean();
  return updatedPayment;
}

// ─────────────────────────────────────────────────────────
// SERVICE 3: Get payment history for current user
// ─────────────────────────────────────────────────────────
export async function getPaymentHistory(userId, { page = 1, limit = 10, status }) {
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.min(50, Math.max(1, parseInt(limit) || 10));

  const query = { user: userId };
  if (status) query.status = status;

  const skip = (p - 1) * l;
  const [payments, total] = await Promise.all([
    Payment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(l)
      .lean(),
    Payment.countDocuments(query),
  ]);

  return {
    payments,
    pagination: {
      page: p,
      limit: l,
      total,
      pages: Math.ceil(total / l),
    },
  };
}

// ─────────────────────────────────────────────────────────
// SERVICE 4: Get single payment by NF-PAY-XXXXX ID (user)
// ─────────────────────────────────────────────────────────
export async function getPaymentByPaymentId(userId, paymentId) {
  const payment = await Payment.findOne({ paymentId })
    .populate('order', 'orderNumber status totalAmount')
    .populate('subscription', 'subscriptionId status plan')
    .lean();

  if (!payment) {
    throw { statusCode: 404, message: 'Payment not found.' };
  }

  if (payment.user.toString() !== userId.toString()) {
    throw { statusCode: 403, message: 'Unauthorized.' };
  }

  return payment;
}

// ─────────────────────────────────────────────────────────
// SERVICE 5: Admin — get all payments (paginated)
// ─────────────────────────────────────────────────────────
export async function getAllPaymentsAdmin({ page = 1, limit = 20, status }) {
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit) || 20));

  const query = {};
  if (status) query.status = status;

  const skip = (p - 1) * l;
  const [payments, total] = await Promise.all([
    Payment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(l)
      .populate('user', 'name email phone')
      .populate('order', 'orderNumber totalAmount')
      .populate('subscription', 'subscriptionId plan')
      .lean(),
    Payment.countDocuments(query),
  ]);

  return {
    payments,
    pagination: {
      page: p,
      limit: l,
      total,
      pages: Math.ceil(total / l),
    },
  };
}

// ─────────────────────────────────────────────────────────
// SERVICE 6: Admin — get single payment by paymentId string
// ─────────────────────────────────────────────────────────
export async function getPaymentByIdAdmin(paymentId) {
  const payment = await Payment.findOne({ paymentId })
    .populate('user', 'name email phone')
    .populate('order', 'orderNumber status totalAmount items')
    .populate('subscription', 'subscriptionId status plan startDate endDate')
    .lean();

  if (!payment) {
    throw { statusCode: 404, message: 'Payment not found.' };
  }

  return payment;
}