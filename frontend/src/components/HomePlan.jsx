import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarDays,
  ArrowRight,
  Check,
  Crown,
  Beef,
  Leaf,
  Sparkles,
  Truck
} from 'lucide-react'

const FALLBACK_PLANS = [
  {
    _id: "b1",
    goal: "Balanced Diet",
    tier: "Std Veg",
    name: "Balanced Diet Standard Veg",
    weeklyPrice: 899,
    deliveryDays: 5,
    supportsPause: true,
    description: "Balanced macros, daily vegetarian variety.",
    image: "",
    vegImage: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=600&q=80",
    nonVegImage: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=600&q=80"
  },
  {
    _id: "b2",
    goal: "Balanced Diet",
    tier: "Std Non-Veg",
    name: "Balanced Diet Standard Non-Veg",
    weeklyPrice: 1099,
    deliveryDays: 5,
    supportsPause: true,
    description: "Balanced macros with high-quality lean meats.",
    image: "",
    vegImage: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    nonVegImage: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=600&q=80"
  },
  {
    _id: "b3",
    goal: "Balanced Diet",
    tier: "Premium Veg",
    name: "Balanced Diet Premium Veg",
    weeklyPrice: 1099,
    deliveryDays: 5,
    supportsPause: true,
    description: "Premium ingredients, chef specials, customized macros.",
    image: "",
    vegImage: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
    nonVegImage: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80"
  },
  {
    _id: "b4",
    goal: "Balanced Diet",
    tier: "Premium Non-Veg",
    name: "Balanced Diet Premium Non-Veg",
    weeklyPrice: 1299,
    deliveryDays: 5,
    supportsPause: true,
    description: "Premium ingredients, seafood, tender meat selections.",
    image: "",
    vegImage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
    nonVegImage: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80"
  },
  {
    _id: "wl1",
    goal: "Weight Loss",
    tier: "Std Veg",
    name: "Weight Loss Standard Veg",
    weeklyPrice: 949,
    deliveryDays: 5,
    supportsPause: true,
    description: "Calorie-deficit vegetarian meals to burn fat.",
    image: "",
    vegImage: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600&q=80",
    nonVegImage: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=600&q=80"
  },
  {
    _id: "wl2",
    goal: "Weight Loss",
    tier: "Std Non-Veg",
    name: "Weight Loss Standard Non-Veg",
    weeklyPrice: 1149,
    deliveryDays: 5,
    supportsPause: true,
    description: "Low calorie lean protein non-veg meals.",
    image: "",
    vegImage: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=600&q=80",
    nonVegImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80"
  },
  {
    _id: "wl3",
    goal: "Weight Loss",
    tier: "Premium Veg",
    name: "Weight Loss Premium Veg",
    weeklyPrice: 1149,
    deliveryDays: 5,
    supportsPause: true,
    description: "Tailored deficit macros, custom vegetarian plans.",
    image: "",
    vegImage: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=600&q=80",
    nonVegImage: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80"
  },
  {
    _id: "wl4",
    goal: "Weight Loss",
    tier: "Premium Non-Veg",
    name: "Weight Loss Premium Non-Veg",
    weeklyPrice: 1349,
    deliveryDays: 5,
    supportsPause: true,
    description: "Tailored deficit macros, premium protein variety.",
    image: "",
    vegImage: "https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=600&q=80",
    nonVegImage: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80"
  },
  {
    _id: "hp1",
    goal: "High Protein",
    tier: "Std Veg",
    name: "High Protein Standard Veg",
    weeklyPrice: 999,
    deliveryDays: 5,
    supportsPause: true,
    description: "Max protein density using paneer, tofu, legumes.",
    image: "",
    vegImage: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
    nonVegImage: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80"
  },
  {
    _id: "hp2",
    goal: "High Protein",
    tier: "Std Non-Veg",
    name: "High Protein Standard Non-Veg",
    weeklyPrice: 1199,
    deliveryDays: 5,
    supportsPause: true,
    description: "Lean chicken, eggs, and fish for active lifestyles.",
    image: "",
    vegImage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
    nonVegImage: "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=600&q=80"
  },
  {
    _id: "hp3",
    goal: "High Protein",
    tier: "Premium Veg",
    name: "High Protein Premium Veg",
    weeklyPrice: 1199,
    deliveryDays: 5,
    supportsPause: true,
    description: "Custom protein profiling, premium vegan sources.",
    image: "",
    vegImage: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    nonVegImage: "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&w=600&q=80"
  },
  {
    _id: "hp4",
    goal: "High Protein",
    tier: "Premium Non-Veg",
    name: "High Protein Premium Non-Veg",
    weeklyPrice: 1399,
    deliveryDays: 5,
    supportsPause: true,
    description: "Imported cuts, customized amino profiles.",
    image: "",
    vegImage: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=600&q=80",
    nonVegImage: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80"
  },
  {
    _id: "wg1",
    goal: "Weight Gain",
    tier: "Std Veg",
    name: "Weight Gain Standard Veg",
    weeklyPrice: 949,
    deliveryDays: 5,
    supportsPause: true,
    description: "Calorie-surplus clean vegetarian meals for bulking.",
    image: "",
    vegImage: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80",
    nonVegImage: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80"
  },
  {
    _id: "wg2",
    goal: "Weight Gain",
    tier: "Std Non-Veg",
    name: "Weight Gain Standard Non-Veg",
    weeklyPrice: 1149,
    deliveryDays: 5,
    supportsPause: true,
    description: "Calorie-dense non-vegetarian meals.",
    image: "",
    vegImage: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=600&q=80",
    nonVegImage: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80"
  },
  {
    _id: "wg3",
    goal: "Weight Gain",
    tier: "Premium Veg",
    name: "Weight Gain Premium Veg",
    weeklyPrice: 1149,
    deliveryDays: 5,
    supportsPause: true,
    description: "Custom surplus profiling, nutrition advisor.",
    image: "",
    vegImage: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
    nonVegImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80"
  },
  {
    _id: "wg4",
    goal: "Weight Gain",
    tier: "Premium Non-Veg",
    name: "Weight Gain Premium Non-Veg",
    weeklyPrice: 1349,
    deliveryDays: 5,
    supportsPause: true,
    description: "Custom surplus profiling, premium proteins.",
    image: "",
    vegImage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
    nonVegImage: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=600&q=80"
  },
  {
    _id: "df1",
    goal: "Diabetic Friendly",
    tier: "Std Veg",
    name: "Diabetic Friendly Standard Veg",
    weeklyPrice: 899,
    deliveryDays: 5,
    supportsPause: true,
    description: "Low glycemic index, fiber-rich vegetarian options.",
    image: "",
    vegImage: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600&q=80",
    nonVegImage: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80"
  },
  {
    _id: "df2",
    goal: "Diabetic Friendly",
    tier: "Std Non-Veg",
    name: "Diabetic Friendly Standard Non-Veg",
    weeklyPrice: 1099,
    deliveryDays: 5,
    supportsPause: true,
    description: "Low glycemic index lean protein options.",
    image: "",
    vegImage: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    nonVegImage: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=600&q=80"
  },
  {
    _id: "df3",
    goal: "Diabetic Friendly",
    tier: "Premium Veg",
    name: "Diabetic Friendly Premium Veg",
    weeklyPrice: 1099,
    deliveryDays: 5,
    supportsPause: true,
    description: "Custom insulin profiling, premium veggie selection.",
    image: "",
    vegImage: "https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=600&q=80",
    nonVegImage: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80"
  },
  {
    _id: "df4",
    goal: "Diabetic Friendly",
    tier: "Premium Non-Veg",
    name: "Diabetic Friendly Premium Non-Veg",
    weeklyPrice: 1299,
    deliveryDays: 5,
    supportsPause: true,
    description: "Custom insulin profiling, high omega-3 fish options.",
    image: "",
    vegImage: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=600&q=80",
    nonVegImage: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80"
  }
]

const goalImages = {
  "veg-High Protein": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
  "non-veg-High Protein": "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=600&q=80",
  "veg-Weight Loss": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
  "non-veg-Weight Loss": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
  "veg-Weight Gain": "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80",
  "non-veg-Weight Gain": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
  "veg-Balanced Diet": "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=600&q=80",
  "non-veg-Balanced Diet": "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=600&q=80",
  "veg-Diabetic Friendly": "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600&q=80",
  "non-veg-Diabetic Friendly": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80"
}

const DIET_CARDS = [
  { id: "High Protein", label: "High Protein" },
  { id: "Weight Loss", label: "Weight Loss" },
  { id: "Weight Gain", label: "Weight Gain" },
  { id: "Balanced Diet", label: "Balanced Diet" },
  { id: "Diabetic Friendly", label: "Diabetic Friendly" }
]

const springTransition = "transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 80, damping: 18 }
  }
}

const HomePlan = ({ plans: plansProp, setActiveTab, onOpenOTP }) => {
  const [mealType, setMealType] = useState("veg")
  const [selectedGoal, setSelectedGoal] = useState("Balanced Diet")
  const [failedImages, setFailedImages] = useState({})

  const activePlans = plansProp && plansProp.length > 0 ? plansProp : FALLBACK_PLANS

  // Same auth guard as Membership.jsx — check token, show OTP if missing
  const handleSelectPlan = () => {
    const token =
      localStorage.getItem('nutriflow_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('auth_token')
    if (!token) {
      onOpenOTP?.()
      // After OTP modal closes the user will be on Home; they can click again to proceed
      return
    }
    setActiveTab?.('Membership')
  }

  const handleImageError = (key) => {
    setFailedImages((prev) => ({ ...prev, [key]: true }))
  }

  /**
   * Image resolution priority chain for backend and frontend fallback plans:
   * 1. Specific mealType image on the plan object: plan.vegImage (if veg) or plan.nonVegImage (if non-veg)
   * 2. Single plan.image fallback (if backend API returns a single generic image field)
   * 3. goalImages fallback map based on `${mealType}-${cardId}`
   * 4. Fallback placeholder UI (Leaf/Beef icon) if image fails to load or URL is missing
   */
  const getCardImageSrc = (cardPlan, currentMealType, goalId) => {
    if (currentMealType === "veg" && cardPlan?.vegImage) return cardPlan.vegImage
    if (currentMealType === "non-veg" && cardPlan?.nonVegImage) return cardPlan.nonVegImage
    if (cardPlan?.image) return cardPlan.image
    const cardImageKey = `${currentMealType}-${goalId}`
    if (goalImages[cardImageKey]) return goalImages[cardImageKey]
    return ""
  }

  const filteredPlans = useMemo(() => {
    return activePlans.filter((p) => {
      const isGoal = p.goal === selectedGoal
      const isVeg = p.tier.includes("Veg") && !p.tier.includes("Non-Veg")
      const isNonVeg = p.tier.includes("Non-Veg")
      const matchesMeal = mealType === "veg" ? isVeg : isNonVeg
      return isGoal && matchesMeal
    })
  }, [activePlans, selectedGoal, mealType])

  const stdPlan = useMemo(() => {
    return filteredPlans.find((p) => p.tier.startsWith("Std"))
  }, [filteredPlans])

  const premPlan = useMemo(() => {
    return filteredPlans.find((p) => p.tier.startsWith("Premium"))
  }, [filteredPlans])

  return (
    <section id="plan" className="py-20 md:py-28 relative z-30 bg-[#FAFBFF]">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(31,77,44,0.03) 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.03) 0%, transparent 70%)' }} />

      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="w-full flex flex-col items-center"
        >
          {/* HEADER */}
          <motion.div variants={itemVariants} className="text-center mb-10">
            <span className="inline-flex items-center gap-2 bg-[#EAF7EB] border border-[#1F4D2C]/10 rounded-full px-4 py-1.5 mb-5 shadow-xs">
              <CalendarDays className="w-3.5 h-3.5 text-[#1F4D2C]" />
              <span className="text-[11px] font-extrabold text-[#1F4D2C] tracking-wider uppercase">Weekly Plans</span>
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Five days. One plan.
              <br />
              <span className="bg-linear-to-r from-[#1F4D2C] via-[#2d7a45] to-[#4DB552] bg-clip-text text-transparent">Zero decisions.</span>
            </h2>
            <p className="text-base text-slate-500 font-light mt-4 max-w-md mx-auto leading-relaxed">
              Pick your goal, choose your plan, and let us handle the rest every single weekday.
            </p>
          </motion.div>

          {/* DIET TYPE CARDS */}
          <motion.div variants={itemVariants} className="w-full mb-10">
            <div
              className="flex gap-4 overflow-x-auto pb-4 pl-1 pr-6 sm:pl-0 sm:pr-0 sm:justify-center w-full"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {DIET_CARDS.map((card) => {
                const isActive = selectedGoal === card.id
                const cardPlan = activePlans.find(
                  (p) =>
                    p.goal === card.id &&
                    (mealType === "veg"
                      ? p.tier.includes("Veg") && !p.tier.includes("Non-Veg")
                      : p.tier.includes("Non-Veg"))
                )
                const cardImageKey = `${mealType}-${card.id}`
                const cardImageSrc = getCardImageSrc(cardPlan, mealType, card.id)
                const hasError = !cardImageSrc || failedImages[cardImageKey]

                return (
                  <motion.div
                    key={card.id}
                    onClick={() => setSelectedGoal(card.id)}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    className={`group flex-shrink-0 w-[210px] sm:w-[210px] cursor-pointer rounded-3xl p-3.5 flex flex-col items-start transition-all duration-300 ${
                      isActive
                        ? "bg-white shadow-[0_8px_30px_rgba(31,77,44,0.12)] border-2 border-[#1F4D2C]"
                        : "bg-white border border-slate-200/80 hover:border-slate-300 hover:shadow-md"
                    }`}
                  >
                    <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 relative">
                      <AnimatePresence mode="wait">
                        {hasError ? (
                          <motion.div
                            key={`fallback-${cardImageKey}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className={`w-full h-full flex flex-col items-center justify-center gap-1.5 transition-colors duration-300 ${
                              mealType === "veg" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                            }`}
                          >
                            {mealType === "veg" ? (
                              <Leaf className="w-8 h-8 opacity-80" />
                            ) : (
                              <Beef className="w-8 h-8 opacity-80" />
                            )}
                            <span className="text-[11px] font-semibold opacity-75">{card.label}</span>
                          </motion.div>
                        ) : (
                          <motion.img
                            key={`${cardImageKey}-${cardImageSrc}`}
                            src={cardImageSrc}
                            alt={card.label}
                            onError={() => handleImageError(cardImageKey)}
                            className="w-full h-full object-cover"
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            whileHover={{ scale: 1.08 }}
                          />
                        )}
                      </AnimatePresence>
                      {/* Dark overlay on hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 rounded-2xl transition-all duration-300 pointer-events-none z-10" />
                    </div>
                    <span className="text-[15px] font-bold text-slate-800 mt-3 leading-snug">{card.label}</span>
                    <span
                      className={`text-[10px] font-semibold rounded-full px-2 py-0.5 mt-1.5 inline-flex items-center gap-1 ${
                        mealType === "veg" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
                      }`}
                    >
                      {mealType === "veg" ? "🟢 Veg" : "🔴 Non-Veg"}
                    </span>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* VEG / NON-VEG TOGGLE */}
          <motion.div variants={itemVariants} className="flex justify-center mb-14">
            <div className="inline-flex bg-white rounded-full p-1 border border-slate-200/80 shadow-sm">
              <button
                onClick={() => setMealType("veg")}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer ${
                  mealType === "veg" ? "bg-[#1F4D2C] text-white shadow-md" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Leaf className="w-4 h-4" />
                Vegetarian
              </button>
              <button
                onClick={() => setMealType("non-veg")}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer ${
                  mealType === "non-veg" ? "bg-[#1F4D2C] text-white shadow-md" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Beef className="w-4 h-4" />
                Non-Vegetarian
              </button>
            </div>
          </motion.div>

          {/* PRICING CARDS */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full mx-auto">
            {/* STANDARD */}
            <motion.div
              whileHover={{ y: -6 }}
              className={`bg-white rounded-3xl p-7 md:p-8 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_35px_rgba(0,0,0,0.08)] flex flex-col justify-between ${springTransition}`}
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
                      key={stdPlan?.weeklyPrice}
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.9 }}
                      transition={{ type: 'spring', stiffness: 150, damping: 15 }}
                      className="text-4xl font-extrabold text-slate-900 tracking-tight"
                    >
                      {stdPlan?.weeklyPrice || "—"}
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-sm font-medium text-slate-400">/week</span>
                </div>
                <div className="h-px bg-slate-100 mb-6" />
                <ul className="space-y-3.5 mb-8">
                  {["5-day weekday breakfasts", "Pre-set weekly menu", "Calorie-accurate meals", "Delivery by 6 AM"].map((feat, fIdx) => (
                    <motion.li
                      key={fIdx}
                      initial={{ opacity: 0, x: -15 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: fIdx * 0.05 }}
                      className="flex items-start gap-3"
                    >
                      <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-slate-500" />
                      </div>
                      <span className="text-sm font-medium text-slate-600">{feat}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
              <motion.button
                type="button"
                onClick={handleSelectPlan}
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 bg-slate-900 text-white hover:bg-slate-800 shadow-sm cursor-pointer ${springTransition}`}
              >
                <span>Get Standard</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>

            {/* PREMIUM */}
            <motion.div
              whileHover={{ y: -6 }}
              className={`relative bg-white rounded-3xl p-7 md:p-8 border border-[#1F4D2C]/20 shadow-[0_8px_30px_rgba(31,77,44,0.12)] hover:shadow-[0_16px_45px_rgba(31,77,44,0.18)] flex flex-col justify-between ${springTransition}`}
            >
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
                  <h3 className="text-lg font-bold text-slate-900">Premium</h3>
                </div>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-sm font-semibold text-slate-400">₹</span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={premPlan?.weeklyPrice}
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.9 }}
                      transition={{ type: 'spring', stiffness: 150, damping: 15 }}
                      className="text-4xl font-extrabold text-slate-900 tracking-tight"
                    >
                      {premPlan?.weeklyPrice || "—"}
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-sm font-medium text-slate-400">/week</span>
                </div>
                <div className="h-px bg-slate-100 mb-6" />
                <ul className="space-y-3.5 mb-8">
                  {[
                    "Everything in Standard",
                    "Custom macro adjustments",
                    "Priority chef specials",
                    premPlan?.supportsPause ? "Pause subscriptions anytime" : "Weekend cheat meals (2)",
                    "Dedicated nutritionist chat"
                  ].map((feat, fIdx) => (
                    <motion.li
                      key={fIdx}
                      initial={{ opacity: 0, x: -15 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: fIdx * 0.05 }}
                      className="flex items-start gap-3"
                    >
                      <div className="w-5 h-5 rounded-full bg-[#EAF7EB] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-[#1F4D2C]" />
                      </div>
                      <span className="text-sm font-medium text-slate-600">{feat}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
              <motion.button
                type="button"
                onClick={handleSelectPlan}
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 bg-[#1F4D2C] text-white hover:bg-[#163d23] shadow-sm cursor-pointer ${springTransition}`}
              >
                <span>Get Premium</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          </motion.div>

          {/* BOTTOM NOTE */}
          <motion.div variants={itemVariants} className="mt-8 flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <Truck className="w-3.5 h-3.5 text-slate-400" />
            <span>Delivery within 10km radius of Kakkanad</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default HomePlan