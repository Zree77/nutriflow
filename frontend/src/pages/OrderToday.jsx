import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import api, { dedupedGet, getAuthToken } from '../api';

const DIETARY_TABS = ["All Plans", "High Protein", "Balanced Diet", "Weight Loss", "Weight Gain", "Diabetic Friendly"];

// Premium visual assets matched closely to items
// Premium visual assets matched closely to items
const FALLBACK_ORDER_MENU = [
  {
    _id: "m1",
    name: "Herb Grilled Chicken Sandwich",
    description: "Tender herb-marinated grilled chicken breast layered with crisp lettuce, fresh tomato, and Greek yogurt dressing on toasted whole-wheat sourdough.",
    price: 229,
    category: "Breakfast",
    vegNonVeg: "Non-Veg",
    goalCategory: ["High Protein"],
    nutrition: { calories: 425, protein: 38, carbs: 34, fats: 12 },
    image: "/Chicken Egg Sandwich.png"
  },
  {
    _id: "m2",
    name: "Greek Yogurt Protein Bowl",
    description: "Thick, high-protein Greek yogurt topped with a premium seed mix, sliced banana, gluten-free granola, and a drizzle of raw honey.",
    price: 189,
    category: "Breakfast",
    vegNonVeg: "Veg",
    goalCategory: ["High Protein"],
    nutrition: { calories: 410, protein: 31, carbs: 38, fats: 13 },
    image: "/Apple Cinnamon Overnight Oats.png"
  },
  {
    _id: "m3",
    name: "Chocolate Protein Smoothie",
    description: "Indulgent cocoa blended with grass-fed whey protein isolate, almond butter, ripe banana, and organic unsweetened almond milk.",
    price: 169,
    category: "Breakfast",
    vegNonVeg: "Veg",
    goalCategory: ["High Protein"],
    nutrition: { calories: 380, protein: 32, carbs: 40, fats: 10 },
    image: "/Banana Protein Smoothie.png"
  },
  {
    _id: "m4",
    name: "Garden Herb Chicken Sandwich",
    description: "Classic grilled chicken breast seasoned with dynamic garden herbs, romaine lettuce, and low-fat light mayo.",
    price: 219,
    category: "Breakfast",
    vegNonVeg: "Non-Veg",
    goalCategory: ["Balanced Diet"],
    nutrition: { calories: 380, protein: 34, carbs: 31, fats: 11 },
    image: "/Balanced Diet - Herbed Paneer Sandwich.png"
  },
  {
    _id: "m5",
    name: "Apple Cinnamon Oats Bowl",
    description: "Warm rolled oats cooked in almond milk, spiced with organic cinnamon, topped with fresh apple slices and chia seeds.",
    price: 179,
    category: "Breakfast",
    vegNonVeg: "Veg",
    goalCategory: ["Balanced Diet"],
    nutrition: { calories: 345, protein: 12, carbs: 54, fats: 8 },
    image: "/Apple Cinnamon Overnight Oats.png"
  },
  {
    _id: "m6",
    name: "Mixed Seed Smoothie",
    description: "Nutrient-packed blend of pumpkin, flax, sunflower, and chia seeds with banana and low-fat Greek yogurt.",
    price: 149,
    category: "Breakfast",
    vegNonVeg: "Veg",
    goalCategory: ["Balanced Diet"],
    nutrition: { calories: 310, protein: 10, carbs: 36, fats: 11 },
    image: "/Green Boost Smoothie.png"
  },
  {
    _id: "m7",
    name: "Lean Herb Chicken Sandwich",
    description: "Ultra-lean chicken breast with dynamic zero-calorie herb seasoning, cucumbers, and spinach.",
    price: 229,
    category: "Breakfast",
    vegNonVeg: "Non-Veg",
    goalCategory: ["Weight Loss"],
    nutrition: { calories: 350, protein: 36, carbs: 14, fats: 8 },
    image: "/Chicken Egg Sandwich.png"
  },
  {
    _id: "m8",
    name: "Greek Yogurt Apple Bowl",
    description: "Calorie-controlled fat-free Greek yogurt topped with crisp green apples and cinnamon.",
    price: 169,
    category: "Breakfast",
    vegNonVeg: "Veg",
    goalCategory: ["Weight Loss"],
    nutrition: { calories: 280, protein: 24, carbs: 28, fats: 2 },
    image: "/Balanced Diet - Cottage Cheese salad.png"
  },
  {
    _id: "m9",
    name: "Green Boost Smoothie",
    description: "Detoxifying spinach, celery, green apple, cucumber, and ginger juice blend for general wellness.",
    price: 139,
    category: "Breakfast",
    vegNonVeg: "Veg",
    goalCategory: ["Weight Loss"],
    nutrition: { calories: 160, protein: 4, carbs: 32, fats: 1 },
    image: "/Green Boost Smoothie.png"
  },
  {
    _id: "m10",
    name: "Chicken Cheese Sandwich",
    description: "Hearty grilled chicken sandwich layered with melted white cheddar cheese and fresh sliced avocados.",
    price: 249,
    category: "Breakfast",
    vegNonVeg: "Non-Veg",
    goalCategory: ["Weight Gain"],
    nutrition: { calories: 580, protein: 42, carbs: 46, fats: 22 },
    image: "/Chicken Egg Sandwich.png"
  },
  {
    _id: "m11",
    name: "Banana Nut Oats Bowl",
    description: "Energy-dense oats loaded with banana, toasted walnuts, pecans, and extra raw honey.",
    price: 199,
    category: "Breakfast",
    vegNonVeg: "Veg",
    goalCategory: ["Weight Gain"],
    nutrition: { calories: 480, protein: 14, carbs: 64, fats: 18 },
    image: "/Banana Nut Oats Bowl.png"
  },
  {
    _id: "m12",
    name: "Peanut Butter Oats Smoothie",
    description: "High-calorie cream blend of raw peanut butter, organic oats, double whey scoop, and whole milk.",
    price: 179,
    category: "Breakfast",
    vegNonVeg: "Veg",
    goalCategory: ["Weight Gain"],
    nutrition: { calories: 550, protein: 35, carbs: 58, fats: 20 },
    image: "/Banana Protein Smoothie.png"
  },
  {
    _id: "m13",
    name: "Grilled Chicken Salad Wrap",
    description: "Low-carb wheat tortilla wrap stuffed with seasoned grilled chicken, cucumber, and high-fiber greens.",
    price: 229,
    category: "Breakfast",
    vegNonVeg: "Non-Veg",
    goalCategory: ["Diabetic Friendly"],
    nutrition: { calories: 340, protein: 32, carbs: 22, fats: 9 },
    image: "/Balanced Diet - Cottage Cheese salad.png"
  },
  {
    _id: "m14",
    name: "Mixed Seed Yogurt Bowl",
    description: "Low-glycemic breakfast featuring unsweetened Greek yogurt with flax, pumpkin, and chia seeds.",
    price: 189,
    category: "Breakfast",
    vegNonVeg: "Veg",
    goalCategory: ["Diabetic Friendly"],
    nutrition: { calories: 320, protein: 28, carbs: 16, fats: 12 },
    image: "/Diabetic Friendly - Sprouts Garden Salad.png"
  },
  {
    _id: "m15",
    name: "Cucumber Mint Smoothie",
    description: "Refreshing zero-sugar hydrating blend of cucumber, fresh mint, and organic celery juice.",
    price: 139,
    category: "Breakfast",
    vegNonVeg: "Veg",
    goalCategory: ["Diabetic Friendly"],
    nutrition: { calories: 110, protein: 3, carbs: 18, fats: 1 },
    image: "/Green Boost Smoothie.png"
  }
];

const OrderToday = ({ onOpenOTP, setActiveTab, cartItems, cartQuantities, addToCart, updateCartQty }) => {
  const [activeDietTab, setActiveDietTab] = useState("All Plans");
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null); // { message, type }

  const triggerToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Helper to check if string is valid 24-char hex MongoDB ObjectId
  const isValidObjectId = (id) => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);

  // True when we're showing hardcoded fallback data instead of live API data
  const isFallback = menuItems.length > 0 && menuItems[0]?._id?.startsWith('m') && menuItems[0]._id.length < 5;

  // Fetch Menu from API / Fallback
  useEffect(() => {
    const controller = new AbortController();
    const fetchMenu = async () => {
      setIsLoading(true);
      try {
        const res = await dedupedGet('/menu', { signal: controller.signal, timeout: 10000 });
        if (controller.signal.aborted) return;
        if (res.data && res.data.data && Array.isArray(res.data.data)) {
          const items = res.data.data.filter(item => item.isAvailable !== false);
          setMenuItems(items.length > 0 ? items : FALLBACK_ORDER_MENU);
        } else {
          setMenuItems(FALLBACK_ORDER_MENU);
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error('[OrderToday] Menu fetch failed:', err.response?.data || err.message || err);
        setMenuItems(FALLBACK_ORDER_MENU);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };
    fetchMenu();
    return () => controller.abort();
  }, []);

  const handleAdd = (id) => {
    if (!isValidObjectId(id)) {
      triggerToast('Live menu unavailable — sample items cannot be added to cart. Please try again shortly.', 'error');
      return;
    }
    // Auth Guard check
    const token = getAuthToken();
    if (!token) {
      onOpenOTP?.();
      return;
    }
    const item = menuItems.find(i => i._id === id);
    if (item) addToCart(item);
  };

  const handleRemove = (id) => {
    const currentQty = cartQuantities[id] || 0;
    if (currentQty > 0) {
      updateCartQty(id, currentQty - 1);
    }
  };

  // Filter items matching active tab
  const filteredMenu = activeDietTab === "All Plans" 
    ? menuItems 
    : menuItems.filter(item => item.goalCategory && item.goalCategory.includes(activeDietTab));

  // Calculations for Bottom Sticky Bar
  const totalItems = Object.values(cartQuantities).reduce((sum, qty) => sum + qty, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * (cartQuantities[item._id] || 0)), 0);

  // Dynamic Image Resolver
  const getImage = (item) => {
    if (!item.image || item.image.trim() === '') return "/breakfast_bowl.png";
    // Absolute URL (seeded as http://localhost:5173/...) → extract pathname only
    if (item.image.startsWith('http://') || item.image.startsWith('https://')) {
      try { return new URL(item.image).pathname; } catch { /* fall through */ }
    }
    // Relative path — ensure leading slash
    return item.image.startsWith('/') ? item.image : `/${item.image}`;
  };

  // View Cart Action: Add to Backend Cart or proceed to Checkout/Membership page
  const handleViewCart = () => {
    setActiveTab("Cart");
  };

  return (
    <div className="pt-24 pb-32 px-4 md:px-8 max-w-7xl mx-auto z-10 relative font-dmsans">
      {/* In-app Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="order-toast"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold ${
              toast.type === 'error'
                ? 'bg-red-50 border border-red-200 text-red-700'
                : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
            }`}
          >
            <span>{toast.type === 'error' ? '⚠️' : '✓'}</span>
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 font-sans">
          Order Today's Breakfast
        </h1>
        <p className="text-slate-500 text-sm md:text-base">
          Freshly prepared, goal-based breakfasts available for one-time ordering
        </p>
      </div>

      {/* Filter Horizontal Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none snap-x snap-mandatory">
        {DIETARY_TABS.map((tab) => {
          const isActive = activeDietTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveDietTab(tab)}
              className={`flex-shrink-0 snap-start px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
                isActive 
                  ? "bg-[#1F4D2C] text-white shadow-md shadow-[#1f4d2c]/20" 
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Fallback Data Banner */}
      {!isLoading && isFallback && (
        <div className="mb-6 flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium">
          <span className="text-lg">⚠️</span>
          <span>Showing sample menu — live menu is temporarily unavailable. Items cannot be added to cart until the connection is restored.</span>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <svg className="animate-spin h-8 w-8 text-[#1F4D2C]" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <span className="text-sm text-slate-500 font-semibold">Loading freshly prepared menu...</span>
        </div>
      ) : (
        /* Menu Grid */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMenu.map((item) => {
            const qty = cartQuantities[item._id] || 0;
            const isVeg = item.vegNonVeg === "Veg" || item.vegNonVeg === "Vegan";

            return (
              <div 
                key={item._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                {/* Food Image */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-50">
                  <img
                    src={getImage(item)}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Veg / Non-Veg Indicator Overlay */}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-0.5 border border-gray-200/50 flex items-center gap-1.5 shadow-sm">
                    <span className={`w-2.5 h-2.5 rounded-full border ${isVeg ? 'bg-green-600 border-green-700' : 'bg-red-600 border-red-700'}`} />
                    <span className="text-[9px] font-extrabold uppercase text-slate-700 tracking-wider">
                      {item.vegNonVeg}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#1F4D2C]">
                      {item.goalCategory ? item.goalCategory[0] : 'Balanced'}
                    </span>
                    <h3 className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-[#1F4D2C] transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-[10.5px] text-slate-400 font-mono">
                      {item.nutrition ? `${item.nutrition.calories} kcal | ${item.nutrition.protein}g Protein` : 'Balanced Nutrition'}
                    </p>
                    <p className="text-[11.5px] text-slate-500 font-dmsans line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Pricing and Action */}
                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-50">
                    <span className="text-base font-extrabold text-slate-900">
                      ₹{item.price}
                    </span>

                    {qty > 0 ? (
                      /* Stepper Control */
                      <div className="flex items-center bg-[#EAF7EB] border border-[#1F4D2C]/20 rounded-full px-2.5 py-1 text-[#1F4D2C]">
                        <button
                          onClick={() => handleRemove(item._id)}
                          className="w-5 h-5 flex items-center justify-center hover:bg-[#1F4D2C] hover:text-white rounded-full transition-colors cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold px-3 min-w-[20px] text-center">
                          {qty}
                        </span>
                        <button
                          onClick={() => handleAdd(item._id)}
                          className="w-5 h-5 flex items-center justify-center hover:bg-[#1F4D2C] hover:text-white rounded-full transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      /* Add Button */
                      <button
                        onClick={() => handleAdd(item._id)}
                        title={!isValidObjectId(item._id) ? "Offline sample item (cannot add to cart)" : "Add to Cart"}
                        className="w-9 h-9 rounded-full flex items-center justify-center border transition-all cursor-pointer bg-[#EAF7EB] text-[#1F4D2C] border-[#1F4D2C]/20 hover:bg-[#1F4D2C] hover:text-white"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Subscription Banner */}
      <div className="mt-16 bg-[#EDF8EF] rounded-[32px] border border-[#D7E9D7] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
        <div className="space-y-2 relative z-10 text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#1F4D2C]">
            Want More Breakfast Choices?
          </h2>
          <p className="text-emerald-800 text-sm max-w-xl">
            Unlock exclusive menus, personalized plans, and daily doorstep delivery.
          </p>
        </div>
        <button
          onClick={() => setActiveTab("Membership")}
          className="relative z-10 bg-[#1F4D2C] hover:bg-[#173C22] text-white text-sm font-bold px-8 py-4 rounded-full transition-colors cursor-pointer"
        >
          Explore Membership Plans
        </button>
      </div>

      {/* Sticky Bottom Bar */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-2xl z-40 py-4 px-6 md:px-12 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EAF7EB] text-[#1F4D2C] flex items-center justify-center border border-[#1F4D2C]/10">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-800">
                  {totalItems} {totalItems === 1 ? 'Dish' : 'Dishes'} Selected
                </p>
                <p className="text-xs text-slate-400">Ready for breakfast delivery</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Total Amount</p>
                <p className="text-lg md:text-xl font-extrabold text-slate-900">
                  ₹{totalPrice}
                </p>
              </div>
              <button
                onClick={handleViewCart}
                className="bg-[#1F4D2C] hover:bg-[#173C22] text-white text-sm font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-[#1f4d2c]/20 hover:shadow-xl transition-all cursor-pointer"
              >
                View Cart
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderToday;
