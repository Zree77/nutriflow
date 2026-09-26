import axios from 'axios';

const BASE_URL = 'https://cpaas.messagecentral.com';

/**
 * Helper to parse a phone number into countryCode and mobileNumber.
 * @param {string} phone 
 * @returns {object}
 */
const parsePhoneNumber = (phone) => {
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    if (cleaned.startsWith('+')) {
        if (cleaned.startsWith('+91')) {
            return { countryCode: '91', mobileNumber: cleaned.slice(3) };
        } else if (cleaned.startsWith('+1')) {
            return { countryCode: '1', mobileNumber: cleaned.slice(2) };
        } else if (cleaned.startsWith('+44')) {
            return { countryCode: '44', mobileNumber: cleaned.slice(3) };
        } else {
            const match = cleaned.match(/^\+(\d{1,3})(\d{10})$/);
            if (match) {
                return { countryCode: match[1], mobileNumber: match[2] };
            }
            return { countryCode: cleaned.slice(1, 3), mobileNumber: cleaned.slice(3) };
        }
    }
    if (cleaned.length === 10) {
        return { countryCode: '91', mobileNumber: cleaned };
    }
    return { countryCode: '91', mobileNumber: cleaned };
};

/**
 * Send OTP using Message Central VerifyNow API v3
 * @param {string} phoneNumber 
 * @returns {Promise<string>} verificationId
 */
export const sendOTP = async (phoneNumber) => {
    const { countryCode, mobileNumber } = parsePhoneNumber(phoneNumber);
    const customerId = process.env.MESSAGECENTRAL_CUSTOMER_ID;
    const authToken = process.env.MESSAGECENTRAL_AUTH_TOKEN;

    if (!customerId || !authToken) {
        throw new Error('Message Central configuration is missing (MESSAGECENTRAL_CUSTOMER_ID or MESSAGECENTRAL_AUTH_TOKEN).');
    }

    try {
        const response = await axios.post(
            `${BASE_URL}/verification/v3/send`,
            null,
            {
                params: {
                    customerId,
                    countryCode,
                    mobileNumber,
                    flowType: 'SMS',
                    type: 'OTP'
                },
                headers: {
                    authToken: authToken,
                    'Content-Type': 'application/json'
                }
            }
        );

        // Check for success (200) or rate-limit session reuse (506)
        if (response.data && response.data.data && response.data.data.verificationId) {
            const code = response.data.responseCode;
            const msg = response.data.message;
            if (code == 200 || code == 506 || msg === 'SUCCESS' || msg === 'REQUEST_ALREADY_EXISTS') {
                return response.data.data.verificationId;
            }
        }

        const errorMsg = response.data?.message || 'Failed to send OTP via Message Central.';
        throw new Error(errorMsg);
    } catch (error) {
        console.error('[Message Central Service Error] Send OTP failed:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || error.message);
    }
};

/**
 * Verify OTP using Message Central VerifyNow API v3
 * @param {string} verificationId - The verificationId returned by sendOTP
 * @param {string} otp - The OTP code to verify
 * @returns {Promise<boolean>} verified status
 */
export const verifyOTP = async (verificationId, otp) => {
    const customerId = process.env.MESSAGECENTRAL_CUSTOMER_ID;
    const authToken = process.env.MESSAGECENTRAL_AUTH_TOKEN;

    if (!customerId || !authToken) {
        throw new Error('Message Central configuration is missing (MESSAGECENTRAL_CUSTOMER_ID or MESSAGECENTRAL_AUTH_TOKEN).');
    }

    try {
        const response = await axios.get(
            `${BASE_URL}/verification/v3/validateOtp`,
            {
                params: {
                    customerId,
                    verificationId,
                    code: otp
                },
                headers: {
                    authToken: authToken,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.data && response.data.data) {
            const code = response.data.responseCode;
            const msg = response.data.message;
            if (code == 200 || msg === 'SUCCESS') {
                const status = response.data.data.verificationStatus;
                return status === 'VERIFICATION_COMPLETED' || status === 'VERIFIED';
            }
        }
        return false;
    } catch (error) {
        console.error('[Message Central Service Error] Verify OTP failed:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || error.message);
    }
};
