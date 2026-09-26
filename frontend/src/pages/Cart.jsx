import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Minus, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';

const Cart = ({ setActiveTab, onOpenOTP, cartItems, cartQuantities, updateCartQty, clearCart }) => {
  const totalItems = Object.values(cartQuantities).reduce((sum, qty) => sum + qty, 0);

  const handleCheckout = () => {
    const token = localStorage.getItem('nutriflow_token') || localStorage.getItem('token') || localStorage.getItem('auth_token');
    if (!token) {
      onOpenOTP?.();
      return;
    }
    setActiveTab("OrderCheckout");
  };

  const getTagColor = (goal) => {
    switch (goal) {
      case "High Protein":
        return "bg-amber-50 text-amber-700";
      case "Weight Loss":
        return "bg-blue-50 text-blue-700";
      case "Weight Gain":
        return "bg-orange-50 text-orange-700";
      case "Balanced Diet":
        return "bg-green-50 text-green-700";
      case "Diabetic Friendly":
        return "bg-purple-50 text-purple-700";
      default:
        return "bg-green-50 text-green-700";
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-32 text-center flex flex-col items-center justify-center font-dmsans">
        <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
          <ShoppingCart className="w-10 h-10 text-slate-300" strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-bold text-slate-700">Your cart is empty</h2>
        <p className="text-sm text-slate-400 mt-2 max-w-sm">
          Add some delicious breakfast items
        </p>
        <button
          onClick={() => setActiveTab("Order Today")}
          className="mt-8 bg-[#1F4D2C] hover:bg-[#173C22] text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          Browse Menu
        </button>
      </div>
    );
  }

  // Find dynamic food mock representation or return placeholder
  const getImage = (item) => {
    if (item.image && item.image.startsWith('/')) return item.image;
    if (item.name) {
      if (item.name.includes("Chicken")) return "/high-protein-veg.png";
      if (item.name.includes("Bowl") || item.name.includes("Oats")) return "/Apple Cinnamon Overnight Oats.png";
      if (item.name.includes("Smoothie")) return "/Banana Protein Smoothie.png";
      if (item.name.includes("Sandwich")) return "/Chicken Egg Sandwich.png";
    }
    return "/breakfast_bowl.png";
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pt-24 pb-32 font-dmsans text-left">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-sans">Your Cart</h1>
          <p className="text-xs text-slate-400 mt-0.5">Review your breakfast order before checkout</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold uppercase tracking-wider text-red-400 hover:text-red-600 transition cursor-pointer"
        >
          Clear Cart
        </button>
      </div>

      {/* Cart Items List */}
      <div className="space-y-4 mb-8">
        {cartItems.map((item) => {
          const qty = cartQuantities[item._id] || 0;
          const isVeg = item.vegNonVeg === "Veg" || item.vegNonVeg === "Vegan";

          return (
            <div
              key={item._id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-row gap-4 relative overflow-hidden"
            >
              {/* Image with absolute veg / non-veg indicator */}
              <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                <img
                  src={getImage(item)}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-1.5 left-1.5 bg-white/90 backdrop-blur-sm rounded-full p-1 border border-gray-100 flex items-center justify-center shadow-sm">
                  <span className={`w-2.5 h-2.5 rounded-full border ${isVeg ? 'bg-green-600 border-green-700' : 'bg-red-600 border-red-700'}`} />
                </div>
              </div>

              {/* Item Details */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 truncate">{item.name}</h3>
                  <div className="flex flex-wrap gap-2 items-center mt-1.5">
                    <span className={`inline-flex text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${getTagColor(item.goalCategory ? item.goalCategory[0] : '')}`}>
                      {item.goalCategory ? item.goalCategory[0] : 'Balanced'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {item.nutrition ? `⚡ ${item.nutrition.calories} kcal · ${item.nutrition.protein}g Protein` : 'Balanced Nutrition'}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  ₹{item.price} / dish
                </div>
              </div>

              {/* Stepper + Actions */}
              <div className="flex flex-col items-end justify-between">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => updateCartQty(item._id, qty - 1)}
                    className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-slate-500 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-bold text-slate-800 w-8 text-center">
                    {qty}
                  </span>
                  <button
                    onClick={() => updateCartQty(item._id, qty + 1)}
                    className="w-8 h-8 rounded-full bg-[#EAF7EB] border border-[#1F4D2C]/20 flex items-center justify-center text-[#1F4D2C] hover:bg-[#1F4D2C] hover:text-white transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => updateCartQty(item._id, 0)}
                  className="text-[11px] text-slate-400 hover:text-red-500 transition flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>



      {/* Bottom Checkout CTA */}
      <div className="mb-8">
        <button
          onClick={handleCheckout}
          className="w-full bg-[#1F4D2C] hover:bg-[#173C22] text-white py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-green-900/10 transition-all"
        >
          <span>Proceed to Checkout</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Back to Menu Link */}
      <div className="text-center mb-8">
        <button
          onClick={() => setActiveTab("Order Today")}
          className="text-xs text-slate-400 hover:text-slate-600 transition cursor-pointer"
        >
          Back to Menu
        </button>
      </div>
    </div>
  );
};

export default Cart;
