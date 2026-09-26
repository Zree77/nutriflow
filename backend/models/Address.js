import mongoose from "mongoose";

const { Schema } = mongoose;

const addressSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        label: {
            type: String,
            enum: ["Home", "Work", "Other"],
            default: "Home",
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        phone: {
            type: String,
            required: true,
            trim: true,
        },
        houseNo: {
            type: String,
            required: true,
            trim: true,
        },
        buildingName: {
            type: String,
            required: true,
            trim: true,
        },
        street: {
            type: String,
            required: true,
            trim: true,
        },
        area: {
            type: String,
            required: true,
            trim: true,
        },
        city: {
            type: String,
            required: true,
            trim: true,
        },
        state: {
            type: String,
            required: true,
            trim: true,
        },
        pincode: {
            type: String,
            required: true,
            trim: true,
            minlength: 6,
            maxlength: 6,
        },
        landmark: {
            type: String,
            trim: true,
            default: "",
        },
        deliveryInstructions: {
            type: String,
            trim: true,
            default: "",
        },
        latitude: {
            type: Number,
            required: true,
        },
        longitude: {
            type: Number,
            required: true,
        },
        isDefault: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const Address = mongoose.model("Address", addressSchema);
Address.schema.index({ user: 1, isDefault: 1 }, { unique: true, partialFilterExpression: { isDefault: true } });

export default Address;
