import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Crown, 
  Gift, 
  Share2, 
  LogOut, 
  ChevronRight, 
  ShieldAlert, 
  User,
  Heart,
  MapPin,
  CreditCard,
  Settings,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  FileText
} from 'lucide-react';
import axios from 'axios';
import Footer from '../components/Footer';

export default function Profile({ setActiveTab, onOpenOTP }) {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('nutriflow_token') || localStorage.getItem('token') || localStorage.getItem('auth_token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      try {
        const res = await axios.get('/nutriflow/users/me', config);
        if (res.data && res.data.data) {
          setUserData(res.data.data);
        } else {
          setUserData(FALLBACK_PROFILE);
        }
      } catch (err) {
        setUserData(FALLBACK_PROFILE);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('nutriflow_token');
    localStorage.removeItem('token');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('nutriflow_user');
    setActiveTab("Home");
    window.location.reload();
  };

  const FALLBACK_PROFILE = {
    name: "Rahi",
    email: "rahi@example.com",
    phone: "+91 98765 43210",
    subscription: {
      tier: "Premium",
      status: "Active",
      startDate: "January 2026",
      renewalDate: "27 July 2026",
      plan: "High Protein Premium Non-Veg",
      billingCycle: "Weekly",
      weeklyPrice: 1349
    },
    nutritionPreferences: {
      goal: "High Protein",
      dietType: "Vegetarian",
      allergies: "Milk, Tree Nuts",
      customizationsEnabled: true
    },
    deliveryAddress: {
      label: "Office Address",
      address: "124 Corporate Plaza, Suite 405",
      city: "Bangalore, KA 560001",
      pincode: "682030",
      preferredSlot: "7-8 AM",
      deliveryZone: "Within Range (3.2 km)"
    },
    payment: {
      method: "UPI",
      nextBilling: "27 Jul 2026",
      lastPaid: "20 Jul 2026 — ₹1,349"
    },
    referralCode: "RAHI2026"
  };

  const profile = userData || FALLBACK_PROFILE;
  const initial = profile.name ? profile.name.charAt(0).toUpperCase() : "U";

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  };

  if (isLoading && !profile) {
    return (
      <div className="min-h-screen bg-[#FAFBFF] flex items-center justify-center pt-24">
        <div className="w-10 h-10 rounded-full border-4 border-[#1F4D2C] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-[#FAFBFF] min-h-screen relative font-sans overflow-x-hidden pt-20">
      {/* Background radial soft light-green glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] rounded-full bg-[#EDF8EF]/60 opacity-70 blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-6 space-y-8">
        
        {/* 1. PAGE HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-8 pb-4"
        >
          <div className="flex items-center gap-5 text-left">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-[#EAF7EB] border-4 border-white shadow-md flex items-center justify-center text-3xl font-extrabold text-[#1F4D2C]">
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop" 
                  alt={profile.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <span className="absolute">{initial}</span>
              </div>
              <div className="absolute bottom-0 right-0 bg-[#1F4D2C] border-2 border-white rounded-full p-1.5 shadow-md cursor-pointer hover:scale-105 transition-transform">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{profile.name}</h1>
                <span className="text-[9px] font-bold tracking-wider uppercase bg-[#EAF7EB] text-[#1F4D2C] px-2.5 py-0.5 rounded-full border border-[#1F4D2C]/10">
                  Active Membership
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-400 font-dmsans">
                Premium Member <span className="mx-1.5 text-slate-300">·</span> Member since January 2026
              </p>
            </div>
          </div>

          <button 
            onClick={() => setActiveTab("Membership")}
            className="px-6 py-2.5 bg-[#1F4D2C] hover:bg-[#173C22] text-white rounded-full text-xs font-bold transition shadow-md shadow-green-950/10 cursor-pointer"
          >
            Edit Profile
          </button>
        </motion.div>

        {/* 2. TWO-COLUMN GRID: Membership & Rewards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Membership Stats card */}
          <motion.div 
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between text-left relative"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">Membership</h2>
                <p className="text-xs text-slate-400 mt-1">Your current nutritional journey</p>
              </div>
              <span className="w-8 h-8 rounded-full bg-[#EAF7EB] text-[#1F4D2C] flex items-center justify-center">
                <Crown className="w-4 h-4" />
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-gray-50 mt-6">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">PLAN</span>
                <strong className="text-xs text-slate-700 font-extrabold mt-1 block">{profile.subscription?.tier || "Premium"}</strong>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">STATUS</span>
                <strong className="text-xs text-green-600 font-bold mt-1 block flex items-center gap-1">
                  <span>{profile.subscription?.status || "Active"}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                </strong>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">RENEWAL</span>
                <strong className="text-xs text-slate-700 font-extrabold mt-1 block">{profile.subscription?.renewalDate || "27 July 2026"}</strong>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">SCHEDULE</span>
                <strong className="text-xs text-slate-700 font-extrabold mt-1 block">{profile.subscription?.billingCycle === "Weekly" ? "Mon - Fri" : "Mon - Fri"}</strong>
              </div>
            </div>

            <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-50">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#1F4D2C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Morning Delivery: <strong className="font-extrabold text-slate-800">{profile.deliveryAddress?.preferredSlot || "7-8 AM"}</strong></span>
              </span>
              <button 
                onClick={() => setActiveTab("Membership")}
                className="text-[11px] text-[#1F4D2C] hover:text-[#173C22] font-bold uppercase tracking-wider transition-colors"
              >
                Weekly Menu
              </button>
            </div>
          </motion.div>

          {/* Rewards card */}
          <motion.div 
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="lg:col-span-4 bg-[#1F4D2C] rounded-3xl p-6 text-white text-left flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-white/5 blur-xl pointer-events-none" />

            <div className="space-y-3">
              <h2 className="text-lg font-extrabold tracking-tight">Rewards</h2>
              <p className="text-xs text-green-200/80 leading-relaxed max-w-xs">
                Referral Program: Invite three friends and receive one complimentary week of morning wellness.
              </p>
            </div>

            <button 
              onClick={() => setActiveTab("Contact Us")}
              className="w-full mt-6 py-3 bg-white text-[#1F4D2C] hover:bg-green-50 rounded-2xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors shadow-sm text-center"
            >
              Invite Friends
            </button>
          </motion.div>
        </div>

        {/* 3. TWO-COLUMN GRID: Preferences & Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Nutrition Preferences */}
          <motion.div 
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 text-left space-y-4"
          >
            <div className="flex justify-between items-center pb-2 border-b border-gray-50">
              <h2 className="text-base font-extrabold text-slate-800 tracking-tight">Nutrition Preferences</h2>
              <svg className="w-4 h-4 text-slate-400 hover:text-[#1F4D2C] cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" onClick={() => setActiveTab("Membership")}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-slate-400">Goal</span>
                <span className="font-bold text-[#1F4D2C] bg-[#EAF7EB] px-2.5 py-0.5 rounded-full">
                  {profile.nutritionPreferences?.goal || "High Protein"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-slate-400">Diet</span>
                <span className="font-extrabold text-slate-700">{profile.nutritionPreferences?.dietType || "Vegetarian"}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-slate-400">Allergies</span>
                <span className="font-bold text-red-500">{profile.nutritionPreferences?.allergies || "None"}</span>
              </div>
              <div className="flex justify-between items-start py-2">
                <span className="text-slate-400">Preferences</span>
                <span className="font-extrabold text-slate-700 text-right leading-relaxed">
                  Extra Protein <br />
                  Less Spice
                </span>
              </div>
            </div>
          </motion.div>

          {/* Delivery Settings */}
          <motion.div 
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 text-left flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                <h2 className="text-base font-extrabold text-slate-800 tracking-tight">Delivery Settings</h2>
              </div>

              <div className="flex items-start gap-4 p-4 bg-[#F8FAF5] rounded-2xl border border-gray-50">
                <span className="w-10 h-10 rounded-xl bg-white text-[#1F4D2C] flex items-center justify-center shadow-sm flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </span>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-800">{profile.deliveryAddress?.label || "Office Address"}</h4>
                  <p className="text-xs text-slate-400 font-semibold">{profile.deliveryAddress?.address || "124 Corporate Plaza, Suite 405"}</p>
                  <p className="text-[11px] text-slate-400 font-semibold">{profile.deliveryAddress?.city || "Bangalore, KA 560001"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-[#EDF8EF] border border-[#D7E9D7] rounded-2xl">
                <span className="w-5 h-5 rounded-full bg-[#1F4D2C] text-white flex items-center justify-center text-xs font-extrabold flex-shrink-0 mt-0.5">!</span>
                <p className="text-[10px] text-[#1F4D2C] font-semibold leading-relaxed">
                  <strong className="font-extrabold">Pause Delivery Policy:</strong> Available for any day if requested before preparation (7 PM previous night).
                </p>
              </div>
            </div>

            <div className="text-right pt-4">
              <button 
                onClick={() => setActiveTab("Membership")}
                className="text-[11px] text-[#1F4D2C] hover:text-[#173C22] font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Manage Delivery
              </button>
            </div>
          </motion.div>
        </div>

        {/* 4. TWO-COLUMN GRID: Billing & Account */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Payment & Billing */}
          <motion.div 
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 text-left space-y-4"
          >
            <h2 className="text-base font-extrabold text-slate-800 tracking-tight pb-2 border-b border-gray-50">Payment & Billing</h2>
            
            <div className="space-y-2">
              <button className="w-full p-4 hover:bg-[#F8FAF5] rounded-2xl border border-gray-50 flex items-center justify-between transition cursor-pointer group">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4 text-slate-400 group-hover:text-[#1F4D2C] transition-colors" />
                  <span className="text-xs font-bold text-slate-700">Billing History</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#1F4D2C] transition-all group-hover:translate-x-0.5" />
              </button>

              <button className="w-full p-4 hover:bg-[#F8FAF5] rounded-2xl border border-gray-50 flex items-center justify-between transition cursor-pointer group">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-slate-400 group-hover:text-[#1F4D2C] transition-colors" />
                  <span className="text-xs font-bold text-slate-700">Invoices</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#1F4D2C] transition-all group-hover:translate-x-0.5" />
              </button>
            </div>
          </motion.div>

          {/* Account Settings */}
          <motion.div 
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 text-left space-y-4"
          >
            <h2 className="text-base font-extrabold text-slate-800 tracking-tight pb-2 border-b border-gray-50">Account Settings</h2>

            <div className="grid grid-cols-2 gap-3">
              <button className="p-4 hover:bg-[#F8FAF5] rounded-2xl border border-gray-50 flex items-center justify-between transition cursor-pointer group">
                <div className="flex items-center gap-2.5">
                  <Settings className="w-4 h-4 text-slate-400 group-hover:text-[#1F4D2C]" />
                  <span className="text-[11px] font-bold text-slate-700">Privacy</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              </button>

              <button className="p-4 hover:bg-[#F8FAF5] rounded-2xl border border-gray-50 flex items-center justify-between transition cursor-pointer group">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-slate-400 group-hover:text-[#1F4D2C]" />
                  <span className="text-[11px] font-bold text-slate-700">Security</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              </button>

              <button className="p-4 hover:bg-[#F8FAF5] rounded-2xl border border-gray-50 flex items-center justify-between transition cursor-pointer group">
                <div className="flex items-center gap-2.5">
                  <HelpCircle className="w-4 h-4 text-slate-400 group-hover:text-[#1F4D2C]" />
                  <span className="text-[11px] font-bold text-slate-700">Help & Support</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              </button>

              <button className="p-4 hover:bg-[#F8FAF5] rounded-2xl border border-gray-50 flex items-center justify-between transition cursor-pointer group">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-slate-400 group-hover:text-[#1F4D2C]" />
                  <span className="text-[11px] font-bold text-slate-700">Terms & Conditions</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* 5. LOGOUT BUTTON */}
        <motion.div 
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="pt-6 flex justify-center"
        >
          <button 
            onClick={handleLogout}
            className="px-12 py-4 bg-slate-900 hover:bg-slate-800 mb-10 text-white rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors flex items-center gap-2 shadow-md shadow-slate-900/10"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </motion.div>

      </div>
      <Footer setActiveTab={setActiveTab} />
    </div>
  );
}
