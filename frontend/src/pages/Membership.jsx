import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarDays,
  ArrowRight,
  ArrowLeft,
  Check,
  Crown,
  Sparkles,
  Truck,
  Plus,
  Trash2,
  MapPin,
  CreditCard,
  ChevronRight,
  CheckCircle2,
  RefreshCw,
  Info,
  DollarSign,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import axios from 'axios'
import api, { getAuthToken } from '../api'
import Footer from '../components/Footer'

// ----------------------------------------------------
// FALLBACK DATASET (FOR OFFLINE / RESILIENT OPERATION)
// ----------------------------------------------------
const FALLBACK_GOALS = [
  {
    id: "High Protein",
    emoji: "💪",
    title: "High Protein",
    description: "Optimize muscle recovery and stay satiated longer with lean protein-rich meals.",
    calories: "450-550 kcal",
    macroBadge: "35g+ Protein",
    coverImage: "/high-protein-veg.png",
    sampleDishes: ["Banana Protein Smoothie", "Balanced Diet - Egg Cheese Sandwich", "Chicken Egg Sandwich"]
  },
  {
    id: "Weight Loss",
    emoji: "🥗",
    title: "Weight Loss",
    description: "Calorie-controlled meals focused on high-volume, low-density ingredients.",
    calories: "300-400 kcal",
    macroBadge: "High Fiber",
    coverImage: "/weight-loss-veg.png",
    sampleDishes: ["Green Boost Smoothie", "Balanced Diet - Cottage Cheese salad", "Cucumber Mint Smoothie"]
  },
  {
    id: "Weight Gain",
    emoji: "🏋️",
    title: "Weight Gain",
    description: "Healthy, energy-dense ingredients to help you reach your mass goals effectively.",
    calories: "600-800 kcal",
    macroBadge: "Complex Carbs",
    coverImage: "/weight-gain-veg.png",
    sampleDishes: ["Chocolate Protein Smoothie", "Banana Nut Oats Bowl", "Peanut Butter Banana Sandwich"]
  },
  {
    id: "Balanced Diet",
    emoji: "⚖️",
    title: "Balanced Diet",
    description: "A perfect harmony of all macronutrients for general health and vitality.",
    calories: "400-500 kcal",
    macroBadge: "Balanced Macros",
    coverImage: "/balanced-diet-veg.png",
    sampleDishes: ["Balanced Diet - Herbed Paneer Sandwich", "Mediterranean Paneer Salad", "Apple Cinnamon Overnight Oats"]
  },
  {
    id: "Diabetic Friendly",
    emoji: "🩺",
    title: "Diabetic Friendly",
    description: "Low-glycemic index meals designed to help stabilize blood sugar levels.",
    calories: "Low GI",
    macroBadge: "Complex Fiber",
    coverImage: "/diabetic-friendly-veg.png",
    sampleDishes: ["Diabetic Friendly - Sprouts Garden Salad", "Herbed Tofu Sandwich", "Diabetic Friendly- Mixed Seed Smoothie"]
  }
]

const FALLBACK_PLANS = [
  { _id: "64f1a2b3c4d5e6f7a8b9c001", isFallbackData: true, goal: "Weight Loss", tier: "Std Veg", name: "Weight Loss Standard Veg", weeklyPrice: 949, deliveryDays: 5, supportsPause: false, description: "Calorie-deficit vegetarian meals to burn fat." },
  { _id: "64f1a2b3c4d5e6f7a8b9c002", isFallbackData: true, goal: "Weight Loss", tier: "Premium Veg", name: "Weight Loss Premium Veg", weeklyPrice: 1149, deliveryDays: 5, supportsPause: true, description: "Tailored deficit macros, custom vegetarian plans." },
  { _id: "64f1a2b3c4d5e6f7a8b9c003", isFallbackData: true, goal: "Weight Loss", tier: "Std Non-Veg", name: "Weight Loss Standard Non-Veg", weeklyPrice: 1149, deliveryDays: 5, supportsPause: false, description: "Low calorie lean protein non-veg meals." },
  { _id: "64f1a2b3c4d5e6f7a8b9c004", isFallbackData: true, goal: "Weight Loss", tier: "Premium Non-Veg", name: "Weight Loss Premium Non-Veg", weeklyPrice: 1349, deliveryDays: 5, supportsPause: true, description: "Tailored deficit macros, premium protein variety." },

  { _id: "64f1a2b3c4d5e6f7a8b9c005", isFallbackData: true, goal: "High Protein", tier: "Std Veg", name: "High Protein Standard Veg", weeklyPrice: 999, deliveryDays: 5, supportsPause: false, description: "Max protein density using paneer, tofu, legumes." },
  { _id: "64f1a2b3c4d5e6f7a8b9c006", isFallbackData: true, goal: "High Protein", tier: "Premium Veg", name: "High Protein Premium Veg", weeklyPrice: 1199, deliveryDays: 5, supportsPause: true, description: "Custom protein profiling, premium vegan sources." },
  { _id: "64f1a2b3c4d5e6f7a8b9c007", isFallbackData: true, goal: "High Protein", tier: "Std Non-Veg", name: "High Protein Standard Non-Veg", weeklyPrice: 1199, deliveryDays: 5, supportsPause: false, description: "Lean chicken, eggs, and fish for active lifestyles." },
  { _id: "64f1a2b3c4d5e6f7a8b9c008", isFallbackData: true, goal: "High Protein", tier: "Premium Non-Veg", name: "High Protein Premium Non-Veg", weeklyPrice: 1399, deliveryDays: 5, supportsPause: true, description: "Imported cuts, customized amino profiles." },

  { _id: "64f1a2b3c4d5e6f7a8b9c009", isFallbackData: true, goal: "Weight Gain", tier: "Std Veg", name: "Weight Gain Standard Veg", weeklyPrice: 949, deliveryDays: 5, supportsPause: false, description: "Calorie-surplus clean vegetarian meals for bulking." },
  { _id: "64f1a2b3c4d5e6f7a8b9c010", isFallbackData: true, goal: "Weight Gain", tier: "Premium Veg", name: "Weight Gain Premium Veg", weeklyPrice: 1149, deliveryDays: 5, supportsPause: true, description: "High-protein surplus macros, organic additions." },
  { _id: "64f1a2b3c4d5e6f7a8b9c011", isFallbackData: true, goal: "Weight Gain", tier: "Std Non-Veg", name: "Weight Gain Standard Non-Veg", weeklyPrice: 1149, deliveryDays: 5, supportsPause: false, description: "Calorie-dense non-vegetarian meals." },
  { _id: "64f1a2b3c4d5e6f7a8b9c012", isFallbackData: true, goal: "Weight Gain", tier: "Premium Non-Veg", name: "Weight Gain Premium Non-Veg", weeklyPrice: 1349, deliveryDays: 5, supportsPause: true, description: "Premium protein sources, customized caloric profiling." },

  { _id: "64f1a2b3c4d5e6f7a8b9c013", isFallbackData: true, goal: "Balanced Diet", tier: "Std Veg", name: "Balanced Diet Standard Veg", weeklyPrice: 899, deliveryDays: 5, supportsPause: false, description: "Balanced macros, daily vegetarian variety." },
  { _id: "64f1a2b3c4d5e6f7a8b9c014", isFallbackData: true, goal: "Balanced Diet", tier: "Premium Veg", name: "Balanced Diet Premium Veg", weeklyPrice: 1099, deliveryDays: 5, supportsPause: true, description: "Premium ingredients, chef specials, customized macros." },
  { _id: "64f1a2b3c4d5e6f7a8b9c015", isFallbackData: true, goal: "Balanced Diet", tier: "Std Non-Veg", name: "Balanced Diet Standard Non-Veg", weeklyPrice: 1099, deliveryDays: 5, supportsPause: false, description: "Balanced macros with high-quality lean meats." },
  { _id: "64f1a2b3c4d5e6f7a8b9c016", isFallbackData: true, goal: "Balanced Diet", tier: "Premium Non-Veg", name: "Balanced Diet Premium Non-Veg", weeklyPrice: 1299, deliveryDays: 5, supportsPause: true, description: "Premium ingredients, seafood, tender meat selections." },

  { _id: "64f1a2b3c4d5e6f7a8b9c017", isFallbackData: true, goal: "Diabetic Friendly", tier: "Std Veg", name: "Diabetic Friendly Standard Veg", weeklyPrice: 949, deliveryDays: 5, supportsPause: false, description: "Low GI index vegetarian breakfast options." },
  { _id: "64f1a2b3c4d5e6f7a8b9c018", isFallbackData: true, goal: "Diabetic Friendly", tier: "Premium Veg", name: "Diabetic Friendly Premium Veg", weeklyPrice: 1149, deliveryDays: 5, supportsPause: true, description: "Low GI, organic fiber, customized glycemic control." },
  { _id: "64f1a2b3c4d5e6f7a8b9c019", isFallbackData: true, goal: "Diabetic Friendly", tier: "Std Non-Veg", name: "Diabetic Friendly Standard Non-Veg", weeklyPrice: 1149, deliveryDays: 5, supportsPause: false, description: "Low GI lean protein options." },
  { _id: "64f1a2b3c4d5e6f7a8b9c020", isFallbackData: true, goal: "Diabetic Friendly", tier: "Premium Non-Veg", name: "Diabetic Friendly Premium Non-Veg", weeklyPrice: 1349, deliveryDays: 5, supportsPause: true, description: "Custom insulin profiling, premium low-glycemic meats." },
]

const FALLBACK_WEEKLY_MENU = [
  {
    day: "Monday",
    mealSlot: "Breakfast",
    dish: {
      _id: "64f1a2b3c4d5e6f7a8b90001",
      menuId: "64f1a2b3c4d5e6f7a8b90001",
      isFallbackData: true,
      name: "Apple Cinnamon Overnight Oats",
      description: "Creamy oats soaked overnight in almond milk with crisp apples, chia seeds, and cinnamon.",
      category: "Bowl",
      vegNonVeg: "Veg",
      nutrition: { calories: 380, protein: 12, carbs: 54, fats: 8, fiber: 9 },
      ingredients: ["Rolled Oats", "Almond Milk", "Apple Slices", "Chia Seeds", "Cinnamon", "Honey"],
      removableIngredients: [{ name: "Honey" }, { name: "Cinnamon" }],
      optionalAddons: [{ name: "Extra Whey Protein Scoop", extraPrice: 60 }, { name: "Sliced Almonds", extraPrice: 30 }],
      allergens: ["Nuts"],
      price: 180,
      image: "Apple Cinnamon Overnight Oats.png"
    }
  },
  {
    day: "Tuesday",
    mealSlot: "Breakfast",
    dish: {
      _id: "64f1a2b3c4d5e6f7a8b90002",
      menuId: "64f1a2b3c4d5e6f7a8b90002",
      isFallbackData: true,
      name: "Chicken Egg Sandwich",
      description: "Lean pulled chicken breast with fluffy egg whites and spinach on toasted whole-wheat sourdough.",
      category: "Sandwich",
      vegNonVeg: "Non-Veg",
      nutrition: { calories: 450, protein: 32, carbs: 32, fats: 14, fiber: 5 },
      ingredients: ["Pulled Chicken", "Egg Whites", "Spinach", "Whole Wheat Bread", "Light Mayo"],
      removableIngredients: [{ name: "Light Mayo" }, { name: "Spinach" }],
      optionalAddons: [{ name: "Extra Chicken", extraPrice: 80 }, { name: "Cheddar Cheese Slice", extraPrice: 40 }],
      allergens: ["Gluten", "Eggs"],
      price: 240,
      image: "Chicken Egg Sandwich.png"
    }
  },
  {
    day: "Wednesday",
    mealSlot: "Breakfast",
    dish: {
      _id: "64f1a2b3c4d5e6f7a8b90003",
      menuId: "64f1a2b3c4d5e6f7a8b90003",
      isFallbackData: true,
      name: "Cottage Cheese Salad",
      description: "Thick blocks of fresh low-fat paneer tossed with cherry tomatoes, cucumbers, olives, and mint dressing.",
      category: "Salad",
      vegNonVeg: "Veg",
      nutrition: { calories: 320, protein: 22, carbs: 12, fats: 18, fiber: 4 },
      ingredients: ["Cottage Cheese", "Cherry Tomatoes", "Cucumber", "Black Olives", "Mint Vinaigrette"],
      removableIngredients: [{ name: "Black Olives" }, { name: "Mint Vinaigrette" }],
      optionalAddons: [{ name: "Avocado Slices", extraPrice: 100 }, { name: "Mixed Seeds", extraPrice: 30 }],
      allergens: ["Dairy"],
      price: 210,
      image: "Balanced Diet - Cottage Cheese salad.png"
    }
  },
  {
    day: "Thursday",
    mealSlot: "Breakfast",
    dish: {
      _id: "64f1a2b3c4d5e6f7a8b90004",
      menuId: "64f1a2b3c4d5e6f7a8b90004",
      isFallbackData: true,
      name: "Banana Protein Smoothie",
      description: "Blended ripe bananas, vegetarian protein isolate, creamy peanut butter, and skimmed milk.",
      category: "Smoothie",
      vegNonVeg: "Veg",
      nutrition: { calories: 420, protein: 28, carbs: 48, fats: 12, fiber: 6 },
      ingredients: ["Bananas", "Whey Isolate", "Peanut Butter", "Skimmed Milk", "Dates"],
      removableIngredients: [{ name: "Peanut Butter" }, { name: "Dates" }],
      optionalAddons: [{ name: "Chia Seed Mix", extraPrice: 20 }, { name: "Double Whey Scoop", extraPrice: 80 }],
      allergens: ["Peanuts", "Dairy"],
      price: 190,
      image: "Banana Protein Smoothie.png"
    }
  },
  {
    day: "Friday",
    mealSlot: "Breakfast",
    dish: {
      _id: "64f1a2b3c4d5e6f7a8b90005",
      menuId: "64f1a2b3c4d5e6f7a8b90005",
      isFallbackData: true,
      name: "Herbed Paneer Sandwich",
      description: "Marinated paneer steak in fresh green herbs grilled and layered on crisp romaine leaves in brown bread.",
      category: "Sandwich",
      vegNonVeg: "Veg",
      nutrition: { calories: 410, protein: 18, carbs: 36, fats: 16, fiber: 5 },
      ingredients: ["Paneer Steak", "Romaine Lettuce", "Green Chutney", "Whole Wheat Bread"],
      removableIngredients: [{ name: "Green Chutney" }],
      optionalAddons: [{ name: "Feta Cheese Crumble", extraPrice: 50 }, { name: "Sautéed Mushrooms", extraPrice: 40 }],
      allergens: ["Gluten", "Dairy"],
      price: 220,
      image: "Balanced Diet - Herbed Paneer Sandwich.png"
    }
  }
]

const FALLBACK_ALTERNATIVES = [
  {
    _id: "64f1a2b3c4d5e6f7a8b9a001",
    menuId: "64f1a2b3c4d5e6f7a8b9a001",
    isFallbackData: true,
    name: "Green Boost Smoothie",
    category: "Smoothie",
    vegNonVeg: "Veg",
    price: 180,
    nutrition: { calories: 280, protein: 8, carbs: 42, fats: 4, fiber: 8 },
    ingredients: ["Spinach", "Green Apples", "Celery", "Cucumber", "Spirulina Powder", "Coconut Water"],
    optionalAddons: [{ name: "Chia Seeds", extraPrice: 20 }],
    removableIngredients: [{ name: "Celery" }],
    allergens: [],
    image: "Green Boost Smoothie.png"
  },
  {
    _id: "64f1a2b3c4d5e6f7a8b9a002",
    menuId: "64f1a2b3c4d5e6f7a8b9a002",
    isFallbackData: true,
    name: "Banana Nut Oats Bowl",
    category: "Bowl",
    vegNonVeg: "Veg",
    price: 190,
    nutrition: { calories: 410, protein: 14, carbs: 58, fats: 11, fiber: 8 },
    ingredients: ["Oats", "Banana Slices", "Walnuts", "Almond Butter", "Oat Milk"],
    optionalAddons: [{ name: "Cacao Nibs", extraPrice: 30 }],
    removableIngredients: [{ name: "Walnuts" }],
    allergens: ["Nuts"],
    image: "Banana Nut Oats Bowl.png"
  },
  {
    _id: "64f1a2b3c4d5e6f7a8b9a003",
    menuId: "64f1a2b3c4d5e6f7a8b9a003",
    isFallbackData: true,
    name: "Peanut Butter Banana Sandwich",
    category: "Sandwich",
    vegNonVeg: "Veg",
    price: 160,
    nutrition: { calories: 490, protein: 16, carbs: 52, fats: 21, fiber: 6 },
    ingredients: ["Natural Peanut Butter", "Banana Slices", "Whole Wheat Toast", "Honey Drop"],
    optionalAddons: [{ name: "Sliced Strawberries", extraPrice: 40 }],
    removableIngredients: [{ name: "Honey Drop" }],
    allergens: ["Peanuts", "Gluten"],
    image: "Peanut Butter Banana Sandwich.png"
  },
  {
    _id: "64f1a2b3c4d5e6f7a8b9a004",
    menuId: "64f1a2b3c4d5e6f7a8b9a004",
    isFallbackData: true,
    name: "Sprouts Garden Salad",
    category: "Salad",
    vegNonVeg: "Veg",
    price: 170,
    nutrition: { calories: 250, protein: 12, carbs: 28, fats: 5, fiber: 9 },
    ingredients: ["Moong Sprouts", "Pomegranate Seeds", "Onions", "Coriander Leaves", "Lemon Dressing"],
    optionalAddons: [{ name: "Feta Cheese Crumble", extraPrice: 50 }],
    removableIngredients: [{ name: "Onions" }],
    allergens: [],
    image: "Diabetic Friendly - Sprouts Garden Salad.png"
  }
]

export default function Membership({
  setActiveTab,
  onOpenOTP
}) {
  // ----------------------------------------------------
  // STATE MANAGEMENT
  // ----------------------------------------------------
  const [step, setStep] = useState(1) // Steps: 1, 2, 3, 4

  const [selectedGoal, setSelectedGoal] = useState("")

  useEffect(() => {
    if (step > 1 && !selectedGoal) {
      setStep(1)
    }
  }, [step, selectedGoal])
  const [prefVeg, setPrefVeg] = useState(true) // true = Veg, false = Non-Veg
  const [selectedTier, setSelectedTier] = useState("Standard") // Standard vs Premium
  const [plans, setPlans] = useState([])
  const [activePlan, setActivePlan] = useState(null)

  // Weekly menu state
  const [weeklyMenu, setWeeklyMenu] = useState([])
  const [selectedDay, setSelectedDay] = useState("Monday")
  const [activeCategory, setActiveCategory] = useState("All")

  // Customization mappings
  const [removedIngredients, setRemovedIngredients] = useState({}) // { [menuId]: [ingredientName] }
  const [selectedAddons, setSelectedAddons] = useState({}) // { [menuId]: [addonObject] }
  const [swappedDishes, setSwappedDishes] = useState({}) // { [day]: dishObject }

  // Alternatives swapper drawer
  const [isSwapOpen, setIsSwapOpen] = useState(false)
  const [swapTargetDay, setSwapTargetDay] = useState(null)
  const [alternativesList, setAlternativesList] = useState([])
  const [loadingAlternatives, setLoadingAlternatives] = useState(false)

  // Loading states
  const [loadingMenu, setLoadingMenu] = useState(false)
  const [loadingPlans, setLoadingPlans] = useState(false)

  // Checkout Info
  const [shippingForm, setShippingForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "Ernakulam",
    state: "Kerala",
    houseNo: "",
    building: "",
    street: "",
    area: "",
    landmark: "",
    pincode: "",
    deliverySlot: "7:00 AM - 8:00 AM"
  })
  const [formErrors, setFormErrors] = useState({})

  // Helper to update form and clear error for that field
  const updateShippingField = (field, value) => {
    setShippingForm(prev => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors(prev => {
        const copy = { ...prev }
        delete copy[field]
        return copy
      })
    }
  }

  // Delivery Radius & Pricing Check State
  const [deliveryInfo, setDeliveryInfo] = useState(null) // { distanceKm, deliveryCharge, isFree, available }
  const [deliveryError, setDeliveryError] = useState("")
  const [isCheckingDelivery, setIsCheckingDelivery] = useState(false)

  // Coupons & Billing
  const [couponCode, setCouponCode] = useState("")
  const [appliedDiscount, setAppliedDiscount] = useState(0) // 0 to 1 decimal
  const [couponStatus, setCouponStatus] = useState({ message: "", success: false })

  // Payments
  const [paymentMethod, setPaymentMethod] = useState("UPI") // UPI or Card
  const [cardDetails, setCardDetails] = useState({ number: "", expiry: "", cvv: "" })
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutSuccess, setCheckoutSuccess] = useState(false)
  const [generatedOrder, setGeneratedOrder] = useState(null)

  // Auth protection check
  const checkAuthToken = () => {
    return getAuthToken()
  }

  // Toast feedback
  const [toast, setToast] = useState({ show: false, message: "", type: "info" })
  const triggerToast = (msg, type = "info") => {
    setToast({ show: true, message: msg, type })
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }))
    }, 3000)
  }

  const handleSelectTierAndContinue = (tier) => {
    if (!selectedGoal) {
      triggerToast("Please select a health goal first", "error")
      return
    }
    setSelectedTier(tier)
    triggerToast(`Selected ${tier} Plan`, "success")
    setStep(2)
  }

  // Card expand/collapse toggles
  const [expandedCards, setExpandedCards] = useState({}) // { [menuId]: boolean }
  const toggleCardExpand = (menuId) => {
    setExpandedCards(prev => ({ ...prev, [menuId]: !prev[menuId] }))
  }

  // ----------------------------------------------------
  // HOOKS: SYNC / FETCHING DATA
  // ----------------------------------------------------
  // Fetch plans on goal selection
  useEffect(() => {
    if (!selectedGoal) return

    // Load fallback IMMEDIATELY — no delay
    const filtered = FALLBACK_PLANS.filter(p => p.goal === selectedGoal)
    setPlans(filtered)
    setLoadingPlans(false)

    // Try API in background
    let cancelled = false;
    api.get('/plans', {
      params: { goal: selectedGoal },
      timeout: 3000
    })
      .then(res => {
        if (cancelled) return;
        if (res.data && res.data.success && res.data.data.length > 0) {
          setPlans(res.data.data)
        }
      })
      .catch(() => { })

    return () => { cancelled = true; };
  }, [selectedGoal])

  // Select matching plan whenever tier or veg toggle updates
  useEffect(() => {
    if (!plans || plans.length === 0) return

    const tierString = `${selectedTier === "Standard" ? "Std" : "Premium"} ${prefVeg ? "Veg" : "Non-Veg"}`
    const match = plans.find(p => p.tier === tierString)

    if (match) {
      setActivePlan(match)
    } else {
      // Pick first plan if perfect matches fail
      setActivePlan(plans[0])
    }
  }, [plans, selectedTier, prefVeg])

  // Load weekly menu when active plan is set
  useEffect(() => {
    if (!activePlan) return

    // Load fallback IMMEDIATELY — no delay
    setWeeklyMenu(FALLBACK_WEEKLY_MENU)
    setLoadingMenu(false)

    // Try API in background
    let cancelled = false;
    api.get('/plans/weekly-menu', {
      params: {
        goal: activePlan.goal,
        tier: activePlan.tier
      },
      timeout: 5000
    })
      .then(res => {
        if (cancelled) return;
        console.log('[Membership] /plans/weekly-menu response:', res.data);
        if (res.data && res.data.success && res.data.menu && res.data.menu.length > 0) {
          setWeeklyMenu(res.data.menu)
        }
      })
      .catch((err) => { console.warn('[Membership] weekly-menu fetch failed:', err.message) })

    return () => { cancelled = true; };
  }, [activePlan])

  // ----------------------------------------------------
  // CUSTOMIZATION HANDLERS
  // ----------------------------------------------------
  const handleRemoveIngredient = (menuId, ingName) => {
    setRemovedIngredients(prev => {
      const existing = prev[menuId] || []
      const updated = existing.includes(ingName)
        ? existing.filter(i => i !== ingName)
        : [...existing, ingName]
      return { ...prev, [menuId]: updated }
    })
    triggerToast(`${ingName} customization updated`, "info")
  }

  const handleToggleAddon = (menuId, addon) => {
    setSelectedAddons(prev => {
      const existing = prev[menuId] || []
      const exists = existing.some(a => a.name === addon.name)
      const updated = exists
        ? existing.filter(a => a.name !== addon.name)
        : [...existing, addon]
      return { ...prev, [menuId]: updated }
    })
    triggerToast(`${addon.name} addon updated`, "success")
  }

  // Load alternatives for day swapper
  const openSwapDrawer = (day) => {
    if (!activePlan) return
    setSwapTargetDay(day)
    setIsSwapOpen(true)
    setAlternativesList(FALLBACK_ALTERNATIVES)
    setLoadingAlternatives(false)

    // Try API in background
    api.get(`/plans/${activePlan._id}/day-options`, {
      params: { day },
      timeout: 3000
    })
      .then(res => {
        if (res.data && res.data.success && res.data.data && res.data.data.alternatives) {
          setAlternativesList(res.data.data.alternatives)
        }
      })
      .catch(() => { })
  }

  const selectAlternativeDish = (dish) => {
    setSwappedDishes(prev => ({
      ...prev,
      [swapTargetDay]: dish
    }))
    setIsSwapOpen(false)
    triggerToast(`Swapped scheduled breakfast to ${dish.name}!`, "success")
  }

  const resetAlternativeDish = (day) => {
    setSwappedDishes(prev => {
      const copy = { ...prev }
      delete copy[day]
      return copy
    })
    triggerToast(`Reset to original meal choice`, "info")
  }

  // ----------------------------------------------------
  // SHIPPING VALIDATION & GEOCODING DELIVERY CHECK
  // ----------------------------------------------------
  const handleValidateForm = () => {
    const errors = {}
    if (!shippingForm.name.trim()) errors.name = "Full Name is required."

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!shippingForm.email.trim()) {
      errors.email = "Email is required."
    } else if (!emailRegex.test(shippingForm.email)) {
      errors.email = "Please enter a valid email address."
    }

    const phoneRegex = /^[6-9][0-9]{9}$/
    if (!shippingForm.phone.trim()) {
      errors.phone = "Phone number is required."
    } else if (!phoneRegex.test(shippingForm.phone)) {
      errors.phone = "Enter a valid 10-digit mobile number starting with 6-9."
    }

    if (!shippingForm.houseNo?.trim()) errors.houseNo = "House / Flat number is required."
    if (!shippingForm.building?.trim()) errors.building = "Building name is required."
    if (!shippingForm.street?.trim()) errors.street = "Street address is required."
    if (!shippingForm.area?.trim()) errors.area = "Area / Locality is required."

    const pinRegex = /^[0-9]{6}$/
    if (!shippingForm.pincode.trim()) {
      errors.pincode = "Pincode is required."
    } else if (!pinRegex.test(shippingForm.pincode)) {
      errors.pincode = "Enter a valid 6-digit postal code."
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const triggerDeliveryCheck = async (formState = shippingForm) => {
    if (!formState.pincode || formState.pincode.length < 6) return
    setIsCheckingDelivery(true)
    setDeliveryError("")
    try {
      let lat = 10.0170
      let lng = 76.3440
      const kakkanadPincodes = ["682042", "682030", "682037", "682021", "682028", "682039", "682024"]
      if (kakkanadPincodes.includes(formState.pincode.trim()) || (formState.area && formState.area.toLowerCase().includes('kakkanad'))) {
        lat = 10.0120
        lng = 76.3580
      } else {
        const addressQuery = encodeURIComponent(`${formState.area || ''} ${formState.pincode}, India`)
        let geoRes = null
        try {
          geoRes = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${addressQuery}`, { timeout: 3000 })
        } catch (geoErr) { }
        if (geoRes && geoRes.data && geoRes.data.length > 0) {
          const parsedLat = parseFloat(geoRes.data[0].lat)
          const parsedLng = parseFloat(geoRes.data[0].lon)
          const rad = Math.PI / 180
          const dLat = (parsedLat - 10.0170) * rad
          const dLon = (parsedLng - 76.3440) * rad
          const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(10.0170 * rad) * Math.cos(parsedLat * rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
          const dist = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
          if (dist > 10) {
            setDeliveryInfo(null)
            setDeliveryError(`Sorry, we deliver only within 10 km. This location is ${dist.toFixed(1)} km away.`)
            return
          }
          lat = parsedLat
          lng = parsedLng
        }
      }
      let res = null
      try {
        res = await api.get(`/orders/delivery-check?lat=${lat}&lng=${lng}`, { timeout: 3000 })
      } catch (apiErr) { }
      if (res && res.data && res.data.data) {
        const data = res.data.data
        const distanceKm = data.distanceKm
        if (distanceKm > 10 || !data.available) {
          setDeliveryInfo(null)
          setDeliveryError("Sorry, we deliver only within 10 km of our kitchen.")
        } else {
          const isPremiumTier = selectedTier === "Premium"
          let deliveryCharge = 0
          let isFree = false
          if (isPremiumTier) {
            deliveryCharge = distanceKm <= 4 ? 0 : Math.ceil(distanceKm - 4) * 10
            isFree = distanceKm <= 4
          } else {
            deliveryCharge = data.standard ? data.standard.charge : (distanceKm <= 4 ? 40 : 40 + Math.ceil(distanceKm - 4) * 10)
            isFree = false
          }
          setDeliveryInfo({ distanceKm, deliveryCharge, isFree, available: true })
          setDeliveryError("")
        }
      } else {
        const isPremiumTier = selectedTier === "Premium"
        setDeliveryInfo({ distanceKm: 3, deliveryCharge: isPremiumTier ? 0 : 40, isFree: isPremiumTier, available: true })
        setDeliveryError("")
      }
    } catch (err) {
      setDeliveryInfo(null)
      setDeliveryError("Delivery check failed.")
    } finally {
      setIsCheckingDelivery(false)
    }
  }

  useEffect(() => {
    if (step === 3 && shippingForm.pincode.length === 6) {
      const debounce = setTimeout(() => { triggerDeliveryCheck(shippingForm) }, 800)
      return () => clearTimeout(debounce)
    }
    if (step !== 3) { setIsCheckingDelivery(false) }
  }, [step, shippingForm.pincode, shippingForm.area, selectedTier])

  const checkHasFallbackData = () => {
    if (activePlan?.isFallbackData) return true
    const usedDishes = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(
      day => swappedDishes[day] || weeklyMenu.find(m => m.day === day)?.dish
    )
    return usedDishes.some(d => d?.isFallbackData)
  }
  // Transition to Step 3 with Auth Guard
  const handleProceedToStep3 = () => {
    if (!activePlan) {
      triggerToast("Please select a health goal and plan first", "error")
      setStep(1)
      return
    }

    if (checkHasFallbackData()) {
      triggerToast("We're having trouble loading fresh menu data. Please wait a moment and refresh the page before continuing your order.", "error")
      return
    }

    const token = checkAuthToken()
    if (!token) {
      triggerToast("Please log in to continue with your membership address", "info")
      onOpenOTP?.()
      return
    }
    setStep(3)
  }

  const handleNextToPayment = () => {
    if (checkHasFallbackData()) {
      triggerToast("We're having trouble loading fresh menu data. Please wait a moment and refresh the page before continuing your order.", "error")
      return
    }

    const token = checkAuthToken()
    if (!token) {
      triggerToast("Please log in to continue", "error")
      onOpenOTP?.()
      return
    }

    if (!handleValidateForm()) {
      // Find the first missing or invalid required field name to show a specific helpful toast message
      const missingFields = []
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const phoneRegex = /^[0-9]{10}$/
      const pinRegex = /^[0-9]{6}$/

      if (!shippingForm.name.trim()) missingFields.push("Full Name")
      if (!shippingForm.email.trim() || !emailRegex.test(shippingForm.email)) missingFields.push("Valid Email Address")
      if (!shippingForm.phone.trim() || !phoneRegex.test(shippingForm.phone)) missingFields.push("Valid 10-digit Mobile Number")
      if (!shippingForm.houseNo?.trim()) missingFields.push("House / Flat No.")
      if (!shippingForm.building?.trim()) missingFields.push("Building Name")
      if (!shippingForm.street?.trim()) missingFields.push("Street")
      if (!shippingForm.area?.trim()) missingFields.push("Area / Locality")
      if (!shippingForm.pincode.trim() || !pinRegex.test(shippingForm.pincode)) missingFields.push("Valid 6-digit Pincode")

      if (missingFields.length > 0) {
        triggerToast(`Please fill required field: ${missingFields[0]}`, "error")
      } else {
        const firstErrorKey = Object.keys(formErrors)[0]
        const firstErrorMsg = formErrors[firstErrorKey]
        triggerToast(firstErrorMsg || "Please fix form validation errors", "error")
      }
      return
    }

    if (deliveryError || (deliveryInfo && !deliveryInfo.available)) {
      triggerToast(deliveryError || "Delivery is unavailable for this address.", "error")
      return
    }

    setStep(4)
  }

  // ----------------------------------------------------
  // COUPON VALIDATION
  // ----------------------------------------------------
  const handleApplyCoupon = () => {
    const promo = couponCode.trim().toUpperCase()
    if (promo === "NUTRI20") {
      setAppliedDiscount(0.20)
      setCouponStatus({ message: "Promo 'NUTRI20' applied! 20% off your weekly subscription.", success: true })
      triggerToast("20% coupon applied!", "success")
    } else if (promo === "WELCOME50") {
      setAppliedDiscount(0.50)
      setCouponStatus({ message: "Promo 'WELCOME50' applied! 50% off your weekly subscription.", success: true })
      triggerToast("50% coupon applied!", "success")
    } else if (!promo) {
      setCouponStatus({ message: "Please enter a coupon code.", success: false })
    } else {
      setAppliedDiscount(0)
      setCouponStatus({ message: "Invalid coupon code. Try 'NUTRI20' or 'WELCOME50'", success: false })
      triggerToast("Invalid coupon code", "error")
    }
  }

  // ----------------------------------------------------
  // CHECKOUT PRICE CALCULATOR
  // ----------------------------------------------------
  const calculateBilling = () => {
    const basePrice = activePlan ? activePlan.weeklyPrice : 999

    // Sum addon costs across all days/slots
    let addonTotal = 0
    Object.values(selectedAddons).forEach(addons => {
      addons.forEach(a => {
        addonTotal += (a.extraPrice || 0)
      })
    })

    const subTotal = basePrice + addonTotal
    const discountAmount = Math.round(subTotal * appliedDiscount)

    // Delivery charge from backend check or fallback
    const deliveryCharge = deliveryInfo ? deliveryInfo.deliveryCharge : (selectedTier === "Premium" ? 0 : 40)

    // GST 5% on subtotal after discount
    const gstAmount = parseFloat(((subTotal - discountAmount) * 0.05).toFixed(2))

    const grandTotal = parseFloat((subTotal - discountAmount + deliveryCharge + gstAmount).toFixed(2))

    return {
      basePrice,
      addonTotal,
      subTotal,
      discountAmount,
      deliveryCharge,
      gstAmount,
      grandTotal
    }
  }

  // ----------------------------------------------------
  // COMPLETING CHECKOUT
  // ----------------------------------------------------
  const getDishId = (dish) => dish?._id || dish?.menuId || null

  const handleCompletePayment = async () => {
    if (paymentMethod === "Card") {
      if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv) {
        triggerToast("Please fill in card details", "error")
        return
      }
    }

    const token = checkAuthToken()
    if (!token) {
      triggerToast("Please log in to continue", "error")
      onOpenOTP?.()
      return
    }

    if (checkHasFallbackData()) {
      triggerToast("We're having trouble loading fresh menu data. Please wait a moment and refresh the page before continuing your order.", "error")
      return
    }

    setCheckoutLoading(true)

    const addressStr = `${shippingForm.houseNo ? shippingForm.houseNo + ', ' : ''}${shippingForm.building ? shippingForm.building + ', ' : ''}${shippingForm.street ? shippingForm.street + ', ' : ''}${shippingForm.area ? shippingForm.area + ', ' : ''}${shippingForm.city} - ${shippingForm.pincode}`

    const todayDate = new Date()
    const nextMondayDate = new Date(todayDate)
    const dayOfWeek = todayDate.getDay()
    let daysUntilNextMonday = 0
    if (dayOfWeek === 0) {
      daysUntilNextMonday = 1
    } else {
      daysUntilNextMonday = 8 - dayOfWeek
    }
    nextMondayDate.setDate(todayDate.getDate() + daysUntilNextMonday)
    nextMondayDate.setHours(0, 0, 0, 0)
    const nextMondayISO = nextMondayDate.toISOString()

    try {
      const mealSchedule = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(dayName => {
        const rawDish = swappedDishes[dayName] || weeklyMenu.find(m => m.day === dayName)?.dish
        if (!rawDish) {
          throw new Error(`Meal schedule missing dish for ${dayName}`)
        }
        const dishId = getDishId(rawDish)
        const addedAddons = (selectedAddons[dishId] || []).map(addon => ({
          addonId: addon._id || addon.addonId || String(addon.name),
          addonName: addon.name || addon.addonName,
          addonPrice: addon.extraPrice !== undefined ? addon.extraPrice : (addon.addonPrice || 0)
        }))
        const removedIngs = removedIngredients[dishId] || []
        return {
          day: dayName,
          menuItemId: dishId,
          removedIngredients: removedIngs,
          addedAddons,
          isCustomized: removedIngs.length > 0 || addedAddons.length > 0
        }
      })

      const subscriptionPayload = {
        planId: activePlan._id,
        startDate: nextMondayISO,
        deliveryAddress: {
          fullName: shippingForm.name,
          phone: shippingForm.phone,
          houseNo: shippingForm.houseNo,
          buildingName: shippingForm.building,
          street: shippingForm.street,
          area: shippingForm.area,
          city: shippingForm.city,
          state: shippingForm.state,
          pincode: shippingForm.pincode,
          landmark: shippingForm.landmark || undefined,
          deliveryInstructions: shippingForm.deliverySlot
        },
        mealSchedule,
        paymentMethod: paymentMethod === "Card" ? "Credit Card" : "UPI",
        paymentStatus: "Pending"
      }

      try {
        const res = await api.post('/subscriptions', subscriptionPayload, { timeout: 5000 })

        if (res.data && res.data.success) {
          const subId = res.data.data._id || res.data.data.subscriptionId

          try {
            const payOrderRes = await api.post('/payment/create-order', { subscriptionId: subId }, { timeout: 5000 })
            if (payOrderRes.data && payOrderRes.data.success) {
              const gatewayOrderId = payOrderRes.data.data.gatewayOrderId
              try {
                await api.post('/payment/verify', {
                  gatewayOrderId,
                  paymentMethod: paymentMethod === "Card" ? "Credit Card" : "UPI"
                }, { timeout: 5000 })
              } catch (verifyErr) { }
            }
          } catch (payErr) { }

          setCheckoutSuccess(true)
          const billing = calculateBilling()
          setGeneratedOrder({
            orderId: subId || ("NF-" + Math.floor(100000 + Math.random() * 900000)),
            goal: selectedGoal,
            tier: activePlan?.tier,
            price: billing.grandTotal,
            deliveryStart: nextMondayDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
            address: addressStr,
            slot: shippingForm.deliverySlot,
            isOrderOnly: false
          })
          triggerToast("Subscription activated successfully!", "success")
        }
      } catch (err) {
        console.error('Subscription creation failed:', JSON.stringify(err.response?.data, null, 2))
        if (err.response) {
          // Real backend HTTP error (409 Conflict, 400, 401, 403, 500)
          const status = err.response.status
          const data = err.response.data
          let errorMessage = "Failed to create subscription. Please try again."
          if (status === 409) {
            errorMessage = data?.message || "You already have an active or pending subscription."
          } else if (status === 401) {
            errorMessage = "Please log in again."
          } else if (status === 403) {
            errorMessage = data?.message || "Feature restricted."
          } else if (status === 400) {
            errorMessage = data?.message || data?.error?.message || "Invalid input data."
          } else if (data?.message) {
            errorMessage = data.message
          }
          triggerToast(errorMessage, "error")
          return
        } else {
          // Network level failure (backend down / no response)
          console.warn("Backend server unreachable:", err?.message || err)
          setCheckoutSuccess(true)
          const billing = calculateBilling()
          setGeneratedOrder({
            orderId: "NF-" + Math.floor(100000 + Math.random() * 900000),
            goal: selectedGoal,
            tier: activePlan?.tier,
            price: billing.grandTotal,
            deliveryStart: nextMondayDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
            address: addressStr,
            slot: shippingForm.deliverySlot,
            isOrderOnly: false
          })
          triggerToast("Subscription activated (offline mode)", "success")
        }
      }
    } catch (err) {
      console.error("Subscription Checkout Error:", err)
      triggerToast(err.message || "Failed to create subscription.", "error")
    } finally {
      setCheckoutLoading(false)
    }
  }

  const billingInfo = calculateBilling()
  // Find dish detail matching active filters
  const getActiveDayDish = (day) => {
    // If swapped, return the swapped dish
    if (swappedDishes[day]) {
      return swappedDishes[day]
    }
    // Find in fetched weekly menu
    const record = weeklyMenu.find(m => m.day === day)
    return record ? record.dish : null
  }

  // ----------------------------------------------------
  // HTML RESOLVERS FOR IMAGES
  // ----------------------------------------------------
  // Accepts a full dish object OR a plain dish name string.
  // Handles three image formats:
  //   1. Absolute URL (http://localhost:5173/Foo%20Bar.png) → extract pathname only
  //   2. Relative path with or without leading slash → normalise to /path
  //   3. No image → construct path from dish.name
  const getImageForDish = (dishOrName) => {
    if (!dishOrName) return "/breakfast_bowl.png"
    // Plain string (e.g. from g.sampleDishes goal-card thumbnails)
    if (typeof dishOrName === 'string') {
      return `/${encodeURIComponent(dishOrName)}.png`
    }
    const img = dishOrName.image
    if (img && img.trim() !== '') {
      // Case 1: Absolute URL — only strip to a local pathname if it points at OUR OWN origin.
      // Genuine external URLs (Cloudinary, S3, etc.) must be used as-is.
      if (img.startsWith('http://') || img.startsWith('https://')) {
        try {
          const parsed = new URL(img)
          if (typeof window !== 'undefined' && parsed.origin === window.location.origin) {
            return parsed.pathname
          }
          return img   // external URL — use directly
        } catch {
          // Malformed URL — fall through to name fallback
        }
      }
      // Case 2: Relative path — ensure leading slash
      return img.startsWith('/') ? img : `/${img}`
    }
    // Case 3: No image field — construct from dish name
    if (dishOrName.name) return `/${encodeURIComponent(dishOrName.name)}.png`
    return "/breakfast_bowl.png"
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-primary-light">
      {/* Back to Home Button — Sticky Top Left */}
      <button
        onClick={() => setActiveTab("Home")}
        className="fixed top-20 left-4 md:left-8 z-50 flex items-center gap-2 backdrop-blur-sm text-gray-700 hover:text-gray-900 px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 group cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
      </button>

      <div className="pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto z-10 relative font-dmsans flex-1 w-full">
        {/* Toast popup */}
        <AnimatePresence>
          {toast.show && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className={`fixed bottom-6 right-6 px-5 py-3.5 rounded-xl shadow-2xl z-50 flex items-center gap-3 text-white border text-sm font-medium ${toast.type === "success"
                ? "bg-[#1F4D2C] border-[#3F9A45] shadow-[#1f4d2c]/20"
                : toast.type === "error"
                  ? "bg-red-800 border-red-600 shadow-red-800/20"
                  : "bg-slate-800 border-slate-700 shadow-slate-800/20"
                }`}
            >
              <Sparkles className="w-5 h-5 animate-pulse text-[#4DB552]" />
              <span>{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>



        {/* Stepper Wizard Indicator */}
        <div className="max-w-3xl mx-auto mb-16 px-4">
          <div className="flex items-center justify-between relative">
            {/* Stepper connector lines */}
            <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-[#E5E7EB] -translate-y-1/2 z-0"></div>
            <div
              className="absolute top-1/2 left-0 h-[2px] bg-[#1F4D2C] -translate-y-1/2 z-0 transition-all duration-700 ease-out"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            ></div>

            {/* Stepper circles */}
            {[
              { num: 1, label: "Membership", displayNum: 1 },
              { num: 2, label: "Meals", displayNum: 2 },
              { num: 3, label: "Address", displayNum: 3 },
              { num: 4, label: "Payment", displayNum: 4 }
            ].map(s => {
              const isCompleted = step > s.num
              const isActive = step === s.num
              return (
                <div key={s.num} className="flex flex-col items-center z-10 relative">
                  <button
                    onClick={() => {
                      if (s.num === 1) setStep(1)
                      if (s.num === 2 && selectedGoal) setStep(2)
                      if (s.num === 3 && selectedGoal && activePlan) setStep(3)
                      if (s.num === 4 && selectedGoal && activePlan && handleValidateForm()) setStep(4)
                    }}
                    disabled={s.num > 1 && !selectedGoal}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${isActive
                      ? "bg-[#1F4D2C] text-white ring-4 ring-[#EAF7EB]"
                      : isCompleted
                        ? "bg-[#1F4D2C] text-white"
                        : "bg-white text-gray-400 border border-[#E5E7EB] hover:border-slate-350"
                      }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5 stroke-[2.5]" />
                    ) : (
                      s.displayNum
                    )}
                  </button>
                  <span className={`text-[11px] font-bold mt-2.5 uppercase tracking-wider transition-colors duration-300 ${isActive || isCompleted ? "text-[#1F4D2C]" : "text-gray-400"
                    }`}>
                    {s.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* ----------------------------------------------------
          STEP 1: CHOOSE GOAL
      ---------------------------------------------------- */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-16"
          >
            {/* Subtle green glow behind the hero section */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full bg-[#EAF7EB] opacity-40 blur-[100px] pointer-events-none -z-10" />

            {/* Hero text */}
            <div className="text-center space-y-4 max-w-xl mx-auto pt-6">
              <span className="text-[11px] font-bold tracking-[0.2em] text-[#1F4D2C] uppercase block">
                GET STARTED
              </span>
              <h1 className="text-4xl md:text-[56px] leading-[1.15] font-extrabold text-slate-900 tracking-tight font-sans">
                Plan your <span className="font-playfair italic font-normal text-slate-900">perfect</span> morning.
              </h1>
              <p className="text-[#6B7280] font-dmsans text-[15px] leading-relaxed max-w-[600px] mx-auto">
                Tailor your nutrition journey. Choose a plan that aligns with your health goals and lifestyle.
              </p>
            </div>

            <div className="space-y-8 pt-6">
              <div className="pb-3 text-left">
                <h2 className="text-3xl font-extrabold text-slate-900 font-sans tracking-tight">Step One: Choose your health goal</h2>
                <p className="text-[#6B7280] text-sm mt-1.5 font-dmsans">We'll curate your meals based on this selection.</p>
              </div>

              {/* Goal card grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {FALLBACK_GOALS.map(g => {
                  const isSelected = selectedGoal === g.id
                  return (
                    <motion.div
                      key={g.id}
                      onClick={() => {
                        setSelectedGoal(g.id)
                        triggerToast(`Selected goal: ${g.title}`, "success")
                      }}
                      whileHover={isSelected ? {} : { y: -6 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className={`bg-white rounded-[24px] overflow-hidden cursor-pointer border transition-all duration-300 relative group flex flex-col justify-between ${isSelected
                        ? "border-2 border-[#1F4D2C] ring-4 ring-[#EAF7EB] shadow-md"
                        : "border-[#E5E7EB] hover:border-slate-350 shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_35px_rgba(0,0,0,0.08)]"
                        }`}
                    >
                      {/* Goal Card Cover Image */}
                      <div className="h-[170px] relative overflow-hidden">
                        <img
                          src={g.coverImage}
                          alt={g.title}
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>

                        {/* Checkmark overlay top-right */}
                        {isSelected && (
                          <div className="absolute top-4 right-4 bg-[#1F4D2C] text-white p-1 rounded-full shadow-md z-10">
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          </div>
                        )}
                      </div>

                      <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                        <div className="space-y-2">
                          <h3 className="text-xl font-bold text-slate-900 font-sans flex items-center gap-2">
                            <span className="text-xl">{g.emoji}</span>
                            {g.title}
                          </h3>
                          <p className="text-[#6B7280] text-[13.5px] leading-relaxed font-dmsans">
                            {g.description}
                          </p>
                        </div>

                        {/* Calorie & Macro Pills */}
                        <div className="flex flex-wrap gap-2 pt-1">
                          <span className="bg-[#F3F4F6] text-[#6B7280] text-xs font-semibold px-3 py-1 rounded-full border border-[#E5E7EB]">
                            {g.calories}
                          </span>
                          <span className="bg-[#EAF7EB] text-[#1F4D2C] text-xs font-bold px-3 py-1 rounded-full">
                            {g.macroBadge}
                          </span>
                        </div>

                        {/* Sample Meals Thumbnails section */}
                        <div className="pt-4 border-t border-[#E5E7EB] space-y-2">
                          <span className="text-[10px] font-bold text-[#6B7280] tracking-wider block uppercase font-sans">Sample Meals</span>
                          <div className="flex items-center gap-2">
                            {g.sampleDishes.map((dishName, i) => (
                              <div
                                key={i}
                                className="relative w-8 h-8 rounded-full border border-white bg-slate-50 shadow-sm overflow-hidden flex-shrink-0"
                                title={dishName}
                              >
                                <img
                                  src={getImageForDish(dishName)}
                                  alt={dishName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {/* Header row - centered matching mockup */}
              <div className="text-center space-y-4 max-w-2xl mx-auto mb-6 mt-12 ">
                <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight font-playfair">
                  Meal Preference & Membership
                </h2>
                <p className="text-gray-500 font-dmsans text-[15px] leading-relaxed">
                  We use premium, ethically sourced ingredients for all dietary choices.
                </p>

                {/* Centered Veg/Non-veg toggle */}
                <div className="flex justify-center pt-2">
                  <div className="flex items-center bg-gray-100 p-1.5 rounded-full border border-gray-200 shadow-inner">
                    <button
                      type="button"
                      onClick={() => {
                        setPrefVeg(true)
                        triggerToast("Set meal preference to Vegetarian", "success")
                      }}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${prefVeg
                        ? "bg-[#1F4D2C] text-white shadow-md"
                        : "text-gray-500 hover:text-gray-800"
                        }`}
                    >
                      <span>Vegetarian</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPrefVeg(false)
                        triggerToast("Set meal preference to Non-Vegetarian", "info")
                      }}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${!prefVeg
                        ? "bg-[#1F4D2C] text-white shadow-md"
                        : "text-gray-500 hover:text-gray-800"
                        }`}
                    >
                      <span>Non-Vegetarian</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Plan tier comparison cards - styled exactly like HomePlan.jsx */}
              {(() => {
                const standardPlan = plans.find(p => p.tier.startsWith("Std") && p.tier.includes(prefVeg ? "Veg" : "Non-Veg"))
                const premiumPlan = plans.find(p => p.tier.startsWith("Premium") && p.tier.includes(prefVeg ? "Veg" : "Non-Veg"))
                const standardCost = standardPlan ? standardPlan.weeklyPrice : (prefVeg ? 899 : 1099)
                const premiumCost = premiumPlan ? premiumPlan.weeklyPrice : (prefVeg ? 1099 : 1299)

                const springTransition = "transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"

                if (loadingPlans) {
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl w-full mx-auto">
                      {[1, 2].map(n => (
                        <div key={n} className="h-96 rounded-3xl bg-gray-55 animate-pulse border border-slate-200/80 shadow-sm"></div>
                      ))}
                    </div>
                  )
                }

                return (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full mx-auto items-stretch">

                      {/* STANDARD CARD - matching HomePlan structure */}
                      <motion.div
                        whileHover={{ y: -6 }}
                        onClick={() => handleSelectTierAndContinue("Standard")}
                        className={`bg-white rounded-3xl p-7 md:p-8 border cursor-pointer flex flex-col justify-between ${selectedTier === "Standard"
                          ? "border-[#1F4D2C] shadow-[0_8px_30px_rgba(31,77,44,0.12)] ring-2 ring-[#1F4D2C]"
                          : "border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_35px_rgba(0,0,0,0.08)] hover:border-slate-300"
                          } ${springTransition}`}
                      >
                        <div>
                          <div className="flex items-center gap-2.5 mb-5">
                            <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center">
                              <CalendarDays className="w-4.5 h-4.5 text-slate-500" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Standard</h3>
                          </div>

                          <div className="flex items-baseline gap-1 mb-6">
                            <span className="text-sm font-semibold text-slate-400">₹</span>
                            <AnimatePresence mode="wait">
                              <motion.span
                                key={standardCost}
                                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.9 }}
                                transition={{ type: 'spring', stiffness: 150, damping: 15 }}
                                className="text-4xl font-extrabold text-slate-900 tracking-tight"
                              >
                                {standardCost}
                              </motion.span>
                            </AnimatePresence>
                            <span className="text-sm font-medium text-slate-400">/week</span>
                          </div>

                          <div className="h-px bg-slate-100 mb-6" />

                          <ul className="space-y-3.5 mb-8">
                            {[
                              { text: "Mon-Fri subscription", active: true },
                              { text: "Weekly menu selection", active: true },
                              { text: "Pause upcoming deliveries", active: true },
                              { text: "Delivered in your preferred time slot", active: true },
                              { text: "AI-powered nutrition insights", active: true },
                              { text: "Ingredient customization", active: false },
                              { text: "Pause Delivery", active: false }
                            ].map((feat, idx) => (
                              <li key={idx} className="flex items-start gap-3">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${feat.active ? "bg-[#EAF7EB]" : "bg-slate-100"
                                  }`}>
                                  {feat.active ? (
                                    <Check className="w-3 h-3 text-[#1F4D2C]" />
                                  ) : (
                                    <span className="text-[9px] font-bold text-slate-400">✕</span>
                                  )}
                                </div>
                                <span className={`text-sm font-medium ${feat.active ? "text-slate-600" : "text-slate-400/80 line-through"
                                  }`}>{feat.text}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <motion.button
                          type="button"
                          whileHover={{ y: -2, scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectTierAndContinue("Standard");
                          }}
                          className={`w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm ${selectedTier === "Standard"
                            ? "bg-slate-900 text-white hover:bg-slate-800"
                            : "bg-white border-2 border-slate-950 text-slate-950 hover:bg-slate-50"
                            } ${springTransition}`}
                        >
                          <span>Choose Standard</span>
                          <ArrowRight className="w-4 h-4" />
                        </motion.button>
                      </motion.div>

                      {/* PREMIUM CARD - matching HomePlan structure */}
                      <motion.div
                        whileHover={{ y: -6 }}
                        onClick={() => handleSelectTierAndContinue("Premium")}
                        className={`relative bg-white rounded-3xl p-7 md:p-8 border cursor-pointer flex flex-col justify-between ${selectedTier === "Premium"
                          ? "border-[#1F4D2C] shadow-[0_16px_45px_rgba(31,77,44,0.18)] ring-2 ring-[#1F4D2C]"
                          : "border-[#1F4D2C]/20 shadow-[0_8px_30px_rgba(31,77,44,0.12)] hover:border-[#1F4D2C]/40 hover:shadow-[0_12px_35px_rgba(0,0,0,0.08)]"
                          } ${springTransition}`}
                      >
                        {/* MOST POPULAR Banner centered top */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <span className="inline-flex items-center gap-1.5 bg-[#1F4D2C] text-white text-[10px] font-bold tracking-wider uppercase px-4 py-1.5 rounded-full shadow-lg shadow-[#1F4D2C]/20">
                            <Sparkles className="w-3 h-3 text-white fill-white" />
                            <span>Most Popular</span>
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2.5 mb-5">
                            <div className="w-9 h-9 bg-[#EAF7EB] rounded-xl flex items-center justify-center">
                              <Crown className="w-4.5 h-4.5 text-[#1F4D2C]" />
                            </div>
                            <h3 className="text-lg font-bold text-[#1F4D2C]">Premium</h3>
                          </div>

                          <div className="flex items-baseline gap-1 mb-6">
                            <span className="text-sm font-semibold text-slate-400">₹</span>
                            <AnimatePresence mode="wait">
                              <motion.span
                                key={premiumCost}
                                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.9 }}
                                transition={{ type: 'spring', stiffness: 150, damping: 15 }}
                                className="text-4xl font-extrabold text-slate-900 tracking-tight"
                              >
                                {premiumCost}
                              </motion.span>
                            </AnimatePresence>
                            <span className="text-sm font-medium text-slate-400">/week</span>
                          </div>

                          <div className="h-px bg-slate-100 mb-6" />

                          <ul className="space-y-3.5 mb-8">
                            {[
                              { text: "Everything in Standard", active: true },
                              { text: "Ingredient customization", active: true, bold: true },
                              { text: "Pause Delivery", active: true, bold: true },
                              { text: "Priority 24/7 support", active: true },
                              { text: "Eco-friendly thermal packaging", active: true },
                              { text: "Free delivery within 4km", active: true }
                            ].map((feat, idx) => (
                              <li key={idx} className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-[#EAF7EB] flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <Check className="w-3 h-3 text-[#1F4D2C]" />
                                </div>
                                <span className={`text-sm font-medium text-slate-600 ${feat.bold ? "font-bold text-slate-900" : ""
                                  }`}>{feat.text}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <motion.button
                          type="button"
                          whileHover={{ y: -2, scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectTierAndContinue("Premium");
                          }}
                          className="w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 bg-[#1F4D2C] text-white hover:bg-[#163d23] shadow-sm cursor-pointer"
                        >
                          <span>Choose Premium</span>
                          <ArrowRight className="w-4 h-4" />
                        </motion.button>
                      </motion.div>
                    </div>

                    <div className="text-center text-xs text-gray-400 pt-2 font-medium">
                      Prices shown exclude applicable taxes.
                    </div>
                  </div>
                )
              })()}
            </div>
          </motion.div>
        )}

        {/* ----------------------------------------------------
          STEP 2: PLAN SELECTOR & MEAL CUSTOMIZER
      ---------------------------------------------------- */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-12 max-w-7xl mx-auto px-4"
          >
            {/* Subtle green glow behind the hero section */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full bg-[#EDF8EF] opacity-50 blur-[120px] pointer-events-none -z-10" />

            {/* Hero Section */}
            <div className="text-center space-y-4 max-w-xl mx-auto pt-6">
              <span className="text-[11px] font-bold tracking-[0.2em] text-[#0B7A33] uppercase block font-sans">
                BUILD YOUR WEEK
              </span>
              <h1 className="text-4xl md:text-[54px] leading-[1.15] font-extrabold text-gray-900 tracking-tight font-sans">
                Build your <span className="font-playfair italic font-normal text-gray-900">week</span>.
              </h1>
              <p className="text-[#6B7280] font-dmsans text-[15px] leading-relaxed max-w-[700px] mx-auto">
                Each weekday deserves a fresh chef-curated breakfast. Pick one nutritious breakfast for every morning.
              </p>
            </div>

            {/* Main Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start pb-24">

              {/* LEFT 70%: Weekly Meal Cards */}
              <div className="lg:col-span-2 space-y-6">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day, idx) => {
                  const dish = getActiveDayDish(day)
                  if (!dish) {
                    return (
                      <div key={day} className="bg-white rounded-3xl border border-[#E5E7EB] shadow-sm p-6 text-center">
                        <Info className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-400">No breakfast configured for {day} yet.</p>
                      </div>
                    )
                  }

                  const isExpanded = !!expandedCards[dish.menuId]
                  const hasSwap = !!swappedDishes[day]
                  const activeAddons = selectedAddons[dish.menuId] || []
                  const activeRemoved = removedIngredients[dish.menuId] || []

                  // Compute price updates
                  let extraSum = 0
                  activeAddons.forEach(a => extraSum += a.extraPrice)
                  const totalDishPrice = dish.price + extraSum

                  return (
                    <motion.div
                      key={day}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ y: -4 }}
                      className="bg-white rounded-[24px] border border-[#E5E7EB] shadow-xl p-6 md:p-8 flex flex-col justify-between hover:shadow-2xl transition-all duration-300 relative group overflow-hidden"
                    >
                      {/* Swapped indicator top banner */}
                      {hasSwap && (
                        <div className="absolute top-0 left-0 right-0 bg-[#EDF8EF] text-[#0B7A33] text-[11px] px-6 py-2 border-b border-[#EDF8EF] font-bold flex justify-between items-center z-10">
                          <span className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 animate-pulse text-[#0B7A33]" />
                            Alternative breakfast chosen for {day}
                          </span>
                          <button
                            onClick={() => resetAlternativeDish(day)}
                            className="text-[#0B7A33] underline hover:no-underline font-bold text-xs cursor-pointer"
                          >
                            Reset to Default
                          </button>
                        </div>
                      )}

                      <div className={`flex flex-col md:flex-row gap-6 ${hasSwap ? "pt-6" : ""}`}>
                        {/* Left: Food Image */}
                        <div className="w-[130px] h-[130px] rounded-[20px] overflow-hidden flex-shrink-0 bg-slate-100 relative">
                          <img
                            src={getImageForDish(dish)}
                            alt={dish.name}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm text-gray-800 text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                            {dish.category}
                          </span>
                        </div>

                        {/* Middle: Day, Name, Description, Macros */}
                        <div className="flex-1 space-y-3">
                          <div className="space-y-1">
                            <span className="text-[10px] font-extrabold tracking-widest text-[#0B7A33] uppercase">
                              {day}
                            </span>
                            <h3 className="text-xl font-bold text-[#1F2937] leading-tight">{dish.name}</h3>
                            <p className="text-[#6B7280] text-[13px] leading-relaxed line-clamp-2 font-dmsans">
                              {dish.description}
                            </p>
                          </div>

                          {/* Nutrition Badges */}
                          <div className="flex flex-wrap gap-2 pt-1">
                            <span className="bg-[#EDF8EF] text-[#0B7A33] text-xs font-semibold px-3 py-1 rounded-full">
                              {dish.nutrition?.calories || 0} kcal
                            </span>
                            {dish.nutrition?.protein && (
                              <span className="bg-[#EDF8EF] text-[#0B7A33] text-xs font-semibold px-3 py-1 rounded-full">
                                {dish.nutrition.protein}g Protein
                              </span>
                            )}
                            <span className="bg-[#EDF8EF] text-[#0B7A33] text-xs font-semibold px-3 py-1 rounded-full">
                              Low GI
                            </span>
                          </div>
                        </div>

                        {/* Right: Three Buttons stacked */}
                        <div className="flex flex-col gap-2.5 justify-center md:items-end w-full md:w-auto flex-shrink-0">
                          {/* Change Breakfast Button */}
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => openSwapDrawer(day)}
                            className="w-full md:w-[160px] bg-[#0B7A33] hover:bg-[#075322] text-white py-2.5 rounded-full text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer text-center"
                          >
                            Change Breakfast
                          </motion.button>

                          {/* View Details Button */}
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toggleCardExpand(dish.menuId)}
                            className="w-full md:w-[160px] border border-[#E5E7EB] hover:bg-slate-50 text-gray-700 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer text-center"
                          >
                            {isExpanded ? "Hide Details" : "View Details"}
                          </motion.button>

                          {/* Customize Ingredients Text Link (Only visible when Premium is selected) */}
                          {selectedTier === "Premium" && (
                            <button
                              onClick={() => toggleCardExpand(dish.menuId)}
                              className="text-xs font-bold text-[#0B7A33] hover:underline cursor-pointer flex items-center gap-1 mt-1 justify-center md:justify-end"
                            >
                              <span>Customize Ingredients ✨</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expandable Customization Details (Inside Card) */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-[#E5E7EB] bg-slate-50/50 -mx-6 md:-mx-8 mt-6 p-6 md:p-8 overflow-hidden space-y-6"
                          >
                            {/* Removable Ingredients */}
                            {dish.removableIngredients && dish.removableIngredients.length > 0 && (
                              <div className="space-y-3">
                                <span className="text-[10px] font-bold text-gray-400 tracking-wider block uppercase font-sans">Remove Ingredients</span>
                                <div className="flex flex-wrap gap-2">
                                  {dish.removableIngredients.map(ing => {
                                    const isRemoved = activeRemoved.includes(ing.name)
                                    return (
                                      <button
                                        key={ing.name}
                                        onClick={() => handleRemoveIngredient(dish.menuId, ing.name)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${isRemoved
                                          ? "bg-red-50 border-red-300 text-red-600 line-through"
                                          : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                                          }`}
                                      >
                                        <span>{ing.name}</span>
                                        {isRemoved && <Plus className="w-3.5 h-3.5 rotate-45" />}
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Optional Addons */}
                            {dish.optionalAddons && dish.optionalAddons.length > 0 && (
                              <div className="space-y-3">
                                <span className="text-[10px] font-bold text-gray-400 tracking-wider block uppercase font-sans">Optional Addons</span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {dish.optionalAddons.map(addon => {
                                    const isAdded = activeAddons.some(a => a.name === addon.name)
                                    return (
                                      <div
                                        key={addon.name}
                                        onClick={() => handleToggleAddon(dish.menuId, addon)}
                                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between bg-white ${isAdded
                                          ? "border-[#0B7A33] bg-[#EDF8EF]/20 shadow-sm"
                                          : "border-gray-200 hover:border-gray-300"
                                          }`}
                                      >
                                        <div className="flex items-center gap-2">
                                          <div className={`w-4 h-4 rounded border flex items-center justify-center ${isAdded ? "bg-[#0B7A33] border-[#0B7A33] text-white" : "border-gray-300"
                                            }`}>
                                            {isAdded && <Check className="w-3 h-3 stroke-[3]" />}
                                          </div>
                                          <span className="text-xs font-bold text-gray-700">{addon.name}</span>
                                        </div>
                                        <span className="text-xs font-black text-gray-900">+₹{addon.extraPrice}</span>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Allergens warning */}
                            {dish.allergens && dish.allergens.length > 0 && (
                              <div className="bg-red-50 text-red-700 p-3.5 rounded-xl border border-red-200/20 text-xs font-medium flex items-center gap-2">
                                <Info className="w-4 h-4 text-red-600 flex-shrink-0" />
                                <span>ALLERGEN WARNING: Contains {dish.allergens.join(', ')}</span>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </div>

              {/* RIGHT 30%: Sticky Summary Card */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-1 lg:sticky lg:top-24 space-y-6"
              >
                {/* Sticky Summary Card */}
                <div className="bg-white rounded-[24px] border border-[#E5E7EB] shadow-xl p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-[#1F2937]">Plan Summary</h3>
                    <div className="h-[2px] bg-[#E5E7EB] w-full mt-3" />
                  </div>

                  <div className="space-y-3.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#6B7280]">Goal</span>
                      <strong className="text-gray-800 font-bold">{selectedGoal || "Not selected"}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B7280]">Membership</span>
                      <strong className="text-[#0B7A33] font-bold">{selectedTier}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B7280]">Diet</span>
                      <strong className="text-gray-800 font-semibold">{prefVeg ? "Vegetarian" : "Non-Vegetarian"}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B7280]">Duration</span>
                      <strong className="text-gray-800 font-semibold">5 Days (Mon-Fri)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B7280]">Delivery Window</span>
                      <strong className="text-gray-800 font-semibold">{shippingForm.deliverySlot}</strong>
                    </div>
                  </div>

                  <div className="h-[1px] bg-[#E5E7EB] w-full" />

                  {/* Weekly Menu Preview */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-gray-400 tracking-wider block uppercase font-sans">
                      Weekly Menu Preview
                    </span>
                    <div className="space-y-2 text-xs">
                      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => {
                        const dish = getActiveDayDish(day)
                        return (
                          <div key={day} className="flex gap-4 justify-between items-start">
                            <span className="text-[#6B7280] font-bold w-8">{day.substring(0, 3)}</span>
                            <span className="text-gray-800 font-medium text-right flex-1 truncate max-w-[180px]" title={dish ? dish.name : "Not selected"}>
                              {dish ? dish.name : "Not selected"}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Continue to Address Primary Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleProceedToStep3}
                    className="w-full bg-[#0B7A33] hover:bg-[#075322] text-white py-3.5 rounded-full text-sm font-bold shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Continue to Address</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>

                  {/* Small green info card */}
                  <div className="bg-[#EDF8EF] text-[#0B7A33] rounded-2xl p-4 flex gap-3 items-start border border-[#EDF8EF]">
                    <Info className="w-5 h-5 text-[#0B7A33] flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider">Need more flexibility?</h4>
                      <p className="text-xs text-[#0B7A33]/90 leading-relaxed font-dmsans">
                        Pause your deliveries before 8:00 PM on the previous evening.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Sticky Bottom Summary Bar */}
            <div className="sticky bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E5E7EB] shadow-2xl -mx-4 md:-mx-8 p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#EDF8EF] flex items-center justify-center text-[#0B7A33]">
                  <CheckCircle2 className="w-6 h-6 stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-800">Weekly breakfast plan ready</h4>
                  <p className="text-xs text-[#6B7280]">5 breakfasts selected</p>
                </div>
              </div>

              <div className="text-center md:text-left">
                <span className="text-xs text-gray-400 block font-semibold uppercase tracking-wider">Membership</span>
                <strong className="text-sm font-bold text-gray-800">{activePlan?.name || `${selectedTier} Plan`}</strong>
                <span className="text-sm font-bold text-[#0B7A33] ml-2">₹{billingInfo.subTotal}/week</span>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleProceedToStep3}
                className="bg-[#0B7A33] hover:bg-[#075322] text-white px-8 py-3.5 rounded-full text-sm font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Continue to Address</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ----------------------------------------------------
          STEP 3: SHIPPING ADDRESS DETAILS
      ---------------------------------------------------- */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-12 max-w-7xl mx-auto px-4"
          >
            {/* Subtle green glow behind the hero section */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full bg-[#EDF8EF] opacity-50 blur-[120px] pointer-events-none -z-10" />

            {/* Hero Section */}
            <div className="text-center space-y-4 max-w-xl mx-auto pt-6">
              <h1 className="text-4xl md:text-[54px] leading-[1.15] font-extrabold text-gray-900 tracking-tight font-sans">
                Where should we deliver your <span className="font-playfair italic font-normal text-[#0B7A33]">mornings?</span>
              </h1>
              <p className="text-[#6B7280] font-dmsans text-[15px] leading-relaxed max-w-[700px] mx-auto">
                Tell us where you'd like your weekday breakfasts delivered.
              </p>
            </div>

            {/* Main Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start pb-24">
              {/* LEFT 65%: Form & Slots & Notice */}
              <div className="lg:col-span-2 space-y-8">
                {/* Delivery Address Card */}
                <div className="bg-white rounded-[32px] border border-[#E5E7EB] shadow-xl p-6 md:p-10 space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 font-sans">Delivery Address</h2>

                  <form onSubmit={(e) => { e.preventDefault(); handleNextToPayment(); }} className="space-y-6">
                    {/* Row 1: Full Name, Email Address, Mobile Number */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-600 block uppercase font-sans">Full Name</label>
                        <input
                          type="text"
                          value={shippingForm.name}
                          onChange={(e) => updateShippingField('name', e.target.value)}
                          placeholder="e.g. Aditi Menon"
                          className={`w-full px-6 py-4 bg-[#EDF8EF]/40 rounded-full border text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B7A33]/25 ${formErrors.name ? "border-red-500 bg-red-50/10 !border-red-400" : "border-[#D7E9D7] focus:border-[#0B7A33]"
                            }`}
                        />
                        {formErrors.name && <span className="text-[10px] text-red-500 font-bold block ml-4">{formErrors.name}</span>}
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-600 block uppercase font-sans">Email Address</label>
                        <input
                          type="email"
                          value={shippingForm.email || ""}
                          onChange={(e) => updateShippingField('email', e.target.value)}
                          placeholder="john@example.com"
                          className={`w-full px-6 py-4 bg-[#EDF8EF]/40 rounded-full border text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B7A33]/25 ${formErrors.email ? "border-red-500 bg-red-50/10 !border-red-400" : "border-[#D7E9D7] focus:border-[#0B7A33]"
                            }`}
                        />
                        {formErrors.email && <span className="text-[10px] text-red-500 font-bold block ml-4">{formErrors.email}</span>}
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <label className="text-xs font-bold text-gray-600 block uppercase font-sans">Mobile Number</label>
                        <input
                          type="tel"
                          value={shippingForm.phone}
                          onChange={(e) => updateShippingField('phone', e.target.value)}
                          placeholder="10-digit mobile number"
                          maxLength={10}
                          className={`w-full px-6 py-4 bg-[#EDF8EF]/40 rounded-full border text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B7A33]/25 ${formErrors.phone ? "border-red-500 bg-red-50/10 !border-red-400" : "border-[#D7E9D7] focus:border-[#0B7A33]"
                            }`}
                        />
                        {formErrors.phone && <span className="text-[10px] text-red-500 font-bold block ml-4">{formErrors.phone}</span>}
                      </div>
                    </div>

                    {/* Row 2: House/Flat, Building Name */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-600 block uppercase font-sans">House / Flat Number</label>
                        <input
                          type="text"
                          value={shippingForm.houseNo || ""}
                          onChange={(e) => updateShippingField('houseNo', e.target.value)}
                          placeholder="e.g. Flat 402"
                          className={`w-full px-6 py-4 bg-[#EDF8EF]/40 rounded-full border text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B7A33]/25 ${formErrors.houseNo ? "border-red-500 bg-red-50/10 !border-red-400" : "border-[#D7E9D7] focus:border-[#0B7A33]"
                            }`}
                        />
                        {formErrors.houseNo && <span className="text-[10px] text-red-500 font-bold block ml-4">{formErrors.houseNo}</span>}
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-600 block uppercase font-sans">Building Name</label>
                        <input
                          type="text"
                          value={shippingForm.building || ""}
                          onChange={(e) => updateShippingField('building', e.target.value)}
                          placeholder="e.g. Prestige Heights"
                          className={`w-full px-6 py-4 bg-[#EDF8EF]/40 rounded-full border text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B7A33]/25 ${formErrors.building ? "border-red-500 bg-red-50/10 !border-red-400" : "border-[#D7E9D7] focus:border-[#0B7A33]"
                            }`}
                        />
                        {formErrors.building && <span className="text-[10px] text-red-500 font-bold block ml-4">{formErrors.building}</span>}
                      </div>
                    </div>

                    {/* Row 3: Street, Area / Locality */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-600 block uppercase font-sans">Street</label>
                        <input
                          type="text"
                          value={shippingForm.street || ""}
                          onChange={(e) => updateShippingField('street', e.target.value)}
                          placeholder="e.g. 10th Main Road"
                          className={`w-full px-6 py-4 bg-[#EDF8EF]/40 rounded-full border text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B7A33]/25 ${formErrors.street ? "border-red-500 bg-red-50/10 !border-red-400" : "border-[#D7E9D7] focus:border-[#0B7A33]"
                            }`}
                        />
                        {formErrors.street && <span className="text-[10px] text-red-500 font-bold block ml-4">{formErrors.street}</span>}
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-600 block uppercase font-sans">Area / Locality</label>
                        <input
                          type="text"
                          value={shippingForm.area || ""}
                          onChange={(e) => updateShippingField('area', e.target.value)}
                          placeholder="e.g. Indiranagar"
                          className={`w-full px-6 py-4 bg-[#EDF8EF]/40 rounded-full border text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B7A33]/25 ${formErrors.area ? "border-red-500 bg-red-50/10 !border-red-400" : "border-[#D7E9D7] focus:border-[#0B7A33]"
                            }`}
                        />
                        {formErrors.area && <span className="text-[10px] text-red-500 font-bold block ml-4">{formErrors.area}</span>}
                      </div>
                    </div>

                    {/* Row 4: City, Pincode */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-600 block uppercase font-sans">City</label>
                        <input
                          type="text"
                          value={shippingForm.city}
                          disabled
                          className="w-full px-6 py-4 bg-gray-100 rounded-full border border-[#E5E7EB] text-sm text-gray-500 cursor-not-allowed"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-600 block uppercase font-sans">Pincode</label>
                        <input
                          type="text"
                          value={shippingForm.pincode}
                          onChange={(e) => updateShippingField('pincode', e.target.value)}
                          placeholder="e.g. 560001"
                          maxLength={6}
                          className={`w-full px-6 py-4 bg-[#EDF8EF]/40 rounded-full border text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B7A33]/25 ${formErrors.pincode ? "border-red-500 bg-red-50/10 !border-red-400" : "border-[#D7E9D7] focus:border-[#0B7A33]"
                            }`}
                        />
                        {formErrors.pincode && <span className="text-[10px] text-red-500 font-bold block ml-4">{formErrors.pincode}</span>}

                        {/* Delivery Status Indicator */}
                        {shippingForm.pincode.length === 6 && (
                          <div className="mt-2">
                            {isCheckingDelivery && (
                              <div className="flex items-center gap-2 text-sm text-slate-500">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Checking delivery availability...
                              </div>
                            )}
                            {!isCheckingDelivery && deliveryError && (
                              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                                <span>❌</span>
                                {deliveryError}
                              </div>
                            )}
                            {!isCheckingDelivery && deliveryInfo && deliveryInfo.available && (
                              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                                <span>✅</span>
                                Delivery available — {deliveryInfo.distanceKm} km away
                                {deliveryInfo.isFree ? (
                                  <span className="ml-1 font-semibold text-green-800">(FREE delivery)</span>
                                ) : (
                                  <span className="ml-1 font-semibold text-green-800">(Delivery charge: ₹{deliveryInfo.deliveryCharge})</span>
                                )}
                              </div>
                            )}
                            {!isCheckingDelivery && deliveryInfo && !deliveryInfo.available && (
                              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                                <span>📍</span>
                                Out of delivery range ({deliveryInfo.distanceKm} km). Max 10 km.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Row 5: Landmark */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-600 block uppercase font-sans">Landmark</label>
                      <input
                        type="text"
                        value={shippingForm.landmark || ""}
                        onChange={(e) => updateShippingField('landmark', e.target.value)}
                        placeholder="e.g. Near Metro Station / Opposite Park"
                        className={`w-full px-6 py-4 bg-[#EDF8EF]/40 rounded-full border text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B7A33]/25 ${formErrors.landmark ? "border-red-500 bg-red-50/10 !border-red-400" : "border-[#D7E9D7] focus:border-[#0B7A33]"
                          }`}
                      />
                      {formErrors.landmark && <span className="text-[10px] text-red-500 font-bold block ml-4">{formErrors.landmark}</span>}
                    </div>

                    {/* Row 6: Delivery Instructions */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-600 block uppercase font-sans">Delivery Instructions</label>
                      <textarea
                        value={shippingForm.address}
                        onChange={(e) => updateShippingField('address', e.target.value)}
                        placeholder="Ring doorbell / Leave at security gate / Call upon arrival..."
                        rows={3}
                        className="w-full p-4 bg-[#EDF8EF]/40 rounded-3xl border border-[#D7E9D7] text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B7A33]/25 focus:border-[#0B7A33] resize-none"
                      />
                    </div>

                    {/* Save Address Button */}
                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="bg-[#0B7A33] hover:bg-[#075322] text-white px-8 py-3.5 rounded-full text-sm font-bold shadow-lg hover:shadow-xl transition-all cursor-pointer"
                      >
                        Save Address
                      </button>
                    </div>
                  </form>
                </div>

                {/* Preferred Delivery Slot Card */}
                <div className="bg-white rounded-[32px] border border-[#E5E7EB] shadow-xl p-6 md:p-8 space-y-6">
                  <h2 className="text-xl font-bold text-gray-900 font-sans">Preferred Delivery Slot</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      "7:00 AM - 8:00 AM",
                      "8:00 AM - 9:00 AM",
                      "9:00 AM - 10:00 AM",
                      "10:00 AM - 11:00 AM"
                    ].map((slot) => {
                      const isSelected = shippingForm.deliverySlot === slot || shippingForm.deliverySlot.startsWith(slot.split(" ")[0])
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setShippingForm(prev => ({ ...prev, deliverySlot: slot }))}
                          className={`py-3 px-4 rounded-full text-xs font-bold transition-all cursor-pointer text-center ${isSelected
                            ? "bg-[#0B7A33] text-white shadow-md"
                            : "bg-[#EDF8EF] text-[#0B7A33] hover:bg-[#D7E9D7]"
                            }`}
                        >
                          {slot}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Delivery Eligibility Notice Card */}
                {deliveryError ? (
                  <div className="bg-red-50 border border-red-200 rounded-[24px] p-6 flex items-start gap-4 shadow-sm">
                    <Info className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h3 className="text-sm font-extrabold text-red-700 uppercase tracking-wider">Delivery Unavailable</h3>
                      <p className="text-xs text-red-600 font-dmsans leading-relaxed font-semibold">
                        {deliveryError}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#EDF8EF] border border-[#D7E9D7] rounded-[24px] p-6 flex items-start gap-4 shadow-sm">
                    <CheckCircle2 className="w-6 h-6 text-[#0B7A33] flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h3 className="text-sm font-extrabold text-[#0B7A33] uppercase tracking-wider">Great News!</h3>
                      <p className="text-xs text-[#0B7A33]/90 font-dmsans leading-relaxed">
                        Your location is eligible for weekday breakfast delivery. {deliveryInfo?.distanceKm ? `Distance: ${deliveryInfo.distanceKm} km.` : ''} Estimated delivery will depend on your selected time slot.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT 35%: Sticky Membership Summary Card */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-1 lg:sticky lg:top-24 space-y-6"
              >
                <div className="bg-white rounded-[32px] border border-[#E5E7EB] shadow-xl p-6 md:p-8 space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-[#1F2937]">Membership Summary</h3>
                    <div className="h-[2px] bg-[#E5E7EB] w-full mt-3" />
                  </div>

                  <div className="space-y-3.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#6B7280]">Goal</span>
                      <strong className="text-gray-800 font-bold">{selectedGoal || "Not selected"}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B7280]">Membership</span>
                      <strong className="text-[#0B7A33] font-bold">{selectedTier}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B7280]">Diet</span>
                      <strong className="text-gray-800 font-semibold">{prefVeg ? "Vegetarian" : "Non-Vegetarian"}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B7280]">Delivery Slot</span>
                      <strong className="text-gray-800 font-semibold">{shippingForm.deliverySlot}</strong>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-[#6B7280]">Address</span>
                      <span className="text-gray-800 font-semibold text-right max-w-[160px] truncate" title={shippingForm.address || "Not entered"}>
                        {shippingForm.address || "Not entered"}
                      </span>
                    </div>
                  </div>

                  <div className="h-[1px] bg-[#E5E7EB] w-full" />

                  {/* Weekly Menu Preview */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-gray-400 tracking-wider block uppercase font-sans">
                      Weekly Menu Preview
                    </span>
                    <div className="space-y-2 text-xs">
                      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => {
                        const dish = getActiveDayDish(day)
                        return (
                          <div key={day} className="flex gap-4 justify-between items-start">
                            <span className="text-[#6B7280] font-bold w-8">{day.substring(0, 3)}</span>
                            <span className="text-gray-800 font-medium text-right flex-1 truncate max-w-[180px]" title={dish ? dish.name : "Not selected"}>
                              {dish ? dish.name : "Not selected"}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="h-[1px] bg-[#E5E7EB] w-full" />

                  {/* Pricing Area */}
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between text-gray-600">
                      <span>Distance</span>
                      <strong className="font-bold text-gray-800">
                        {deliveryInfo?.distanceKm ? `${deliveryInfo.distanceKm} km` : "3.2 km"}
                      </strong>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Delivery</span>
                      {deliveryInfo?.isFree || (selectedTier === "Premium" && (!deliveryInfo || deliveryInfo.deliveryCharge === 0)) ? (
                        <span className="text-[#0B7A33] font-bold">FREE</span>
                      ) : (
                        <span className="font-bold text-gray-800">₹{billingInfo.deliveryCharge}</span>
                      )}
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>GST</span>
                      <span className="font-bold text-gray-800">₹{billingInfo.gstAmount}</span>
                    </div>
                    <div className="h-[1px] bg-[#E5E7EB] w-full my-2" />
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-extrabold text-gray-900">Total</span>
                      <span className="text-xl font-extrabold text-[#0B7A33]">₹{billingInfo.grandTotal}</span>
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="space-y-3 pt-2">
                    <motion.button
                      whileHover={deliveryError ? {} : { scale: 1.02 }}
                      whileTap={deliveryError ? {} : { scale: 0.98 }}
                      onClick={handleNextToPayment}
                      disabled={!!deliveryError}
                      className={`w-full py-3.5 rounded-full text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${deliveryError
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                        : "bg-[#0B7A33] hover:bg-[#075322] text-white hover:shadow-xl cursor-pointer"
                        }`}
                    >
                      <span>Continue to Payment</span>
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>

                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-full py-3 rounded-full text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* ----------------------------------------------------
          STEP 4: REVIEW & PAYMENT
      ---------------------------------------------------- */}
        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-12"
          >
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 font-playfair">
                Step Four: Review Order & Pay
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">
                Please review your subscription details before generating order.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Left: Summary and details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Order breakdown */}
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6">
                  <h3 className="text-lg font-bold text-gray-900 font-playfair flex items-center gap-2 border-b border-gray-100 pb-4">
                    <Check className="w-5 h-5 text-green-500 stroke-[3.5]" />
                    <span>Subscription Details</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm text-gray-600">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 block tracking-wider uppercase mb-1 font-sans">Health Goal</span>
                      <strong className="text-gray-800 font-medium">{selectedGoal}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 block tracking-wider uppercase mb-1 font-sans">Subscription Tier</span>
                      <strong className="text-gray-800 font-medium">{activePlan?.name || selectedTier}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 block tracking-wider uppercase mb-1 font-sans">Delivery Address</span>
                      <p className="text-gray-800 leading-normal font-medium">
                        {shippingForm.address}, {shippingForm.pincode}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 block tracking-wider uppercase mb-1 font-sans">Delivery Time Slot</span>
                      <strong className="text-gray-800 font-medium">{shippingForm.deliverySlot}</strong>
                    </div>
                  </div>
                </div>

                {/* Payment selector */}
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6">
                  <h3 className="text-lg font-bold text-gray-900 font-playfair border-b border-gray-100 pb-4">
                    Choose Payment Method
                  </h3>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setPaymentMethod("UPI")}
                      className={`flex-1 p-4 rounded-xl border-2 flex items-center justify-center gap-3 transition-all cursor-pointer ${paymentMethod === "UPI"
                        ? "border-[#2E7D32] bg-green-50/10 text-gray-900"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                        }`}
                    >
                      <SmartphoneIcon className="w-5 h-5" />
                      <span className="text-sm font-bold">UPI Payment</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod("Card")}
                      className={`flex-1 p-4 rounded-xl border-2 flex items-center justify-center gap-3 transition-all cursor-pointer ${paymentMethod === "Card"
                        ? "border-[#2E7D32] bg-green-50/10 text-gray-900"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                        }`}
                    >
                      <CreditCard className="w-5 h-5" />
                      <span className="text-sm font-bold">Credit/Debit Card</span>
                    </button>
                  </div>

                  {paymentMethod === "UPI" ? (
                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200/50 text-center space-y-4">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest block font-sans">Scan simulated QR Code</span>
                      <div className="w-40 h-40 bg-white border border-gray-200 rounded-xl flex items-center justify-center mx-auto shadow-inner relative group">
                        {/* Fake QR bars */}
                        <div className="absolute inset-4 grid grid-cols-4 grid-rows-4 gap-2 opacity-85">
                          <div className="bg-gray-800 rounded-sm"></div>
                          <div className="bg-gray-800 rounded-sm"></div>
                          <div></div>
                          <div className="bg-gray-800 rounded-sm"></div>
                          <div className="bg-gray-800 rounded-sm"></div>
                          <div></div>
                          <div className="bg-gray-800 rounded-sm"></div>
                          <div className="bg-gray-800 rounded-sm"></div>
                          <div></div>
                          <div className="bg-gray-800 rounded-sm"></div>
                          <div className="bg-gray-800 rounded-sm"></div>
                          <div></div>
                          <div className="bg-gray-800 rounded-sm"></div>
                          <div></div>
                          <div className="bg-gray-800 rounded-sm"></div>
                          <div className="bg-gray-800 rounded-sm"></div>
                        </div>
                        <div className="w-8 h-8 bg-white border-2 border-[#0B7A33] rounded-full z-10 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-[#0B7A33]">NF</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 block font-dmsans">Scan with GPay, PhonePe, or Paytm during mock checkout.</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 block uppercase font-sans">Card Number</label>
                        <input
                          type="text"
                          placeholder="4111 2222 3333 4444"
                          value={cardDetails.number}
                          onChange={(e) => setCardDetails(prev => ({ ...prev, number: e.target.value }))}
                          className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#2E7D32]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 block uppercase font-sans">Expiry Date</label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            maxLength={5}
                            value={cardDetails.expiry}
                            onChange={(e) => setCardDetails(prev => ({ ...prev, expiry: e.target.value }))}
                            className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#2E7D32]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 block uppercase font-sans">CVV</label>
                          <input
                            type="password"
                            placeholder="***"
                            maxLength={3}
                            value={cardDetails.cvv}
                            onChange={(e) => setCardDetails(prev => ({ ...prev, cvv: e.target.value }))}
                            className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#2E7D32]"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Checkout Billing Calculation card */}
              <div className="space-y-6">
                {/* Promo Coupon inputs */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                  <span className="text-[10px] font-bold text-gray-400 tracking-wider block uppercase font-sans">Promo Coupon</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. NUTRI20"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm uppercase focus:outline-none focus:border-[#2E7D32]"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-4 rounded-xl transition-all cursor-pointer border border-gray-200"
                    >
                      Apply
                    </button>
                  </div>
                  {couponStatus.message && (
                    <span className={`text-[10px] font-bold block ${couponStatus.success ? "text-green-600 animate-pulse" : "text-red-500"
                      }`}>
                      {couponStatus.message}
                    </span>
                  )}
                </div>

                {/* Price Calculation details */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-3 font-sans">
                    Bill Summary
                  </h4>

                  <div className="space-y-2 text-xs text-gray-500">
                    <div className="flex justify-between">
                      <span>Base Plan Price:</span>
                      <span className="text-gray-800 font-medium">₹{billingInfo.basePrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Addons Extras:</span>
                      <span className="text-gray-800 font-medium">₹{billingInfo.addonTotal}</span>
                    </div>
                    {appliedDiscount > 0 && (
                      <div className="flex justify-between text-[#2E7D32] font-semibold">
                        <span>Promo Discount:</span>
                        <span>-₹{billingInfo.discountAmount}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Delivery Fee:</span>
                      <span className="text-green-600 font-bold uppercase">Free</span>
                    </div>

                    <hr className="border-gray-100 my-2" />

                    <div className="flex justify-between items-center text-sm font-bold text-gray-900 pt-1">
                      <span>Weekly Total:</span>
                      <span className="text-xl font-black text-[#2E7D32]">₹{billingInfo.grandTotal}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCompletePayment}
                    disabled={checkoutLoading}
                    className="w-full bg-[#1F4D2C] hover:bg-[#173C22] text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
                  >
                    {checkoutLoading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <span>Complete Checkout</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Stepper Footer Controls */}
            <div className="flex items-center justify-between pt-8 border-t border-gray-100">
              <button
                onClick={() => setStep(3)}
                className="text-gray-500 hover:text-gray-800 px-6 py-3.5 rounded-xl font-semibold transition-all flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Shipping</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Success Confirmation Modal */}
        <AnimatePresence>
          {checkoutSuccess && generatedOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-[36px] max-w-lg w-full p-8 shadow-2xl border border-gray-100 relative text-center space-y-6 overflow-hidden"
              >
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto text-[#0B7A33] border-4 border-green-100">
                  <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
                </div>

                <div className="space-y-2">
                  <span className="bg-[#EDF8EF] text-[#0B7A33] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Subscription Confirmed
                  </span>
                  <h2 className="text-3xl font-extrabold text-gray-900 font-playfair">
                    Subscription Order Placed!
                  </h2>
                  <p className="text-xs text-gray-500">
                    Subscription ID: <span className="font-mono font-bold text-gray-700">{generatedOrder.orderId}</span>
                  </p>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-left space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Goal</span>
                    <span className="font-bold text-gray-800">{generatedOrder.goal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tier</span>
                    <span className="font-bold text-gray-800">{generatedOrder.tier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Weekly Price</span>
                    <span className="font-bold text-[#0B7A33] text-sm">₹{generatedOrder.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Start Date</span>
                    <span className="font-medium text-gray-800">{generatedOrder.deliveryStart}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Time Slot</span>
                    <span className="font-medium text-gray-800">{generatedOrder.slot}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-gray-500">Address</span>
                    <span className="font-medium text-gray-800 text-right max-w-[180px] truncate">{generatedOrder.address}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setCheckoutSuccess(false)
                      setActiveTab("History")
                    }}
                    className="w-full bg-[#0B7A33] hover:bg-[#075322] text-white py-4 rounded-full font-bold text-sm shadow-lg hover:shadow-xl transition-all cursor-pointer"
                  >
                    View Subscriptions & Orders
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ----------------------------------------------------
          ALTERNATIVE DISHES SLIDER / MODAL DRAWER
      ---------------------------------------------------- */}
        <AnimatePresence>
          {isSwapOpen && (
            <div className="fixed inset-0 bg-[#0f0f0acc]/65 backdrop-blur-sm z-50 flex justify-end">
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "tween", duration: 0.35 }}
                className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden"
              >
                {/* Header */}
                <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 font-playfair">Alternatives for {swapTargetDay}</h3>
                    <p className="text-gray-500 text-xs mt-0.5">Select a dish to replace your scheduled breakfast option.</p>
                  </div>
                  <button
                    onClick={() => setIsSwapOpen(false)}
                    className="text-gray-400 hover:text-gray-705 text-2xl font-semibold cursor-pointer"
                  >
                    &times;
                  </button>
                </div>

                {/* List scrollable */}
                <div className="p-6 md:p-8 flex-1 overflow-y-auto space-y-4">
                  {loadingAlternatives ? (
                    [1, 2, 3].map(n => (
                      <div key={n} className="h-32 rounded-2xl bg-gray-50 animate-pulse border border-gray-100"></div>
                    ))
                  ) : (
                    alternativesList.map(alt => (
                      <div
                        key={alt.menuId}
                        onClick={() => selectAlternativeDish(alt)}
                        className="border border-gray-100 rounded-2xl p-4 flex gap-4 hover:border-[#2E7D32]/50 hover:bg-green-50/5 transition-all cursor-pointer group"
                      >
                        <div className="w-20 h-20 rounded-xl bg-gray-105 overflow-hidden flex-shrink-0">
                          <img
                            src={getImageForDish(alt)}
                            alt={alt.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <h4 className="text-sm font-bold text-gray-900">{alt.name}</h4>
                              <span className="text-xs font-black text-gray-800">₹{alt.price}</span>
                            </div>
                            <span className="text-[9px] font-bold text-[#2E7D32] bg-[#EAF7EB] px-2 py-0.5 rounded-full inline-block mt-0.5 font-sans">
                              {alt.category}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-gray-400 font-medium">
                            <span>Calories: {alt.nutrition?.calories || 0} kcal</span>
                            <span className="text-[#2E7D32] group-hover:translate-x-1 transition-transform font-bold flex items-center gap-0.5">
                              <span>Swap</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Cancel footer */}
                <div className="p-6 md:p-8 border-t border-gray-100 bg-gray-50">
                  <button
                    onClick={() => setIsSwapOpen(false)}
                    className="w-full py-3.5 text-center text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel Swap
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
      <Footer setActiveTab={setActiveTab} />
    </div>
  )
}

// ----------------------------------------------------
// MOBILE SMARTPHONE ICON HELPER
// ----------------------------------------------------
function SmartphoneIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
      <path d="M12 18h.01" />
    </svg>
  )
}
