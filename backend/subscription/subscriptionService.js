import Plan from '../models/Plan.js';
import Subscription from '../models/Subscription.js';
import MenuItem from '../models/Menu.js';
import * as constants from '../config/constants.js';

const PAUSE_DEADLINE_HOUR = constants.PAUSE_DEADLINE_HOUR !== undefined ? constants.PAUSE_DEADLINE_HOUR : 19;
const MAX_WEEKLY_PAUSES = constants.MAX_WEEKLY_PAUSES !== undefined ? constants.MAX_WEEKLY_PAUSES : 2;
const DELIVERY_DAYS = constants.DELIVERY_DAYS !== undefined ? constants.DELIVERY_DAYS : [1, 2, 3, 4, 5];
const DAY_NAMES = constants.DAY_NAMES !== undefined ? constants.DAY_NAMES : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PAUSE_LOOKAHEAD_DAYS = constants.PAUSE_LOOKAHEAD_DAYS !== undefined ? constants.PAUSE_LOOKAHEAD_DAYS : 14;

// Constants
const REQUIRED_ADDRESS_FIELDS = [
  'fullName',
  'phone',
  'houseNo',
  'buildingName',
  'street',
  'area',
  'city',
  'state',
  'pincode',
];

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Helpers
function validateDeliveryAddress(address) {
  if (!address || typeof address !== 'object') {
    throw { statusCode: 400, message: 'Delivery address is required.' };
  }

  for (const field of REQUIRED_ADDRESS_FIELDS) {
    if (!address[field] || String(address[field]).trim() === '') {
      throw {
        statusCode: 400,
        message: `Delivery address field "${field}" is required`,
      };
    }
  }
}

function getDayOfWeek(date) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date(date).getDay()];
}

async function generateDefaultWeeklyMenuInternal(plan) {
  const isNonVeg = plan.tier.includes('Non-Veg');
  const isPremium = plan.tier.startsWith('Premium');

  const vegFilter = isNonVeg ? 'Non-Veg' : 'Veg';
  const menuTier = isPremium ? 'Premium' : 'Standard';

  let items = await MenuItem.find({
    isAvailable: true,
    availableForSubscription: true,
    vegNonVeg: vegFilter,
    goalCategory: plan.goal,
    tier: menuTier,
  }).lean();

  if (items.length === 0) {
    items = await MenuItem.find({
      isAvailable: true,
      availableForSubscription: true,
      vegNonVeg: vegFilter,
      goalCategory: plan.goal,
    }).lean();
  }

  if (items.length === 0) {
    throw {
      statusCode: 400,
      message: `Not enough menu items for "${plan.name}". Minimum 1 required, found 0.`,
    };
  }

  const categoryMap = {};
  for (const item of items) {
    const category = item.category || 'General';
    if (!categoryMap[category]) categoryMap[category] = [];
    categoryMap[category].push(item);
  }

  const sortedCategories = Object.keys(categoryMap).sort();

  const schedule = [];
  const categoryIndices = {};
  for (const cat of sortedCategories) categoryIndices[cat] = 0;

  let catPointer = 0;
  for (let i = 0; i < 5; i++) {
    const category = sortedCategories[catPointer % sortedCategories.length];
    const idx = categoryIndices[category];
    const item = categoryMap[category][idx % categoryMap[category].length];

    schedule.push({
      day: WEEKDAYS[i],
      menuItem: item._id,
      menuItemName: item.name,
      menuItemCategory: item.category || 'General',
      isCustomized: false,
    });

    categoryIndices[category] += 1;
    catPointer++;
  }

  return schedule;
}

// Services
export async function getPlans() {
  return Plan.find().sort({ weeklyPrice: 1 }).lean();
}

export async function getDefaultMenu(planId) {
  const plan = await Plan.findById(planId).lean();
  if (!plan) {
    throw { statusCode: 404, message: 'Plan not found.' };
  }
  return generateDefaultWeeklyMenuInternal(plan);
}

export async function createSubscription(userId, payload) {
  const {
    planId,
    startDate,
    deliveryAddress,
    mealSchedule,
    paymentMethod,
    paymentStatus,
  } = payload;

  const plan = await Plan.findById(planId).lean();
  if (!plan) {
    throw { statusCode: 404, message: 'Plan not found.' };
  }

  const isPremium = plan.tier.startsWith('Premium');
  const menuTier = isPremium ? 'Premium' : 'Standard';
  const isNonVeg = plan.tier.includes('Non-Veg');
  const vegFilter = isNonVeg ? 'Non-Veg' : 'Veg';

  validateDeliveryAddress(deliveryAddress);

  if (!mealSchedule || mealSchedule.length !== 5) {
    throw { statusCode: 400, message: 'Meal schedule must contain exactly 5 days.' };
  }

  const days = mealSchedule.map((item) => item.day);
  if (new Set(days).size !== days.length) {
    throw { statusCode: 400, message: 'Meal schedule must have all 5 days unique.' };
  }

  const dbMealSchedule = [];
  let addonTotal = 0;

  for (const sentMeal of mealSchedule) {
    const menuItem = await MenuItem.findById(sentMeal.menuItemId).lean();
    if (!menuItem) {
      throw {
        statusCode: 400,
        message: `Menu item not found for day "${sentMeal.day}" (id: ${sentMeal.menuItemId}).`,
      };
    }

    if (menuItem.vegNonVeg !== vegFilter) {
      throw {
        statusCode: 403,
        message: `"${menuItem.name}" is ${menuItem.vegNonVeg} but your plan "${plan.name}" is ${vegFilter}.`,
      };
    }

    if (menuItem.tier !== menuTier) {
      throw {
        statusCode: 403,
        message: 'Dish tier mismatch',
      };
    }

    if (!menuItem.goalCategory || !menuItem.goalCategory.includes(plan.goal)) {
      throw {
        statusCode: 403,
        message: `"${menuItem.name}" does not belong to "${plan.goal}" category.`,
      };
    }

    if (!menuItem.isAvailable || !menuItem.availableForSubscription) {
      throw {
        statusCode: 400,
        message: `"${menuItem.name}" is not available for subscription.`,
      };
    }

    const removedIngredients = sentMeal.removedIngredients || [];

    if (removedIngredients.length > 0 && !isPremium) {
      throw {
        statusCode: 403,
        message: 'Ingredient removal is only available for Premium plans.',
      };
    }

    const itemRemovable = menuItem.removableIngredients || [];
    const removableNames = itemRemovable.map((r) => (typeof r === 'string' ? r : r.name));
    for (const ing of removedIngredients) {
      if (!removableNames.includes(ing)) {
        throw {
          statusCode: 400,
          message: `"${ing}" cannot be removed from "${menuItem.name}".`,
        };
      }
    }

    const addedAddons = sentMeal.addedAddons || [];

    if (addedAddons.length > 0 && !isPremium) {
      throw {
        statusCode: 403,
        message: 'Addon items are only available for Premium plans.',
      };
    }

    const itemAddons = menuItem.optionalAddons || [];
    for (const addon of addedAddons) {
      const found = itemAddons.find(
        (a) => a.name === addon.addonName || String(a._id) === addon.addonId
      );
      if (!found) {
        throw {
          statusCode: 400,
          message: `"${addon.addonName}" is not available as an addon for "${menuItem.name}".`,
        };
      }
      addonTotal += found.extraPrice;
    }

    dbMealSchedule.push({
      day: sentMeal.day,
      menuItem: menuItem._id,
      removedIngredients,
      addedAddons,
      isCustomized: false,
    });
  }

  const existingSub = await Subscription.findOne({
    user: userId,
    status: { $in: ['Active', 'Pending Payment'] },
  }).lean();

  if (existingSub) {
    throw {
      statusCode: 409,
      message: 'You already have an active or pending subscription.',
    };
  }

  const start = new Date(startDate);
  const endDate = new Date(start);
  endDate.setDate(endDate.getDate() + (plan.deliveryDays - 1));
  endDate.setHours(23, 59, 59, 0);

  const subscriptionStatus = paymentStatus === 'Success' ? 'Active' : 'Pending Payment';

  const subscription = await Subscription.create({
    user: userId,
    plan: plan._id,
    status: subscriptionStatus,
    startDate: start,
    endDate,
    deliveryAddress,
    paymentMethod,
    paymentStatus: paymentStatus || 'Pending',
    pauseCount: 0,
    mealSchedule: dbMealSchedule,
    totalPrice: plan.weeklyPrice + addonTotal,
  });

  return subscription;
}

export async function autoExpireSubscriptions(userId) {
  await Subscription.updateMany(
    { user: userId, status: 'Active', endDate: { $lt: new Date() } },
    { $set: { status: 'Expired' } }
  );
}

export async function getMySubscription(userId) {
  await autoExpireSubscriptions(userId);

  const subscription = await Subscription.findOne({
    user: userId,
    status: { $in: ['Active', 'Paused', 'Pending Payment'] },
  })
    .populate('plan', 'name slug weeklyPrice deliveryDays features supportsPause')
    .populate('mealSchedule.menuItem', 'name description category')
    .lean();

  if (!subscription) {
    throw { statusCode: 404, message: 'No active subscription found.' };
  }

  return subscription;
}

export async function getSubscriptionHistory(userId, { page = 1, limit = 10, status }) {
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.min(50, Math.max(1, parseInt(limit) || 10));
  const query = { user: userId };
  if (status) query.status = status;

  const skip = (p - 1) * l;
  const [subscriptions, total] = await Promise.all([
    Subscription.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(l)
      .populate('plan', 'name slug weeklyPrice deliveryDays supportsPause')
      .populate('mealSchedule.menuItem', 'name category')
      .lean(),
    Subscription.countDocuments(query),
  ]);

  return {
    subscriptions,
    pagination: { page: p, limit: l, total, pages: Math.ceil(total / l) },
  };
}

export async function getAllSubscriptions({ page = 1, limit = 20, status }) {
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const query = {};
  if (status) query.status = status;

  const skip = (p - 1) * l;
  const [subscriptions, total] = await Promise.all([
    Subscription.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(l)
      .populate('user', 'name email phone')
      .populate('plan', 'name slug weeklyPrice supportsPause')
      .populate('mealSchedule.menuItem', 'name category')
      .lean(),
    Subscription.countDocuments(query),
  ]);

  return {
    subscriptions,
    pagination: { page: p, limit: l, total, pages: Math.ceil(total / l) },
  };
}

export async function getActiveSubscribers({ page = 1, limit = 20 }) {
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const query = { status: 'Active' };
  const skip = (p - 1) * l;

  const [subscribers, total] = await Promise.all([
    Subscription.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(l)
      .populate('user', 'name email phone')
      .populate('plan', 'name slug weeklyPrice supportsPause')
      .lean(),
    Subscription.countDocuments(query),
  ]);

  return {
    subscribers,
    pagination: { page: p, limit: l, total, pages: Math.ceil(total / l) },
  };
}

export async function getCustomerDetails(targetUserId) {
  return Subscription.find({ user: targetUserId })
    .sort({ createdAt: -1 })
    .populate('user', 'name email phone')
    .populate('plan', 'name slug weeklyPrice deliveryDays supportsPause')
    .populate('mealSchedule.menuItem', 'name category')
    .lean();
}

export async function pauseSubscription(subscriptionId) {
  const subscription = await Subscription.findById(subscriptionId);
  if (!subscription) throw { statusCode: 404, message: 'Subscription not found.' };

  if (subscription.status !== 'Active') {
    throw { statusCode: 400, message: 'Only active subscriptions can be paused.' };
  }

  const updated = await Subscription.findByIdAndUpdate(
    subscriptionId,
    { $inc: { pauseCount: 1 }, $set: { status: 'Paused' } },
    { new: true }
  ).lean();

  return updated;
}

export async function resumeSubscription(subscriptionId) {
  const subscription = await Subscription.findById(subscriptionId);
  if (!subscription) throw { statusCode: 404, message: 'Subscription not found.' };

  if (subscription.status !== 'Paused') {
    throw { statusCode: 400, message: 'Only paused subscriptions can be resumed.' };
  }

  const updated = await Subscription.findByIdAndUpdate(
    subscriptionId,
    { $set: { status: 'Active' } },
    { new: true }
  ).lean();

  return updated;
}

export async function pauseMySubscription(userId) {
  const subscription = await Subscription.findOne({ user: userId, status: 'Active' }).populate('plan');
  if (!subscription) {
    throw { statusCode: 404, message: 'No active subscription found.' };
  }
  if (!subscription.plan) {
    throw { statusCode: 404, message: 'Plan details not found.' };
  }
  if (subscription.plan.supportsPause === false) {
    throw { statusCode: 403, message: 'Standard plans cannot be paused. Only Premium plans support pause.' };
  }
  if (subscription.pauseCount >= 2) {
    throw { statusCode: 403, message: 'Maximum 2 pauses reached for this subscription.' };
  }

  const updated = await Subscription.findByIdAndUpdate(
    subscription._id,
    { $inc: { pauseCount: 1 }, $set: { status: 'Paused' } },
    { new: true }
  ).lean();

  return updated;
}

export async function resumeMySubscription(userId) {
  const subscription = await Subscription.findOne({ user: userId, status: 'Paused' });
  if (!subscription) {
    throw { statusCode: 404, message: 'No paused subscription found.' };
  }

  const updated = await Subscription.findByIdAndUpdate(
    subscription._id,
    { $set: { status: 'Active' } },
    { new: true }
  ).lean();

  return updated;
}

export async function getKitchenDashboard({ date, view = 'daily' }) {
  const targetDate = date ? new Date(date) : new Date();

  const subscriptions = await Subscription.find({
    status: 'Active',
    startDate: { $lte: targetDate },
    endDate: { $gte: targetDate },
  })
    .populate('user', 'name phone')
    .populate('mealSchedule.menuItem', 'name category')
    .lean();

  if (view === 'daily') {
    const dayName = getDayOfWeek(targetDate);
    const mealMap = {};

    for (const sub of subscriptions) {
      const meal = sub.mealSchedule.find((m) => m.day === dayName);
      if (!meal || !meal.menuItem) continue;

      const key = meal.menuItem._id.toString();
      if (!mealMap[key]) {
        mealMap[key] = {
          menuItem: { name: meal.menuItem.name, category: meal.menuItem.category },
          quantity: 0,
          customizations: [],
        };
      }
      mealMap[key].quantity += 1;
      mealMap[key].customizations.push({
        subscriptionId: sub._id.toString(),
        customerName: sub.user?.name,
        phone: sub.user?.phone,
        removedIngredients: meal.removedIngredients || [],
        addedAddons: meal.addedAddons || [],
      });
    }

    return {
      view: 'daily',
      date: targetDate.toISOString().split('T')[0],
      dayName,
      totalMeals: Object.values(mealMap).reduce((s, m) => s + m.quantity, 0),
      meals: Object.values(mealMap),
    };
  }

  if (view === 'weekly') {
    const weekData = {};

    for (const day of WEEKDAYS) {
      weekData[day] = [];
    }

    for (const sub of subscriptions) {
      for (const meal of sub.mealSchedule) {
        if (!meal.menuItem) continue;
        const dayArr = weekData[meal.day];
        if (!dayArr) continue;

        const existing = dayArr.find(
          (m) => m.menuItem._id.toString() === meal.menuItem._id.toString()
        );

        if (existing) {
          existing.quantity += 1;
          existing.customizations.push({
            subscriptionId: sub._id.toString(),
            customerName: sub.user?.name,
            phone: sub.user?.phone,
            removedIngredients: meal.removedIngredients || [],
            addedAddons: meal.addedAddons || [],
          });
        } else {
          dayArr.push({
            menuItem: { name: meal.menuItem.name, category: meal.menuItem.category },
            quantity: 1,
            customizations: [{
              subscriptionId: sub._id.toString(),
              customerName: sub.user?.name,
              phone: sub.user?.phone,
              removedIngredients: meal.removedIngredients || [],
              addedAddons: meal.addedAddons || [],
            }],
          });
        }
      }
    }

    const dailyBreakdown = WEEKDAYS.map((day) => ({
      day,
      meals: weekData[day],
      totalMeals: weekData[day].reduce((s, m) => s + m.quantity, 0),
    }));

    const totalMeals = dailyBreakdown.reduce((s, d) => s + d.totalMeals, 0);

    const dayIndex = targetDate.getDay();
    const mondayOffset = dayIndex === 0 ? -6 : 1 - dayIndex;
    const monday = new Date(targetDate);
    monday.setDate(monday.getDate() + mondayOffset);
    const friday = new Date(monday);
    friday.setDate(friday.getDate() + 4);

    return {
      view: 'weekly',
      weekStart: monday.toISOString().split('T')[0],
      weekEnd: friday.toISOString().split('T')[0],
      totalMeals,
      dailyBreakdown,
    };
  }
}

export async function getStatistics() {
  const [statusAgg, planAgg] = await Promise.all([
    Subscription.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [{ $eq: ['$paymentStatus', 'Success'] }, '$totalPrice', 0],
            },
          },
        },
      },
    ]),
    Subscription.aggregate([
      {
        $lookup: {
          from: 'plans',
          localField: 'plan',
          foreignField: '_id',
          as: 'planData',
        },
      },
      { $unwind: '$planData' },
      {
        $group: {
          _id: '$planData._id',
          planName: { $first: '$planData.name' },
          goal: { $first: '$planData.goal' },
          tier: { $first: '$planData.tier' },
          count: { $sum: 1 },
          activeCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] },
          },
          revenue: {
            $sum: {
              $cond: [{ $eq: ['$paymentStatus', 'Success'] }, '$totalPrice', 0],
            },
          },
        },
      },
    ]),
  ]);

  const statsMap = {
    'Pending Payment': { count: 0, revenue: 0 },
    'Active': { count: 0, revenue: 0 },
    'Paused': { count: 0, revenue: 0 },
    'Cancelled': { count: 0, revenue: 0 },
    'Expired': { count: 0, revenue: 0 },
  };

  let totalSubscribers = 0;
  let totalRevenue = 0;

  for (const res of statusAgg) {
    if (statsMap[res._id]) {
      statsMap[res._id].count = res.count;
      statsMap[res._id].revenue = res.revenue;
    }
    totalSubscribers += res.count;
    totalRevenue += res.revenue;
  }

  const byPlan = planAgg.map((p) => ({
    planId: p._id,
    planName: p.planName,
    count: p.count,
    activeCount: p.activeCount,
    revenue: p.revenue,
  }));

  const byGoal = {};
  for (const p of planAgg) {
    if (!byGoal[p.goal]) byGoal[p.goal] = { count: 0, activeCount: 0 };
    byGoal[p.goal].count += p.count;
    byGoal[p.goal].activeCount += p.activeCount;
  }

  const byTier = {};
  for (const p of planAgg) {
    if (!byTier[p.tier]) byTier[p.tier] = { count: 0, activeCount: 0 };
    byTier[p.tier].count += p.count;
    byTier[p.tier].activeCount += p.activeCount;
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weeklySubs = await Subscription.find({
    paymentStatus: 'Success',
    createdAt: { $gte: sevenDaysAgo },
  }).select('totalPrice').lean();

  const weeklyRevenue = weeklySubs.reduce((sum, s) => sum + s.totalPrice, 0);

  return {
    overview: {
      totalSubscriptions: totalSubscribers,
      activeSubscriptions: statsMap['Active'].count,
      pausedSubscriptions: statsMap['Paused'].count,
      expiredSubscriptions: statsMap['Expired'].count,
    },
    byPlan,
    byGoal,
    byTier,
    revenue: {
      totalRevenue,
      weeklyRevenue,
    },
  };
}

export function getISOWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  const start = new Date(d);
  start.setDate(d.getDate() + offset);
  start.setHours(0, 0, 0, 0);
  return start;
}

export function isDeliveryDay(date) {
  const day = new Date(date).getDay();
  return DELIVERY_DAYS.includes(day);
}

export function stripTime(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getPauseableDaysService(userId, { subscriptionId }) {
  console.log('[getPauseableDaysService] Debug Input:', { subscriptionId, userId, userIdType: typeof userId });
  const rawSub = await Subscription.findById(subscriptionId).lean();
  console.log('[getPauseableDaysService] Raw Sub Check:', rawSub ? { id: rawSub._id, user: rawSub.user, userType: typeof rawSub.user, status: rawSub.status } : 'NULL');

  const subscription = await Subscription.findOne({ _id: subscriptionId, user: userId, status: 'Active' })
    .populate('plan')
    .populate('mealSchedule.menuItem')
    .lean();

  if (!subscription) {
    throw { statusCode: 404, message: 'Active subscription not found.' };
  }

  if (!subscription.plan || !subscription.plan.supportsPause) {
    throw { statusCode: 400, message: 'Only Premium subscriptions support pausing meals.' };
  }

  const now = new Date();
  const pauseableDays = [];

  for (let i = 1; i <= PAUSE_LOOKAHEAD_DAYS; i++) {
    const targetDate = new Date();
    targetDate.setDate(now.getDate() + i);
    targetDate.setHours(0, 0, 0, 0);

    const subStart = stripTime(subscription.startDate);
    const subEnd = stripTime(subscription.endDate);

    if (targetDate < subStart || targetDate > subEnd) {
      continue;
    }

    if (!isDeliveryDay(targetDate)) {
      continue;
    }

    const dayName = DAY_NAMES[targetDate.getDay()];
    const scheduledMeal = subscription.mealSchedule.find(m => m.day === dayName);
    if (!scheduledMeal) continue;

    const pendingPause = (subscription.pausedMeals || []).find(pm =>
      pm.status === 'pending' && stripTime(pm.originalDate).getTime() === targetDate.getTime()
    );

    const deadline = new Date(targetDate);
    deadline.setDate(deadline.getDate() - 1);
    deadline.setHours(PAUSE_DEADLINE_HOUR, 0, 0, 0);

    const canPause = now < deadline && !pendingPause;

    // Generate next 3 delivery days after targetDate as reschedule options
    const rescheduleOptions = [];
    let scanDate = new Date(targetDate);
    let rescheduleCount = 0;
    while (rescheduleCount < 3) {
      scanDate.setDate(scanDate.getDate() + 1);
      if (stripTime(scanDate) > subEnd) break; // circuit breaker: no more delivery days within subscription
      if (isDeliveryDay(scanDate) && stripTime(scanDate) <= subEnd) {
        rescheduleOptions.push({
          date: stripTime(scanDate).toISOString().split('T')[0],
          day: DAY_NAMES[scanDate.getDay()]
        });
        rescheduleCount++;
      }
    }

    pauseableDays.push({
      date: targetDate.toISOString().split('T')[0],
      dayName,
      mealDetails: {
        menuItem: scheduledMeal.menuItem ? {
          _id: scheduledMeal.menuItem._id,
          name: scheduledMeal.menuItem.name,
          category: scheduledMeal.menuItem.category
        } : null,
        removedIngredients: scheduledMeal.removedIngredients || [],
        addedAddons: (scheduledMeal.addedAddons || []).map(addon => ({
          addonId: addon.addonId,
          addonName: addon.addonName,
          addonPrice: addon.addonPrice
        })),
        isCustomized: scheduledMeal.isCustomized || false
      },
      canPause,
      deadlineISO: deadline.toISOString(),
      rescheduleOptions
    });
  }

  // Lifetime pause quota based on pauseCount field
  const pausesUsed = subscription.pauseCount || 0;

  return {
    pauseableDays,
    pausesUsed,
    pausesLimit: 2,
    canPause: pausesUsed < 2
  };
}

export async function pauseMealService(userId, { subscriptionId, originalDate, rescheduledDate }) {
  console.log('[pauseMealService] Debug Input:', { subscriptionId, userId, userIdType: typeof userId });
  const rawSub = await Subscription.findById(subscriptionId).lean();
  console.log('[pauseMealService] Raw Sub Check:', rawSub ? { id: rawSub._id, user: rawSub.user, userType: typeof rawSub.user, status: rawSub.status } : 'NULL');

  const subscription = await Subscription.findOne({ _id: subscriptionId, user: userId, status: 'Active' })
    .populate('plan')
    .populate('mealSchedule.menuItem')
    .lean();

  if (!subscription) {
    throw { statusCode: 404, message: 'Active subscription not found.' };
  }

  if (!subscription.plan || subscription.plan.supportsPause !== true) {
    throw { statusCode: 400, message: 'Only Premium subscriptions support pausing meals.' };
  }

  // Lifetime pause quota check (max 2 pauses per subscription lifetime)
  if ((subscription.pauseCount || 0) >= 2) {
    throw { statusCode: 403, message: 'Maximum 2 pauses reached for this subscription.' };
  }

  const now = new Date();
  const deadline = new Date(originalDate);
  deadline.setDate(deadline.getDate() - 1);
  deadline.setHours(PAUSE_DEADLINE_HOUR, 0, 0, 0);

  if (now >= deadline) {
    throw { statusCode: 400, message: 'Pause request must be made before 7:00 PM the day before delivery.' };
  }

  if (!isDeliveryDay(originalDate)) {
    throw { statusCode: 400, message: 'Can only pause Monday to Friday delivery days.' };
  }

  const origDate = stripTime(originalDate);
  if (origDate <= stripTime(now)) {
    throw { statusCode: 400, message: 'Can only pause future dates.' };
  }

  if (!rescheduledDate) {
    throw { statusCode: 400, message: 'Rescheduled date is required.' };
  }

  const resDate = stripTime(rescheduledDate);
  if (origDate.getTime() === resDate.getTime()) {
    throw { statusCode: 400, message: 'Rescheduled date cannot be the same as the original date.' };
  }

  if (!isDeliveryDay(rescheduledDate)) {
    throw { statusCode: 400, message: 'Rescheduled date cannot be a weekend.' };
  }

  const subStart = stripTime(subscription.startDate);
  const subEnd = stripTime(subscription.endDate);

  if (resDate < stripTime(new Date())) {
    throw { statusCode: 400, message: 'Rescheduled date must be a future date.' };
  }

  if (origDate < subStart || origDate > subEnd) {
    throw { statusCode: 400, message: "Original date must be within the subscription's active date range." };
  }

  // Validate rescheduledDate is within the next 3 delivery days after originalDate
  const validRescheduleDates = [];
  let scanDate = new Date(origDate);
  while (validRescheduleDates.length < 3) {
    scanDate.setDate(scanDate.getDate() + 1);
    if (stripTime(scanDate) > subEnd) {
      break; // Stop scanning if we go past subscription's end date
    }
    if (isDeliveryDay(scanDate)) {
      validRescheduleDates.push(stripTime(scanDate).getTime());
    }
  }
  if (!validRescheduleDates.includes(resDate.getTime())) {
    throw { statusCode: 400, message: 'Rescheduled date must be within 3 delivery days after the paused date.' };
  }

  const alreadyPaused = (subscription.pausedMeals || []).some(pm =>
    pm.status === 'pending' && stripTime(pm.originalDate).getTime() === origDate.getTime()
  );
  if (alreadyPaused) {
    throw { statusCode: 400, message: 'This date is already paused.' };
  }

  const dayName = DAY_NAMES[originalDate.getDay()];
  const scheduledMeal = subscription.mealSchedule.find(m => m.day === dayName);
  if (!scheduledMeal) {
    throw { statusCode: 404, message: `No scheduled meal found for ${dayName}.` };
  }

  const originalMeal = {
    menuItem: scheduledMeal.menuItem ? (scheduledMeal.menuItem._id || scheduledMeal.menuItem) : null,
    mealName: scheduledMeal.menuItem ? scheduledMeal.menuItem.name : 'Unknown Meal',
    removedIngredients: scheduledMeal.removedIngredients || [],
    addedAddons: (scheduledMeal.addedAddons || []).map(addon => ({
      addonId: addon.addonId,
      addonName: addon.addonName,
      addonPrice: addon.addonPrice
    })),
    isCustomized: scheduledMeal.isCustomized || false
  };

  const newPausedMeal = {
    originalDate: origDate,
    rescheduledDate: resDate,
    originalMeal,
    status: 'pending',
    createdAt: new Date()
  };

  // Push the new paused meal AND increment the lifetime pauseCount atomically
  await Subscription.updateOne(
    { _id: subscriptionId, user: userId, status: 'Active' },
    {
      $push: { pausedMeals: newPausedMeal },
      $inc: { pauseCount: 1 }
    }
  );

  const updatedSubscription = await Subscription.findOne({ _id: subscriptionId, user: userId }).lean();

  const pausedDetail = (updatedSubscription.pausedMeals || []).find(pm =>
    stripTime(pm.originalDate).getTime() === origDate.getTime()
  );

  return {
    pausedMeal: pausedDetail,
    pausesUsed: updatedSubscription.pauseCount || 0,
    pausesLimit: 2
  };
}

export async function resumeMealService(userId, { subscriptionId, originalDate }) {
  const subscription = await Subscription.findOne({ _id: subscriptionId, user: userId }).lean();
  if (!subscription) {
    throw { statusCode: 404, message: 'Subscription not found.' };
  }

  const origDate = stripTime(originalDate);
  const pendingPause = (subscription.pausedMeals || []).find(pm =>
    pm.status === 'pending' && stripTime(pm.originalDate).getTime() === origDate.getTime()
  );

  if (!pendingPause) {
    throw { statusCode: 404, message: 'No pending pause found for the specified date.' };
  }

  const now = new Date();
  const deadline = new Date(pendingPause.originalDate);
  deadline.setDate(deadline.getDate() - 1);
  deadline.setHours(PAUSE_DEADLINE_HOUR, 0, 0, 0);

  if (now >= deadline) {
    throw { statusCode: 400, message: 'Cannot resume meal after the deadline (7:00 PM the day before delivery).' };
  }

  // Remove the paused meal entry. NOTE: pauseCount is NOT decremented on resume —
  // the lifetime quota is consumed permanently once used.
  await Subscription.updateOne(
    { _id: subscriptionId, user: userId },
    { $pull: { pausedMeals: { _id: pendingPause._id } } }
  );

  const updatedSubscription = await Subscription.findOne({ _id: subscriptionId, user: userId }).lean();

  return {
    pausesUsed: updatedSubscription.pauseCount || 0,
    pausesLimit: 2
  };
}

export function getEffectiveMealsForDate(subscription, targetDate) {
  if (!subscription || !subscription.mealSchedule) return [];

  const targetDateStripped = stripTime(targetDate);
  const dayName = DAY_NAMES[targetDateStripped.getDay()];
  const isDelivery = isDeliveryDay(targetDateStripped);

  const isPaused = (subscription.pausedMeals || []).some(pm =>
    pm.status === 'pending' &&
    stripTime(pm.originalDate).getTime() === targetDateStripped.getTime()
  );

  const meals = [];

  if (!isPaused && isDelivery) {
    const subStart = stripTime(subscription.startDate);
    const subEnd = stripTime(subscription.endDate);
    if (targetDateStripped >= subStart && targetDateStripped <= subEnd) {
      const scheduledMeal = subscription.mealSchedule.find(m => m.day === dayName);
      if (scheduledMeal) {
        meals.push({
          menuItem: scheduledMeal.menuItem ? (scheduledMeal.menuItem._id || scheduledMeal.menuItem) : null,
          removedIngredients: scheduledMeal.removedIngredients || [],
          addedAddons: (scheduledMeal.addedAddons || []).map(addon => ({
            addonId: addon.addonId,
            addonName: addon.addonName,
            addonPrice: addon.addonPrice
          })),
          isCustomized: scheduledMeal.isCustomized || false,
          source: 'scheduled'
        });
      }
    }
  }

  const rescheduledMeals = (subscription.pausedMeals || []).filter(pm =>
    pm.status === 'pending' &&
    stripTime(pm.rescheduledDate).getTime() === targetDateStripped.getTime()
  );

  for (const pm of rescheduledMeals) {
    meals.push({
      menuItem: pm.originalMeal.menuItem,
      mealName: pm.originalMeal.mealName,
      removedIngredients: pm.originalMeal.removedIngredients || [],
      addedAddons: (pm.originalMeal.addedAddons || []).map(addon => ({
        addonId: addon.addonId,
        addonName: addon.addonName,
        addonPrice: addon.addonPrice
      })),
      isCustomized: pm.originalMeal.isCustomized || false,
      source: 'rescheduled',
      rescheduledFrom: stripTime(pm.originalDate).toISOString().split('T')[0]
    });
  }

  return meals;
}