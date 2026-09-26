export const INVALID_MENU_ID = 'Invalid Menu ID.';
export const ITEM_NOT_FOUND = 'Item not found.';
export const CART_NOT_FOUND = 'Cart not found.';
export const INTERNAL_SERVER_ERROR = 'Internal Server Error.';
export const ITEM_ADDED_SUCCESSFULLY = 'Item added to cart successfully.';
export const ITEM_UPDATED_SUCCESSFULLY = 'Cart item updated successfully.';
export const ITEM_REMOVED_SUCCESSFULLY = 'Item removed from cart successfully.';
export const CART_CLEARED_SUCCESSFULLY = 'Cart cleared successfully.';
export const PROVIDE_MENU_ITEM_AND_QUANTITY = 'Please provide both menuItemId and quantity.';
export const QUANTITY_GREATER_THAN_ZERO = 'Quantity must be greater than zero.';
export const QUANTITY_MUST_BE_NUMBER = 'Quantity must be a number.';
export const CUSTOMIZATION_SUBSCRIBERS_ONLY = 'Item customization is exclusive to subscribed users.';
export const ITEM_NOT_FOUND_IN_CART = 'Item not found in cart.';

// Validator 
export const REMOVED_INGREDIENTS_MUST_BE_ARRAY = 'removedIngredients must be an array of strings.';
export const ADDED_ADDONS_MUST_BE_ARRAY = 'addedAddons must be an array of objects.';
export const ADDON_NAME_REQUIRED = "Each addon must have a valid 'name' string.";
export const CUSTOMIZATIONS_REQUIRED_FOR_REMOVE = 'Customizations payload is required for exact removal. Send { removedIngredients: [], addedAddons: [] } for non-customized items.';
export const CUSTOMIZATIONS_REQUIRED_FOR_UPDATE = 'Customizations payload is required for exact update. Send { removedIngredients: [], addedAddons: [] } for non-customized items.';

export const getIngredientNotRemovableMessage = (name) => `Ingredient "${name}" cannot be removed from this item.`;
export const getAddonNotAvailableMessage = (name) => `Addon "${name}" is not available for this item.`;