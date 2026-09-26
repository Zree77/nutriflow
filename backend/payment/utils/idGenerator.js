// payment/utils/idGenerator.js
import crypto from 'crypto';

export function generateGatewayOrderId() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'order_';
  const bytes = crypto.randomBytes(14);
  for (let i = 0; i < 14; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

export function generateGatewayPaymentId() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'pay_';
  const bytes = crypto.randomBytes(14);
  for (let i = 0; i < 14; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

export function generateGatewaySignature() {
  return 'fake_signature_' + crypto.randomBytes(16).toString('hex');
}
