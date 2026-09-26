import {
    KITCHEN_LAT,
    KITCHEN_LNG,
    FREE_DELIVERY_RADIUS_KM,
    EXTRA_CHARGE_PER_KM,
    MAX_DELIVERY_RADIUS_KM,
    DELIVERY_CHARGE
} from '../config/constants.js';

/**
 * Calculates the distance in kilometers between two lat/lng coordinates using the Haversine formula.
 */
function getHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Calculates distance, delivery charge, and availability status for a customer location.
 * 
 * @param {string|boolean} tierOrIsSubscribed - Active membership tier ("Premium", "Standard") or isSubscribed boolean
 * @param {number} customerLat - Latitude of the customer
 * @param {number} customerLng - Longitude of the customer
 * @returns {object} { distanceKm, deliveryCharge, isFree, isInRange }
 */
export function calculateDelivery(tierOrIsSubscribed, customerLat, customerLng) {
    const distanceKm = getHaversineDistance(KITCHEN_LAT, KITCHEN_LNG, customerLat, customerLng);
    const isInRange = distanceKm <= MAX_DELIVERY_RADIUS_KM;

    let deliveryCharge = 0;
    let isFree = false;

    // Check if tier is explicitly Premium or if boolean isSubscribed was passed as true
    const isPremium = typeof tierOrIsSubscribed === 'string'
        ? tierOrIsSubscribed.toLowerCase().includes('premium')
        : Boolean(tierOrIsSubscribed);

    if (isPremium) {
        if (distanceKm <= FREE_DELIVERY_RADIUS_KM) {
            deliveryCharge = 0;
            isFree = true;
        } else {
            const extraKm = Math.ceil(distanceKm - FREE_DELIVERY_RADIUS_KM);
            deliveryCharge = extraKm * EXTRA_CHARGE_PER_KM;
            isFree = false;
        }
    } else {
        // Standard membership / non-premium delivery calculation
        if (distanceKm <= FREE_DELIVERY_RADIUS_KM) {
            deliveryCharge = DELIVERY_CHARGE;
            isFree = false;
        } else {
            const extraKm = Math.ceil(distanceKm - FREE_DELIVERY_RADIUS_KM);
            deliveryCharge = DELIVERY_CHARGE + (extraKm * EXTRA_CHARGE_PER_KM);
            isFree = false;
        }
    }

    return {
        distanceKm: parseFloat(distanceKm.toFixed(2)),
        deliveryCharge,
        isFree,
        isInRange
    };
}

/**
 * Checks delivery availability and calculates pricing tiers for subscription vs non-subscription.
 * 
 * @param {number} customerLat - Latitude of the customer
 * @param {number} customerLng - Longitude of the customer
 * @returns {object} { available, distanceKm, premium: { charge, isFree }, standard: { charge }, subscribed: { charge, isFree }, nonSubscribed: { charge } }
 */
export function checkDeliveryAvailability(customerLat, customerLng) {
    const distanceKm = getHaversineDistance(KITCHEN_LAT, KITCHEN_LNG, customerLat, customerLng);
    const available = distanceKm <= MAX_DELIVERY_RADIUS_KM;

    if (!available) {
        return {
            available: false,
            distanceKm: parseFloat(distanceKm.toFixed(2)),
            premium: { charge: 0, isFree: false },
            standard: { charge: 0 },
            subscribed: { charge: 0, isFree: false },
            nonSubscribed: { charge: 0 }
        };
    }

    let premiumCharge = 0;
    let premiumIsFree = false;

    if (distanceKm <= FREE_DELIVERY_RADIUS_KM) {
        premiumCharge = 0;
        premiumIsFree = true;
    } else {
        const extraKm = Math.ceil(distanceKm - FREE_DELIVERY_RADIUS_KM);
        premiumCharge = extraKm * EXTRA_CHARGE_PER_KM;
    }

    let standardCharge = DELIVERY_CHARGE;
    if (distanceKm > FREE_DELIVERY_RADIUS_KM) {
        const extraKm = Math.ceil(distanceKm - FREE_DELIVERY_RADIUS_KM);
        standardCharge = DELIVERY_CHARGE + (extraKm * EXTRA_CHARGE_PER_KM);
    }

    return {
        available: true,
        distanceKm: parseFloat(distanceKm.toFixed(2)),
        premium: { charge: premiumCharge, isFree: premiumIsFree },
        standard: { charge: standardCharge },
        subscribed: { charge: premiumCharge, isFree: premiumIsFree },
        nonSubscribed: { charge: standardCharge }
    };
}
export { MAX_DELIVERY_RADIUS_KM };

