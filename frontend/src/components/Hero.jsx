import React, { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import {
  UtensilsCrossed,
  ShieldCheck,
  BadgeCheck,
  Leaf,
  Calendar,
  Flame,
  CalendarDays,
  ShoppingBag,
  Star,
  Truck,
  Clock,
  Heart,
} from 'lucide-react'

const badges = [
  { icon: <ShieldCheck className="w-4 h-4" />, label: "FSSAI Certified" },
  { icon: <Leaf className="w-4 h-4" />, label: "No Preservatives" },
  { icon: <UtensilsCrossed className="w-4 h-4" />, label: "Chef-Cooked Fresh" },
  { icon: <Flame className="w-4 h-4" />, label: "Calorie Accurate" },
  { icon: <BadgeCheck className="w-4 h-4" />, label: "Flexible Membership" },
  { icon: <Truck className="w-4 h-4" />, label: "Timely Delivery" },
  { icon: <Clock className="w-4 h-4" />, label: "Weekday Subscriptions" },
  { icon: <Heart className="w-4 h-4" />, label: "Made with Love" },
]

const marqueeVariants = {
  animate: {
    x: ["0%", "-25%"],
    transition: {
      x: {
        repeat: Infinity,
        repeatType: "loop",
        duration: 35,
        ease: "linear",
      },
    },
  },
}

// Reusable floating animation configs with transform-gpu
const floatSlow = {
  y: [-12, 0, -12],
  transition: {
    y: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
}

const floatFast = {
  y: [-6, 0, -6],
  transition: {
    y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
  },
}

const floatMedium = {
  y: [-8, 0, -8],
  transition: {
    y: { duration: 7, repeat: Infinity, ease: "easeInOut" },
  },
}

const Hero = () => {
  const containerRef = useRef(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  const heroY = useTransform(scrollYProgress, [0, 0.6], [0, 80])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  const smoothY = useSpring(heroY, { stiffness: 120, damping: 30, mass: 0.5 })
  const smoothOpacity = useSpring(heroOpacity, { stiffness: 120, damping: 30, mass: 0.5 })

  const avatars = [
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80"
  ]

  const springTransition = "transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
  const track = [...badges, ...badges, ...badges, ...badges]

  return (
    <section ref={containerRef} id="home" className="relative min-h-screen flex flex-col overflow-hidden bg-primary-light">

      {/* === Main Hero Content (This part fades on scroll) === */}
      <motion.div
        style={{ y: smoothY, opacity: smoothOpacity }}
        className="flex-1  items-start max-w-7xl mx-auto w-full relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-16 px-6 pt-16 pb-8 md:pt-24 md:pb-12 transform-gpu"
      >
        {/* Left Text Column */}
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="flex items-center gap-2 px-4 py-2  rounded-full bg-[#DAFBCtA] border border-secondary-hover/30 shadow-sm backdrop-blur-md mb-6 hover:bg-[#adee8d] transition-all duration-500 ease-in-out"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-extrabold text-slate-800 tracking-wider uppercase">
              WEEKDAY MORNINGS, MADE EFFORTLESS
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-[64px] leading-[1.1] font-extrabold text-slate-900 tracking-[-0.03em] mb-6 font-serif tracking-tighter"
          >
            <span className="bg-linear-to-r from-[hsl(128,26%,17%)]  via-[hsl(136,35%,33%)] to-[hsl(132,48%,40%)] bg-clip-text text-transparent block ">
              Personalized breakfasts,
              <span className="font-newsreader italic ml-4"> five</span>
            </span>

            <span className="bg-linear-to-r from-[hsl(128,26%,17%)] to-[#2a7e4b] bg-clip-text text-transparent block mt-1 ">
              mornings a week
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-lg sm:text-xl font-light text-slate-500 leading-relaxed mb-8 max-w-xl"
          >
            Build around your health goal. Cooked fresh in Kochi. delivered warm before your day begins </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="flex flex-wrap gap-3 mb-5 max-w-2xl text-black"
          >
            <span className="bg-linear-to-r from-[hsl(128,26%,17%)] via-[hsl(136,35%,33%)] to-[hsl(132,51%,27%)] bg-clip-text text-transparent block font-serif">
              Monday to Friday
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 mb-12 w-full sm:w-auto"
          >
            <motion.a
              href="#plan"
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`px-8 py-4 rounded-full text-base font-bold text-white bg-linear-to-r from-secondary via-[#004714] to-secondary shadow-[0_8px_20px_rgba(59,130,246,0.2),inset_0_1px_0_rgba(255,255,255,0.4)] hover:shadow-[0_12px_28px_rgba(59,130,246,0.3),inset_0_1px_0_rgba(255,255,255,0.4)] flex items-center justify-center gap-2 ${springTransition}`}
            >
              <CalendarDays className="w-5 h-5" />
              <span>Plan Your Week</span>
            </motion.a>

            <motion.a
              href="#order"
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`px-8 py-4 rounded-full text-base font-bold text-slate-800 bg-transparent border border-primary shadow-[0_8px_20px_rgba(15,23,42,0.04)] hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)] backdrop-blur-md  flex items-center justify-center gap-2 group ${springTransition}`}
            >
              <ShoppingBag className="w-5 h-5 text-slate-800 group-hover:text-[#224715] transition-colors duration-300" />
              <span>Order Today's Breakfast</span>
            </motion.a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className=" pb-10 border-t border-slate-100/80  w-full max-w-xl"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="flex -space-x-3.5">
                {avatars.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Customer ${i + 1}`}
                    className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm"
                    loading="lazy"
                  />
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-900 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                  +99
                </div>
              </div>
              <div className="text-left">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-0.5">Start Every Morning Better</h4>
                <p className="text-xs text-slate-500 font-light mb-1 leading-normal">Healthy breakfasts made simple, consistent, and delicious.</p>
                <p className="text-xs font-semibold text-blue-600">Trusted by 500+ Kochi residents.</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Image Column */}
        <div className="lg:col-span-5 relative flex items-center justify-center min-h-[480px]">
          <div
            className="absolute w-[440px] h-[440px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)' }}
          />
          <div className="absolute w-[490px] h-[490px] rounded-full border border-dashed border-slate-300/30 animate-spin-slow pointer-events-none will-change-transform" />
          <div className="absolute w-[450px] h-[450px] rounded-full border border-slate-300/20 animate-spin-reverse-slow pointer-events-none will-change-transform" />
          <div
            className="absolute bottom-[-15px] left-1/2 -translate-x-1/2 w-[340px] h-[25px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(ellipse, rgba(30,58,138,0.08) 0%, transparent 70%)' }}
          />

          {/* OUTER: entrance animation only */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-[300px] h-[300px] md:w-[430px] md:h-[430px]"
          >
            {/* INNER: floating animation only — no CSS class, pure Framer Motion */}
            <motion.div
              animate={floatSlow}
              className="w-full h-full rounded-full border-6 border-white shadow-[0_20px_50px_rgba(30,58,138,0.12)] will-change-transform overflow-hidden flex items-center justify-center bg-white"
            >
              <img
                src="/breakfast_bowl.png"
                alt="Premium NutriFlow Breakfast Bowl"
                className="w-full h-full object-cover select-none"
                loading="eager"
              />
            </motion.div>
          </motion.div>

          {/* Calorie floating card — Framer Motion float */}
          <motion.div
            animate={floatFast}
            className={`absolute top-10 left-[-20px] z-20 hidden md:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/80 border border-white/50 shadow-[0_4px_16px_rgba(31,38,135,0.06)] will-change-transform hover:scale-105 ${springTransition}`}
          >
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            </div>
            <div className="text-left">
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase leading-none">Calories</p>
              <p className="text-sm font-bold text-slate-800 mt-0.5">380 kcal</p>
            </div>
          </motion.div>

          {/* Rating floating card — Framer Motion float */}
          <motion.div
            animate={floatMedium}
            className={`absolute bottom-16 right-[-20px] z-20 hidden md:flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-white/80 border border-white/50 shadow-[0_4px_16px_rgba(31,38,135,0.06)] will-change-transform hover:scale-105 ${springTransition}`}
          >
            <div className="text-left">
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase leading-none">Rating</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-sm font-bold text-slate-800">4.9</span>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Drifting dots — Framer Motion */}
          <motion.div
            animate={{
              x: [0, 15, -10, 0],
              y: [0, -15, 10, 0],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 right-5 w-3 h-3 rounded-full bg-blue-500/70 will-change-transform"
          />
          <motion.div
            animate={{
              x: [0, -20, 15, 0],
              y: [0, 10, -20, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-28 left-4 w-2.5 h-2.5 rounded-full bg-rose-500/70 will-change-transform"
          />
        </div>
      </motion.div>

      {/* === Infinite Scrolling Badge Band (OUTSIDE the fading wrapper) === */}
      <div className="relative z-20 w-full border-t border-slate-200/30 pt-5 pb-6 bg-[#FAFBFF]">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <motion.div
            variants={marqueeVariants}
            animate="animate"
            className="flex items-center gap-3 w-max"
          >
            {track.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/50 border border-slate-200/40 whitespace-nowrap select-none shrink-0"
              >
                <span className="text-[#2E7D32]">{item.icon}</span>
                <span className="text-[13px] font-semibold text-slate-500 tracking-wide">
                  {item.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

    </section>
  )
}

export default Hero