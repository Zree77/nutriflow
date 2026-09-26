import mongoose from 'mongoose';

const { Schema } = mongoose;

const planSchema = new Schema(
  {
    goal: {
      type: String,
      required: true,
      enum: ['High Protein', 'Weight Loss', 'Weight Gain', 'Balanced Diet', 'Diabetic Friendly'],
    },
    tier: {
      type: String,
      required: true,
      enum: ['Std Veg', 'Premium Veg', 'Std Non-Veg', 'Premium Non-Veg'],
    },
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    weeklyPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryDays: {
      type: Number,
      default: 5,
    },
    defaultWeeklyMenu: {
      monday: { type: Schema.Types.ObjectId, ref: 'Menu', default: null },
      tuesday: { type: Schema.Types.ObjectId, ref: 'Menu', default: null },
      wednesday: { type: Schema.Types.ObjectId, ref: 'Menu', default: null },
      thursday: { type: Schema.Types.ObjectId, ref: 'Menu', default: null },
      friday: { type: Schema.Types.ObjectId, ref: 'Menu', default: null },
    },
    targetNutritionPerDay: {
      calories: { type: Number },
      protein: { type: Number },
      carbs: { type: Number },
      fats: { type: Number },
    },
    image: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    supportsPause: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: each goal+tier combination must be unique
planSchema.index({ goal: 1, tier: 1 }, { unique: true });

export default mongoose.model('Plan', planSchema);
