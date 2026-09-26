import React from 'react'
import { Mail, MapPin } from 'lucide-react'

const Footer = ({ setActiveTab }) => {
  return (
    <footer id="about" className="bg-[#1C231C] text-slate-300 pt-16 pb-12 px-6 sm:px-12 relative z-30 font-sans border-t border-slate-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16">
          {/* Left Brand Column */}
          <div className="lg:col-span-5 flex flex-col items-start">
            <a href="#home" onClick={(e) => { e.preventDefault(); setActiveTab?.("Home"); }} className="text-3xl font-extrabold text-[#4DB552] tracking-tight hover:opacity-90 transition-opacity">
              NutriFlow
            </a>
            <p className="text-slate-300 text-sm mt-4 max-w-sm leading-relaxed">
              Elevating wellness through morning nourishment, delivered fresh to your doorstep in Kochi.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-5 mt-6">
              <a href="#mail" aria-label="Email" className="text-slate-300 hover:text-[#4DB552] transition-colors">
                <Mail className="w-5 h-5" />
              </a>
              <a href="#facebook" aria-label="Facebook" className="text-slate-300 hover:text-[#4DB552] transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a href="#instagram" aria-label="Instagram" className="text-slate-300 hover:text-[#4DB552] transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a href="#twitter" aria-label="Twitter" className="text-slate-300 hover:text-[#4DB552] transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Right Links Columns */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {/* Column 1: MEMBERSHIP */}
            <div>
              <h4 className="text-[#4DB552] text-xs font-bold uppercase tracking-wider mb-4">
                MEMBERSHIP
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a 
                    href="#membership" 
                    onClick={(e) => { e.preventDefault(); setActiveTab?.("Membership"); }}
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    Membership
                  </a>
                </li>
                <li>
                  <a 
                    href="#plan" 
                    onClick={(e) => { e.preventDefault(); setActiveTab?.("Membership"); }}
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    Plan Your Week
                  </a>
                </li>
                <li>
                  <a href="#faq" className="text-slate-300 hover:text-white transition-colors">
                    Membership FAQ
                  </a>
                </li>
                <li>
                  <a href="#dashboard" className="text-slate-300 hover:text-white transition-colors">
                    User Dashboard
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 2: QUICK LINKS */}
            <div>
              <h4 className="text-[#4DB552] text-xs font-bold uppercase tracking-wider mb-4">
                QUICK LINKS
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#order" className="text-slate-300 hover:text-white transition-colors">
                    Order Today
                  </a>
                </li>
                <li>
                  <a href="#about" className="text-slate-300 hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#contact" className="text-slate-300 hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: LEGAL */}
            <div>
              <h4 className="text-[#4DB552] text-xs font-bold uppercase tracking-wider mb-4">
                LEGAL
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#privacy" className="text-slate-300 hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#terms" className="text-slate-300 hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#faq" className="text-slate-300 hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700/60 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} NutriFlow. All rights reserved.</p>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            <span>Kakkanad, Kerala</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
