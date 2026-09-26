// models/Payment.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const paymentSchema = new Schema(
  {
    paymentId: {
      type: String,
      unique: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Nullable — only set for order payments
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
    // Nullable — only set for subscription payments
    subscription: {
      type: Schema.Types.ObjectId,
      ref: 'Subscription',
      default: null,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR'],
    },
    gateway: {
      type: String,
      default: 'RAZORPAY',
      enum: ['RAZORPAY'],
    },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'Credit Card', 'Debit Card', ''],
      default: '',
    },
    // Simulated Razorpay IDs — generated server-side, never trusted from frontend
    gatewayOrderId: {
      type: String,
      required: true,
    },
    gatewayPaymentId: {
      type: String,
      default: '',
    },
    gatewaySignature: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      required: true,
      enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
    },
  },
  { timestamps: true }
);

// Pre-save hook: Auto-generate paymentId (NF-PAY-XXXXX format)
// Uses async function() — NO next param (Mongoose 7+ requirement)
paymentSchema.pre('save', async function () {
  if (this.paymentId) return;

  const count = await mongoose.model('Payment').countDocuments();
  this.paymentId = `NF-PAY-${String(count + 1).padStart(5, '0')}`;
});

// Indexes
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ gatewayOrderId: 1 }, { unique: true });
paymentSchema.index({ order: 1 }, { sparse: true });
paymentSchema.index({ subscription: 1 }, { sparse: true });

export default mongoose.model('Payment', paymentSchema);
