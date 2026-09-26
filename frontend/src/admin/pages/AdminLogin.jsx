import { useState } from 'react'
import axios from 'axios'

const BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/nutriflow'}`



export default function AdminLogin({ onLoginSuccess }) {
  const [step, setStep] = useState('phone')         
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [verificationId, setVerificationId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  /* ── Step 1: send OTP ──────────────────────────────────────── */
  const handleSendOtp = async (e) => {
    e.preventDefault()
    setError('')
    if (!/^\d{10}$/.test(phone.trim())) {
      setError('Enter a valid 10-digit phone number.')
      return
    }
    setLoading(true)
    try {
      const res = await axios.post(`${BASE}/auth`, { phone: phone.trim() })
      if (res.data.success) {
        setVerificationId(res.data.verificationId)
        setInfo(`OTP sent to +91 ${phone.trim()}`)
        setStep('otp')
      } else {
        setError(res.data.message || 'Failed to send OTP.')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reach server. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  /* ── Step 2: verify OTP + role check ───────────────────────── */
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError('')
    if (!/^\d{4,6}$/.test(otp.trim())) {
      setError('Enter the OTP sent to your phone.')
      return
    }
    setLoading(true)
    try {
      const res = await axios.post(`${BASE}/auth/verify-otp`, {
        verificationId,
        otp: otp.trim(),
        name: '',               // not required for existing admin users
      })
      if (res.data.success) {
        const { token, user } = res.data
        // Role guard — do NOT store token if user is not admin
        if (user?.role !== 'admin') {
          setError('This phone number does not have admin access.')
          setStep('phone')
          setOtp('')
          setPhone('')
          return
        }
        onLoginSuccess(token)
      } else {
        setError(res.data.message || 'OTP verification failed.')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const goBack = () => {
    setStep('phone')
    setOtp('')
    setError('')
    setInfo('')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #0F2027 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', sans-serif",
      padding: '24px',
    }}>
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Ambient glow orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)' }} />
      </div>

      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '24px',
        padding: '48px 40px',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Logo / Brand */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #10B981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 24px rgba(16,185,129,0.3)',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h1 style={{ color: '#F8FAFC', fontSize: '22px', fontWeight: 700, margin: '0 0 6px' }}>
            NutriFlow Admin
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '14px', margin: 0 }}>
            {step === 'phone' ? 'Sign in with your phone number' : `OTP sent to +91 ${phone}`}
          </p>
        </div>

        {/* Error / Info banners */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: '10px', padding: '12px 16px', marginBottom: '20px',
            color: '#FCA5A5', fontSize: '13px', lineHeight: 1.5,
          }}>
            {error}
          </div>
        )}
        {info && !error && (
          <div style={{
            background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: '10px', padding: '12px 16px', marginBottom: '20px',
            color: '#6EE7B7', fontSize: '13px',
          }}>
            {info}
          </div>
        )}

        {/* ── Step 1: Phone ── */}
        {step === 'phone' && (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', color: '#CBD5E1', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>
                Phone Number
              </label>
              <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '12px', overflow: 'hidden' }}>
                <span style={{ padding: '0 14px', color: '#64748B', fontSize: '14px', fontWeight: 600, borderRight: '1px solid rgba(255,255,255,0.08)', height: '48px', display: 'flex', alignItems: 'center' }}>+91</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="10-digit number"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                  autoFocus
                  style={{
                    flex: 1, padding: '0 16px', height: '48px', background: 'transparent',
                    border: 'none', outline: 'none', color: '#F8FAFC', fontSize: '15px',
                    letterSpacing: '0.04em', fontFamily: 'inherit',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                height: '48px', borderRadius: '12px', border: 'none',
                background: loading ? '#065F46' : 'linear-gradient(135deg, #10B981, #059669)',
                color: '#fff', fontSize: '15px', fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.2s',
                fontFamily: 'inherit',
                boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
              }}
            >
              {loading ? 'Sending OTP…' : 'Send OTP →'}
            </button>
          </form>
        )}

        {/* ── Step 2: OTP ── */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', color: '#CBD5E1', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>
                Verification Code
              </label>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter OTP"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                autoFocus
                style={{
                  width: '100%', height: '52px', borderRadius: '12px', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)',
                  color: '#F8FAFC', fontSize: '22px', fontWeight: 700,
                  textAlign: 'center', letterSpacing: '10px', outline: 'none',
                  fontFamily: 'inherit', padding: '0 16px',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                height: '48px', borderRadius: '12px', border: 'none',
                background: loading ? '#065F46' : 'linear-gradient(135deg, #10B981, #059669)',
                color: '#fff', fontSize: '15px', fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
              }}
            >
              {loading ? 'Verifying…' : 'Verify & Sign In'}
            </button>

            <button
              type="button"
              onClick={goBack}
              style={{
                height: '40px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.10)',
                background: 'transparent', color: '#94A3B8', fontSize: '13px',
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              ← Change phone number
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', color: '#475569', fontSize: '12px', marginTop: '32px', marginBottom: 0 }}>
          NutriFlow Admin Portal · Access restricted
        </p>
      </div>
    </div>
  )
}
