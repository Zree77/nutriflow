import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { MessageCircle, X, Send, Check, Bot, ScanLine } from 'lucide-react'

const INITIAL_MESSAGES = [
  {
    id: 1,
    sender: 'bot',
    text: "Hi! I'm Nutri AI, your personal nutrition assistant. Ask me to recommend a meal for your health goal and I'll show you full nutrition analysis!",
    type: 'text'
  }
]

const MEAL_RECOMMENDATIONS = {
  "high protein": {
    name: "Herb Grilled Chicken Sandwich",
    description: "Tender herb-marinated grilled chicken breast with crisp lettuce, fresh tomato, and Greek yogurt dressing on toasted whole-wheat sourdough.",
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop",
    calories: 420, protein: 32, carbs: 38, fats: 14, fiber: 6,
    goalMatch: 96,
    goalLabel: "High Protein",
    ingredients: ["Whole wheat bread", "Grilled chicken breast", "Lettuce & cucumber", "Greek yogurt dressing"],
    aiNote: "The grilled chicken breast provides high-quality lean protein (32g) essential for muscle recovery and satiety. Whole wheat bread adds complex carbohydrates and dietary fiber, keeping you full longer without blood sugar spikes. This combination perfectly supports your High Protein goal with a 96% match rate."
  },
  "weight loss": {
    name: "Green Boost Smoothie",
    description: "Detoxifying blend of spinach, green apple, cucumber, celery, and spirulina with coconut water base.",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
    calories: 160, protein: 4, carbs: 32, fats: 1, fiber: 8,
    goalMatch: 94,
    goalLabel: "Weight Loss",
    ingredients: ["Spinach", "Green apple", "Cucumber", "Celery", "Spirulina", "Coconut water"],
    aiNote: "At only 160 calories, this smoothie is extremely calorie-dense-efficient. The high fiber content from vegetables slows digestion and extends satiety. Spirulina adds a complete protein profile while coconut water provides electrolytes without added sugar."
  },
  "weight gain": {
    name: "Chicken Cheese Sandwich",
    description: "Hearty grilled chicken layered with melted white cheddar cheese, fresh avocado slices, and seasoned mayo on sourdough.",
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop",
    calories: 580, protein: 42, carbs: 46, fats: 22, fiber: 4,
    goalMatch: 92,
    goalLabel: "Weight Gain",
    ingredients: ["Sourdough bread", "Grilled chicken", "White cheddar cheese", "Avocado", "Seasoned mayo"],
    aiNote: "This calorie-dense sandwich delivers 580 kcal with 42g protein — ideal for a caloric surplus needed for weight gain. The combination of complex carbs from sourdough, healthy fats from avocado, and high-quality protein from chicken creates a balanced mass-building meal."
  },
  "balanced": {
    name: "Apple Cinnamon Overnight Oats",
    description: "Creamy rolled oats soaked overnight in almond milk with crisp apple slices, chia seeds, and cinnamon.",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
    calories: 380, protein: 12, carbs: 54, fats: 8, fiber: 9,
    goalMatch: 91,
    goalLabel: "Balanced Diet",
    ingredients: ["Rolled oats", "Almond milk", "Apple slices", "Chia seeds", "Cinnamon", "Honey"],
    aiNote: "A perfectly balanced breakfast with a 46:22:19:13 macro split. The oats provide sustained energy through complex carbohydrates, while chia seeds add omega-3 fatty acids. Apple and cinnamon contribute to blood sugar regulation, making this an ideal daily staple."
  },
  "diabetic": {
    name: "Sprouts Garden Salad",
    description: "Fresh moong sprouts with pomegranate seeds, onions, coriander leaves, and lemon dressing.",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
    calories: 250, protein: 12, carbs: 28, fats: 5, fiber: 9,
    goalMatch: 95,
    goalLabel: "Diabetic Friendly",
    ingredients: ["Moong sprouts", "Pomegranate seeds", "Onions", "Coriander leaves", "Lemon dressing"],
    aiNote: "With a low glycemic index and only 28g net carbs, this salad is designed to prevent blood sugar spikes. The high fiber (9g) from sprouts slows glucose absorption. Pomegranate seeds add antioxidants while lemon dressing provides vitamin C without added sugars."
  }
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef(null)
  const panelRef = useRef(null)
  const shouldReduceMotion = useReducedMotion()

  const [expandedNutrition, setExpandedNutrition] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Auto-scroll to bottom of message list
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen, isTyping])

  // Close when clicking outside panel
  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener('open-nutriflow-chatbot', handleOpenChat);

    const handleClickOutside = (e) => {
      if (isOpen && panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      window.removeEventListener('open-nutriflow-chatbot', handleOpenChat);
      document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen])

  const getBotReply = (userMsg) => {
    const lower = userMsg.toLowerCase()
    let mealKey = null
    let prefixText = ""

    if (lower.includes('high protein') || lower.includes('protein')) {
      mealKey = "high protein"
      prefixText = "Here's my top recommendation for your High Protein goal:"
    } else if (lower.includes('weight loss') || lower.includes('lose weight') || lower.includes('diet')) {
      mealKey = "weight loss"
      prefixText = "For your Weight Loss goal, I recommend this low-calorie option:"
    } else if (lower.includes('weight gain') || lower.includes('gain weight') || lower.includes('bulk')) {
      mealKey = "weight gain"
      prefixText = "To support your Weight Gain goals, this calorie-dense option is perfect:"
    } else if (lower.includes('balanced') || lower.includes('balance')) {
      mealKey = "balanced"
      prefixText = "Here's a perfectly balanced breakfast for daily nutrition:"
    } else if (lower.includes('diabet') || lower.includes('sugar') || lower.includes('diabetic')) {
      mealKey = "diabetic"
      prefixText = "For blood sugar management, this low-GI option is ideal:"
    } else if (lower.includes('recommend') || lower.includes('suggest') || lower.includes('what should')) {
      mealKey = "high protein" // default recommendation
      prefixText = "Here's my top recommendation for you:"
    } else if (lower.includes('plan') || lower.includes('subscription')) {
      return { type: 'text', text: "We offer 5 diet plans: High Protein, Weight Loss, Weight Gain, Balanced Diet, and Diabetic Friendly. Each comes in Standard and Premium tiers with Veg/Non-Veg options! Try asking me to recommend a meal for your goal." }
    } else if (lower.includes('price') || lower.includes('cost') || lower.includes('how much')) {
      return { type: 'text', text: "Plans start from ₹899/week for Standard Veg. Premium plans start at ₹1099/week and include perks like ingredient customization and meal pausing. Ask me to recommend a meal to see nutrition details!" }
    } else if (lower.includes('pause')) {
      return { type: 'text', text: "Premium subscribers can pause up to 2 meals per week! Just make sure to pause before 7 PM the day before delivery. Your subscription billing continues during pauses." }
    } else if (lower.includes('veg') || lower.includes('vegetarian')) {
      return { type: 'text', text: "All our plans have Veg options! Standard Veg starts at ₹899/week and Premium Veg at ₹1099/week with customization perks. Ask me to recommend a specific veg meal!" }
    } else if (lower.includes('non-veg') || lower.includes('non veg') || lower.includes('chicken')) {
      mealKey = "high protein" // chicken sandwich
      prefixText = "Here's a popular non-veg option packed with protein:"
    } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
      return { type: 'text', text: "Hello! Welcome to Nutri AI. I can recommend meals based on your health goal. Try asking: 'recommend a high protein breakfast' or 'suggest a meal for weight loss'!" }
    } else if (lower.includes('thank')) {
      return { type: 'text', text: "You're welcome! Feel free to ask for more recommendations anytime. I can analyze nutrition for any of our 5 diet plans!" }
    }

    if (mealKey && MEAL_RECOMMENDATIONS[mealKey]) {
      return {
        type: 'meal',
        text: prefixText,
        mealCard: MEAL_RECOMMENDATIONS[mealKey]
      }
    }

    return { type: 'text', text: "Great question! Try asking me to recommend a meal by specifying your goal — like 'recommend a high protein breakfast' or 'what should I eat for weight loss?' I'll show you full nutrition analysis!" }
  }

  const handleSend = (e) => {
    e?.preventDefault()
    if (!inputValue.trim() || isTyping) return

    const userText = inputValue.trim()
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: userText,
      type: 'text'
    }

    setMessages((prev) => [...prev, userMsg])
    setInputValue('')
    setIsTyping(true)

    setTimeout(() => {
      const reply = getBotReply(userText)

      if (reply.type === 'meal') {
        // First: show text message + analyzing indicator
        const textMsg = {
          id: Date.now() + 1,
          sender: 'bot',
          text: reply.text,
          type: 'text'
        }
        const analyzingMsg = {
          id: Date.now() + 2,
          sender: 'bot',
          analyzing: true
        }

        setMessages((prev) => [...prev, textMsg, analyzingMsg])
        setIsTyping(false)

        // Then: replace analyzing with meal card after delay
        setTimeout(() => {
          setMessages((prev) => prev.map(m =>
            m.analyzing
              ? { id: m.id, sender: 'bot', mealCard: reply.mealCard }
              : m
          ))
          scrollToBottom()
        }, 1500)

      } else {
        const botMsg = {
          id: Date.now() + 1,
          sender: 'bot',
          text: reply.text,
          type: 'text'
        }
        setMessages((prev) => [...prev, botMsg])
        setIsTyping(false)
      }
    }, 1000)
  }

  const renderAnalyzingIndicator = () => (
    <div className="w-full max-w-[320px]">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-[#1F4D2C]/20 border-t-transparent animate-spin flex items-center justify-center">
          <div className="w-4 h-4 rounded-full border-2 border-[#1F4D2C] border-r-transparent animate-spin" />
        </div>
        <span className="text-xs font-bold text-[#1F4D2C]">Analyzing nutrition...</span>
      </div>
    </div>
  )

  const renderMealCard = (meal) => {
    const isExpanded = expandedNutrition === meal.name

    return (
      <div className="w-full max-w-[320px]">
        {/* Main Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden text-left">
          {/* Top Full Width Image */}
          <div className="aspect-[4/3] w-full relative bg-slate-50 overflow-hidden">
            <img
              src={meal.image}
              alt={meal.name}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop" }}
            />
            {/* Top match badge */}
            <span className="absolute top-3 left-3 bg-[#1F4D2C] text-white text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
              Best for {meal.goalLabel} Goal
            </span>
          </div>

          {/* Details body */}
          <div className="p-5 space-y-4">
            <div className="space-y-1">
              <h4 className="text-xl font-extrabold text-slate-900 leading-snug tracking-tight font-playfair">
                {meal.name}
              </h4>
            </div>

            {/* Split row */}
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-50 text-[11px] font-semibold text-slate-500">
              <div className="flex items-center gap-1.5">
                <span>🔥</span>
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">CALORIES</span>
                  <strong className="text-slate-800 font-extrabold font-mono text-xs">{meal.calories} kcal</strong>
                </div>
              </div>
              <div className="flex items-center gap-1.5 border-l border-gray-100 pl-4">
                <span>🌱</span>
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">PROTEIN</span>
                  <strong className="text-[#1F4D2C] font-extrabold font-mono text-xs">{meal.protein}g</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action buttons */}
          <div className="border-t border-gray-50 bg-[#F8FAF5]/40 p-3 grid grid-cols-2 gap-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-600">
            <button
              onClick={() => {
                if (isExpanded) {
                  setExpandedNutrition(null)
                } else {
                  setIsAnalyzing(true)
                  setTimeout(() => {
                    setExpandedNutrition(meal.name)
                    setIsAnalyzing(false)
                  }, 1200)
                }
              }}
              className="py-2 hover:text-[#1F4D2C] hover:bg-white rounded-xl transition flex items-center justify-center gap-1 cursor-pointer border border-transparent hover:border-gray-100"
            >
              <span>📈 Nutrition Facts</span>
            </button>
            <button
              onClick={() => window.location.reload()}
              className="py-2 hover:text-[#1F4D2C] hover:bg-white rounded-xl transition flex items-center justify-center gap-1 cursor-pointer border border-transparent hover:border-gray-100"
            >
              <span>🍳 Similar Breakfasts</span>
            </button>
          </div>

          {/* Expanded Analysis Section */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="border-t border-gray-100 p-4 space-y-4 bg-white">
                  {/* Analysis Complete Badge */}
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#EAF7EB] flex items-center justify-center">
                      <Check className="w-3 h-3 text-[#1F4D2C]" />
                    </div>
                    <span className="text-[11px] font-bold text-[#1F4D2C] uppercase tracking-wider">Analysis Complete</span>
                  </div>

                  {/* Macro Bars */}
                  <div className="space-y-3 pt-2">
                    {[
                      { label: 'CALORIES', value: meal.calories, unit: ' kcal', max: 800, color: '#f59e0b' },
                      { label: 'PROTEIN', value: meal.protein, unit: ' g', max: 50, color: '#1F4D2C' },
                      { label: 'CARBS', value: meal.carbs, unit: ' g', max: 80, color: '#3b82f6' },
                      { label: 'FAT', value: meal.fats, unit: ' g', max: 30, color: '#ef4444' }
                    ].map((macro) => (
                      <div key={macro.label} className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                          <span>{macro.label}</span>
                          <span className="text-slate-800 font-mono">{macro.value}{macro.unit}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((macro.value / macro.max) * 100, 100)}%` }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: macro.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Goal Match */}
                  <div className="bg-[#EAF7EB]/50 rounded-2xl p-4 border border-[#D7E9D7]/50 space-y-1 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-[#1F4D2C] uppercase tracking-wider">Goal Match</span>
                      <strong className="text-sm font-extrabold text-[#1F4D2C]">{meal.goalMatch}%</strong>
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                      This meal perfectly aligns with your {meal.goalLabel} plan.
                    </p>
                  </div>

                  {/* AI Note */}
                  <div className="bg-[#F8FAF5] rounded-2xl p-4 border border-gray-100 text-left">
                    <span className="text-[10px] font-bold text-[#1F4D2C] uppercase tracking-wider block mb-1">AI Recommendation</span>
                    <p className="text-[11px] text-slate-500 font-semibold leading-relaxed italic">
                      "{meal.aiNote}"
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    )
  }

  // Animation values respecting prefers-reduced-motion
  const floatAnim = shouldReduceMotion
    ? {}
    : {
      y: [0, -15, 0, -8, 0],
      transition: {
        duration: 2.0,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }

  const shadowAnim = shouldReduceMotion
    ? {}
    : {
      scale: [1, 0.85, 1, 0.9, 1],
      opacity: [0.15, 0.08, 0.15, 0.1, 0.15]
    }

  return (
    <div className="fixed bottom-6 right-6 z-40 font-sans pointer-events-auto">
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <div className="relative group">

            {/* Anti-Gravity Button */}
            <motion.button
              animate={{ y: [0, -15, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => setIsOpen(true)}
              aria-label="Open Nutri AI"
              className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#37ea46] text-[#1F4D2C] shadow-[0_8px_24px_rgba(31,77,44,0.15)] border border-[#1F4D2C]/20 cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#1F4D2C]/20 animate-pulse"
            >
              <Bot className="w-6 h-6 text-[#101211]" />
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            className="fixed bottom-6 right-6 w-[380px] max-w-[calc(100vw-32px)] h-[500px] max-h-[calc(100vh-100px)] bg-white rounded-2xl border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col z-40"
          >
            {/* Header */}
            <div className="h-14 bg-gradient-to-r from-[#1F4D2C] to-[#4DB552] px-4 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/20">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm leading-tight">Nutri AI</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                    <span className="text-[11px] text-emerald-100 font-medium">AI Assistant</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close Chat"
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 active:scale-95 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Message List */}
            <div className="flex-1 bg-[#F8FAFC] p-4 overflow-y-auto space-y-3">
              {messages.map((msg) => {
                if (msg.mealCard) {
                  // Render rich meal card for bot messages with meal data
                  return (
                    <div key={msg.id} className="flex flex-col items-start gap-2">
                      {msg.text && (
                        <div className="max-w-[85%] bg-white text-slate-800 rounded-2xl rounded-bl-none border border-slate-100 shadow-sm px-4 py-2.5 text-sm leading-relaxed">
                          {msg.text}
                        </div>
                      )}
                      {renderMealCard(msg.mealCard)}
                    </div>
                  )
                }

                if (msg.analyzing) {
                  return <div key={msg.id}>{renderAnalyzingIndicator()}</div>
                }

                // Default text message rendering
                return (
                  <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[85%] px-4 py-2.5 text-sm leading-relaxed ${msg.sender === 'user'
                        ? 'bg-[#4B5563] text-white rounded-2xl rounded-br-none shadow-sm'
                        : 'bg-white text-slate-800 rounded-2xl rounded-bl-none border border-slate-100 shadow-sm'
                      }`}>
                      {msg.text}
                    </div>
                  </div>
                )
              })}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-center gap-1.5 px-4 py-3 bg-white border border-slate-100 rounded-2xl rounded-bl-xs w-max shadow-xs">
                  <motion.span
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    className="w-1.5 h-1.5 rounded-full bg-slate-400"
                  />
                  <motion.span
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                    className="w-1.5 h-1.5 rounded-full bg-slate-400"
                  />
                  <motion.span
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                    className="w-1.5 h-1.5 rounded-full bg-slate-400"
                  />
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleSend}
              className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
            >
              <button
                type="button"
                aria-label="Scan barcode"
                onClick={() => console.log('Scan button clicked — feature not yet implemented')}
                className="w-9 h-9 rounded-full bg-[#E8F5E9] text-[#1F4D2C] flex items-center justify-center hover:bg-[#C8E6C9] active:scale-95 transition-all cursor-pointer shrink-0"
              >
                <ScanLine className="w-4 h-4" />
              </button>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                disabled={isTyping}
                className="flex-1 text-sm text-slate-800 placeholder-slate-400 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 focus:outline-none focus:border-[#4DB552] focus:bg-white focus:ring-2 focus:ring-[#4DB552]/20 transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                aria-label="Send message"
                className="w-9 h-9 rounded-full bg-[#4DB552] text-white flex items-center justify-center disabled:opacity-40 hover:bg-[#1F4D2C] active:scale-95 transition-all cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4 translate-x-[0.5px]" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
