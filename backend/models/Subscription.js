import mongoose from 'mongoose';

const { Schema } = mongoose;

// Embedded Schema 1: Delivery Address
const deliveryAddressSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    houseNo: { type: String, required: true, trim: true },
    buildingName: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    area: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    landmark: { type: String, trim: true },
    deliveryInstructions: { type: String, trim: true },
  },
  { _id: false }
);

// Embedded Schema 2: Meal Schedule Item
const mealScheduleItemSchema = new Schema(
  {
    day: {
      type: String,
      required: true,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
    menuItem: {
      type: Schema.Types.ObjectId,
      ref: 'Menu',
      required: true,
    },
    removedIngredients: {
      type: [String],
      default: [],
    },
    addedAddons: [
      {
        addonId: { type: String, required: true },
        addonName: { type: String, required: true },
        addonPrice: { type: Number, required: true, min: 0 },
      },
    ],
    isCustomized: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { _id: false }
);

// Embedded Schema 3: Paused Meal (Day-level pause with reschedule)
const pausedMealSchema = new Schema(
  {
    originalDate: {
      type: Date,
      required: true,
    },
    rescheduledDate: {
      type: Date,
      required: true,
    },
    originalMeal: {
      menuItem: {
        type: Schema.Types.ObjectId,
        ref: 'Menu',
      },
      mealName: {
        type: String,
        required: true,
      },
      removedIngredients: [
        {
          type: String,
        },
      ],
      addedAddons: [
        {
          addonId: {
            type: Schema.Types.ObjectId,
          },
          addonName: {
            type: String,
          },
          addonPrice: {
            type: Number,
          },
        },
      ],
      isCustomized: {
        type: Boolean,
        default: false,
      },
    },
    status: {
      type: String,
      enum: ['pending', 'delivered', 'skipped'],
      default: 'pending',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

// Main Schema: Subscription
const subscriptionSchema = new Schema(
  {
    subscriptionId: {
      type: String,
      unique: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    plan: {
      type: Schema.Types.ObjectId,
      ref: 'Plan',
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['Pending Payment', 'Active', 'Paused', 'Cancelled', 'Expired'],
      default: 'Pending Payment',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    deliveryAddress: {
      type: deliveryAddressSchema,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['UPI', 'Credit Card', 'Debit Card'],
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ['Pending', 'Success', 'Failed'],
      default: 'Pending',
    },
    pauseCount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    mealSchedule: {
      type: [mealScheduleItemSchema],
      required: true,
      validate: [
        {
          validator: (val) => val.length === 5,
          message: 'mealSchedule must contain exactly 5 items.',
        },
        {
          validator: (val) => {
            const days = val.map((item) => item.day);
            return new Set(days).size === days.length;
          },
          message: 'mealSchedule must have all 5 days unique.',
        },
      ],
    },
    pausedMeals: {
      type: [pausedMealSchema],
      default: [],
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

// Pre-save Hook: Auto-generate subscriptionId
subscriptionSchema.pre('save', async function () {
  if (this.subscriptionId) return;

  const count = await mongoose.model('Subscription').countDocuments();
  this.subscriptionId = `NF-SUB-${String(count + 1).padStart(5, '0')}`;
});

// Indexes
subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ 'pausedMeals.originalDate': 1 });
subscriptionSchema.index({ 'pausedMeals.rescheduledDate': 1 });

export default mongoose.model('Subscription', subscriptionSchema);