import mongoose from "mongoose";

const { Schema } = mongoose;


//  orderItemSchema
const orderItemSchema = new Schema(
    {
        menuItem: {
            type: Schema.Types.ObjectId,
            ref: "Menu",
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
        menuName: {
            type: String,
            required: true,
            trim: true,
        },
        image: {
            type: String,
            default: "",
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        customizations: {
            removedIngredients: [{
                name: { type: String, required: true }
            }],
            addedAddons: [{
                name: { type: String, required: true },
                extraPrice: { type: Number, required: true, min: 0 }
            }]
        }
    },
    { _id: false }
);


//  deliveryAddressSchema

const deliveryAddressSchema = new Schema(
    {
        fullName: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        houseNo: { type: String, required: true, trim: true },
        buildingName: { type: String, required: true, trim: true },
        street: { type: String, required: true, trim: true },
        area: { type: String, required: true, trim: true },
        landmark: { type: String, trim: true, default: "" },
        city: { type: String, required: true, trim: true },
        state: { type: String, required: true, trim: true },
        pincode: { type: String, required: true, trim: true },
        deliveryInstructions: { type: String, trim: true, default: "" }
    },
    { _id: false }
);

//  counterSchema
const counterSchema = new Schema({
    _id: {
        type: String,
        required: true,
    },
    sequenceValue: {
        type: Number,
        required: true,
        default: 0,
    },
});


//  Counter model
const Counter =
    mongoose.models.Counter || mongoose.model("Counter", counterSchema);


//  getNextOrderNumber function
async function getNextOrderNumber() {
    const result = await Counter.findOneAndUpdate(
        { _id: "orderNumber" },
        { $inc: { sequenceValue: 1 } },
        { new: true, upsert: true }
    );

    return `NF${String(result.sequenceValue).padStart(6, "0")}`;
}


//  orderSchema
const orderSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        orderNumber: {
            type: String,
            unique: true,
        },
        items: {
            type: [orderItemSchema],
            required: true,
            validate: {
                validator: (items) => items.length > 0,
                message: "Order must contain at least one item.",
            },
        },
        orderType: {
            type: String,
            enum: ["order", "subscription"],
            default: "order",
            required: true,
        },

        // Billing
        subtotal: { type: Number, required: true, min: 0 },
        deliveryCharge: { type: Number, required: true, min: 0, default: 0 },
        tax: { type: Number, required: true, min: 0, default: 0 },
        discount: { type: Number, required: true, min: 0, default: 0 },
        totalAmount: { type: Number, required: true, min: 0 },
        couponCode: { type: String, default: "", trim: true },

        // Payment
        paymentMethod: {
            type: String,
            enum: ["COD", "UPI", "Credit Card", "Debit Card", "Net Banking"],
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ["Pending", "Paid", "Failed", "Refunded"],
            default: "Pending",
        },
        paymentId: { type: String, default: "" },

        // Address
        deliveryAddress: { type: deliveryAddressSchema, required: true },

        // Delivery
        deliveryDate: {
            type: Date,
            required: function () {
                return this.orderType === "order";
            },
        },
        deliverySlot: {
            type: String,
            required: function () {
                return this.orderType === "order";
            },
        },
        preferredDeliverySlot: {
            type: String,
            required: function () {
                return this.orderType === "subscription";
            },
        },

        // Order Status
        status: {
            type: String,
            enum: [
                "Pending",
                "Confirmed",
                "Preparing",
                "Out for Delivery",
                "Delivered",
                "Cancelled",
            ],
            default: "Pending",
        },
        notes: { type: String, default: "", trim: true },
        deliveredAt: { type: Date },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);


//  indexes
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ orderType: 1 });
orderSchema.index({ couponCode: 1 });


//  virtuals
orderSchema.virtual("itemCount").get(function () {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
});


// pre-save hook

orderSchema.pre("save", async function () {
    if (!this.isNew || this.orderNumber) {
        return;
    }
    this.orderNumber = await getNextOrderNumber();
});

//  Order model
const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

// export default Order
export default Order;