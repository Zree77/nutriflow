import mongoose from "mongoose";
import { Schema } from "mongoose";

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        default: "",
    },
    address: {
        type: String,
        default: "",
    },
    profileImage: {
        type: String,
        default: "",
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user",
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    isSubscribed: {
        type: Boolean,
        default: false,
    },
},
    {
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema);
export default User;