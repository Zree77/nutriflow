/**
 * Helper to normalize and serialize customizations for stable JSON comparison.
 * 
 * RULES:
 * 1. "Lettuce, Tomato" MUST equal "Tomato, Lettuce" (Sorted).
 * 2. Duplicate detection is STRICTLY by NAMES. Price is NOT included in the key.
 * 3. Handles arrays of strings for removedIngredients.
 */
export const getCustomizationString = (cust) => {
    // Fast path: null, undefined, or empty customizations all equal the same base state
    if (!cust ||
        (!cust.removedIngredients?.length && !cust.addedAddons?.length)) {
        return JSON.stringify({ removedIngredients: [], addedAddons: [] });
    }

    // Sort removed ingredients (Array of strings)
    const sortedRemoved = [...(cust.removedIngredients || [])]
        .sort((a, b) => a.localeCompare(b));

    // Sort added addons by NAME ONLY (Ignore client-sent extraPrice for key generation)
    const sortedAdded = [...(cust.addedAddons || [])]
        .map(a => a.name)
        .sort((a, b) => a.localeCompare(b));

    return JSON.stringify({
        removedIngredients: sortedRemoved,
        addedAddons: sortedAdded
    });
};