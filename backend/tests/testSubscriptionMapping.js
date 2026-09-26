import 'dotenv/config';
import mongoose from 'mongoose';
import Menu from '../models/Menu.js';
import WeeklyMenu from '../models/WeeklyMenu.js';

const GOALS = [
  'High Protein',
  'Weight Loss',
  'Weight Gain',
  'Balanced Diet',
  'Diabetic Friendly',
];

const TIERS = [
  'Std Veg',
  'Premium Veg',
  'Std Non-Veg',
  'Premium Non-Veg',
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

function getMondayOfCurrentWeek() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

async function runDiagnostic() {
  let issueCount = 0;
  let warningCount = 0;

  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  NUTRIFLOW — SUBSCRIPTION MAPPING DIAGNOSTIC');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📦 MENU ITEMS BY PLAN BUCKET');
    console.log('────────────────────────────────────────────────\n');

    for (const goal of GOALS) {
      console.log(`  🔹 ${goal}`);

      for (const tierStr of TIERS) {
        const isNonVeg = tierStr.includes('Non-Veg');
        const isPremium = tierStr.startsWith('Premium');
        const menuTier = isPremium ? 'Premium' : 'Standard';
        const vegFilter = isNonVeg ? 'Non-Veg' : { $in: ['Veg', 'Vegan'] };

        const items = await Menu.find({
          goalCategory: goal,
          vegNonVeg: vegFilter,
          tier: menuTier,
        });

        const statusIcon = items.length >= 5 ? '✅' : items.length >= 1 ? '🟢' : '❌';
        if (items.length === 0) issueCount++;

        console.log(`    ${statusIcon} ${tierStr.padEnd(16)} →  ${items.length} exact matches`);

        for (const item of items) {
          const star = item.isChefSpecial ? '⭐' : '  ';
          const tierTag = `[${item.tier}]`;
          console.log(`         ${item.menuId.padEnd(6)} ${item.name.padEnd(30)} ${item.category.padEnd(12)} ${star} ${tierTag}`);

          if (item.tier !== menuTier) {
            console.log(`         ⚠️  WARNING: Item ${item.menuId} tier (${item.tier}) does not match expected (${menuTier})`);
            warningCount++;
          }
        }
      }
      console.log('');
    }

    console.log('📅 THIS WEEK\'S MENU ASSIGNMENT');
    console.log('────────────────────────────────────────────────');

    const weekStartDate = getMondayOfCurrentWeek();

    for (const goal of GOALS) {
      for (const tierStr of TIERS) {
        console.log(`  ${goal} — ${tierStr}`);

        const weeklyEntries = await WeeklyMenu.find({
          weekStartDate,
          goal,
          tier: tierStr,
        }).populate('menuId');

        const isPremiumPlan = tierStr.startsWith('Premium');
        let chefSpecialCount = 0;

        const dayMap = {};
        weeklyEntries.forEach((entry) => {
          dayMap[entry.day] = entry;
        });

        for (const day of DAYS) {
          const entry = dayMap[day];
          if (!entry || !entry.menuId) {
            console.log(`    ${day.padEnd(10)} ❌ NO DISH ASSIGNED`);
            issueCount++;
            continue;
          }

          const dish = entry.menuId;
          if (dish.isChefSpecial) chefSpecialCount++;

          let checkMark = '✅';
          let warningMsg = '';

          if (isPremiumPlan && dish.tier === 'Standard') {
            checkMark = '⚠️';
            warningMsg = ' (Standard dish on Premium plan!)';
            warningCount++;
          }

          console.log(`    ${day.padEnd(10)} 🟢 ${dish.menuId.padEnd(6)} ${dish.name.padEnd(30)} [${dish.tier}] ${checkMark}${warningMsg}`);
        }

        if (isPremiumPlan && chefSpecialCount < 1) {
          console.log(`    ⚠️  WARNING: Premium plan ${goal} ${tierStr} has 0 chef specials`);
          warningCount++;
        }
      }
    }

    console.log('\n👑 PREMIUM FEATURES READINESS');
    console.log('────────────────────────────────────────────────');

    for (const goal of GOALS) {
      const premiumVegItems = await Menu.find({
        goalCategory: goal,
        vegNonVeg: { $in: ['Veg', 'Vegan'] },
        tier: 'Premium',
      });

      const hasRemovableVeg = premiumVegItems.some((i) => i.removableIngredients && i.removableIngredients.length > 0);
      const hasAddonsVeg = premiumVegItems.some((i) => i.optionalAddons && i.optionalAddons.length > 0);

      console.log(`  ${goal}: Premium Veg items with removableIngredients: ${hasRemovableVeg ? '✅ Yes' : '⚠️ No'}`);
      console.log(`  ${goal}: Premium Veg items with optionalAddons: ${hasAddonsVeg ? '✅ Yes' : '⚠️ No'}`);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    if (issueCount === 0 && warningCount === 0) {
      console.log('  FINAL VERDICT: READY FOR SUBSCRIPTION TESTING ✅');
    } else {
      console.log(`  FINAL VERDICT: FIX ${issueCount + warningCount} ISSUES FIRST ❌ (Issues: ${issueCount}, Warnings: ${warningCount})`);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.error('Diagnostic error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

runDiagnostic();
