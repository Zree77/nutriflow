// payment/controllers/paymentController.js
import {
  createPaymentOrder as createPaymentOrderService,
  verifyPayment as verifyPaymentService,
  getPaymentHistory as getPaymentHistoryService,
  getPaymentByPaymentId as getPaymentByPaymentIdService,
  getAllPaymentsAdmin as getAllPaymentsAdminService,
  getPaymentByIdAdmin as getPaymentByIdAdminService,
} from '../services/paymentService.js';

// ===================== User Controllers =====================

async function createPaymentOrder(req, res, next) {
  try {
    const userId = req.user._id;
    const result = await createPaymentOrderService(userId, req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

async function verifyPayment(req, res, next) {
  try {
    const userId = req.user._id;
    const result = await verifyPaymentService(userId, req.body);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

async function getPaymentHistory(req, res, next) {
  try {
    const userId = req.user._id;
    const result = await getPaymentHistoryService(userId, req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

async function getPaymentById(req, res, next) {
  try {
    const userId = req.user._id;
    const { paymentId } = req.params;
    const result = await getPaymentByPaymentIdService(userId, paymentId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

// ===================== Admin Controllers =====================

async function getAllPaymentsAdmin(req, res, next) {
  try {
    const result = await getAllPaymentsAdminService(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

async function getPaymentByIdAdmin(req, res, next) {
  try {
    const { paymentId } = req.params;
    const result = await getPaymentByIdAdminService(paymentId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export {
  createPaymentOrder,
  verifyPayment,
  getPaymentHistory,
  getPaymentById,
  getAllPaymentsAdmin,
  getPaymentByIdAdmin,
};
