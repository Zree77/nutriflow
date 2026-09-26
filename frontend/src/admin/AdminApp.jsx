import { useState } from 'react'
import AdminLogin from './pages/AdminLogin'
import AdminLayout from './components/AdminLayout'

export default function AdminApp() {
  // Read from localStorage on first render only (initializer fn)
  const [token, setToken] = useState(
    () => localStorage.getItem('nutriflow_admin_token')
  )

  const handleLoginSuccess = (newToken) => {
    localStorage.setItem('nutriflow_admin_token', newToken)
    setToken(newToken)
  }

  // Login page has no sidebar — rendered outside AdminLayout entirely
  if (!token) return <AdminLogin onLoginSuccess={handleLoginSuccess} />

  return <AdminLayout />
}
