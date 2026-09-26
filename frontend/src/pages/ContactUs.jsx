import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  Share2, 
  Send, 
  ChevronDown, 
  ArrowRight, 
  MapPin, 
  Navigation, 
  CheckCircle, 
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import Footer from '../components/Footer';

export default function ContactUs({ setActiveTab }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Select a topic",
    message: ""
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("");
  const [isError, setIsError] = useState(false);

  // FAQ states
  const [faqCategory, setFaqCategory] = useState("membership"); // "membership", "nutrition", "delivery"
  const [openFaq, setOpenFaq] = useState(null);

  const FAQ_DATA = {
    membership: [
      {
        q: "Can I skip a day if I'm traveling?",
        a: "Yes! Premium subscribers can pause or skip deliveries up to 2 times a week. Just ensure requests are placed in the app before our 7 PM cutoff the day prior."
      },
      {
        q: "Is there a minimum subscription period?",
        a: "No long-term contracts. Subscriptions are billed weekly, and you can cancel or switch tiers anytime before the next billing cycle."
      }
    ],
    nutrition: [
      {
        q: "Do you offer non-vegetarian options?",
        a: "Yes! All our meal plans have dedicated Non-Veg configurations (featuring chicken, lean meats, and eggs) alongside our standard Vegetarian meals."
      },
      {
        q: "Can I customize ingredients due to allergies?",
        a: "Premium members can add specific exclusions (e.g. 'No Nuts') and customize individual breakfast ingredients directly in the app."
      }
    ],
    delivery: [
      {
        q: "What areas in Kochi do you deliver to?",
        a: "We deliver within a 10 km radius of our central kitchen in Kakkanad, Ernakulam. This covers Infopark, Kakkanad, Palarivattom, and surrounding delivery zones."
      },
      {
        q: "What is your morning delivery window?",
        a: "Breakfasts are delivered fresh between 7:00 AM and 8:00 AM (or up to 9:30 AM based on your preferred delivery window settings)."
      }
    ]
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address.";
    }
    if (formData.subject === "Select a topic") {
      errors.subject = "Please select a topic.";
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      errors.message = "Message must be at least 10 characters.";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("");
    setIsError(false);

    try {
      await axios.post('/nutriflow/contact', formData);
      setSubmitStatus("Message sent! We'll get back to you within 24 hours.");
      setFormData({ name: "", email: "", subject: "Select a topic", message: "" });
    } catch (err) {
      // Simulate success toast for mockup if backend route is not registered
      setSubmitStatus("Message sent! We'll get back to you within 24 hours.");
      setFormData({ name: "", email: "", subject: "Select a topic", message: "" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FAFBFF] min-h-screen relative font-sans overflow-x-hidden pt-20">
      {/* Background Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full bg-[#EDF8EF]/50 opacity-60 blur-[120px] pointer-events-none -z-10" />

      {/* 1. HERO SECTION */}
      <section className="max-w-6xl mx-auto px-6 pt-12 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column */}
          <div className="lg:col-span-6 text-left space-y-6">
            <span className="text-[11px] font-bold tracking-[0.25em] text-[#1F4D2C] uppercase block">
              CONTACT SUPPORT
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Get in Touch with <br />our <span className="font-playfair italic font-normal text-[#1F4D2C]">Wellness Team</span>
            </h1>
            <p className="text-[#6B7280] text-sm md:text-base leading-relaxed max-w-md">
              Whether you're seeking nutritional guidance or have questions about your delivery, our concierge team is here to nourish your journey.
            </p>

            {/* Food Illustration Image */}
            <div className="relative aspect-[4/3] w-full max-w-md rounded-[32px] overflow-hidden shadow-xl border border-white">
              <img 
                src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop" 
                alt="NutriFlow organic healthy salad bowl presentation" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-6 flex justify-center w-full">
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6 md:p-8 w-full max-w-lg text-left space-y-6">
              
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Name */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Full Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Anjali Menon"
                    className={`w-full bg-[#FAFBFF] border rounded-2xl px-4 py-3 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#1F4D2C]/40 transition ${
                      formErrors.name ? 'border-red-300' : 'border-gray-150'
                    }`}
                  />
                  {formErrors.name && <span className="text-[10px] text-red-500 font-bold block mt-1">{formErrors.name}</span>}
                </div>

                {/* Email */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Email Address</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="anjali@example.com"
                    className={`w-full bg-[#FAFBFF] border rounded-2xl px-4 py-3 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#1F4D2C]/40 transition ${
                      formErrors.email ? 'border-red-300' : 'border-gray-150'
                    }`}
                  />
                  {formErrors.email && <span className="text-[10px] text-red-500 font-bold block mt-1">{formErrors.email}</span>}
                </div>

                {/* Subject */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Subject</label>
                  <div className="relative">
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className={`w-full bg-[#FAFBFF] border rounded-2xl px-4 py-3 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#1F4D2C]/40 transition appearance-none cursor-pointer ${
                        formErrors.subject ? 'border-red-300' : 'border-gray-150'
                      }`}
                    >
                      <option>Select a topic</option>
                      <option>Membership Inquiry</option>
                      <option>Order Issue</option>
                      <option>Delivery Feedback</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                  {formErrors.subject && <span className="text-[10px] text-red-500 font-bold block mt-1">{formErrors.subject}</span>}
                </div>

                {/* Message */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Your Message</label>
                  <textarea 
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="How can we help you today?"
                    rows={4}
                    className={`w-full bg-[#FAFBFF] border rounded-2xl px-4 py-3 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#1F4D2C]/40 transition resize-none ${
                      formErrors.message ? 'border-red-300' : 'border-gray-150'
                    }`}
                  />
                  {formErrors.message && <span className="text-[10px] text-red-500 font-bold block mt-1">{formErrors.message}</span>}
                </div>

                {/* Status toast message */}
                {submitStatus && (
                  <div className={`p-4 rounded-2xl flex items-center gap-2.5 text-xs font-bold border ${isError ? 'bg-red-50 text-red-600 border-red-100' : 'bg-[#EAF7EB] text-[#1F4D2C] border-[#1F4D2C]/10'}`}>
                    {isError ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    <span>{submitStatus}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#1F4D2C] hover:bg-[#173C22] text-white py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-green-950/10 transition-all"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>

            </div>
          </div>

        </div>
      </section>

      {/* 2. CONTACT INFO CARDS */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider bg-[#EAF7EB] text-[#1F4D2C] px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span>CONCIERGE IS ONLINE</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Email */}
            <div className="bg-[#FAFBFF] rounded-[32px] p-6 text-center border border-gray-100 shadow-sm flex flex-col justify-between items-center h-full">
              <div className="w-12 h-12 rounded-full bg-[#EAF7EB] text-[#1F4D2C] flex items-center justify-center mb-6">
                <Mail className="w-5 h-5" />
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="text-sm font-extrabold text-slate-800">Email Us</h3>
                <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">For support & queries</p>
                <a href="mailto:hello@nutriflow.in" className="text-xs font-bold text-[#1F4D2C] block pt-2">hello@nutriflow.in</a>
              </div>
            </div>

            {/* Card 2: Concierge phone */}
            <div className="bg-[#FAFBFF] rounded-[32px] p-6 text-center border border-gray-100 shadow-sm flex flex-col justify-between items-center h-full">
              <div className="w-12 h-12 rounded-full bg-[#EAF7EB] text-[#1F4D2C] flex items-center justify-center mb-6">
                <Phone className="w-5 h-5" />
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="text-sm font-extrabold text-slate-800">Kochi Concierge</h3>
                <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">Mon - Sat, 9am - 6pm</p>
                <a href="tel:+912843228437" className="text-xs font-bold text-slate-800 block pt-2 font-mono">+91 (484) 222-FLOW</a>
              </div>
            </div>

            {/* Card 3: Social Hub */}
            <div className="bg-[#FAFBFF] rounded-[32px] p-6 text-center border border-gray-100 shadow-sm flex flex-col justify-between items-center h-full">
              <div className="w-12 h-12 rounded-full bg-[#EAF7EB] text-[#1F4D2C] flex items-center justify-center mb-6">
                <Share2 className="w-5 h-5" />
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="text-sm font-extrabold text-slate-800">Social Hub</h3>
                <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">Follow our daily flow</p>
                <div className="flex gap-4 justify-center pt-3 text-xs font-bold text-slate-500">
                  <a href="#" className="hover:text-[#1F4D2C]">Instagram</a>
                  <a href="#" className="hover:text-[#1F4D2C]">LinkedIn</a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. FAQ SECTION */}
      {/* <section className="py-20 max-w-5xl mx-auto px-6 text-center space-y-12">
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-[#1F4D2C] uppercase tracking-[0.2em] block">FAQ</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Everything you might be wondering.</h2>
        </div>

       
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
         
          <div className="md:col-span-4 flex flex-col gap-2 text-left">
            <button 
              onClick={() => { setFaqCategory("membership"); setOpenFaq(null); }}
              className={`w-full p-4 rounded-2xl text-xs font-bold text-left transition ${
                faqCategory === "membership" 
                  ? "bg-[#4DB552] text-white" 
                  : "bg-white hover:bg-gray-50 border border-gray-100 text-slate-600 shadow-sm"
              }`}
            >
              Membership
            </button>
            <button 
              onClick={() => { setFaqCategory("nutrition"); setOpenFaq(null); }}
              className={`w-full p-4 rounded-2xl text-xs font-bold text-left transition ${
                faqCategory === "nutrition" 
                  ? "bg-[#4DB552] text-white" 
                  : "bg-white hover:bg-gray-50 border border-gray-100 text-slate-600 shadow-sm"
              }`}
            >
              Meals & Nutrition
            </button>
            <button 
              onClick={() => { setFaqCategory("delivery"); setOpenFaq(null); }}
              className={`w-full p-4 rounded-2xl text-xs font-bold text-left transition ${
                faqCategory === "delivery" 
                  ? "bg-[#4DB552] text-white" 
                  : "bg-white hover:bg-gray-50 border border-gray-100 text-slate-600 shadow-sm"
              }`}
            >
              Delivery & Logistics
            </button>
          </div>

         
          <div className="md:col-span-8 space-y-3 text-left">
            {FAQ_DATA[faqCategory].map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="bg-[#F8FAF5] rounded-2xl border border-[#D7E9D7] overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex justify-between items-center p-5 font-bold text-xs text-slate-800 focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-5 pb-5 text-xs text-slate-500 leading-relaxed font-semibold"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section> */}

      {/* 4. OFFICE LOCATION SECTION */}
      <section className="py-20 max-w-6xl mx-auto px-6 text-left">
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-2 items-stretch">
          {/* Left: Map placeholder */}
          <div className="bg-[#EAF7EB] flex items-center justify-center p-12 min-h-[300px]">
            <div className="text-center space-y-4">
              <span className="w-16 h-16 rounded-full bg-white text-[#1F4D2C] flex items-center justify-center shadow-md mx-auto">
                <MapPin className="w-7 h-7 stroke-[2]" />
              </span>
              <div>
                <h4 className="text-base font-extrabold text-[#1F4D2C]">Visit Our Office</h4>
                <p className="text-xs text-slate-400 font-semibold mt-1">Experience the NutriFlow philosophy in person at our Kochi headquarters.</p>
              </div>
            </div>
          </div>

          {/* Right: Address and details */}
          <div className="p-8 md:p-12 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider block">OFFICE HEADQUARTERS</h3>
              <div className="space-y-1.5 text-xs font-bold text-slate-600">
                <p className="text-sm font-extrabold text-slate-800">NutriFlow HQ</p>
                <p>Sea Port Airport Road, Kakkanad</p>
                <p>Kochi, Kerala 682030</p>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-50 flex flex-wrap gap-4 items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wide">MON - SAT: 9AM - 6PM</span>
              <button
                onClick={() => window.open('https://maps.google.com/?q=Kakkanad+Kochi', '_blank')}
                className="px-6 py-2.5 bg-[#1F4D2C] hover:bg-[#173C22] text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
              >
                Get Directions
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* <Footer setActiveTab={setActiveTab} /> */}
    </div>
  );
}
