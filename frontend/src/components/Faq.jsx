import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqData = [
  {
    id: 1,
    question: "Can I skip a day if I'm traveling?",
    answer: "Absolutely. Just head to the app and pause or skip your delivery for any day. Just make sure you do it before 8 PM the night before."
  },
  {
    id: 2,
    question: "What areas in Kochi do you deliver to?",
    answer: "We currently deliver across Kakkanad, Infopark, and surrounding areas. Edapally and Marine Drive are coming soon — stay tuned."
  },
  {
    id: 3,
    question: "Is the packaging sustainable?",
    answer: "Yes. We use 100% compostable containers made from sugarcane bagasse. No plastic, no guilt."
  },
  {
    id: 4,
    question: "Do you offer non-vegetarian options?",
    answer: "Our High-Protein and Balanced plans include eggs, poultry, and fish. You can set your preferences during sign-up."
  }
];

const Faq = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-[#F9F8F6] py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-[720px] mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2
            className="text-[36px] md:text-[40px] font-bold text-[#0F172A] tracking-tight font-serif"
            style={{ fontFamily: "'Newsreader', 'Playfair Display', Georgia, serif" }}
          >
            Frequently Asked Questions
          </h2>
          <p className="text-slate-500 text-base md:text-lg mt-2 font-normal">
            Everything you need to know about your daily meals.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-[18px]">
          {faqData.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? 'border-l-4 border-l-[#E5B044] border-gray-200 shadow-md'
                    : 'border-[#E5E7EB] shadow-sm hover:shadow-md'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(index)}
                  className="w-full text-left px-5 sm:px-6 py-5 flex items-center justify-between gap-4 focus:outline-none cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-[#0F172A] text-base md:text-[16px] leading-snug">
                    {item.question}
                  </span>

                  <span
                    className={`w-8 h-8 rounded-full bg-[#E5B044]/15 text-[#E5B044] flex items-center justify-center shrink-0 transition-all duration-300 ${
                      isOpen ? 'rotate-45 bg-[#E5B044] text-white' : ''
                    }`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="2.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.04, 0.62, 0.23, 0.98] }}
                    >
                      <div className="px-5 sm:px-6 pb-5 pt-1 text-[#475569] text-[15px] leading-[1.7] font-normal border-t border-gray-50">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Faq;
