import mongoose from 'mongoose';

const { Schema } = mongoose;

const menuSchema = new Schema({
    menuId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    baseRecipeId: {
        type: String,
        trim: true,
        default: '',
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        default: '',
    },
    category: {
        type: String,
        required: true,
        enum: ['Sandwich', 'Salad', 'Bowl', 'Smoothie', 'Wrap', 'Other'],
    },
    vegNonVeg: {
        type: String,
        required: true,
        enum: ['Veg', 'Non-Veg', 'Vegan'],
    },
    servingSize: {
        type: String,
        default: '',
    },
    ingredients: [{ type: String }],
    removableIngredients: [{
        name: { type: String, required: true },
    }],
    optionalAddons: [{
        name: { type: String, required: true },
        extraPrice: { type: Number, required: true },
    }],
    nutrition: {
        calories: { type: Number, default: 0 },
        protein: { type: Number, default: 0 },
        carbs: { type: Number, default: 0 },
        fats: { type: Number, default: 0 },
        fiber: { type: Number, default: 0 },
        sugar: { type: Number, default: 0 },  // grams
        sodium: { type: Number, default: 0 }, // milligrams
    },

    allergens: [{ type: String }],
    allergyIndicators: [{ type: String }],

    // Pricing
    estimatedFoodCost: { type: Number, default: 0 }, // internal cost 
    price: { type: Number, required: true, min: 0 }, // selling price shown to customer 

    // Goal categories this item belongs to
    goalCategory: [{
        type: String,
        enum: ['High Protein', 'Weight Loss', 'Weight Gain', 'Balanced Diet', 'Diabetic Friendly'],
    }],

    // Dietary tags for filtering
    dietaryTags: [{
        type: String,
        enum: ['Veg', 'Non-Veg', 'Vegan', 'Gluten-Free', 'High-Protein', 'Low-Calorie', 'Low-Carb', 'Diabetic-Friendly'],
    }],

    image: { type: String, default: '' },

    // Availability flags
    availableForDailyOrder: { type: Boolean, default: true },
    availableForSubscription: { type: Boolean, default: true },
    isAvailable: { type: Boolean, default: true }, // kitchen toggle

    // Tier & Chef Special flags
    tier: {
        type: String,
        enum: ['Standard', 'Premium'],
        required: true,
    },
    isChefSpecial: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

menuSchema.index({ goalCategory: 1, vegNonVeg: 1, tier: 1, category: 1 });

const Menu = mongoose.model('Menu', menuSchema);
export default Menu;
