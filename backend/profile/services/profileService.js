import mongoose from "mongoose";
import User from "../../models/User.js";
import Address from "../../models/Address.js";
import Order from "../../models/Order.js";
import Subscription from "../../models/Subscription.js";
import Plan from "../../models/Plan.js";


const MAX_ADDRESSES = 3;

/**
 * Get user profile details
 * Excludes sensitive fields, only includes name, email, phone, profileImage, isVerified, isSubscribed, createdAt
 */
export async function getProfile(userId) {
    const user = await User.findById(userId)
        .select("name email phone profileImage isVerified isSubscribed createdAt")
        .lean();

    if (!user) {
        throw { statusCode: 404, message: "User not found." };
    }

    return user;
}

/**
 * Update profile details (name, email, profileImage)
 */
export async function updateProfile(userId, data) {
    const user = await User.findById(userId);
    if (!user) {
        throw { statusCode: 404, message: "User not found." };
    }

    const { name, email, profileImage } = data;

    if (email !== undefined) {
        const cleanEmail = email.trim().toLowerCase();
        if (cleanEmail !== "") {
            const existingUser = await User.findOne({ email: cleanEmail, _id: { $ne: userId } });
            if (existingUser) {
                throw { statusCode: 400, message: "Email is already in use by another account." };
            }
        }
        user.email = cleanEmail;
    }

    if (name !== undefined) {
        user.name = name.trim();
    }

    if (profileImage !== undefined) {
        user.profileImage = profileImage.trim();
    }

    await user.save();

    return await getProfile(userId);
}

/**
 * Get all addresses of a user sorted by default status first, then createdAt descending
 */
export async function getAddresses(userId) {
    return await Address.find({ user: userId })
        .sort({ isDefault: -1, createdAt: -1 })
        .lean();
}

/**
 * Add a new address
 * Max limit is 3. If first address, sets as default. Unsets other defaults if isDefault is true.
 */
export async function addAddress(userId, data) {
    const count = await Address.countDocuments({ user: userId });
    if (count >= MAX_ADDRESSES) {
        throw { statusCode: 400, message: "Maximum 3 addresses allowed. Delete one first." };
    }

    const addressData = { ...data, user: userId };

    if (count === 0) {
        addressData.isDefault = true;
    } else if (addressData.isDefault) {
        await Address.updateMany({ user: userId, isDefault: true }, { $set: { isDefault: false } });
    }

    const address = await Address.create(addressData);
    return address;
}

/**
 * Update an existing address
 */
export async function updateAddress(userId, addressId, data) {
    const address = await Address.findOne({ _id: addressId, user: userId });
    if (!address) {
        throw { statusCode: 404, message: "Address not found." };
    }

    if (data.isDefault === true) {
        await Address.updateMany({ user: userId, isDefault: true }, { $set: { isDefault: false } });
    }

    Object.assign(address, data);
    await address.save();
    return address;
}

/**
 * Delete address and fallback default address to oldest remaining if deleted was default
 */
export async function deleteAddress(userId, addressId) {
    const address = await Address.findOne({ _id: addressId, user: userId });
    if (!address) {
        throw { statusCode: 404, message: "Address not found." };
    }

    const wasDefault = address.isDefault;
    await Address.deleteOne({ _id: addressId });

    if (wasDefault) {
        const oldestRemaining = await Address.findOne({ user: userId }).sort({ createdAt: 1 });
        if (oldestRemaining) {
            oldestRemaining.isDefault = true;
            await oldestRemaining.save();
        }
    }

    return { success: true, message: "Address deleted" };
}

/**
 * Set an address as the default address
 */
export async function setDefaultAddress(userId, addressId) {
    const address = await Address.findOne({ _id: addressId, user: userId });
    if (!address) {
        throw { statusCode: 404, message: "Address not found." };
    }

    await Address.updateMany({ user: userId, isDefault: true }, { $set: { isDefault: false } });
    address.isDefault = true;
    await address.save();
    return address;
}

/**
 * Fetch all dashboard summary metrics in parallel using Promise.all
 */
export async function getDashboardSummary(userId) {
    const [
        profile,
        activeSubscription,
        defaultAddress,
        recentSubscriptions,
        recentOrders,
        mealsOrderedResult,
        totalSpentResult,
        subscriptionsForWeeks,
        favoriteGoalResult
    ] = await Promise.all([
        getProfile(userId),
        Subscription.findOne({ user: userId, status: { $in: ["Active", "Paused"] } })
            .populate("plan", "name weeklyPrice goal tier supportsPause")
            .populate("mealSchedule.menuItem")
            .lean(),
        Address.findOne({ user: userId, isDefault: true }).lean(),
        Subscription.find({ user: userId }).sort({ createdAt: -1 }).limit(3)
            .populate("plan", "name weeklyPrice goal tier")
            .lean(),
        Order.find({ user: userId }).sort({ createdAt: -1 }).limit(5)
            .select("orderNumber totalAmount status paymentMethod createdAt items.menuName items.quantity")
            .lean(),
        Order.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId), status: { $ne: "Cancelled" } } },
            { $unwind: "$items" },
            { $group: { _id: null, totalQuantity: { $sum: "$items.quantity" } } }
        ]),
        Order.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId), paymentStatus: "Paid", status: { $ne: "Cancelled" } } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]),
        Subscription.find({ user: userId, paymentStatus: "Success" }).populate("plan").lean(),
        Subscription.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId) } },
            {
                $lookup: {
                    from: "plans",
                    localField: "plan",
                    foreignField: "_id",
                    as: "planData"
                }
            },
            { $unwind: "$planData" },
            {
                $group: {
                    _id: "$planData.goal",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 1 }
        ])
    ]);

    // calculate upcomingDeliveries
    const upcomingDeliveries = [];
    if (activeSubscription && activeSubscription.mealSchedule) {
        const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
        const start = new Date(activeSubscription.startDate);
        const endDate = new Date(activeSubscription.endDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let startDay = start.getDay();
        let daysUntilMonday = (1 - startDay + 7) % 7;
        const firstMonday = new Date(start);
        firstMonday.setDate(firstMonday.getDate() + daysUntilMonday);
        firstMonday.setHours(0, 0, 0, 0);

        for (const item of activeSubscription.mealSchedule) {
            const dayIndex = WEEKDAYS.indexOf(item.day);
            if (dayIndex === -1) continue;

            const dayDate = new Date(firstMonday);
            dayDate.setDate(dayDate.getDate() + dayIndex);
            dayDate.setHours(0, 0, 0, 0);

            if (dayDate >= today && dayDate <= endDate) {
                upcomingDeliveries.push({
                    date: dayDate.toISOString().split('T')[0],
                    dayName: item.day,
                    mealName: item.menuItem?.name || "",
                    mealCategory: item.menuItem?.category || ""
                });
            }
        }
        upcomingDeliveries.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    // calculate statistics
    const mealsOrdered = mealsOrderedResult.length > 0 ? mealsOrderedResult[0].totalQuantity : 0;
    const totalSpent = totalSpentResult.length > 0 ? totalSpentResult[0].total : 0;

    let totalWeeks = 0;
    subscriptionsForWeeks.forEach(sub => {
        const deliveryDays = sub.plan?.deliveryDays || 5;
        totalWeeks += deliveryDays / 5;
    });
    const subscriptionWeeks = Math.round(totalWeeks);

    const favoriteGoal = favoriteGoalResult.length > 0 ? favoriteGoalResult[0]._id : null;

    const statistics = {
        mealsOrdered,
        totalSpent,
        subscriptionWeeks,
        favoriteGoal
    };

    return {
        profile,
        activeSubscription,
        upcomingDeliveries,
        statistics,
        defaultAddress,
        recentSubscriptions,
        recentOrders
    };
}

/**
 * Fetch list of upcoming deliveries for the active subscription
 */
export async function getUpcomingDeliveries(userId) {
    const activeSubscription = await Subscription.findOne({ user: userId, status: { $in: ["Active", "Paused"] } })
        .populate("mealSchedule.menuItem")
        .lean();

    if (!activeSubscription || !activeSubscription.mealSchedule) {
        return [];
    }

    const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const start = new Date(activeSubscription.startDate);
    const endDate = new Date(activeSubscription.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let startDay = start.getDay();
    let daysUntilMonday = (1 - startDay + 7) % 7;
    const firstMonday = new Date(start);
    firstMonday.setDate(firstMonday.getDate() + daysUntilMonday);
    firstMonday.setHours(0, 0, 0, 0);

    const upcomingDeliveries = [];
    for (const item of activeSubscription.mealSchedule) {
        const dayIndex = WEEKDAYS.indexOf(item.day);
        if (dayIndex === -1) continue;

        const dayDate = new Date(firstMonday);
        dayDate.setDate(dayDate.getDate() + dayIndex);
        dayDate.setHours(0, 0, 0, 0);

        if (dayDate >= today && dayDate <= endDate) {
            upcomingDeliveries.push({
                date: dayDate.toISOString().split('T')[0],
                dayName: item.day,
                mealName: item.menuItem?.name || "",
                mealCategory: item.menuItem?.category || ""
            });
        }
    }
    upcomingDeliveries.sort((a, b) => new Date(a.date) - new Date(b.date));
    return upcomingDeliveries;
}

/**
 * Fetch statistics summary for user (mealsOrdered, totalSpent, subscriptionWeeks, favoriteGoal)
 */
export async function getStatistics(userId) {
    const [
        mealsOrderedResult,
        totalSpentResult,
        subscriptionsForWeeks,
        favoriteGoalResult
    ] = await Promise.all([
        Order.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId), status: { $ne: "Cancelled" } } },
            { $unwind: "$items" },
            { $group: { _id: null, totalQuantity: { $sum: "$items.quantity" } } }
        ]),
        Order.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId), paymentStatus: "Paid", status: { $ne: "Cancelled" } } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]),
        Subscription.find({ user: userId, paymentStatus: "Success" }).populate("plan").lean(),
        Subscription.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId) } },
            {
                $lookup: {
                    from: "plans",
                    localField: "plan",
                    foreignField: "_id",
                    as: "planData"
                }
            },
            { $unwind: "$planData" },
            {
                $group: {
                    _id: "$planData.goal",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 1 }
        ])
    ]);

    const mealsOrdered = mealsOrderedResult.length > 0 ? mealsOrderedResult[0].totalQuantity : 0;
    const totalSpent = totalSpentResult.length > 0 ? totalSpentResult[0].total : 0;

    let totalWeeks = 0;
    subscriptionsForWeeks.forEach(sub => {
        const deliveryDays = sub.plan?.deliveryDays || 5;
        totalWeeks += deliveryDays / 5;
    });
    const subscriptionWeeks = Math.round(totalWeeks);

    const favoriteGoal = favoriteGoalResult.length > 0 ? favoriteGoalResult[0]._id : null;

    return {
        mealsOrdered,
        totalSpent,
        subscriptionWeeks,
        favoriteGoal
    };
}
