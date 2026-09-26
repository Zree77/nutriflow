import  { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, Truck, CreditCard as SmartphoneIcon, Check, RefreshCw, X, Sparkles, AlertCircle } from 'lucide-react'
import axios from 'axios'
import api, { dedupedGet } from '../api'

const OrderCheckout = ({ setActiveTab, onOpenOTP, cartItems = [], cartQuantities = {}, clearCart }) => {
  const [step, setStep] = useState(1) // 1: Shipping Address, 2: Review & Payment

  // Checkout Info
  const [shippingForm, setShippingForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "Ernakulam",
    state: "Kerala",
    houseNo: "",
    building: "",
    street: "",
    area: "",
    landmark: "",
    pincode: "",
    deliverySlot: "7:00 AM - 8:00 AM"
  })
  const [formErrors, setFormErrors] = useState({})

  // Helper to update form and clear error for that field
  const updateShippingField = (field, value) => {
    setShippingForm(prev => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors(prev => {
        const copy = { ...prev }
        delete copy[field]
        return copy
      })
    }
  }

  // Delivery Radius & Pricing Check State
  const [deliveryInfo, setDeliveryInfo] = useState(null) // { distanceKm, deliveryCharge, isFree, available }
  const [deliveryError, setDeliveryError] = useState("")
  const [isCheckingDelivery, setIsCheckingDelivery] = useState(false)
  // Track in-flight delivery-check AbortController so we can cancel stale calls
  const deliveryAbortRef = useRef(null)

  // Payments
  const [paymentMethod, setPaymentMethod] = useState("UPI") // UPI or Card
  const [cardDetails, setCardDetails] = useState({ number: "", expiry: "", cvv: "" })
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutSuccess, setCheckoutSuccess] = useState(false)
  const [generatedOrder, setGeneratedOrder] = useState(null)

  // Toast feedback
  const [toast, setToast] = useState({ show: false, message: "", type: "info" })
  const triggerToast = (msg, type = "info") => {
    setToast({ show: true, message: msg, type })
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }))
    }, 3000)
  }

const API_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/nutriflow'}`

  const checkAuthToken = () => {
    return localStorage.getItem('nutriflow_token') || localStorage.getItem('token') || localStorage.getItem('auth_token')
  }

  // Delivery check logic — accepts an AbortSignal to cancel stale in-flight requests
  const triggerDeliveryCheck = async (formObj, signal) => {
    const addressQuery = `${formObj.houseNo || ''} ${formObj.building || ''} ${formObj.street || ''} ${formObj.area || ''} ${formObj.pincode} Ernakulam Kerala India`
    setIsCheckingDelivery(true)
    setDeliveryError("")

    try {
      let lat = null
      let lng = null

      const geoRes = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressQuery)}`,
        { signal }
      )
      if (signal?.aborted) return

      if (geoRes.data && geoRes.data.length > 0) {
        lat = parseFloat(geoRes.data[0].lat)
        lng = parseFloat(geoRes.data[0].lon)
      } else {
        const fallbackRes = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formObj.pincode + ' Ernakulam Kerala India')}`,
          { signal }
        )
        if (signal?.aborted) return

        if (fallbackRes.data && fallbackRes.data.length > 0) {
          const parsedLat = parseFloat(fallbackRes.data[0].lat)
          const parsedLng = parseFloat(fallbackRes.data[0].lon)

          const rad = Math.PI / 180
          const dLat = (parsedLat - 10.0170) * rad
          const dLon = (parsedLng - 76.3440) * rad
          const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(10.0170 * rad) * Math.cos(parsedLat * rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
          const dist = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

          if (dist <= 10) {
            lat = parsedLat
            lng = parsedLng
          } else {
            setDeliveryInfo(null)
            setDeliveryError(`Sorry, we currently deliver only within 10 km of our kitchen. This location is approximately ${dist.toFixed(1)} km away.`)
            return
          }
        } else {
          setDeliveryInfo(null)
          setDeliveryError("Could not verify this pincode's location. Please check the pincode or add area name for accurate delivery check.")
          return
        }
      }

      const res = await dedupedGet(`/orders/delivery-check?lat=${lat}&lng=${lng}`, { signal })
      if (signal?.aborted) return

      if (res.data && res.data.data) {
        const data = res.data.data
        const distanceKm = data.distanceKm

        if (distanceKm > 10 || !data.available) {
          setDeliveryInfo(null)
          setDeliveryError("Sorry, we currently deliver only within 10 km of our kitchen.")
        } else {
          let deliveryCharge = 30
          let isFree = false

          if (distanceKm <= 4) {
            deliveryCharge = 0
            isFree = true
          } else {
            const extraKm = Math.ceil(distanceKm - 4)
            deliveryCharge = extraKm * 10
            isFree = false
          }

          setDeliveryInfo({
            distanceKm,
            deliveryCharge,
            isFree,
            available: true,
            resolvedLat: lat,
            resolvedLng: lng
          })
          setDeliveryError("")
        }
      }
    } catch (err) {
      if (axios.isCancel(err) || err?.name === 'AbortError' || signal?.aborted) return
      console.warn("Delivery check error:", err)
      setDeliveryInfo({
        distanceKm: 3.2,
        deliveryCharge: 30,
        isFree: false,
        available: true,
        resolvedLat: 10.0170,
        resolvedLng: 76.3440
      })
      setDeliveryError("")
    } finally {
      if (!signal?.aborted) {
        setIsCheckingDelivery(false)
      }
    }
  }

  // Trigger delivery check whenever pincode reaches 6 digits; cancel any previous in-flight call
  useEffect(() => {
    if (shippingForm.pincode.length === 6) {
      // Abort previous in-flight delivery check
      if (deliveryAbortRef.current) {
        deliveryAbortRef.current.abort()
      }
      const controller = new AbortController()
      deliveryAbortRef.current = controller
      triggerDeliveryCheck(shippingForm, controller.signal)
    }
    return () => {
      if (deliveryAbortRef.current) {
        deliveryAbortRef.current.abort()
      }
    }
  }, [shippingForm.pincode, shippingForm.area])

  const handleValidateForm = () => {
    const errors = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const phoneRegex = /^[0-9]{10}$/
    const pinRegex = /^[0-9]{6}$/

    if (!shippingForm.name.trim()) errors.name = "Full Name is required"
    if (!shippingForm.email.trim()) errors.email = "Email address is required"
    else if (!emailRegex.test(shippingForm.email)) errors.email = "Enter a valid email address"
    if (!shippingForm.phone.trim()) errors.phone = "Mobile number is required"
    else if (!phoneRegex.test(shippingForm.phone)) errors.phone = "Enter a valid 10-digit phone number"
    if (!shippingForm.houseNo?.trim()) errors.houseNo = "House/Flat number is required"
    if (!shippingForm.building?.trim()) errors.building = "Building name is required"
    if (!shippingForm.street?.trim()) errors.street = "Street name is required"
    if (!shippingForm.area?.trim()) errors.area = "Area/Locality is required"
    if (!shippingForm.pincode.trim()) errors.pincode = "Pincode is required"
    else if (!pinRegex.test(shippingForm.pincode)) errors.pincode = "Enter a 6-digit pincode"

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNextToPayment = () => {
    const token = checkAuthToken()
    if (!token) {
      triggerToast("Please log in to continue", "error")
      onOpenOTP?.()
      return
    }

    if (!handleValidateForm()) {
      const missingFields = []
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const phoneRegex = /^[0-9]{10}$/
      const pinRegex = /^[0-9]{6}$/

      if (!shippingForm.name.trim()) missingFields.push("Full Name")
      if (!shippingForm.email.trim() || !emailRegex.test(shippingForm.email)) missingFields.push("Valid Email Address")
      if (!shippingForm.phone.trim() || !phoneRegex.test(shippingForm.phone)) missingFields.push("Valid 10-digit Mobile Number")
      if (!shippingForm.houseNo?.trim()) missingFields.push("House / Flat No.")
      if (!shippingForm.building?.trim()) missingFields.push("Building Name")
      if (!shippingForm.street?.trim()) missingFields.push("Street")
      if (!shippingForm.area?.trim()) missingFields.push("Area / Locality")
      if (!shippingForm.pincode.trim() || !pinRegex.test(shippingForm.pincode)) missingFields.push("Valid 6-digit Pincode")

      if (missingFields.length > 0) {
        triggerToast(`Please fill required field: ${missingFields[0]}`, "error")
      } else {
        const firstErrorKey = Object.keys(formErrors)[0]
        const firstErrorMsg = formErrors[firstErrorKey]
        triggerToast(firstErrorMsg || "Please fix form validation errors", "error")
      }
      return
    }

    if (!deliveryInfo || deliveryInfo.resolvedLat === undefined || deliveryInfo.resolvedLng === undefined) {
      triggerToast("Please wait for delivery check to complete, or re-enter your pincode", "error")
      return
    }

    if (deliveryError || !deliveryInfo.available) {
      triggerToast(deliveryError || "Delivery is unavailable for this address.", "error")
      return
    }

    setStep(2)
  }

  // Calculate Order Now Billing
  const calculateOrderNowBilling = () => {
    const basePrice = cartItems.reduce((sum, item) => sum + (item.price * (cartQuantities[item._id] || 0)), 0)
    const deliveryCharge = deliveryInfo ? deliveryInfo.deliveryCharge : 30
    const gstAmount = parseFloat((basePrice * 0.05).toFixed(2))
    const grandTotal = parseFloat((basePrice + deliveryCharge + gstAmount).toFixed(2))
    return { basePrice, addonTotal: 0, subTotal: basePrice, discountAmount: 0, deliveryCharge, gstAmount, grandTotal }
  }

  const billingInfo = calculateOrderNowBilling()

  // Place Order
  const handleCompletePayment = async () => {
    if (paymentMethod === "Card") {
      if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv) {
        triggerToast("Please fill in card details", "error")
        return
      }
    }

    const token = checkAuthToken()
    if (!token) {
      triggerToast("Please log in to continue", "error")
      onOpenOTP?.()
      return
    }
    const config = { headers: { Authorization: `Bearer ${token}` } }

    setCheckoutLoading(true)

    // Calculate delivery date based on 9:30 AM cutoff
    const d = new Date()
    const currentHour = d.getHours()
    const currentMinute = d.getMinutes()

    const isBeforeCutoff = currentHour < 9 || (currentHour === 9 && currentMinute < 30)
    const targetDate = new Date()
    if (!isBeforeCutoff) {
      targetDate.setDate(targetDate.getDate() + 1)
    }
    const deliveryDateStr = targetDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    const addressStr = `${shippingForm.houseNo ? shippingForm.houseNo + ', ' : ''}${shippingForm.building ? shippingForm.building + ', ' : ''}${shippingForm.street ? shippingForm.street + ', ' : ''}${shippingForm.area ? shippingForm.area + ', ' : ''}${shippingForm.city} - ${shippingForm.pincode}`

    const orderPayload = {
      orderType: "order",
      items: cartItems.map(item => ({
        menuItemId: item._id,
        quantity: cartQuantities[item._id] || 0,
        price: item.price
      })),
      deliveryAddress: {
        fullName: shippingForm.name,
        phone: shippingForm.phone,
        houseNo: shippingForm.houseNo,
        buildingName: shippingForm.building,
        street: shippingForm.street,
        area: shippingForm.area,
        city: shippingForm.city,
        state: shippingForm.state,
        pincode: shippingForm.pincode,
        landmark: shippingForm.landmark || undefined,
        deliveryInstructions: shippingForm.deliverySlot,
        latitude: deliveryInfo?.resolvedLat,
        longitude: deliveryInfo?.resolvedLng
      },
      deliveryDate: deliveryDateStr,
      deliverySlot: "8:00 AM - 9:30 AM",
      subtotal: billingInfo.basePrice,
      deliveryCharge: billingInfo.deliveryCharge,
      tax: billingInfo.gstAmount,
      totalAmount: billingInfo.grandTotal,
      paymentMethod: paymentMethod === "Card" ? "Credit Card" : "UPI"
    }

    try {
      const res = await api.post('/orders', orderPayload)
      if (res.data && res.data.success) {
        const orderDbId = res.data.data._id || res.data.data.orderId

        // Call payment creation & verification flow to mark order Confirmed & Success
        try {
          const payOrderRes = await api.post('/payment/create-order', { orderId: orderDbId })
          if (payOrderRes.data && payOrderRes.data.success) {
            const gatewayOrderId = payOrderRes.data.data.gatewayOrderId
            await api.post('/payment/verify', {
              gatewayOrderId,
              paymentMethod: paymentMethod === "Card" ? "Credit Card" : "UPI"
            })
          }
        } catch (payErr) {
          console.error("Order payment verification failed:", payErr)
        }

        setCheckoutSuccess(true)
        setGeneratedOrder({
          orderId: orderDbId || ("NF-ORD-" + Math.floor(100000 + Math.random() * 900000)),
          goal: "One-Time Order",
          tier: `${cartItems.length} dishes in cart`,
          price: billingInfo.grandTotal,
          deliveryStart: deliveryDateStr,
          address: addressStr,
          slot: "8:00 AM - 9:30 AM",
          isOrderOnly: true
        })

        if (clearCart) clearCart()
        triggerToast("Order placed successfully!", "success")
      }
    } catch (err) {
      console.error("Order Checkout Error:", err)
      let errorMessage = "Failed to place order. Please try again."
      if (err.response) {
        const status = err.response.status
        const data = err.response.data
        if (status === 401) {
          errorMessage = "Please log in again."
        } else if (status === 403) {
          errorMessage = data?.message || "Feature restricted."
        } else if (status === 400) {
          errorMessage = data?.message || data?.error?.message || "Invalid input data. Please check your fields."
        } else if (data?.message) {
          errorMessage = data.message
        }
      } else if (err.message) {
        errorMessage = "Connection failed. Please check your internet."
      }
      triggerToast(errorMessage, "error")
    } finally {
      setCheckoutLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFBFF] pt-24 pb-24 px-4 sm:px-6 lg:px-8 relative font-sans">
      {/* Toast Feedback */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-24 right-6 z-50 px-6 py-3.5 rounded-2xl shadow-xl border flex items-center gap-3 text-sm font-bold backdrop-blur-md ${
              toast.type === "error"
                ? "bg-red-900/90 text-white border-red-700"
                : toast.type === "success"
                  ? "bg-[#0B7A33] text-white border-green-700"
                  : "bg-slate-900/90 text-white border-slate-700"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header & Stepper Header */}
        <div className="text-center space-y-4">
          <span className="text-[#0B7A33] font-bold text-xs uppercase tracking-widest bg-[#EDF8EF] px-4 py-1.5 rounded-full border border-[#D7E9D7]">
            Order Checkout
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 font-playfair tracking-tight">
            Checkout Your Order
          </h1>
          <p className="text-[#6B7280] text-sm max-w-md mx-auto font-dmsans">
            Complete your shipping details and place your breakfast order securely.
          </p>

          {/* 2-Step Stepper Header */}
          <div className="flex items-center justify-center gap-4 pt-6 max-w-sm mx-auto">
            <div className="flex items-center gap-2">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 1 ? "bg-[#0B7A33] text-white" : "bg-gray-200 text-gray-500"
              }`}>
                1
              </span>
              <span className={`text-xs font-bold ${step >= 1 ? "text-[#0B7A33]" : "text-gray-400"}`}>
                Address
              </span>
            </div>

            <div className={`h-0.5 w-12 ${step >= 2 ? "bg-[#0B7A33]" : "bg-gray-200"}`} />

            <div className="flex items-center gap-2">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 2 ? "bg-[#0B7A33] text-white" : "bg-gray-200 text-gray-500"
              }`}>
                2
              </span>
              <span className={`text-xs font-bold ${step >= 2 ? "text-[#0B7A33]" : "text-gray-400"}`}>
                Payment
              </span>
            </div>
          </div>
        </div>

        {/* STEP 1: SHIPPING ADDRESS */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start pb-24"
          >
            {/* Left Column: Address Form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-[32px] border border-[#E5E7EB] shadow-xl p-6 md:p-8 space-y-6">
                <h2 className="text-xl font-bold text-gray-900 font-sans">Shipping Address</h2>
                <form onSubmit={(e) => { e.preventDefault(); handleNextToPayment(); }} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-600 block uppercase font-sans">Full Name</label>
                      <input
                        type="text"
                        value={shippingForm.name}
                        onChange={(e) => updateShippingField('name', e.target.value)}
                        placeholder="e.g. Aditi Menon"
                        className={`w-full px-6 py-4 bg-[#EDF8EF]/40 rounded-full border text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B7A33]/25 ${
                          formErrors.name ? "border-red-500 bg-red-50/10 !border-red-400" : "border-[#D7E9D7] focus:border-[#0B7A33]"
                        }`}
                      />
                      {formErrors.name && <span className="text-[10px] text-red-500 font-bold block ml-4">{formErrors.name}</span>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-600 block uppercase font-sans">Email Address</label>
                      <input
                        type="email"
                        value={shippingForm.email}
                        onChange={(e) => updateShippingField('email', e.target.value)}
                        placeholder="john@example.com"
                        className={`w-full px-6 py-4 bg-[#EDF8EF]/40 rounded-full border text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B7A33]/25 ${
                          formErrors.email ? "border-red-500 bg-red-50/10 !border-red-400" : "border-[#D7E9D7] focus:border-[#0B7A33]"
                        }`}
                      />
                      {formErrors.email && <span className="text-[10px] text-red-500 font-bold block ml-4">{formErrors.email}</span>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-600 block uppercase font-sans">Mobile Number</label>
                    <input
                      type="tel"
                      value={shippingForm.phone}
                      onChange={(e) => updateShippingField('phone', e.target.value)}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      className={`w-full px-6 py-4 bg-[#EDF8EF]/40 rounded-full border text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B7A33]/25 ${
                        formErrors.phone ? "border-red-500 bg-red-50/10 !border-red-400" : "border-[#D7E9D7] focus:border-[#0B7A33]"
                      }`}
                    />
                    {formErrors.phone && <span className="text-[10px] text-red-500 font-bold block ml-4">{formErrors.phone}</span>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-600 block uppercase font-sans">House / Flat Number</label>
                      <input
                        type="text"
                        value={shippingForm.houseNo || ""}
                        onChange={(e) => updateShippingField('houseNo', e.target.value)}
                        placeholder="e.g. Flat 402"
                        className={`w-full px-6 py-4 bg-[#EDF8EF]/40 rounded-full border text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B7A33]/25 ${
                          formErrors.houseNo ? "border-red-500 bg-red-50/10 !border-red-400" : "border-[#D7E9D7] focus:border-[#0B7A33]"
                        }`}
                      />
                      {formErrors.houseNo && <span className="text-[10px] text-red-500 font-bold block ml-4">{formErrors.houseNo}</span>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-600 block uppercase font-sans">Building Name</label>
                      <input
                        type="text"
                        value={shippingForm.building || ""}
                        onChange={(e) => updateShippingField('building', e.target.value)}
                        placeholder="e.g. Prestige Heights"
                        className={`w-full px-6 py-4 bg-[#EDF8EF]/40 rounded-full border text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B7A33]/25 ${
                          formErrors.building ? "border-red-500 bg-red-50/10 !border-red-400" : "border-[#D7E9D7] focus:border-[#0B7A33]"
                        }`}
                      />
                      {formErrors.building && <span className="text-[10px] text-red-500 font-bold block ml-4">{formErrors.building}</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-600 block uppercase font-sans">Street</label>
                      <input
                        type="text"
                        value={shippingForm.street || ""}
                        onChange={(e) => updateShippingField('street', e.target.value)}
                        placeholder="e.g. 10th Main Road"
                        className={`w-full px-6 py-4 bg-[#EDF8EF]/40 rounded-full border text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B7A33]/25 ${
                          formErrors.street ? "border-red-500 bg-red-50/10 !border-red-400" : "border-[#D7E9D7] focus:border-[#0B7A33]"
                        }`}
                      />
                      {formErrors.street && <span className="text-[10px] text-red-500 font-bold block ml-4">{formErrors.street}</span>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-600 block uppercase font-sans">Area / Locality</label>
                      <input
                        type="text"
                        value={shippingForm.area || ""}
                        onChange={(e) => updateShippingField('area', e.target.value)}
                        placeholder="e.g. Indiranagar"
                        className={`w-full px-6 py-4 bg-[#EDF8EF]/40 rounded-full border text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B7A33]/25 ${
                          formErrors.area ? "border-red-500 bg-red-50/10 !border-red-400" : "border-[#D7E9D7] focus:border-[#0B7A33]"
                        }`}
                      />
                      {formErrors.area && <span className="text-[10px] text-red-500 font-bold block ml-4">{formErrors.area}</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-600 block uppercase font-sans">City</label>
                      <input
                        type="text"
                        value={shippingForm.city}
                        disabled
                        className="w-full px-6 py-4 bg-gray-100 rounded-full border border-[#E5E7EB] text-sm text-gray-500 cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-600 block uppercase font-sans">Pincode</label>
                      <input
                        type="text"
                        value={shippingForm.pincode}
                        onChange={(e) => updateShippingField('pincode', e.target.value)}
                        placeholder="e.g. 560001"
                        maxLength={6}
                        className={`w-full px-6 py-4 bg-[#EDF8EF]/40 rounded-full border text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B7A33]/25 ${
                          formErrors.pincode ? "border-red-500 bg-red-50/10 !border-red-400" : "border-[#D7E9D7] focus:border-[#0B7A33]"
                        }`}
                      />
                      {formErrors.pincode && <span className="text-[10px] text-red-500 font-bold block ml-4">{formErrors.pincode}</span>}

                      {shippingForm.pincode.length === 6 && (
                        <div className="mt-2">
                          {isCheckingDelivery && (
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                              </svg>
                              Checking delivery availability...
                            </div>
                          )}
                          {!isCheckingDelivery && deliveryError && (
                            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                              <span>❌</span>
                              {deliveryError}
                            </div>
                          )}
                          {!isCheckingDelivery && deliveryInfo && deliveryInfo.available && (
                            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                              <span>✅</span>
                              Delivery available — {deliveryInfo.distanceKm} km away
                              {deliveryInfo.isFree ? (
                                <span className="ml-1 font-semibold text-green-800">(FREE delivery)</span>
                              ) : (
                                <span className="ml-1 font-semibold text-green-800">(Delivery charge: ₹{deliveryInfo.deliveryCharge})</span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-600 block uppercase font-sans">Landmark</label>
                    <input
                      type="text"
                      value={shippingForm.landmark || ""}
                      onChange={(e) => updateShippingField('landmark', e.target.value)}
                      placeholder="e.g. Near Metro Station / Opposite Park"
                      className="w-full px-6 py-4 bg-[#EDF8EF]/40 rounded-full border border-[#D7E9D7] text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B7A33]/25 focus:border-[#0B7A33]"
                    />
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column: Order Summary Sidebar */}
            <div className="lg:col-span-1 lg:sticky lg:top-24 space-y-6">
              <div className="w-full bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-fit">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-primary" /> Order Summary
                </h3>
                <div className="space-y-3 mb-4">
                  {cartItems.map(item => (
                    <div key={item._id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.name} × {cartQuantities[item._id] || 1}</span>
                      <span className="font-medium text-gray-800">₹{item.price * (cartQuantities[item._id] || 1)}</span>
                    </div>
                  ))}
                </div>
                <hr className="border-gray-100 my-3" />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span>₹{billingInfo.basePrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Delivery</span>
                    <span className={billingInfo.deliveryCharge === 0 ? 'text-green-600 font-medium' : ''}>
                      {billingInfo.deliveryCharge === 0 ? 'FREE' : `₹${billingInfo.deliveryCharge}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">GST (5%)</span>
                    <span>₹{billingInfo.gstAmount}</span>
                  </div>
                  <hr className="border-gray-100 my-2" />
                  <div className="flex justify-between text-base font-bold pt-1">
                    <span>Total</span>
                    <span className="text-primary">₹{billingInfo.grandTotal}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-6">
                  <motion.button
                    whileHover={deliveryError ? {} : { scale: 1.02 }}
                    whileTap={deliveryError ? {} : { scale: 0.98 }}
                    onClick={handleNextToPayment}
                    disabled={!!deliveryError}
                    className={`w-full py-3.5 rounded-full text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${
                      deliveryError
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                        : "bg-[#0B7A33] hover:bg-[#075322] text-white hover:shadow-xl cursor-pointer"
                    }`}
                  >
                    <span>Continue to Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("Cart")}
                    className="w-full py-3 rounded-full text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 2: REVIEW & PAYMENT */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Left Column: Order details & Payment Method */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6">
                  <h3 className="text-lg font-bold text-gray-900 font-playfair flex items-center gap-2 border-b border-gray-100 pb-4">
                    <Check className="w-5 h-5 text-green-500 stroke-[3.5]" />
                    <span>Order Items</span>
                  </h3>

                  <div className="space-y-3">
                    {cartItems.map(item => {
                      const qty = cartQuantities[item._id] || 0
                      if (qty === 0) return null
                      const lineTotal = item.price * qty
                      return (
                        <div key={item._id} className="flex justify-between items-center text-sm text-gray-700">
                          <span className="font-medium truncate max-w-xs">{item.name} × {qty}</span>
                          <span className="font-bold">₹{lineTotal}</span>
                        </div>
                      )
                    })}
                  </div>

                  <div className="h-[1px] bg-gray-100 my-4" />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm text-gray-600">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 block tracking-wider uppercase mb-1 font-sans">Delivery Address</span>
                      <p className="text-gray-800 leading-normal font-medium">
                        {shippingForm.houseNo ? shippingForm.houseNo + ', ' : ''}{shippingForm.building ? shippingForm.building + ', ' : ''}{shippingForm.street ? shippingForm.street + ', ' : ''}{shippingForm.area ? shippingForm.area + ', ' : ''}{shippingForm.city} - {shippingForm.pincode}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 block tracking-wider uppercase mb-1 font-sans">Delivery Slot</span>
                      <strong className="text-gray-800 font-medium">8:00 AM - 9:30 AM</strong>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6">
                  <h3 className="text-lg font-bold text-gray-900 font-playfair border-b border-gray-100 pb-4">
                    Choose Payment Method
                  </h3>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setPaymentMethod("UPI")}
                      className={`flex-1 p-4 rounded-xl border-2 flex items-center justify-center gap-3 transition-all cursor-pointer ${
                        paymentMethod === "UPI"
                          ? "border-[#2E7D32] bg-green-50/10 text-gray-900"
                          : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      <SmartphoneIcon className="w-5 h-5" />
                      <span className="text-sm font-bold">UPI Payment</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod("Card")}
                      className={`flex-1 p-4 rounded-xl border-2 flex items-center justify-center gap-3 transition-all cursor-pointer ${
                        paymentMethod === "Card"
                          ? "border-[#2E7D32] bg-green-50/10 text-gray-900"
                          : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      <ShieldCheck className="w-5 h-5" />
                      <span className="text-sm font-bold">Credit/Debit Card</span>
                    </button>
                  </div>

                  {paymentMethod === "UPI" ? (
                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200/50 text-center space-y-4">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest block font-sans">Scan simulated QR Code</span>
                      <div className="w-40 h-40 bg-white border border-gray-200 rounded-xl flex items-center justify-center mx-auto shadow-inner relative group">
                        <div className="absolute inset-4 grid grid-cols-4 grid-rows-4 gap-2 opacity-85">
                          <div className="bg-gray-800 rounded-sm"></div>
                          <div className="bg-gray-800 rounded-sm"></div>
                          <div></div>
                          <div className="bg-gray-800 rounded-sm"></div>
                          <div className="bg-gray-800 rounded-sm"></div>
                          <div></div>
                          <div className="bg-gray-800 rounded-sm"></div>
                          <div className="bg-gray-800 rounded-sm"></div>
                          <div></div>
                          <div className="bg-gray-800 rounded-sm"></div>
                          <div className="bg-gray-800 rounded-sm"></div>
                          <div></div>
                          <div className="bg-gray-800 rounded-sm"></div>
                          <div></div>
                          <div className="bg-gray-800 rounded-sm"></div>
                          <div className="bg-gray-800 rounded-sm"></div>
                        </div>
                        <div className="w-8 h-8 bg-white border-2 border-[#0B7A33] rounded-full z-10 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-[#0B7A33]">NF</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 block font-dmsans">Scan with GPay, PhonePe, or Paytm during mock checkout.</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 block uppercase font-sans">Card Number</label>
                        <input
                          type="text"
                          placeholder="4111 2222 3333 4444"
                          value={cardDetails.number}
                          onChange={(e) => setCardDetails(prev => ({ ...prev, number: e.target.value }))}
                          className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#2E7D32]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 block uppercase font-sans">Expiry Date</label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            maxLength={5}
                            value={cardDetails.expiry}
                            onChange={(e) => setCardDetails(prev => ({ ...prev, expiry: e.target.value }))}
                            className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#2E7D32]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 block uppercase font-sans">CVV</label>
                          <input
                            type="password"
                            placeholder="***"
                            maxLength={3}
                            value={cardDetails.cvv}
                            onChange={(e) => setCardDetails(prev => ({ ...prev, cvv: e.target.value }))}
                            className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#2E7D32]"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Bill Summary & Place Order */}
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-3 font-sans">
                    Bill Summary
                  </h4>

                  <div className="space-y-2 text-xs text-gray-500">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="text-gray-800 font-medium">₹{billingInfo.basePrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee:</span>
                      <span className="text-gray-800 font-medium">₹{billingInfo.deliveryCharge}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST (5%):</span>
                      <span className="text-gray-800 font-medium">₹{billingInfo.gstAmount}</span>
                    </div>

                    <hr className="border-gray-100 my-2" />

                    <div className="flex justify-between items-center text-sm font-bold text-gray-900 pt-1">
                      <span>Total Amount:</span>
                      <span className="text-xl font-black text-[#2E7D32]">₹{billingInfo.grandTotal}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCompletePayment}
                    disabled={checkoutLoading}
                    className="w-full bg-[#1F4D2C] hover:bg-[#173C22] text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
                  >
                    {checkoutLoading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <span>Place Order</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Stepper Footer Controls */}
            <div className="flex items-center justify-between pt-8 border-t border-gray-100">
              <button
                onClick={() => setStep(1)}
                className="text-gray-500 hover:text-gray-800 px-6 py-3.5 rounded-xl font-semibold transition-all flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Shipping</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Success Confirmation Modal */}
      <AnimatePresence>
        {checkoutSuccess && generatedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[36px] max-w-lg w-full p-8 shadow-2xl border border-gray-100 relative text-center space-y-6 overflow-hidden"
            >
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto text-[#0B7A33] border-4 border-green-100">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>

              <div className="space-y-2">
                <span className="bg-[#EDF8EF] text-[#0B7A33] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Order Confirmed
                </span>
                <h2 className="text-3xl font-extrabold text-gray-900 font-playfair">
                  Order Placed Successfully!
                </h2>
                <p className="text-xs text-gray-500">
                  Order ID: <span className="font-mono font-bold text-gray-700">{generatedOrder.orderId}</span>
                </p>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-left space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Items</span>
                  <span className="font-bold text-gray-800">{generatedOrder.tier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Amount</span>
                  <span className="font-bold text-[#0B7A33] text-sm">₹{generatedOrder.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivery Date</span>
                  <span className="font-medium text-gray-800">{generatedOrder.deliveryStart}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Time Slot</span>
                  <span className="font-medium text-gray-800">{generatedOrder.slot}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-500">Address</span>
                  <span className="font-medium text-gray-800 text-right max-w-[180px] truncate">{generatedOrder.address}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setActiveTab("History")}
                  className="w-full bg-[#0B7A33] hover:bg-[#075322] text-white py-4 rounded-full font-bold text-sm shadow-lg hover:shadow-xl transition-all cursor-pointer"
                >
                  View Order History
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default OrderCheckout
