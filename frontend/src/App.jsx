import React, { useState, useEffect } from 'react'
import api, { getAuthToken } from './api'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Membership from './pages/Membership'
import OrderCheckout from './pages/OrderCheckout'
import OrderToday from './pages/OrderToday'
import Cart from './pages/Cart'
import About from './pages/About'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import History from './pages/History'
import ContactUs from './pages/ContactUs'
import ChatBot from './components/ChatBot'
import OTPModal from './components/OTPModal'
import { useLenis } from './hooks/useLenis'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAFBFF] flex items-center justify-center pt-24 pb-12">
          <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Something went wrong</h2>
            <p className="text-sm text-slate-500 mb-6">This section encountered an error.</p>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
              className="px-6 py-3 bg-[#1F4D2C] text-white rounded-2xl font-bold text-sm cursor-pointer hover:bg-[#173C22] transition"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => {
  useLenis()
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("Home")

  const [cartItems, setCartItems] = useState([])
  const [cartQuantities, setCartQuantities] = useState({})

  // Sync React state cart with backend cart on initial load or login
  const fetchBackendCart = async () => {
    const token = getAuthToken()
    if (!token) return
    try {
      const res = await api.get('/cart')
      if (res.data && res.data.success && res.data.data) {
        const items = res.data.data.items || []
        const newCartItems = []
        const newQuantities = {}
        items.forEach(item => {
          if (item.menuItem) {
            newCartItems.push(item.menuItem)
            newQuantities[item.menuItem._id] = item.quantity
          }
        })
        setCartItems(newCartItems)
        setCartQuantities(newQuantities)
      }
    } catch (err) {
      console.warn("Could not fetch backend cart:", err)
    }
  }

  useEffect(() => {
    fetchBackendCart()
  }, [])

  const addToCart = async (menuItem) => {
    // Save previous state for rollback
    const prevQuantities = { ...cartQuantities }
    const prevItems = [...cartItems]

    const newQty = (cartQuantities[menuItem._id] || 0) + 1
    setCartQuantities(prev => ({ ...prev, [menuItem._id]: newQty }))
    setCartItems(prev => {
      const exists = prev.find(i => i._id === menuItem._id)
      if (exists) return prev
      return [...prev, menuItem]
    })

    const token = getAuthToken()
    if (token) {
      try {
        await api.post('/cart', {
          menuItemId: menuItem._id,
          quantity: 1
        })
      } catch (err) {
        console.error("Backend addToCart failed:", err)
        // Rollback local state on backend error
        setCartQuantities(prevQuantities)
        setCartItems(prevItems)
        const errorMessage = err.response?.data?.message || "Failed to add item to cart. Please try again."
        alert(errorMessage)
      }
    }
  }

  const updateCartQty = async (itemId, newQty) => {
    if (newQty <= 0) {
      setCartQuantities(prev => {
        const copy = { ...prev }
        delete copy[itemId]
        return copy
      })
      setCartItems(prev => prev.filter(i => i._id !== itemId))
    } else {
      setCartQuantities(prev => ({ ...prev, [itemId]: newQty }))
    }

    const token = getAuthToken()
    if (token) {
      try {
        if (newQty <= 0) {
          await api.post('/cart/remove', { menuItemId: itemId })
        } else {
          await api.put('/cart/update-quantity', {
            menuItemId: itemId,
            quantity: newQty
          })
        }
      } catch (err) {
        console.warn("Backend updateCartQty error:", err)
      }
    }
  }

  const clearCart = async () => {
    setCartItems([])
    setCartQuantities({})

    const token = getAuthToken()
    if (token) {
      try {
        await api.delete('/cart')
      } catch (err) {
        console.warn("Backend clearCart error:", err)
      }
    }
  }

  return (
    <div className="bg-[#FAFBFF] text-slate-500 font-sans min-h-screen relative overflow-x-hidden dot-grid">

      {/* Background Noise Layer — STATIC, no animation, lower z-index, no blend mode */}
      <div className="fixed inset-0 noise-overlay opacity-[0.02] z-0 pointer-events-none" />

      {/* Background Floating Orbs — removed blur, using solid soft gradients instead */}
      <div
        className="absolute top-[10%] right-[-5%] w-112.5 h-112.5 rounded-full pointer-events-none animate-float-slow will-change-transform"
        style={{ background: 'radial-gradient(circle, rgba(96,165,250,0.06) 0%, transparent 70%)' }}
      />
      <div
        className="absolute top-[40%] left-[-10%] w-95 h-95 rounded-full pointer-events-none animate-float-fast will-change-transform"
        style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.05) 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-[20%] right-[10%] w-137.5 h-137.5 rounded-full pointer-events-none animate-float will-change-transform"
        style={{ background: 'radial-gradient(circle, rgba(251,113,133,0.05) 0%, transparent 70%)' }}
      />

      {/* Navigation */}
      <Navbar
        onOpenOTP={() => setIsOtpModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={Object.values(cartQuantities).reduce((sum, qty) => sum + qty, 0)}
      />

      {/* Main Page Content */}
      {activeTab === "Membership" ? (
        <ErrorBoundary>
          <Membership
            setActiveTab={setActiveTab}
            onGoToMeals={() => setActiveTab("Membership")}
            onOpenOTP={() => setIsOtpModalOpen(true)}
          />
        </ErrorBoundary>
      ) : activeTab === "OrderCheckout" ? (
        <OrderCheckout
          setActiveTab={setActiveTab}
          onOpenOTP={() => setIsOtpModalOpen(true)}
          cartItems={cartItems}
          cartQuantities={cartQuantities}
          clearCart={clearCart}
        />
      ) : activeTab === "Order Today" ? (
        <OrderToday
          onOpenOTP={() => setIsOtpModalOpen(true)}
          setActiveTab={setActiveTab}
          cartItems={cartItems}
          cartQuantities={cartQuantities}
          addToCart={addToCart}
          updateCartQty={updateCartQty}
        />
      ) : activeTab === "Cart" ? (
        <Cart
          setActiveTab={setActiveTab}
          onOpenOTP={() => setIsOtpModalOpen(true)}
          cartItems={cartItems}
          cartQuantities={cartQuantities}
          updateCartQty={updateCartQty}
          clearCart={clearCart}
        />
      ) : activeTab === "About" ? (
        <About setActiveTab={setActiveTab} />
      ) : activeTab === "Profile" ? (
        <Profile setActiveTab={setActiveTab} onOpenOTP={() => setIsOtpModalOpen(true)} />
      ) : activeTab === "History" ? (
        <History setActiveTab={setActiveTab} />
      ) : (activeTab === "Contact Us" || activeTab === "ContactUs") ? (
        <ContactUs setActiveTab={setActiveTab} />
      ) : activeTab === "Home" ? (
        getAuthToken() ? (
          <ErrorBoundary>
            <Dashboard setActiveTab={setActiveTab} />
          </ErrorBoundary>
        ) : (
          <Home setActiveTab={setActiveTab} onOpenOTP={() => setIsOtpModalOpen(true)} />
        )
      ) : (
        <Home setActiveTab={setActiveTab} onOpenOTP={() => setIsOtpModalOpen(true)} />
      )}

      {/* Standalone Floating AI Chatbot Overlay */}
      <ChatBot />

      {/* NutriFlow OTP Verification Modal */}
      <OTPModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
      />
    </div>
  )
}

export default App