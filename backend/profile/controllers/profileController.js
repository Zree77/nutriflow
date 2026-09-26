import * as profileService from "../services/profileService.js";

export const getProfileController = async (req, res, next) => {
    try {
        const result = await profileService.getProfile(req.user._id);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const updateProfileController = async (req, res, next) => {
    try {
        const result = await profileService.updateProfile(req.user._id, req.body);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const getAddressesController = async (req, res, next) => {
    try {
        const result = await profileService.getAddresses(req.user._id);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const addAddressController = async (req, res, next) => {
    try {
        const result = await profileService.addAddress(req.user._id, req.body);
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const updateAddressController = async (req, res, next) => {
    try {
        const result = await profileService.updateAddress(req.user._id, req.params.id, req.body);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const deleteAddressController = async (req, res, next) => {
    try {
        const result = await profileService.deleteAddress(req.user._id, req.params.id);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const setDefaultAddressController = async (req, res, next) => {
    try {
        const result = await profileService.setDefaultAddress(req.user._id, req.params.id);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const getDashboardController = async (req, res, next) => {
    try {
        const result = await profileService.getDashboardSummary(req.user._id);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const getUpcomingDeliveriesController = async (req, res, next) => {
    try {
        const result = await profileService.getUpcomingDeliveries(req.user._id);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const getStatisticsController = async (req, res, next) => {
    try {
        const result = await profileService.getStatistics(req.user._id);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};
