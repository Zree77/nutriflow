


import { useState } from "react";
import { ShoppingCart, Menu, X } from "lucide-react";
import nuriflow_logo from "../assets/nutriflow_logo.svg"


export default function Navbar({ onOpenOTP, activeTab, setActiveTab, cartCount = 0 }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [localActive, setLocalActive] = useState("Home");

  const active = activeTab !== undefined 
    ? (activeTab === "About" ? "About Us" : activeTab) 
    : localActive;

  const setActive = (tab) => {
    let targetTab = tab;
    if (tab === "About Us") {
      targetTab = "About";
    }
    if (setActiveTab) {
      setActiveTab(targetTab);
    } else {
      setLocalActive(targetTab);
    }
  };
  const links = ["Home", "Membership", "Order Today", "About Us", "Contact Us"];

  return (
    <nav className="fixed top-0  w-full  px-6 py-4 bg-primary-background backdrop-blur-sm z-50">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <a 
          href="#" 
          onClick={(e) => { e.preventDefault(); setActive("Home"); }}
          className="text-2xl font-bold text-[#0c280e]"
        >
        <img src={nuriflow_logo} alt="NutriFlow" className="h-8 w-auto" />
        </a>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <a
              key={link}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActive(link);
              }}
              className={`text-[15px] font-medium pb-1 border-b-2 transition-all duration-500 ease  ${
                active === link
                  ? "text-primary border-primary-hover"
                  : "text-gray-700 border-transparent hover:text-[#2E7D32]"
              }`}
            >
              {link}
            </a>
          ))}
        </div>

        {/* Right side actions */}
        <div className="hidden md:flex items-center gap-4">
          {/* Cart Icon - always visible */}
          <button onClick={() => setActive("Cart")} className="relative cursor-pointer" aria-label="Cart">
            <ShoppingCart className="w-6 h-6 text-gray-800" strokeWidth={1.8} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#2E7D32] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {(() => {
            const token = localStorage.getItem('nutriflow_token') || localStorage.getItem('token') || localStorage.getItem('auth_token');
            
            if (token) {
              // LOGGED IN: Show profile avatar + tier badge, NO "Plan Your Week" button
              const userTier = localStorage.getItem('nutriflow_tier') || 'Premium';
              const userName = localStorage.getItem('nutriflow_user_name') || 'Rahi';
              const initial = userName ? userName.charAt(0).toUpperCase() : 'R';
              const isPremium = userTier.toLowerCase().includes('premium');

              return (
                <button
                  onClick={() => setActive("Profile")}
                  className="flex items-center gap-2.5 cursor-pointer group"
                >
                  {/* Tier Badge */}
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                    isPremium 
                      ? 'bg-[#EAF7EB] text-[#1F4D2C] border-[#1F4D2C]/20' 
                      : 'bg-gray-100 text-slate-500 border-gray-200'
                  }`}>
                    {userTier}
                  </span>
                  
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-[#EAF7EB] border-2 border-[#1F4D2C]/20 flex items-center justify-center text-sm font-extrabold text-[#1F4D2C] group-hover:shadow-md group-hover:border-[#1F4D2C]/40 transition-all relative">
                    <img 
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop" 
                      alt="Profile" 
                      className="w-full h-full object-cover absolute inset-0"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <span className="relative z-10">{initial}</span>
                  </div>
                </button>
              )
            }

            // NOT LOGGED IN: Show "Log in" text + "Plan Your Week" button (existing behavior)
            return (
              <>
                <button
                  onClick={() => onOpenOTP?.()}
                  className="text-[15px] font-medium text-gray-700 hover:text-[#2E7D32] transition-colors cursor-pointer"
                >
                  Log in
                </button>
                <button
                  onClick={() => setActive("Membership")}
                  className="bg-[#1F4D2C] hover:bg-[#173C22] text-white text-[15px] font-semibold px-5 py-2.5 rounded-full transition-colors cursor-pointer"
                >
                  Plan Your Week
                </button>
              </>
            )
          })()}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-gray-800"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 flex flex-col gap-4 pb-2">
          {links.map((link) => (
            <a
              key={link}
              href="#"
              onClick={() => {
                setActive(link);
                setMenuOpen(false);
              }}
              className={`text-[15px] font-medium ${
                active === link ? "text-[#2E7D32]" : "text-gray-700"
              }`}
            >
              {link}
            </a>
          ))}

          <div className="flex items-center justify-between pt-3 border-t border-gray-300">
            <button onClick={() => { setActive("Cart"); setMenuOpen(false); }} className="relative cursor-pointer" aria-label="Cart">
              <ShoppingCart className="w-6 h-6 text-gray-800" strokeWidth={1.8} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#2E7D32] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {(() => {
              const token = localStorage.getItem('nutriflow_token') || localStorage.getItem('token') || localStorage.getItem('auth_token');
              if (token) {
                return (
                  <button
                    onClick={() => { setActive("Profile"); setMenuOpen(false); }}
                    className="text-[15px] font-medium text-gray-700 hover:text-[#2E7D32] cursor-pointer"
                  >
                    Profile
                  </button>
                )
              }
              return (
                <button
                  onClick={() => {
                    onOpenOTP?.()
                    setMenuOpen(false)
                  }}
                  className="text-[15px] font-medium text-gray-700 cursor-pointer"
                >
                  Log in
                </button>
              )
            })()}

            <button
              onClick={() => {
                setActive("Membership");
                setMenuOpen(false);
              }}
              className="bg-[#1F4D2C] hover:bg-[#173C22] text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors cursor-pointer"
            >
              {active === "Membership" ? "Step 1 of 4" : "Plan Your Week"}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}