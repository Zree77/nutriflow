
// Order and billing constants
export const DELIVERY_CHARGE = 40;
export const GST_PERCENT = 5;

// Breakfast Delivery Config
export const VALID_BREAKFAST_SLOTS = ["8:00 AM - 9:30 AM"];
export const ORDER_CUTOFF_HOUR = 9;
export const ORDER_CUTOFF_MINUTE = 30;


// Order Cancellation Config (Order Now only)
export const CANCEL_MIN_SECONDS = 60;  // 60 seconds (User has to wait 1 min to prevent accidental clicks)
export const CANCEL_MAX_SECONDS = 120; // 120 seconds (Max 2 mins window to cancel before kitchen preps)

// Distance-based delivery charge config
export const KITCHEN_LAT = parseFloat(process.env.KITCHEN_LAT) || 10.0170;
export const KITCHEN_LNG = parseFloat(process.env.KITCHEN_LNG) || 76.3440;
export const FREE_DELIVERY_RADIUS_KM = 4;
export const EXTRA_CHARGE_PER_KM = 10;
export const MAX_DELIVERY_RADIUS_KM = 10;

export const PAUSE_DEADLINE_HOUR = 19;          // 7 PM day-before cutoff
export const MAX_WEEKLY_PAUSES = 2;             // Per ISO week (Mon-Sun)
export const DELIVERY_DAYS = [1, 2, 3, 4, 5];   // Mon=1 through Fri=5
export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const PAUSE_LOOKAHEAD_DAYS = 14;         // How many days ahead to show pauseable days
