
export const calculateAdjustedPrice = (basePrice, addedAddons, dbOptionalAddons = []) => {
    if (!addedAddons || !Array.isArray(addedAddons) || addedAddons.length === 0) {
        return basePrice;
    }

    let totalAddonPrice = 0;

    for (const clientAddon of addedAddons) {
        const dbAddon = dbOptionalAddons.find(db => db.name === clientAddon.name);

        if (dbAddon) {
            totalAddonPrice += dbAddon.extraPrice;
        }
    }

    return basePrice + totalAddonPrice;
};