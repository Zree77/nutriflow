import Plan from '../models/Plan.js';
import WeeklyMenu from '../models/WeeklyMenu.js';
import Menu from '../models/Menu.js';

/**
 * 1. getAllPlans - GET /
 * Accept optional query params: goal, tier, vegNonVeg
 */
export const getAllPlans = async (req, res) => {
  try {
    const { goal, tier, vegNonVeg } = req.query;

    const filter = { isActive: true };

    if (goal) {
      filter.goal = { $regex: new RegExp(`^${goal}$`, 'i') };
    }

    if (tier) {
      filter.tier = tier;
    } else if (vegNonVeg) {
      const type = vegNonVeg.toLowerCase();
      if (type === 'veg') {
        filter.tier = { $in: ['Std Veg', 'Premium Veg'] };
      } else if (type === 'non-veg') {
        filter.tier = { $in: ['Std Non-Veg', 'Premium Non-Veg'] };
      }
    }

    const plans = await Plan.find(filter).sort({ goal: 1, weeklyPrice: 1 });

    return res.json({
      success: true,
      count: plans.length,
      data: plans,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * 2. getWeeklyMenu - GET /weekly-menu
 * Required query params: goal, tier
 * Optional query param: day
 */
export const getWeeklyMenu = async (req, res) => {
  try {
    const { goal, tier, day } = req.query;

    if (!goal || !tier) {
      return res.status(400).json({
        success: false,
        message: 'Goal and tier are required query parameters',
      });
    }

    // Find the most recent weekStartDate available for this goal/tier
    const latest = await WeeklyMenu.findOne({ goal, tier }).sort({ weekStartDate: -1 });

    if (!latest) {
      return res.json({
        success: true,
        weekStartDate: null,
        goal,
        tier,
        count: 0,
        menu: [],
      });
    }

    const query = {
      weekStartDate: latest.weekStartDate,
      goal,
      tier,
    };

    if (day) {
      query.day = day;
    }

    const records = await WeeklyMenu.find(query).populate('menuId');

     if (!records || records.length === 0) {
      return res.json({
        success: true,
        weekStartDate: latest.weekStartDate.toISOString(),
        goal,
        tier,
        count: 0,
        menu: [],
      });
    }

    // Custom day order map
    const dayOrder = {
      Monday: 0,
      Tuesday: 1,
      Wednesday: 2,
      Thursday: 3,
      Friday: 4,
    };

    records.sort((a, b) => (dayOrder[a.day] ?? 99) - (dayOrder[b.day] ?? 99));

    const mappedMenu = records.map((record) => {
      const menuObj = record.menuId || {};
      return {
        day: record.day,
        mealSlot: record.mealSlot,
        isChefSpecial: record.isChefSpecial,
        dish: {
          _id: menuObj._id,
          menuId: menuObj.menuId,
          name: menuObj.name,
          description: menuObj.description,
          category: menuObj.category,
          vegNonVeg: menuObj.vegNonVeg,
          tier: menuObj.tier,
          isChefSpecial: menuObj.isChefSpecial,
          nutrition: menuObj.nutrition,
          ingredients: menuObj.ingredients,
          optionalAddons: menuObj.optionalAddons,
          removableIngredients: menuObj.removableIngredients,
          allergens: menuObj.allergens,
          image: menuObj.image,
          price: menuObj.price,
        },
      };
    });

    return res.json({
      success: true,
      weekStartDate: latest.weekStartDate.toISOString(),
      goal,
      tier,
      count: mappedMenu.length,
      menu: mappedMenu,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * 3. getPlanById - GET /:id
 * Find by _id where isActive: true
 */
export const getPlanById = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await Plan.findOne({ _id: id, isActive: true });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found',
      });
    }

    return res.json({
      success: true,
      data: plan,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * 4. getDayAlternatives - GET /:planId/day-options?day=Wednesday
 */
export const getDayAlternatives = async (req, res) => {
  try {
    const { planId } = req.params;
    const { day } = req.query;

    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    if (!day || !validDays.includes(day)) {
      return res.status(400).json({
        success: false,
        message: 'Valid day (Monday-Friday) is required query parameter',
      });
    }

    const plan = await Plan.findById(planId).lean();
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found',
      });
    }

    const isNonVeg = plan.tier.includes('Non-Veg');
    const vegFilter = isNonVeg ? 'Non-Veg' : 'Veg';
    const menuTier = plan.tier.startsWith('Premium') ? 'Premium' : 'Standard';

    const alternatives = await Menu.find({
      isAvailable: true,
      availableForSubscription: true,
      vegNonVeg: vegFilter,
      tier: menuTier,
      goalCategory: plan.goal,
    }).lean();

    return res.json({
      success: true,
      data: {
        day,
        goal: plan.goal,
        alternatives,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
