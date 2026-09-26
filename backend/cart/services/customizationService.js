/**
 * Normalizes incoming customizations to ensure a safe structure for matching.
 * Prevents undefined errors during exact-match comparison.
 * 
 * @param {Object} customizations - Incoming customizations from req.body
 * @returns {Object} Normalized object with empty arrays as fallbacks
 */
export const normalizeTargetCustomizations = (customizations) => {
    if (!customizations) {
        return { removedIngredients: [], addedAddons: [] };
    }

    // Handle both client format (removableIngredients) & internal format (removedIngredients)
    const rawRemoved = customizations.removedIngredients || customizations.removableIngredients || [];


    const removedIngredients = rawRemoved.map(item => {
        if (typeof item === 'string') return { name: item };
        if (typeof item === 'object' && item !== null && item.name) return { name: item.name };
        return null;
    }).filter(Boolean);

    // Handle both client format (optionalAddons) and internal format (addedAddons)
    const addedAddons = customizations.addedAddons || customizations.optionalAddons || [];

    return {
        removedIngredients,
        addedAddons
    };
};

/**
 * SECURITY CHECK: Blocks non-subscribed users from using ANY customizations.
 * Prevents Postman hacking where a non-premium user sends customizations in the body.
 * 
 * @param {Object} user - req.user object (must contain isSubscribed boolean)
 * @param {Object} customizations - Incoming customizations
 * @returns {Object} { isValid: boolean, status?: number, message?: string }
 */
export const validateSubscriberOnlyCustomizations = (user, customizations) => {
    const normalized = normalizeTargetCustomizations(customizations);

    const hasCustomizations =
        (normalized.removedIngredients && normalized.removedIngredients.length > 0) ||
        (normalized.addedAddons && normalized.addedAddons.length > 0);

    if (hasCustomizations && !user.isSubscribed) {
        return {
            isValid: false,
            status: 403,
            message: 'Access denied: Item customization is strictly available for subscribed users only.'
        };
    }

    return { isValid: true };
};

/**
 * Validates requested customizations against the Menu Item's allowed options in the DB.
 * CRITICAL SECURITY: Ignores client-sent extraPrice to prevent price manipulation.
 * Strictly fetches the correct price from the Database.
 * 
 * @param {Object} menuItem - The Mongoose Menu document
 * @param {Object} customizations - Incoming customizations
 * @returns {Object} { isValid: boolean, status?: number, message?: string, normalizedCustomizations?: Object }
 */
export const validateAndSanitizeCustomizations = (menuItem, customizations) => {
    const normalized = normalizeTargetCustomizations(customizations);

    // 1. Validate Removed Ingredients
    if (normalized.removedIngredients.length > 0) {
        // Create an array of strictly ALLOWED names from DB
        const dbRemovableNames = menuItem.removableIngredients.map(i => i.name);

        for (const reqItem of normalized.removedIngredients) {
            const reqName = typeof reqItem === 'object' ? reqItem.name : reqItem;
            if (!dbRemovableNames.includes(reqName)) {
                return {
                    isValid: false,
                    status: 400,
                    message: `${reqName} cannot be removed from this item.`
                };
            }
        }
    }

    // 2. Validate Added Addons & Enforce DB Prices
    if (normalized.addedAddons.length > 0) {
        const sanitizedAddons = [];

        // Create a Map of allowed addons from DB
        const dbAddonMap = new Map(menuItem.optionalAddons.map(a => [a.name, a.extraPrice]));

        for (const clientAddon of normalized.addedAddons) {
            const dbPrice = dbAddonMap.get(clientAddon.name);

            // If the requested addon doesn't exist in DB for this item
            if (dbPrice === undefined) {
                return {
                    isValid: false,
                    status: 400,
                    message: `${clientAddon.name} is not available as an addon for this item.`
                };
            }

            // CRITICAL RULE: Overwrite client-sent price with strict DB price. Prevents hacking.
            sanitizedAddons.push({
                name: clientAddon.name,
                extraPrice: dbPrice
            });
        }

        // Return sanitized customizations with secured DB prices
        return {
            isValid: true,
            normalizedCustomizations: {
                removedIngredients: normalized.removedIngredients,
                addedAddons: sanitizedAddons
            }
        };
    }

    // No addons to sanitize, just return the validated removed ingredients
    return {
        isValid: true,
        normalizedCustomizations: {
            removedIngredients: normalized.removedIngredients,
            addedAddons: []
        }
    };
};