import { useState } from 'react'
import { motion } from 'framer-motion'
import {  CheckCircle2 } from "lucide-react"

import weightGainImg from '../assets/weightgain_Non_img.png'
import flexibleMembershipImg from '../assets/flexible membership (2).png'
import freshDailyDeliveryImg from '../assets/fresh daily delivery (2).png'
import aiHealthAssistantImg from '../assets/AIHealthAssistant.png'

const HowItWorks = () => {
  const features = [
    {
      title: "Goal-Based Nutrition",
      desc: "Choose breakfasts tailored to your health goals.",
      image: weightGainImg,
      bgColor: "#FCF7F0",
      illustration: "nutrition"
    },
    {
      title: "Flexible Membership",
      desc: "Plan & Customize meals, Pause deliveries with ease.",
      image: flexibleMembershipImg,
      bgColor: "#F5F5FA",
      illustration: "membership"
    },
    {
      title: "Fresh Daily Delivery",
      desc: "Fresh breakfasts, wherever you need them.",
      image: freshDailyDeliveryImg,
      bgColor: "#EAF3EC",
      illustration: "delivery"
    },
    {
      title: "AI Health Assistant",
      desc: "Get instant AI-powered nutrition guidance and meal insights.",
      image: aiHealthAssistantImg,
      bgColor: "#F0F7F4",
      illustration: "chat"
    }
  ]

  const FlipCard = ({ item, idx }) => {
    const [isFlipped, setIsFlipped] = useState(false)

    return (
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: {
            opacity: 1, y: 0,
            transition: { type: 'spring', stiffness: 60, damping: 18, delay: idx * 0.15 }
          }
        }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        onMouseEnter={() => setIsFlipped(true)}
        onMouseLeave={() => setIsFlipped(false)}
        className="aspect-[3/4] rounded-[32px] shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
        style={{ perspective: 1000 }}
      >
        <motion.div
          className="w-full h-full relative"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* FRONT FACE */}
          <div
            className="absolute inset-0 overflow-hidden rounded-[32px]"
            style={{ backfaceVisibility: "hidden" }}
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <h3 className="absolute bottom-0 left-0 right-0 p-5 pb-6 text-white text-lg font-bold z-10">
              {item.title}
            </h3>
          </div>

          {/* BACK FACE */}
          <div
            className="absolute inset-0 overflow-hidden rounded-[32px] border border-slate-100/80 flex flex-col p-6 text-left justify-between"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              backgroundColor: item.bgColor
            }}
          >
            {item.illustration === "nutrition" && (
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Personalization</span>
                  <h3 className="text-xl font-extrabold text-slate-900 leading-tight mb-4">Find Your Perfect Breakfast</h3>

                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Choose Your Goal</p>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[11px] bg-[#1F4D2C] text-white px-3 py-1 rounded-full font-bold">High Protein</span>
                    <span className="text-[11px] bg-[#EAF7EB]/60 text-slate-700 border border-[#1F4D2C]/10 px-3 py-1 rounded-full font-semibold">Weight Loss</span>
                    <span className="text-[11px] bg-[#EAF7EB]/60 text-slate-700 border border-[#1F4D2C]/10 px-3 py-1 rounded-full font-semibold">Weight Gain</span>
                    <span className="text-[11px] bg-[#EAF7EB]/60 text-slate-700 border border-[#1F4D2C]/10 px-3 py-1 rounded-full font-semibold">Balanced Diet</span>
                    <span className="text-[11px] bg-[#EAF7EB]/60 text-slate-700 border border-[#1F4D2C]/10 px-3 py-1 rounded-full font-semibold">Diabetic Friendly</span>
                  </div>
                </div>

                <div>
                  <div className="w-full h-[1px] bg-slate-150 my-3" />
                  <div className="flex gap-2">
                    <span className="text-[10px] bg-white/80 text-slate-600 px-3 py-1.5 rounded-full border border-slate-100 font-semibold shadow-xs">Nutritionist Curated</span>
                    <span className="text-[10px] bg-white/80 text-slate-600 px-3 py-1.5 rounded-full border border-slate-100 font-semibold shadow-xs">Goal Focused</span>
                  </div>
                </div>
              </div>
            )}

            {item.illustration === "membership" && (
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Membership</span>
                  <h3 className="text-xl font-extrabold text-slate-900 leading-tight mb-4">Your Week, Your Way</h3>

                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[11px] font-semibold text-slate-500">Weekly Planner</span>
                    <span className="text-[11px] font-bold text-[#1F4D2C]">Standard Plan</span>
                  </div>

                  {/* Days Row */}
                  <div className="flex justify-between items-center mb-4 bg-white/60 p-2.5 rounded-2xl border border-white/80">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[9px] font-bold text-slate-400">MON</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[9px] font-bold text-slate-400">TUE</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[9px] font-bold text-slate-400">WED</span>
                      <span className="w-4 h-4 rounded-full border border-amber-600/40 bg-amber-50 flex items-center justify-center text-[10px] font-extrabold text-amber-700">II</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[9px] font-bold text-slate-400">THU</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[9px] font-bold text-slate-400">FRI</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                  </div>

                  {/* Bullets */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Skip or pause deliveries anytime</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Adjust macros daily</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="w-full h-[1px] bg-slate-150 my-3" />
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] bg-white/80 text-slate-600 px-3 py-1.5 rounded-full border border-slate-100 font-semibold shadow-xs">Flexible</span>
                    <span className="text-[10px] bg-white/80 text-slate-600 px-3 py-1.5 rounded-full border border-slate-100 font-semibold shadow-xs">Weekdays</span>
                    <span className="text-[10px] bg-white/80 text-slate-600 px-3 py-1.5 rounded-full border border-slate-100 font-semibold shadow-xs">Premium</span>
                  </div>
                </div>
              </div>
            )}

            {item.illustration === "delivery" && (
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Delivery</span>
                  <h3 className="text-xl font-extrabold text-slate-900 leading-tight mb-4">Prepared Fresh Every Morning</h3>

                  {/* Vertical timeline */}
                  <div className="relative border-l-2 border-emerald-600/20 ml-2 pl-4 space-y-4 my-2">
                    <div className="relative">
                      <div className="absolute -left-[23px] top-1 w-2.5 h-1 bg-[#1F4D2C] rounded-full" />
                      <span className="text-xs font-bold text-slate-500">Freshly Prepared</span>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[23px] top-1 w-2.5 h-1 bg-[#1F4D2C] rounded-full" />
                      <span className="text-xs font-bold text-slate-500">Hygienically Packed</span>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[25px] top-0.5 w-3.5 h-2.5 bg-white border-2 border-emerald-600 rounded-full flex items-center justify-center" />
                      <span className="text-xs font-extrabold text-emerald-700">Out for Delivery</span>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[23px] top-1.5 w-2.5 h-1 bg-slate-300 rounded-full" />
                      <span className="text-xs font-bold text-slate-400">Timely Delivery</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="w-full h-[1px] bg-slate-150 my-3" />
                  <div className="flex gap-2">
                    <span className="text-[10px] bg-white/80 text-slate-600 px-3 py-1.5 rounded-full border border-slate-100 font-semibold shadow-xs">Fresh</span>
                    <span className="text-[10px] bg-white/80 text-slate-600 px-3 py-1.5 rounded-full border border-slate-100 font-semibold shadow-xs">Reliable</span>
                    <span className="text-[10px] bg-white/80 text-slate-600 px-3 py-1.5 rounded-full border border-slate-100 font-semibold shadow-xs">Doorstep</span>
                  </div>
                </div>
              </div>
            )}

            {item.illustration === "chat" && (
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">AI Assistant</span>
                  <h3 className="text-xl font-extrabold text-slate-900 leading-tight mb-4">Smart Nutrition Guidance</h3>

                  {/* Chat Mockup */}
                  <div className="space-y-3">
                    {/* User Bubble */}
                    <div className="flex justify-end">
                      <div className="bg-[#EAF7EB] text-slate-700 text-[11px] font-semibold px-3.5 py-2 rounded-2xl rounded-tr-sm max-w-[85%] shadow-xs">
                        Recommend a healthy breakfast for muscle gain.
                      </div>
                    </div>

                    {/* Assistant Bubble */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-[#1F4D2C] block">Assistant</span>
                      <div className="bg-white border border-emerald-600/10 text-slate-700 text-[11px] px-3.5 py-2 rounded-2xl rounded-tl-sm max-w-[90%] shadow-xs space-y-0.5">
                        <p className="font-bold text-slate-800">I recommend Herb Grilled Chicken Sandwich</p>
                        <p className="text-[#1F4D2C] font-extrabold">420 kcal  32g Protein</p>
                      </div>
                    </div>

                    {/* Quick replies */}
                    <div className="flex gap-1 flex-wrap">
                      <span className="text-[9px] border border-slate-200 bg-white text-slate-500 italic px-2 py-0.5 rounded-md">Add fiber?</span>
                      <span className="text-[9px] border border-slate-200 bg-white text-slate-500 italic px-2 py-0.5 rounded-md">other option?</span>
                      <span className="text-[9px] border border-slate-200 bg-white text-slate-500 italic px-2 py-0.5 rounded-md">Allergens?</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="w-full h-[1px] bg-slate-150 my-3" />
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] bg-white/80 text-slate-600 px-3 py-1.5 rounded-full border border-slate-100 font-semibold shadow-xs">AI Powered</span>
                    <span className="text-[10px] bg-white/80 text-slate-600 px-3 py-1.5 rounded-full border border-slate-100 font-semibold shadow-xs">Personalized</span>
                    <span className="text-[10px] bg-white/80 text-slate-600 px-3 py-1.5 rounded-full border border-slate-100 font-semibold shadow-xs">Nutrition Insights</span>
                  </div>
                </div>
              </div>
            )}
          </div>

        </motion.div>
      </motion.div>
    )
  }

  return (
    <section id="why-nutriflow" className="relative py-[120px] bg-[#FAFBFF] z-30">
      <div className="max-w-7xl mx-auto px-6 text-center">

        {/* Section Header */}
        <div className="mb-16 flex flex-col items-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Why Choose <span className="bg-linear-to-r from-[hsl(128,26%,17%)]  via-[hsl(136,35%,33%)] to-[hsl(132,48%,40%)] bg-clip-text text-transparent  font-serif">NutriFlow</span>
          </h2>
          <div className="w-12 h-1 bg-[#1F4D2C] rounded-full mt-4" />
        </div>

        {/* 4-Column Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1246px] mx-auto">
          {features.map((item, idx) => (
            <FlipCard key={idx} item={item} idx={idx} />
          ))}
        </div>

      </div>
    </section>
  )
}

export default HowItWorks