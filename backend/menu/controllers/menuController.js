import * as menuService from '../menuService.js';

/*
 * Get all menu items with filtering and search
 * route   GET /nutriflow/menu
 * access  Public
 */
export const getMenuItems = async (req, res) => {
    try {
        const result = await menuService.getMenuItemsService(req.query);

        if (!result.success) {
            return res.status(result.status).json({
                success: false,
                message: result.message,
                error: result.error
            });
        }

        return res.status(result.status).json({
            success: true,
            count: result.count,
            data: result.data
        });
    } catch (error) {
        console.error('[Menu Controller Error] getMenuItems failed:', error);
        return res.status(500).json({
            success: false,
            message: 'Server Error fetching menu items',
            error: error.message
        });
    }
};

/*
 * Get single menu item by ID or custom menuId
 * route   GET /nutriflow/menu/:id
 * access  Public
 */
export const getMenuItemById = async (req, res) => {
    try {
        const result = await menuService.getMenuItemByIdService(req.params.id);

        if (!result.success) {
            return res.status(result.status).json({
                success: false,
                message: result.message,
                error: result.error
            });
        }

        return res.status(result.status).json({
            success: true,
            data: result.data
        });
    } catch (error) {
        console.error('[Menu Controller Error] getMenuItemById failed:', error);
        return res.status(500).json({
            success: false,
            message: 'Server Error retrieving menu item',
            error: error.message
        });
    }
};

/*
 * Create new menu item (Admin only)
 * route   POST /nutriflow/menu
 * access  Private/Admin
 */
export const createMenuItem = async (req, res) => {
    try {
        const result = await menuService.createMenuItemService(req.body);

        if (!result.success) {
            return res.status(result.status).json({
                success: false,
                message: result.message,
                error: result.error
            });
        }

        return res.status(result.status).json({
            success: true,
            data: result.data
        });
    } catch (error) {
        console.error('[Menu Controller Error] createMenuItem failed:', error);
        return res.status(500).json({
            success: false,
            message: 'Server Error creating menu item',
            error: error.message
        });
    }
};

/*
 * Update existing menu item (Admin only)
 * route   PUT /nutriflow/menu/:id
 * access  Private/Admin
 */
export const updateMenuItem = async (req, res) => {
    try {
        const lookupValue = req.params.id || req.params.value;
        const result = await menuService.updateMenuItemService(lookupValue, req.body);

        if (!result.success) {
            return res.status(result.status).json({
                success: false,
                message: result.message,
                error: result.error
            });
        }

        return res.status(result.status).json({
            success: true,
            data: result.data
        });
    } catch (error) {
        console.error('[Menu Controller Error] updateMenuItem failed:', error);
        return res.status(500).json({
            success: false,
            message: 'Server Error updating menu item',
            error: error.message
        });
    }
};

/*
 * Delete menu item (Admin only)
 * route   DELETE /nutriflow/menu/:id
 * access  Private/Admin
 */
export const deleteMenuItem = async (req, res) => {
    try {
        const result = await menuService.deleteMenuItemService(req.params.id);

        if (!result.success) {
            return res.status(result.status).json({
                success: false,
                message: result.message,
                error: result.error
            });
        }

        return res.status(result.status).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        console.error('[Menu Controller Error] deleteMenuItem failed:', error);
        return res.status(500).json({
            success: false,
            message: 'Server Error deleting menu item',
            error: error.message
        });
    }
};
