import mongoose from 'mongoose';

const { Schema } = mongoose;

const weeklyMenuSchema = new Schema({
  weekStartDate: {
    type: Date,
    required: true,
  },
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
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  },
  mealSlot: {
    type: String,
    required: true,
    default: 'Breakfast',
    enum: ['Breakfast', 'Lunch', 'Dinner'],
  },
  menuId: {
    type: Schema.Types.ObjectId,
    ref: 'Menu',
    required: true,
  },
  isChefSpecial: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

weeklyMenuSchema.index(
  { weekStartDate: 1, goal: 1, tier: 1, day: 1, mealSlot: 1 },
  { unique: true }
);

const WeeklyMenu = mongoose.model('WeeklyMenu', weeklyMenuSchema);
export default WeeklyMenu;
