import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        trim: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 180, //3mins expiry
    }
});

const OTP = mongoose.model('OTP', otpSchema);
export default OTP;
