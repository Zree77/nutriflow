import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Check, Lock, AlertCircle, CheckCircle2, RotateCcw, ChevronDown } from 'lucide-react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

// Base URL for NutriFlow Auth endpoints
const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/nutriflow'}/auth`

/**
 * Helper function to fetch profile using token
 * GET /nutriflow/auth/profile
 */
export const fetchUserProfile = async (token) => {
  const authToken = token || localStorage.getItem('nutriflow_token')
  if (!authToken) throw new Error('No authentication token found')

  const response = await axios.get(`${API_BASE_URL}/profile`, {
    headers: {
      Authorization: `Bearer ${authToken}`
    }
  })
  return response.data
}

export default function OTPModal({ isOpen, onClose, onSuccess }) {
  const [currentStep, setCurrentStep] = useState('phone') // 'phone' | 'otp'
  const [phone, setPhone] = useState('')
  const [verificationId, setVerificationId] = useState('')
  const [otp, setOtp] = useState(['', '', '', '']) // 4-digit OTP
  const [timer, setTimer] = useState(569) // 9:29 in seconds
  const [isTimerActive, setIsTimerActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [phoneError, setPhoneError] = useState('')
  const [otpError, setOtpError] = useState('')
  const [isShaking, setIsShaking] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [toast, setToast] = useState(null)

  const phoneInputRef = useRef(null)
  const otpInputRefs = useRef([])

  let navigate
  try {
    navigate = useNavigate()
  } catch {
    navigate = null
  }

  const handleNavigate = (path) => {
    if (navigate) {
      navigate(path)
    } else {
      window.location.href = path
    }
  }

  // Toast notification helper with 4s auto-dismiss
  const showToast = (type, message) => {
    setToast({ id: Date.now(), type, message })
    setTimeout(() => {
      setToast(null)
    }, 4000)
  }

  // Always show animations regardless of OS reduced-motion setting
  const prefersReducedMotion = false

  // Reset modal state when closed or opened afresh
  useEffect(() => {
    if (!isOpen) {
      const timeout = setTimeout(() => {
        setCurrentStep('phone')
        setPhone('')
        setVerificationId('')
        setOtp(['', '', '', ''])
        setTimer(569)
        setIsTimerActive(false)
        setIsLoading(false)
        setPhoneError('')
        setOtpError('')
        setIsShaking(false)
        setIsSuccess(false)
        setToast(null)
      }, 300)
      return () => clearTimeout(timeout)
    }
  }, [isOpen])

  // Countdown timer effect
  useEffect(() => {
    let interval = null
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
    } else if (timer === 0) {
      setIsTimerActive(false)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isTimerActive, timer])

  // Auto focus inputs on step change & modal open
  useEffect(() => {
    if (isOpen && !isSuccess) {
      if (currentStep === 'phone') {
        const t = setTimeout(() => phoneInputRef.current?.focus(), 150)
        return () => clearTimeout(t)
      } else if (currentStep === 'otp') {
        const t = setTimeout(() => otpInputRefs.current[0]?.focus(), 150)
        return () => clearTimeout(t)
      }
    }
  }, [isOpen, currentStep, isSuccess])

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose?.()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isLoading, onClose])

  // Format timer into MM:SS
  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Mask phone number: e.g. 9876543210 -> +91 98XXXXXX10
  const getMaskedPhone = (num) => {
    if (!num || num.length !== 10) return `+91 ${num}`
    return `+91 ${num.slice(0, 2)}XXXXXX${num.slice(8)}`
  }

  // Placeholder Google Login Handler
  const handleGoogleLogin = () => {
    console.log('Google login clicked')
  }

  // Handle phone input change (strictly digits only, max 10)
  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10)
    setPhone(val)
    if (phoneError) setPhoneError('')
  }

  // Send OTP handler
  const handleSendOTP = async (e) => {
    e?.preventDefault()
    if (phone.length !== 10) {
      setPhoneError('Please enter a full 10-digit mobile number.')
      return
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setPhoneError('Indian mobile numbers must start with 6, 7, 8, or 9.')
      return
    }

    setPhoneError('')
    setIsLoading(true)

    try {
      const response = await axios.post(`${API_BASE_URL}/`, { phone })

      if (response.data?.success) {
        setVerificationId(response.data.verificationId)
        setCurrentStep('otp')
        setTimer(569) // Reset to 9:29
        setIsTimerActive(true)
        showToast('success', response.data.message || 'OTP verification code sent!')
      } else {
        const msg = response.data?.message || 'Failed to send verification code.'
        setPhoneError(msg)
        showToast('error', msg)
      }
    } catch (err) {
      const backendMessage =
        err.response?.data?.message ||
        (err.response?.data?.errors && err.response.data.errors[0]?.msg) ||
        'Error connecting to server. Please try again.'
      setPhoneError(backendMessage)
      showToast('error', backendMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // OTP input handlers
  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const newOtp = [...otp]
    newOtp[index] = digit
    setOtp(newOtp)
    if (otpError) setOtpError('')

    // Auto advance focus (4-digit max index is 3)
    if (digit && index < 3) {
      otpInputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        otpInputRefs.current[index - 1]?.focus()
        const newOtp = [...otp]
        newOtp[index - 1] = ''
        setOtp(newOtp)
      }
    }
  }

  const handleOtpPaste = (e) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
    if (pastedText) {
      const newOtp = ['', '', '', '']
      for (let i = 0; i < pastedText.length; i++) {
        newOtp[i] = pastedText[i]
      }
      setOtp(newOtp)
      if (otpError) setOtpError('')
      const nextFocus = Math.min(pastedText.length, 3)
      otpInputRefs.current[nextFocus]?.focus()
    }
  }

  // Trigger error shake animation
  const triggerShake = () => {
    setIsShaking(true)
    setTimeout(() => setIsShaking(false), 600)
  }

  // Verify OTP handler
  const handleVerifyOTP = async (e) => {
    e?.preventDefault()
    const otpCode = otp.join('')

    if (otpCode.length !== 4) {
      setOtpError('Please enter the complete 4-digit OTP code.')
      triggerShake()
      return
    }

    setOtpError('')
    setIsLoading(true)

    try {
      const response = await axios.post(`${API_BASE_URL}/verify-otp`, {
        verificationId,
        otp: otpCode
      })

      if (response.data?.success) {
        const { token, isNewUser, user } = response.data

        // Store JWT token in localStorage key: nutriflow_token
        localStorage.setItem('nutriflow_token', token)
        setIsSuccess(true)
        showToast('success', 'Mobile number verified successfully!')

        // Show success animation for 1.5s then redirect
        setTimeout(() => {
          onClose?.()
          onSuccess?.({ token, isNewUser, user })
          if (isNewUser) {
            handleNavigate('/onboarding')
          } else {
            handleNavigate('/dashboard')
          }
        }, 1500)
      } else {
        const msg = response.data?.message || 'Invalid OTP code. Please try again.'
        setOtpError(msg)
        triggerShake()
        showToast('error', msg)
      }
    } catch (err) {
      const backendMessage =
        err.response?.data?.message ||
        'Invalid or expired verification code. Please try again.'
      setOtpError(backendMessage)
      triggerShake()
      showToast('error', backendMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Resend OTP handler
  const handleResendOTP = async () => {
    if (isLoading) return
    setOtp(['', '', '', ''])
    setOtpError('')
    setIsLoading(true)

    try {
      const response = await axios.post(`${API_BASE_URL}/`, { phone })

      if (response.data?.success) {
        setVerificationId(response.data.verificationId)
        setTimer(569)
        setIsTimerActive(true)
        showToast('success', 'A new verification code has been sent!')
        setTimeout(() => otpInputRefs.current[0]?.focus(), 150)
      } else {
        const msg = response.data?.message || 'Failed to resend OTP.'
        showToast('error', msg)
      }
    } catch (err) {
      const backendMessage =
        err.response?.data?.message || 'Error resending code. Please try again.'
      showToast('error', backendMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Change phone number handler
  const handleChangeNumber = () => {
    setCurrentStep('phone')
    setVerificationId('')
    setOtp(['', '', '', ''])
    setOtpError('')
    setPhoneError('')
    setIsTimerActive(false)
  }

  if (!isOpen) return null

  const isPhoneValid = phone.length === 10 && /^[6-9]\d{9}$/.test(phone)
  const isOtpComplete = otp.join('').length === 4

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-x-hidden font-sans"
        >
          {/* Top-center Toast Notification System */}
          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: -40, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -30, scale: 0.9 }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                className={`fixed top-5 left-1/2 -translate-x-1/2 z-[10000] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-sm font-medium text-white pointer-events-auto max-w-[90vw] sm:max-w-md ${
                  toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'
                }`}
              >
                {toast.type === 'error' ? (
                  <AlertCircle className="w-5 h-5 shrink-0 stroke-[2.2]" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 shrink-0 stroke-[2.2]" />
                )}
                <span>{toast.message}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Modal Overlay / Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => !isLoading && onClose?.()}
            className="fixed inset-0 bg-slate-900/50 z-0"
            aria-hidden="true"
          />

          {/* Floating Anti-Gravity Container & Shadow */}
          <div className="relative z-10 w-full max-w-[440px]">
            {/* Card Shadow scaling with bobbing - hardware accelerated */}
            <div
              className="w-4/5 h-6 bg-black/15 blur-sm rounded-[100%] mx-auto mb-[-12px] pointer-events-none"
            />

            {/* Entry/Exit wrapper */}
            <motion.div
              initial={{ opacity: 0, y: 25, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.97 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {/* Anti-Gravity Floating Card (fast smooth GPU bobbing) */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="relative bg-[#FAFBFF] text-slate-500 rounded-2xl border border-slate-200/80 shadow-2xl p-6 sm:p-8 overflow-hidden dot-grid transform-gpu"
              >
              {/* Background Floating Orbs */}
              <div
                className="absolute top-[-10%] right-[-10%] w-[180px] h-[180px] rounded-full pointer-events-none opacity-60"
                style={{ background: 'radial-gradient(circle, rgba(96,165,250,0.15) 0%, transparent 70%)' }}
              />
              <div
                className="absolute top-[40%] left-[-15%] w-[160px] h-[160px] rounded-full pointer-events-none opacity-60"
                style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.12) 0%, transparent 70%)' }}
              />
              <div
                className="absolute bottom-[-10%] right-[10%] w-[200px] h-[200px] rounded-full pointer-events-none opacity-60"
                style={{ background: 'radial-gradient(circle, rgba(251,113,133,0.12) 0%, transparent 70%)' }}
              />

              {/* Close Modal Button */}
              <button
                onClick={() => !isLoading && onClose?.()}
                disabled={isLoading}
                aria-label="Close modal"
                className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>

              {/* Success Overlay View */}
              <AnimatePresence>
                {isSuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: 'spring', damping: 22, stiffness: 280 }}
                    className="absolute inset-0 z-30 bg-[#FAFBFF] flex flex-col items-center justify-center p-6 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 15, stiffness: 220, delay: 0.1 }}
                      className="w-20 h-20 rounded-full bg-emerald-100/90 text-emerald-600 border-2 border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/10 mb-4"
                    >
                      <Check className="w-10 h-10 stroke-[3]" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">
                      Verified Successfully
                    </h3>
                    <p className="text-sm text-slate-500">
                      Redirecting you now...
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Main Modal Contents */}
              <div className="relative z-10">
                {/* Step 1: Mobile Phone Input */}
                {currentStep === 'phone' && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.25 }}
                  >
                    <h2
                      id="modal-title"
                      className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-1.5 tracking-tight"
                    >
                      Welcome to NutriFlow
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 text-center mb-6">
                      Sign in to continue managing your breakfast plan
                    </p>

                    {/* Google Login Button */}
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium shadow-xs hover:bg-slate-50 hover:border-slate-300 hover:shadow-md transition-all duration-200 cursor-pointer disabled:opacity-50"
                    >
                      <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Continue with Google</span>
                    </button>

                    {/* OR Divider */}
                    <div className="flex items-center gap-4 my-6">
                      <div className="flex-1 h-px bg-slate-200" />
                      <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">OR</span>
                      <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    <form onSubmit={handleSendOTP} className="space-y-4">
                      <div>
                        <div className="flex items-center rounded-xl shadow-xs transition-all duration-200 focus-within:ring-4 focus-within:ring-emerald-500/20">
                          <button
                            type="button"
                            aria-label="Country code"
                            className="bg-slate-100 text-slate-700 font-semibold px-3 py-3 rounded-l-xl border border-r-0 border-slate-200 text-sm flex items-center gap-1 shrink-0 cursor-pointer hover:bg-slate-200/70 transition-colors"
                          >
                            <span>+91</span>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                          </button>
                          <input
                            ref={phoneInputRef}
                            type="tel"
                            inputMode="numeric"
                            value={phone}
                            onChange={handlePhoneChange}
                            placeholder="Enter mobile number"
                            maxLength={10}
                            disabled={isLoading}
                            aria-label="10-digit mobile number"
                            className="w-full bg-white text-slate-900 text-base font-semibold px-4 py-3 rounded-r-xl border border-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors disabled:bg-slate-50"
                          />
                        </div>
                        {phoneError && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-500 text-xs mt-2 text-left flex items-center gap-1 font-medium"
                          >
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{phoneError}</span>
                          </motion.p>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={!isPhoneValid || isLoading}
                        aria-label="Send OTP"
                        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3.5 px-4 rounded-xl shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 relative overflow-hidden flex items-center justify-center gap-2 group"
                      >
                        {!prefersReducedMotion && (
                          <span className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
                        )}
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Sending Code...</span>
                          </>
                        ) : (
                          <span>Send OTP</span>
                        )}
                      </button>
                    </form>

                    <div className="mt-6 flex items-center justify-center gap-1.5 text-slate-400 text-xs">
                      <Lock className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      <span>Your information is securely encrypted</span>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: OTP Verification Input */}
                {currentStep === 'otp' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    <h2
                      id="modal-title"
                      className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-1.5 tracking-tight"
                    >
                      Verify Your Mobile Number
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 text-center mb-1">
                      We've sent a verification code to
                    </p>
                    <p className="text-sm font-semibold text-slate-800 text-center mb-1">
                      {getMaskedPhone(phone)}
                    </p>
                    <button
                      onClick={handleChangeNumber}
                      disabled={isLoading}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer mb-5 block mx-auto text-center disabled:opacity-50"
                    >
                      Change Number
                    </button>

                    <form onSubmit={handleVerifyOTP} className="space-y-5">
                      {/* 4-Digit OTP Boxes */}
                      <motion.div
                        animate={isShaking ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
                        transition={{ duration: 0.5 }}
                        className="flex items-center justify-center gap-3 sm:gap-4"
                      >
                        {otp.map((digit, idx) => {
                          const isFilled = Boolean(digit)
                          const hasError = Boolean(otpError)

                          return (
                            <input
                              key={idx}
                              ref={(el) => (otpInputRefs.current[idx] = el)}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleOtpChange(idx, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                              onPaste={idx === 0 ? handleOtpPaste : undefined}
                              disabled={isLoading}
                              aria-label={`OTP Digit ${idx + 1}`}
                              className={`w-14 h-16 sm:w-16 sm:h-[72px] text-center text-2xl font-bold rounded-xl border-2 transition-all duration-200 outline-none shadow-xs disabled:opacity-50 ${
                                hasError
                                  ? 'border-red-400 bg-red-50 text-red-900 focus:border-red-500 focus:ring-4 focus:ring-red-500/15'
                                  : isFilled
                                  ? 'border-emerald-400 bg-emerald-50/50 text-emerald-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15'
                                  : 'border-slate-200 bg-white text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15'
                              }`}
                            />
                          )
                        })}
                      </motion.div>

                      {otpError && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-500 text-xs text-center flex items-center justify-center gap-1 font-medium"
                        >
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{otpError}</span>
                        </motion.p>
                      )}

                      {/* Timer & Resend Link */}
                      <div className="text-center text-xs sm:text-sm">
                        {isTimerActive ? (
                          <div className="inline-flex items-center gap-1.5 text-slate-500 font-medium">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping inline-block" />
                            <span>Resend code in</span>
                            <span className="font-semibold text-slate-800 font-mono text-sm">
                              {formatTimer(timer)}
                            </span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={handleResendOTP}
                            disabled={isLoading}
                            className="inline-flex items-center gap-1.5 text-blue-600 font-semibold hover:text-blue-700 hover:underline cursor-pointer disabled:opacity-50"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Resend Code</span>
                          </button>
                        )}
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={!isOtpComplete || isLoading}
                        aria-label="Verify and continue"
                        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3.5 px-4 rounded-xl shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 relative overflow-hidden flex items-center justify-center gap-2 group"
                      >
                        {!prefersReducedMotion && (
                          <span className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
                        )}
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Verifying...</span>
                          </>
                        ) : (
                          <span>Verify & Continue</span>
                        )}
                      </button>
                    </form>

                    <div className="mt-6 space-y-2 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs">
                        <Lock className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span>Your information is securely encrypted</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleChangeNumber}
                        disabled={isLoading}
                        className="text-xs text-slate-500 hover:text-blue-600 hover:underline cursor-pointer disabled:opacity-50 block mx-auto"
                      >
                        Wrong number? Edit Mobile Number
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
