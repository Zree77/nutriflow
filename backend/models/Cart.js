import mongoose from 'mongoose';

const { Schema } = mongoose;

const cartSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [
        {
            menuItem: {
                type: Schema.Types.ObjectId,
                ref: 'Menu',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            customizations: {
                removedIngredients: [{
                    name: { type: String, required: true }
                }],
                addedAddons: [{
                    name: { type: String, required: true },
                    extraPrice: { type: Number, required: true, min: 0 }
                }]
            },
            adjustedPrice: {
                type: Number,
                required: true,
                min: 0
            }
        }
    ]
}, {
    timestamps: true
});

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
