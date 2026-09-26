import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Plan from './subscription/models/Plan.js';

const plans = [
  // High Protein
  { goal: 'High Protein', tier: 'Std Veg', name: 'High Protein - Std Veg', weeklyPrice: 999, supportsPause: false },
  { goal: 'High Protein', tier: 'Premium Veg', name: 'High Protein - Premium Veg', weeklyPrice: 1199, supportsPause: true },
  { goal: 'High Protein', tier: 'Std Non-Veg', name: 'High Protein - Std Non-Veg', weeklyPrice: 1199, supportsPause: false },
  { goal: 'High Protein', tier: 'Premium Non-Veg', name: 'High Protein - Premium Non-Veg', weeklyPrice: 1399, supportsPause: true },

  // Weight Loss
  { goal: 'Weight Loss', tier: 'Std Veg', name: 'Weight Loss - Std Veg', weeklyPrice: 949, supportsPause: false },
  { goal: 'Weight Loss', tier: 'Premium Veg', name: 'Weight Loss - Premium Veg', weeklyPrice: 1149, supportsPause: true },
  { goal: 'Weight Loss', tier: 'Std Non-Veg', name: 'Weight Loss - Std Non-Veg', weeklyPrice: 1149, supportsPause: false },
  { goal: 'Weight Loss', tier: 'Premium Non-Veg', name: 'Weight Loss - Premium Non-Veg', weeklyPrice: 1349, supportsPause: true },

  // Weight Gain
  { goal: 'Weight Gain', tier: 'Std Veg', name: 'Weight Gain - Std Veg', weeklyPrice: 949, supportsPause: false },
  { goal: 'Weight Gain', tier: 'Premium Veg', name: 'Weight Gain - Premium Veg', weeklyPrice: 1149, supportsPause: true },
  { goal: 'Weight Gain', tier: 'Std Non-Veg', name: 'Weight Gain - Std Non-Veg', weeklyPrice: 1149, supportsPause: false },
  { goal: 'Weight Gain', tier: 'Premium Non-Veg', name: 'Weight Gain - Premium Non-Veg', weeklyPrice: 1349, supportsPause: true },

  // Balanced Diet
  { goal: 'Balanced Diet', tier: 'Std Veg', name: 'Balanced Diet - Std Veg', weeklyPrice: 899, supportsPause: false },
  { goal: 'Balanced Diet', tier: 'Premium Veg', name: 'Balanced Diet - Premium Veg', weeklyPrice: 1099, supportsPause: true },
  { goal: 'Balanced Diet', tier: 'Std Non-Veg', name: 'Balanced Diet - Std Non-Veg', weeklyPrice: 1099, supportsPause: false },
  { goal: 'Balanced Diet', tier: 'Premium Non-Veg', name: 'Balanced Diet - Premium Non-Veg', weeklyPrice: 1299, supportsPause: true },

  // Diabetic Friendly
  { goal: 'Diabetic Friendly', tier: 'Std Veg', name: 'Diabetic Friendly - Std Veg', weeklyPrice: 949, supportsPause: false },
  { goal: 'Diabetic Friendly', tier: 'Premium Veg', name: 'Diabetic Friendly - Premium Veg', weeklyPrice: 1149, supportsPause: true },
  { goal: 'Diabetic Friendly', tier: 'Std Non-Veg', name: 'Diabetic Friendly - Std Non-Veg', weeklyPrice: 1149, supportsPause: false },
  { goal: 'Diabetic Friendly', tier: 'Premium Non-Veg', name: 'Diabetic Friendly - Premium Non-Veg', weeklyPrice: 1349, supportsPause: true },
];

const descriptions = {
  'High Protein': 'Fuel your muscles with protein-rich breakfast meals designed to support strength and recovery.',
  'Weight Loss': 'Low-calorie, high-fiber breakfast meals to help you achieve a healthy calorie deficit.',
  'Weight Gain': 'Calorie-dense, nutrient-rich breakfast meals to support healthy weight and muscle gain.',
  'Balanced Diet': 'A well-rounded mix of macronutrients to keep you energized and nourished all morning.',
  'Diabetic Friendly': 'Low glycemic index breakfast meals crafted to help manage blood sugar levels.',
};

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  await Plan.deleteMany({});
  console.log('Cleared existing plans');

  const docs = plans.map(p => ({
    ...p,
    description: descriptions[p.goal],
    deliveryDays: 5,
  }));

  await Plan.insertMany(docs);
  console.log(`Seeded ${docs.length} plans`);

  await mongoose.disconnect();
  console.log('Done');
}

seed().catch(err => { console.error(err); process.exit(1); });