import * as messageCentral from '../services/messageCentralService.js';
import OTP from '../../models/OTP.js';
import User from '../../models/User.js';
import jwt from 'jsonwebtoken';

/**
 * Generate and send OTP via Message Central VerifyNow CPaaS
 * route  = POST /nutriflow/auth/send-otp
 */
export const sendOTP = async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone || phone.trim().length !== 10) {
            return res.status(400).json({
                success: false,
                message: "A valid 10-digit phone number is required (spacing not allowed)."
            });
        }

        console.log(`[Auth] Requesting OTP send via Message Central for phone: ${phone}`);

        const verificationId = await messageCentral.sendOTP(phone);

        await OTP.findOneAndUpdate(
            { phone },
            { otp: verificationId, createdAt: Date.now() },
            {
                upsert: true,
                returnDocument: "after",
                setDefaultsOnInsert: true
            }
        );

        console.log(`[Auth] OTP dispatched successfully. Verification ID: ${verificationId}`);

        return res.status(200).json({
            success: true,
            message: "OTP verification code sent successfully.",
            verificationId
        });
    } catch (error) {
        console.error('[Controller Error] sendOTP failed:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error."
        });
    }
};

/**
 * Verify OTP code via Message Central and login/register the user
 * route  = POST /nutriflow/auth/verify-otp
 */
export const verifyOTP = async (req, res) => {
    try {
        const { verificationId, otp, name } = req.body;

        if (!verificationId || !otp) {
            return res.status(400).json({
                success: false,
                message: "Verification ID and OTP code are required."
            });
        }

        const record = await OTP.findOne({ otp: verificationId });
        if (!record) {
            return res.status(400).json({
                success: false,
                message: "Verification session has expired or is invalid."
            });
        }

        const phone = record.phone;
        console.log(`[Auth] Validating OTP code for phone ${phone} with ID ${verificationId}`);

        const isVerified = await messageCentral.verifyOTP(verificationId, otp);

        if (!isVerified) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP code. Please check and try again."
            });
        }

        await OTP.deleteOne({ _id: record._id });

        let user = await User.findOne({ phone: phone });
        let isNewUser = false;

        if (!user) {
            user = new User({
                name: name || `User_${phone.slice(-4)}`,
                phone: phone,
                isVerified: true,
                isSubscribed: false
            });
            await user.save();
            isNewUser = true;
            console.log(`[Auth] Registered new user with phone: ${phone}`);
        } else {
            if (!user.isVerified) {
                user.isVerified = true;
                await user.save();
            }
            console.log(`[Auth] Existing user logged in with phone: ${phone}`);
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'nutriflow_jwt_secret_key_12345',
            { expiresIn: '7d' }
        );

        return res.status(200).json({
            success: true,
            token,
            isNewUser,
            user: {
                _id: user._id,
                name: user.name,
                phone: user.phone,
                role: user.role,
                isVerified: user.isVerified,
                isSubscribed: user.isSubscribed
            }
        });
    } catch (error) {
        console.error('[Controller Error] verifyOTP failed:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error."
        });
    }
};

/**
 * Get profile details of the authenticated user
 * route  = GET /nutriflow/auth/profile
 */
export const getProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }
        return res.status(200).json({
            success: true,
            user: {
                _id: req.user._id,
                name: req.user.name,
                phone: req.user.phone,
                role: req.user.role,
                isVerified: req.user.isVerified,
                isSubscribed: req.user.isSubscribed,
                email: req.user.email || '',
                address: req.user.address || null,
                createdAt: req.user.createdAt,
                updatedAt: req.user.updatedAt
            }
        });
    } catch (error) {
        console.error('[Controller Error] getProfile failed:', error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error."
        });
    }
};