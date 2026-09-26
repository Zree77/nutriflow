import {
  getPlans,
  getDefaultMenu,
  createSubscription as createSubscriptionService,
  getMySubscription as getMySubscriptionService,
  getSubscriptionHistory,
  getAllSubscriptions as getAllSubscriptionsService,
  getActiveSubscribers as getActiveSubscribersService,
  getCustomerDetails as getCustomerDetailsService,
  pauseSubscription as pauseSubscriptionService,
  resumeSubscription as resumeSubscriptionService,
  getKitchenDashboard as getKitchenDashboardService,
  getStatistics as getStatisticsService,
  pauseMySubscription as pauseMySubscriptionService,
  resumeMySubscription as resumeMySubscriptionService,
  getPauseableDaysService,
  pauseMealService,
  resumeMealService,
  getISOWeekStart,
  stripTime,
  isDeliveryDay,
} from './subscriptionService.js';
import Subscription from '../models/Subscription.js';
import { MAX_WEEKLY_PAUSES } from '../config/constants.js';


// ===================== User Controllers =====================

async function viewPlans(req, res, next) {
  try {
    const result = await getPlans();
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

async function viewDefaultMenu(req, res, next) {
  try {
    const result = await getDefaultMenu(req.query.planId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

async function createSubscription(req, res, next) {
  try {
    const userId = req.user._id;
    const result = await createSubscriptionService(userId, req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

async function getMySubscription(req, res, next) {
  try {
    const userId = req.user._id;
    const result = await getMySubscriptionService(userId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

async function getHistory(req, res, next) {
  try {
    const userId = req.user._id;
    const result = await getSubscriptionHistory(userId, req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

async function pauseMySubscription(req, res, next) {
  try {
    const result = await pauseMySubscriptionService(req.user._id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

async function resumeMySubscription(req, res, next) {
  try {
    const result = await resumeMySubscriptionService(req.user._id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

// --- Day-level meal pause/resume (Premium only) ---

async function getPauseableDays(req, res, next) {
  try {
    const userId = req.user._id;
    const result = await getPauseableDaysService(userId, req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

async function pauseMeal(req, res, next) {
  try {
    const userId = req.user._id;
    const result = await pauseMealService(userId, req.body);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

async function resumeMeal(req, res, next) {
  try {
    const userId = req.user._id;
    const result = await resumeMealService(userId, req.body);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

async function getPauseStatus(req, res, next) {
  try {
    const userId = req.user._id;
    const subscription = await Subscription.findOne({ user: userId, status: { $in: ['Active', 'Paused'] } })
      .populate('plan')
      .lean();

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'No active subscription found.' });
    }

    if (!subscription.plan || !subscription.plan.supportsPause) {
      return res.status(400).json({ success: false, message: 'Only Premium subscriptions support pausing meals.' });
    }


    const pausesUsed = subscription.pauseCount || 0;
    const remainingPauses = Math.max(0, 2 - pausesUsed);

    const pausedDates = (subscription.pausedMeals || [])
      .filter(pm => pm.status === 'pending')
      .map(pm => { const d = new Date(pm.originalDate); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; });

    res.status(200).json({
      success: true,
      data: {
        subscriptionId: subscription._id,
        subscriptionStartDate: stripTime(subscription.startDate).toISOString().split('T')[0],
        subscriptionEndDate: stripTime(subscription.endDate).toISOString().split('T')[0],
        remainingPauses,
        usedPauses: pausesUsed,
        pausesLimit: 2,
        pausedDates,
      }
    });
  } catch (error) {
    // FIX: Direct JSON response instead of next(error)
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Failed to fetch pause status.';
    res.status(statusCode).json({ success: false, message });
  }
}

async function quickPauseMeal(req, res, next) {
  try {
    const userId = req.user._id;
    const { pauseDate, rescheduledDate } = req.body;

    const subscription = await Subscription.findOne({ user: userId, status: 'Active' }).lean();
    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Active subscription not found.' });
    }

    let finalRescheduledDate = rescheduledDate;

    if (!finalRescheduledDate) {
      const startScan = new Date(pauseDate);

      const pausedDates = (subscription.pausedMeals || [])
        .filter(pm => pm.status === 'pending')
        .map(pm => stripTime(pm.originalDate).getTime());

      const rescheduledDates = (subscription.pausedMeals || [])
        .filter(pm => pm.status === 'pending')
        .map(pm => stripTime(pm.rescheduledDate).getTime());

      for (let i = 1; i <= 30; i++) {
        const scanDate = new Date(startScan);
        scanDate.setDate(startScan.getDate() + i);
        const scanTime = stripTime(scanDate).getTime();

        if (!isDeliveryDay(scanDate)) continue;
        if (scanTime === stripTime(pauseDate).getTime()) continue;
        if (pausedDates.includes(scanTime) || rescheduledDates.includes(scanTime)) continue;

        finalRescheduledDate = stripTime(scanDate).toISOString().split('T')[0];
        break;
      }

      if (!finalRescheduledDate) {
        return res.status(400).json({
          success: false,
          message: 'No available dates to reschedule within 30 days forward.'
        });
      }
    }

    const result = await pauseMealService(userId, {
      subscriptionId: subscription._id,
      originalDate: new Date(pauseDate),
      rescheduledDate: new Date(finalRescheduledDate),
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("QUICK PAUSE MEAL ERROR:", error); // ADD THIS LOG
    const statusCode = error.statusCode || 500;
    // Safely extract message from custom objects, Mongoose errors, or standard errors
    const message = error.message || error.msg || JSON.stringify(error) || 'An unknown error occurred while pausing.';
    res.status(statusCode).json({ success: false, message });
  }
}

async function quickResumeMeal(req, res, next) {
  try {
    const userId = req.user._id;
    const { pauseDate } = req.body;

    const subscription = await Subscription.findOne({ user: userId }).lean();
    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found.' });
    }

    const result = await resumeMealService(userId, {
      subscriptionId: subscription._id,
      originalDate: new Date(pauseDate),
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("QUICK RESUME MEAL ERROR:", error);
    const statusCode = error.statusCode || 500;
    const message = error.message || error.msg || JSON.stringify(error) || 'An unknown error occurred while resuming.';
    res.status(statusCode).json({ success: false, message });
  }
}


// ===================== Admin Controllers =====================

async function getAllSubscriptions(req, res, next) {
  try {
    const result = await getAllSubscriptionsService(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

async function getActiveSubscribers(req, res, next) {
  try {
    const result = await getActiveSubscribersService(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

async function getCustomerDetails(req, res, next) {
  try {
    const result = await getCustomerDetailsService(req.params.userId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

async function pauseSubscription(req, res, next) {
  try {
    const result = await pauseSubscriptionService(req.params.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

async function resumeSubscription(req, res, next) {
  try {
    const result = await resumeSubscriptionService(req.params.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

async function getKitchenDashboard(req, res, next) {
  try {
    const result = await getKitchenDashboardService(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

async function getStatistics(req, res, next) {
  try {
    const result = await getStatisticsService();
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export {
  viewPlans,
  viewDefaultMenu,
  createSubscription,
  getMySubscription,
  getHistory,
  pauseMySubscription,
  resumeMySubscription,
  getPauseableDays,
  pauseMeal,
  resumeMeal,
  getPauseStatus,
  quickPauseMeal,
  quickResumeMeal,
  getAllSubscriptions,
  getActiveSubscribers,
  getCustomerDetails,
  pauseSubscription,
  resumeSubscription,
  getKitchenDashboard,
  getStatistics,
};