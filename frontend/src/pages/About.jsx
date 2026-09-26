import React from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  User, 
  MapPin, 
  Clipboard, 
  UtensilsCrossed, 
  Sun, 
  ArrowRight
} from 'lucide-react';
import Footer from '../components/Footer';

const TEAM_MEMBERS = [
  {
    name: "Priya Nair",
    role: "Founder & CEO",
    bio: "Certified nutritionist with 8+ years in clinical diet planning. Priya leads our menu curation and ensures every meal meets strict macro standards.",
    image: "/team-priya.jpg",
    linkedin: "#",
    twitter: "#"
  },
  {
    name: "Arjun Menon",
    role: "Head Chef",
    bio: "Arjun is a seasoned culinary veteran specializing in healthy gourmet recipes. He ensures our healthy options taste like a fine dining experience.",
    image: "/team-arjun.jpg",
    linkedin: "#",
    twitter: "#"
  },
  {
    name: "Meera Krishnan",
    role: "Operations Lead",
    bio: "Operations specialist with expertise in fresh food logistics. Meera optimizes our kitchen layout and routes for rapid morning shipping.",
    image: "/team-meera.jpg",
    linkedin: "#",
    twitter: "#"
  }
];

const STEPS = [
  {
    num: 1,
    title: "Choose Your Goal",
    desc: "Select from High Protein, Weight Loss, Weight Gain, Balanced Diet, or Diabetic Friendly plans",
    icon: Clipboard
  },
  {
    num: 2,
    title: "Pick Your Meals",
    desc: "Customize your weekly menu with our chef-curated breakfast selections",
    icon: UtensilsCrossed
  },
  {
    num: 3,
    title: "Set Your Address",
    desc: "Enter your delivery address — we deliver within 10km of our Kakkanad kitchen",
    icon: MapPin
  },
  {
    num: 4,
    title: "Wake Up to Breakfast",
    desc: "Fresh breakfast arrives at your doorstep between 8:00 AM and 9:30 AM",
    icon: Sun
  }
];

const TESTIMONIALS = [
  {
    initials: "RK",
    name: "Rahul Krishnan",
    plan: "High Protein Plan · 3 months",
    quote: "I've been ordering NutriFlow for 3 months now. My energy levels have improved dramatically and I no longer skip breakfast. The High Protein plan is absolutely delicious."
  },
  {
    initials: "AS",
    name: "Anjali Suresh",
    plan: "Weight Loss Plan · 2 months",
    quote: "Lost 4kg in 2 months just by switching breakfast. No gym or starvation needed — simply calorie controlled portioned breakfasts that keep me full."
  },
  {
    initials: "DR",
    name: "Deepak Raj",
    plan: "Balanced Diet Plan · 6 months",
    quote: "As a busy professional, NutriFlow saves me 30 minutes every morning. The quality is consistently high and the taste is clean."
  }
];

export default function About({ setActiveTab }) {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <div className="bg-[#FAFBFF] min-h-screen relative font-sans overflow-x-hidden pt-20">
      
      {/* 1. HERO SECTION */}
      <section className="min-h-[75vh] flex items-center justify-center relative overflow-hidden px-6 py-12 md:py-20 max-w-7xl mx-auto">
        {/* Glow Effects */}
        <div className="absolute top-10 left-1/3 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-[#EDF8EF] opacity-50 blur-[120px] pointer-events-none -z-10" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-[#EAF7EB]/60 opacity-30 blur-[100px] pointer-events-none -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
          {/* Left Column: Text content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <motion.span 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-[11px] font-bold tracking-[0.25em] text-[#1F4D2C] uppercase block"
            >
              ABOUT NUTRIFLOW
            </motion.span>
            
            <motion.h1 
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-[60px] leading-[1.1] font-extrabold text-[#111827] tracking-tight font-sans"
            >
              Wellness is a <span className="font-playfair italic font-normal text-[#1F4D2C]">rhythm,</span> <span className="block">not a final goal.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-[#4B5563] text-sm md:text-base leading-relaxed max-w-xl mt-6"
            >
              We craft personalized, chef-prepared breakfasts delivered fresh to your door every morning — because great days start with great nutrition.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex justify-start gap-4 pt-6"
            >
              <button
                onClick={() => setActiveTab("Membership")}
                className="bg-[#1F4D2C] hover:bg-[#173C22] text-white px-8 py-3 rounded-full font-bold text-xs cursor-pointer shadow-lg shadow-green-900/10 transition-all"
              >
                Start Your Journey
              </button>
              <button
                onClick={() => setActiveTab("Order Today")}
                className="bg-transparent border border-gray-200 hover:border-gray-300 text-slate-800 px-8 py-3 rounded-full font-bold text-xs cursor-pointer transition-all"
              >
                Order Online
              </button>
            </motion.div>
          </div>

          {/* Right Column: Hero Image Card */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative w-full max-w-[400px] aspect-[4/5] rounded-[40px] overflow-hidden shadow-2xl bg-slate-50 border-4 border-white"
            >
              <img 
                src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=1000&fit=crop" 
                alt="Lady enjoying fresh breakfast bowl in the morning" 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-5 rounded-3xl shadow-lg border border-gray-100/50">
                <span className="text-[10px] font-bold text-[#1F4D2C] uppercase tracking-wider block">FRESH AND NUTRIENT-RICH</span>
                <p className="text-xs text-slate-700 font-semibold mt-1">"Every bite is curated to fuel my active day!"</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. OUR STORY SECTION */}
      <section className="py-20 md:py-28 px-6 max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center"
        >
          {/* LEFT: Image */}
          <div className="relative aspect-[4/5] sm:aspect-square md:aspect-[4/5] rounded-[32px] overflow-hidden shadow-2xl bg-slate-100 group">
            <img 
              src="/about-chef.jpg" 
              alt="Chef cooking fresh healthy breakfast toast" 
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
              onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=1000&fit=crop" }}
            />
            {/* Soft decorative shadow overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1F4D2C]/10 to-transparent pointer-events-none" />
          </div>

          {/* RIGHT: Story content */}
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mt-2">
              Our Story
            </h2>
            <div className="space-y-4 text-[#6B7280] text-[15px] leading-relaxed">
              <p>
                Every morning starts with a simple choice: how do we fuel our bodies? Unfortunately, in the rush of daily schedules, nutrition is too often the first compromise we make.
              </p>
              <p>
                NutriFlow was created to bridge this gap. We partner with local organic farmers and expert nutritionists to deliver freshly prepared, goal-aligned breakfast menus right to your door every single morning.
              </p>
            </div>
            
            <p className="text-xl md:text-2xl font-semibold text-[#1F4D2C] leading-relaxed pt-4 font-playfair italic">
              "Wellness isn't a sprint; it's the rhythm of your daily routine."
            </p>
          </div>
        </motion.div>
      </section>

      {/* 3. OUR MISSION / TEAM SECTION */}
      <section className="py-20 md:py-28 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-16">
            <div>
              <span className="text-[11px] font-bold tracking-[0.2em] text-[#1F4D2C] uppercase block">
                VALUES & MISSION
              </span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mt-2">
                Our Mission
              </h2>
            </div>
            <p className="text-[#6B7280] text-sm md:text-base leading-relaxed">
              To make nourishing, high-quality mornings the standard, not the exception. We believe structured daily nutrition has the power to transform personal health, productivity, and general well-being.
            </p>
          </div>

          {/* Core Values Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            <div className="bg-[#F8FAF5] rounded-3xl p-8 border border-gray-50 flex flex-col items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white text-[#1F4D2C] flex items-center justify-center shadow-sm">
                <span className="text-lg font-bold">✨</span>
              </div>
              <h3 className="text-base font-extrabold text-slate-800">Personalized Nutrition</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Meals engineered for your specific health goals, backed by certified dietary experts.</p>
            </div>
            <div className="bg-[#F8FAF5] rounded-3xl p-8 border border-gray-50 flex flex-col items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white text-[#1F4D2C] flex items-center justify-center shadow-sm">
                <span className="text-lg font-bold">🍏</span>
              </div>
              <h3 className="text-base font-extrabold text-slate-800">Consistency Over Convenience</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Every weekday morning, without fail. We establish the rhythm that keeps your health plan on track.</p>
            </div>
            <div className="bg-[#F8FAF5] rounded-3xl p-8 border border-gray-50 flex flex-col items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white text-[#1F4D2C] flex items-center justify-center shadow-sm">
                <span className="text-lg font-bold">🤝</span>
              </div>
              <h3 className="text-base font-extrabold text-slate-800">Value for People & Planet</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Sourced from sustainable local farms, packed in eco-friendly containers, and delivered with care.</p>
            </div>
          </div>

          {/* The Minds Behind */}
          <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
            <span className="text-[11px] font-bold tracking-[0.2em] text-[#1F4D2C] uppercase block">
              CO-FOUNDERS & OPERATORS
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              The Minds Behind NutriFlow
            </h2>
          </div>

          {/* Co-Founders Grid */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"
          >
            {[
              {
                name: "Priya Nair",
                role: "FOUNDER & CEO",
                bio: "Certified nutritionist guiding daily meal macros and clinical recipe balances.",
                image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&h=600&fit=crop"
              },
              {
                name: "Chef Arjun",
                role: "HEAD CHEF",
                bio: "Culinary specialist blending premium gourmet style with pure, healthy ingredients.",
                image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=500&h=600&fit=crop"
              },
              {
                name: "Meera Krishnan",
                role: "OPERATIONS LEAD",
                bio: "Fresh logistics expert optimizing kitchen routing and prompt morning shipping.",
                image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&h=600&fit=crop"
              },
              {
                name: "Rahul Pathak",
                role: "LOGISTICS LEAD",
                bio: "Ensures delivery fleet operations run on time within active delivery zones.",
                image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&h=600&fit=crop"
              }
            ].map((member, index) => (
              <motion.div 
                key={member.name}
                variants={cardVariants}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between"
              >
                {/* Photo */}
                <div className="aspect-[4/5] relative bg-slate-50 overflow-hidden group">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                  />
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between text-center">
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-extrabold text-slate-800">{member.name}</h3>
                    <span className="text-[10px] font-bold text-[#1F4D2C] uppercase tracking-wider block">{member.role}</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed pt-1.5">{member.bio}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4. THE NUTRIFLOW JOURNEY / 4-STEP PROCESS SECTION */}
      <section className="py-20 md:py-28 px-6 bg-[#F8FAF5]/40 text-center relative">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-20 space-y-3">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1F4D2C] tracking-tight font-playfair italic">
            The NutriFlow Journey
          </h2>
          <p className="text-slate-400 text-xs uppercase tracking-wider font-bold">
            Four simple steps to your daily breakfast routine
          </p>
        </div>

        {/* Steps Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-6 relative"
        >
          {STEPS.map((step) => {
            const IconComponent = step.icon;
            return (
              <motion.div 
                key={step.num}
                variants={cardVariants}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 text-center relative flex flex-col items-center group hover:shadow-md transition-shadow duration-300"
              >
                {/* Number badge */}
                <div className="absolute -top-3.5 -left-3.5 w-8 h-8 rounded-full bg-[#1F4D2C] text-white text-[11px] font-extrabold flex items-center justify-center shadow-lg">
                  {step.num}
                </div>

                {/* Icon wrapper */}
                <div className="w-14 h-14 rounded-2xl bg-[#EAF7EB] text-[#1F4D2C] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                  <IconComponent className="w-6 h-6 stroke-[2]" />
                </div>

                <h3 className="text-sm font-extrabold text-slate-800">{step.title}</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-2.5 max-w-[170px] mx-auto">
                  {step.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* 5. TESTIMONIALS / REVIEWS SECTION */}
      <section className="py-20 md:py-28 px-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-4">
          <div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              Heard in the City
            </h2>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider md:max-w-xs md:text-right">
            Real stories from our morning community
          </p>
        </div>

        {/* Testimonials Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {TESTIMONIALS.map((t) => (
            <motion.div 
              key={t.name}
              variants={cardVariants}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 flex flex-col justify-between hover:shadow-md transition-shadow duration-300"
            >
              <div>
                {/* Quote Icon */}
                <div className="text-[#EAF7EB] text-5xl font-serif leading-none select-none">“</div>
                <p className="text-slate-600 text-sm leading-relaxed italic -mt-4">
                  {t.quote}
                </p>
              </div>

              {/* Author Detail */}
              <div className="mt-8 pt-5 border-t border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#EAF7EB] text-[#1F4D2C] flex items-center justify-center font-bold text-xs">
                    {t.initials}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{t.name}</h4>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{t.plan}</span>
                  </div>
                </div>
                {/* 5 Stars */}
                <div className="flex gap-0.5 mt-3.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 6. BOTTOM CTA SECTION */}
      <section className="py-20 md:py-24 px-6 bg-[#1F4D2C] text-white text-center relative overflow-hidden">
        {/* Soft circle glow behind */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#EAF7EB]/10 blur-[100px] pointer-events-none" />

        <div className="max-w-xl mx-auto space-y-6 relative z-10">
          <motion.h2 
            initial={{ scale: 0.95 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-extrabold tracking-tight"
          >
            Ready to transform your <span className="font-playfair italic font-normal text-green-200">mornings?</span>
          </motion.h2>
          <p className="text-green-100/70 text-sm md:text-base max-w-sm mx-auto">
            Join 500+ people who start their day with NutriFlow
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <button
              onClick={() => setActiveTab("Membership")}
              className="bg-white text-[#1F4D2C] px-8 py-4 rounded-xl font-bold text-sm cursor-pointer hover:bg-green-50 hover:shadow-lg transition-all"
            >
              Start Your Plan
            </button>
            <button
              onClick={() => setActiveTab("Order Today")}
              className="bg-transparent border border-white/30 text-white px-8 py-4 rounded-xl font-bold text-sm cursor-pointer hover:bg-white/10 transition-all"
            >
              Order Today
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer setActiveTab={setActiveTab} />
    </div>
  );
}
