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

function select5DishesForWeek(candidateMenus, isPremium) {
  if (!candidateMenus || candidateMenus.length === 0) {
    return [];
  }

  const selected = [];

  if (isPremium) {
    const chefSpecials = candidateMenus.filter((m) => m.isChefSpecial);
    const regulars = candidateMenus.filter((m) => !m.isChefSpecial);

    const numChefSpecialsToPick = Math.min(2, chefSpecials.length);
    for (let i = 0; i < numChefSpecialsToPick; i++) {
      selected.push(chefSpecials[i]);
    }

    const remainingPool = [...regulars, ...chefSpecials.slice(numChefSpecialsToPick)];
    let poolIdx = 0;
    while (selected.length < 5 && poolIdx < remainingPool.length) {
      if (!selected.includes(remainingPool[poolIdx])) {
        selected.push(remainingPool[poolIdx]);
      }
      poolIdx++;
    }

    let cycleIdx = 0;
    while (selected.length < 5) {
      selected.push(candidateMenus[cycleIdx % candidateMenus.length]);
      cycleIdx++;
    }
  } else {
    for (let i = 0; i < Math.min(5, candidateMenus.length); i++) {
      selected.push(candidateMenus[i]);
    }
    let cycleIdx = 0;
    while (selected.length < 5) {
      selected.push(candidateMenus[cycleIdx % candidateMenus.length]);
      cycleIdx++;
    }
  }

  return selected.slice(0, 5);
}

async function seedWeeklyMenu() {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const weekStartDate = getMondayOfCurrentWeek();
    console.log(`Seeding WeeklyMenu for week starting: ${weekStartDate.toISOString().split('T')[0]}`);

    let totalCreated = 0;

    for (const goal of GOALS) {
      for (const tierStr of TIERS) {
        const isNonVeg = tierStr.includes('Non-Veg');
        const isPremium = tierStr.startsWith('Premium');

        const menuTier = isPremium ? 'Premium' : 'Standard';
        const vegQuery = isNonVeg ? 'Non-Veg' : { $in: ['Veg', 'Vegan'] };

        let candidateMenus = await Menu.find({
          goalCategory: goal,
          vegNonVeg: vegQuery,
          tier: menuTier,
        });

        if (candidateMenus.length === 0) {
          candidateMenus = await Menu.find({
            goalCategory: goal,
            vegNonVeg: vegQuery,
          });
        }

        if (candidateMenus.length === 0) {
          candidateMenus = await Menu.find({
            goalCategory: goal,
          });
        }

        if (candidateMenus.length === 0) {
          console.warn(`No menu items found for ${goal} - ${tierStr}`);
          continue;
        }

        const chosen5Dishes = select5DishesForWeek(candidateMenus, isPremium);

        for (let dayIdx = 0; dayIdx < DAYS.length; dayIdx++) {
          const dayName = DAYS[dayIdx];
          const dish = chosen5Dishes[dayIdx];

          await WeeklyMenu.findOneAndUpdate(
            {
              weekStartDate,
              goal,
              tier: tierStr,
              day: dayName,
              mealSlot: 'Breakfast',
            },
            {
              weekStartDate,
              goal,
              tier: tierStr,
              day: dayName,
              mealSlot: 'Breakfast',
              menuId: dish._id,
              isChefSpecial: dish.isChefSpecial || false,
            },
            { upsert: true, returnDocument: 'after' }
          );

          totalCreated++;
        }
      }
    }

    console.log(`Successfully seeded/upserted ${totalCreated} WeeklyMenu records across 20 plan combinations.`);
  } catch (error) {
    console.error('Error seeding WeeklyMenu:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedWeeklyMenu();
