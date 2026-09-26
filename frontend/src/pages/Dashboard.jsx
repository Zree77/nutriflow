import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  Pause,
  Crown,
  Droplets,
  History,
  PhoneCall,
  Compass,
  Calendar,
  CheckCircle,
  ArrowRight,
  Info,
  User,
  LogOut
} from 'lucide-react';
import api, { dedupedGet } from '../api';
import PauseDeliveryModal from '../components/PauseDeliveryModal';

export default function Dashboard({ setActiveTab }) {
  const [userData, setUserData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
  const [activeSubscriptionId, setActiveSubscriptionId] = useState(null);

  // Time-based greeting helper
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "Good Morning";
    if (hours < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // Date format helper
  const getFormattedDate = () => {
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  const todayDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  // Fetch Dashboard Stats & Profile
  useEffect(() => {
    console.log('[Dashboard] MOUNTED');
    setUserData({
      name: "user",
      tier: "Premium",
      renewalDate: "15 Jul 2025",
      weeklyPrice: 1199,
      isSubscribed: true
    });
    setDashboardData({
      user: { name: "user", tier: "Premium", renewalDate: "15 Jul 2025", weeklyPrice: 1199, isSubscribed: true },
      todayMeal: {
        name: "Berry Granola Bowl",
        description: "Fresh seasonal berries, organic Greek yogurt, and house-made honey granola with Kerala spices.",
        image: "/Apple Cinnamon Overnight Oats.png",
        calories: 420,
        protein: 22,
        arrivalTime: "7:45 AM Arrival",
        ingredients: ["Fresh Berries", "Greek Yogurt", "Honey Granola", "Chia Seeds", "Almond Milk"]
      },
      weeklyMenu: [
        { day: "Monday", dish: "Berry Granola Bowl", image: "/Apple Cinnamon Overnight Oats.png", calories: 420, protein: 22, active: true },
        { day: "Tuesday", dish: "Herbed Paneer Sandwich", image: "/Balanced Diet - Herbed Paneer Sandwich.png", calories: 410, protein: 24 },
        { day: "Wednesday", dish: "Greek Yogurt Protein Bowl", image: "/Apple Cinnamon Overnight Oats.png", calories: 390, protein: 20 },
        { day: "Thursday", dish: "Herb Chicken Salad", image: "/Balanced Diet - Cottage Cheese salad.png", calories: 360, protein: 22 },
        { day: "Friday", dish: "Chocolate Protein Smoothie", image: "/Banana Protein Smoothie.png", calories: 450, protein: 28 }
      ],
      insights: { weeklyCalories: 2050, calorieGoal: 2750, weeklyProtein: 152, proteinGoal: 250, streakDays: 12 }
    });
    const controller = new AbortController();
    const fetchDashboard = async () => {
      try {
        const [userRes, profileDashRes, subRes] = await Promise.all([
          dedupedGet('/auth/profile', { timeout: 10000, signal: controller.signal }).catch(() => null),
          dedupedGet('/profile/dashboard', { timeout: 10000, signal: controller.signal }).catch(() => null),
          dedupedGet('/subscriptions/my', { timeout: 10000, signal: controller.signal }).catch(() => null)
        ]);
        if (controller.signal.aborted) return;
        if (subRes?.data?.success && subRes.data.data?._id) {
          setActiveSubscriptionId(String(subRes.data.data._id));
        }
        if (userRes?.data?.data) {
          const apiUser = userRes.data.data;
          setUserData({
            name: apiUser.name || "user",
            tier: apiUser.subscriptionTier || "Premium",
            renewalDate: apiUser.subscriptionEnd ? new Date(apiUser.subscriptionEnd).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : "15 Jul 2025",
            weeklyPrice: apiUser.subscriptionTier === "Premium" ? 1199 : 899,
            isSubscribed: !!apiUser.isSubscribed
          });
        }
      } catch (err) {
        console.error('[Dashboard] fetchDashboard failed:', err);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };
    fetchDashboard();
    return () => {
      controller.abort();
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('nutriflow_token');
    localStorage.removeItem('token');
    localStorage.removeItem('auth_token');
    window.location.reload();
  };

  if (isLoading || !dashboardData) {
    return (
      <div className="min-h-screen bg-[#FAFBFF] flex items-center justify-center pt-24 pb-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-[#1F4D2C] border-t-transparent animate-spin" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loading Dashboard...</span>
        </div>
      </div>
    );
  }

  const { todayMeal, weeklyMenu, insights } = dashboardData;

  return (
    <div className="bg-primary-light min-h-screen relative font-sans overflow-x-hidden pt-20 pb-28">
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] rounded-full bg-[#EDF8EF]/70 opacity-80 blur-[130px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-6 space-y-8">

        {/* 1. TOP GREETING BAR */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-1.5"
          >
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              {getGreeting()}, {userData?.name || "user"} <span className="animate-bounce">👋</span>
            </h1>
            <p className="text-xs font-semibold text-slate-400 font-dmsans">
              Your personalized breakfast is scheduled for your preferred morning delivery window.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3"
          >
            <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:shadow-sm transition cursor-pointer relative" aria-label="Notifications">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#2E7D32]" />
            </button>

            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-full bg-white border border-gray-200 text-xs font-bold text-red-500 hover:bg-red-50 hover:border-red-100 flex items-center gap-1.5 transition cursor-pointer shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
          </motion.div>
        </div>

        {/* 2. TODAY'S RECOMMENDED MEALS CARD & ACTION SQUARES */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

          {/* LEFT: Recommended Meal Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col md:flex-row gap-6 items-center"
          >
            <div className="w-full md:w-56 aspect-square rounded-2xl overflow-hidden bg-slate-50 flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=600&fit=crop"
                alt={todayMeal.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 space-y-4 text-left w-full">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#EAF7EB] text-[#1F4D2C] border border-[#1F4D2C]/10">
                  Today's Breakfast
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                  {todayMeal.arrivalTime}
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">{todayMeal.name}</h2>
                <p className="text-xs text-slate-400 leading-relaxed mt-1.5 max-w-md">{todayMeal.description}</p>
              </div>

              {/* Macros Row */}
              <div className="flex items-center gap-5 pt-1">
                <div className="flex items-center gap-2 bg-[#F8FAF5] px-4 py-2 rounded-xl border border-gray-100">
                  <span className="text-xs text-slate-400">🔥 Calories:</span>
                  <strong className="text-xs font-mono font-bold text-slate-800">{todayMeal.calories} kcal</strong>
                </div>
                <div className="flex items-center gap-2 bg-[#F8FAF5] px-4 py-2 rounded-xl border border-gray-100">
                  <span className="text-xs text-slate-400">🌱 Protein:</span>
                  <strong className="text-xs font-mono font-extrabold text-[#1F4D2C]">{todayMeal.protein}g Protein</strong>
                </div>
              </div>

              {/* View Details CTA */}
              <button
                onClick={() => setActiveTab("Order Today")}
                className="w-full md:w-auto px-6 py-3 bg-[#1F4D2C] hover:bg-[#173C22] text-white rounded-2xl font-bold text-xs cursor-pointer transition shadow-md shadow-green-950/10 block text-center"
              >
                View Breakfast Details
              </button>
            </div>
          </motion.div>

          {/* RIGHT: Visual Action Squares */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-4 grid grid-cols-2 gap-4"
          >
            <button
              onClick={() => setIsPauseModalOpen(true)}
              className="bg-[#F8FAF5] border border-gray-100 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 group hover:border-[#1F4D2C] hover:shadow-sm transition cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-white text-[#1F4D2C] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <Pause className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">Pause Delivery</span>
            </button>

            <button
              onClick={() => setActiveTab("History")}
              className="bg-[#F8FAF5] border border-gray-100 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 group hover:border-[#1F4D2C] hover:shadow-sm transition cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-white text-[#1F4D2C] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <History className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">History</span>
            </button>

            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-nutriflow-chatbot'))}
              className="bg-[#F8FAF5] border border-gray-100 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 group hover:border-[#1F4D2C] hover:shadow-sm transition cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-white text-[#1F4D2C] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <Compass className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">AI Nutrition</span>
            </button>

            <button
              onClick={() => setActiveTab("Contact Us")}
              className="bg-[#F8FAF5] border border-gray-100 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 group hover:border-[#1F4D2C] hover:shadow-sm transition cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-white text-[#1F4D2C] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <PhoneCall className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">Contact Us</span>
            </button>
          </motion.div>
        </div>

        {/* 3. WEEKLY MEAL PLAN */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-base font-extrabold text-slate-800 uppercase tracking-wider">This Week's Plan</h2>
            <button
              onClick={() => setActiveTab("Membership")}
              className="text-xs text-[#1F4D2C] hover:text-[#173C22] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-3 snap-x scrollbar-none">
            {weeklyMenu.map((item, idx) => {
              const isToday = item.day.toLowerCase() === todayDayName.toLowerCase() || (todayDayName === "Sunday" && item.day === "Monday") || (todayDayName === "Saturday" && item.day === "Monday");

              // Fallback placeholder images
              const imageMap = [
                "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=225&fit=crop", // Mon
                "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=300&h=225&fit=crop", // Tue
                "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=225&fit=crop", // Wed
                "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=225&fit=crop", // Thu
                "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=300&h=225&fit=crop"  // Fri
              ];

              return (
                <div
                  key={item.day}
                  className={`min-w-[170px] flex-1 bg-white rounded-2xl border overflow-hidden flex-shrink-0 snap-start transition-all ${isToday
                      ? "border-2 border-[#1F4D2C] shadow-md ring-2 ring-[#1F4D2C]/10"
                      : "border-gray-100 shadow-sm"
                    }`}
                >
                  <div className="aspect-[4/3] relative bg-slate-50 overflow-hidden">
                    <img
                      src={imageMap[idx]}
                      alt={item.dish}
                      className="w-full h-full object-cover"
                    />
                    {isToday && (
                      <span className="absolute top-2 right-2 bg-[#1F4D2C] text-white text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                        Today
                      </span>
                    )}
                  </div>

                  <div className="p-3.5 space-y-1 text-left">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      {item.day}
                      {isToday && <span className="w-1.5 h-1.5 rounded-full bg-[#1F4D2C]" />}
                    </span>
                    <h3 className="text-xs font-bold text-slate-800 truncate leading-snug">{item.dish}</h3>
                    <span className="text-[10px] text-slate-400 font-mono font-medium block">
                      {item.calories} kcal · {item.protein}g P
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* 4. BOTTOM 3-COLUMN METRICS GRID */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* COLUMN 1 - BREAKFAST INSIGHTS */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-5 text-left flex flex-col justify-between">
            <div className="flex justify-between items-center pb-2 border-b border-gray-50">
              <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">Breakfast Insights</span>
              <Info className="w-3.5 h-3.5 text-slate-300" />
            </div>

            <div className="space-y-4 flex-1 flex flex-col justify-center">
              {/* Metric 1 */}
              <div className="space-y-1">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] text-slate-400 font-medium">CALORIES THIS WEEK</span>
                  <span className="text-[10px] text-[#1F4D2C] font-bold">75% Complete</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold text-slate-800 font-mono">{insights.weeklyCalories}</span>
                  <span className="text-xs text-slate-400 font-mono">/ {insights.calorieGoal} kcal</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#1F4D2C] rounded-full" style={{ width: '75%' }} />
                </div>
              </div>

              {/* Metric 2 */}
              <div className="space-y-1">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] text-slate-400 font-medium">PROTEIN INTAKE</span>
                  <span className="text-[10px] text-[#2E7D32] font-bold">60% Complete</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold text-slate-800 font-mono">{insights.weeklyProtein}g</span>
                  <span className="text-xs text-slate-400 font-mono">/ {insights.proteinGoal}g</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#4DB552] rounded-full" style={{ width: '60%' }} />
                </div>
              </div>
            </div>

            {/* Streak */}
            <div className="pt-4 border-t border-gray-50 flex items-center gap-2">
              <span className="text-lg">🔥</span>
              <div>
                <span className="text-xs font-bold text-slate-800 block">CURRENT STREAK</span>
                <span className="text-[10px] text-slate-400 font-medium block">{insights.streakDays} Days — Keep the momentum going!</span>
              </div>
            </div>
          </div>

          {/* COLUMN 2 - AI INSIGHTS DIALOG */}
          <div className="bg-[#1F4D2C] rounded-3xl p-6 text-white text-left flex flex-col justify-between relative overflow-hidden">
            {/* Glow orb */}
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/5 blur-xl pointer-events-none" />

            <div className="space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-green-200/80 block">AI Insights</span>
              <p className="text-lg font-playfair font-normal leading-relaxed text-green-50/95">
                "Your breakfast this week averages <span className="font-bold text-green-200 font-sans">29g of protein</span> per day. Consider adding <span className="font-bold italic text-green-200">more hydration</span> alongside your morning meal."
              </p>
            </div>

            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-nutriflow-chatbot'))}
              className="w-full mt-6 py-3 bg-white text-[#1F4D2C] hover:bg-green-50 rounded-2xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors shadow-sm"
            >
              Open AI Assistant
            </button>
          </div>

          {/* COLUMN 3 - MEMBERSHIP & ACTIONS */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 text-left space-y-4 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">MEMBERSHIP</span>
                <div className="flex items-center gap-2 mt-2">
                  <h3 className="text-lg font-extrabold text-slate-800">Premium Plan</h3>
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-[#EAF7EB] text-[#1F4D2C] border border-[#1F4D2C]/10 px-2.5 py-0.5 rounded-full">
                    <Crown className="w-2.5 h-2.5" />
                    <span>Premium</span>
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>RENEWAL DATE</span>
                  <strong className="text-slate-800 font-bold">{userData?.renewalDate}</strong>
                </div>
                <p className="text-[11px] text-slate-400">Your membership renews automatically next week.</p>
              </div>

              <button
                onClick={() => setActiveTab("History")}
                className="w-full py-3 border border-gray-200 hover:border-[#1F4D2C] hover:text-[#1F4D2C] text-slate-500 rounded-2xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors text-center"
              >
                View History
              </button>
            </div>

            {/* Delivery Status summary */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 text-left flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">STATUS</span>
                <span className="text-sm font-extrabold text-slate-800 mt-1 block">Out For Delivery</span>
              </div>
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
            </div>
          </div>

        </motion.div>

        {/* BOTTOM EXTRA BANNER FIELDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className={`bg-[#F8FAF5] border border-gray-100 rounded-3xl p-5 text-left flex items-center justify-between transition-all group ${!activeSubscriptionId ? "opacity-50 cursor-not-allowed" : "hover:shadow-sm cursor-pointer"
              }`}
            onClick={() => activeSubscriptionId && setIsPauseModalOpen(true)}
          >
            <div>
              <h4 className="text-xs font-bold text-slate-800">Pause tomorrow's breakfast?</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">We need 12 hours notice for delivery updates.</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>

          <div className="bg-[#86efac]/30 border border-green-200 rounded-3xl p-5 text-left flex items-center justify-between hover:shadow-sm transition-all group cursor-pointer" onClick={() => setActiveTab("Contact Us")}>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Invite Friends</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Get 1 week free for every 3 referrals.</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

      </div>

      <PauseDeliveryModal
        isOpen={isPauseModalOpen}
        onClose={() => setIsPauseModalOpen(false)}
        activeSubscriptionId={activeSubscriptionId}
        onPauseSuccess={(rem, date) => {
          // Update local state dynamically
          if (dashboardData) {
            setDashboardData(prev => ({
              ...prev,
              insights: {
                ...prev.insights,
                remainingPauses: rem
              }
            }));
          }
        }}
      />
    </div>
  );
}
