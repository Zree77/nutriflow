import axios from 'axios'


const ADMIN_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/nutriflow'}/admin`

const adminApi = axios.create({
  baseURL: ADMIN_BASE_URL,
})

// Separate localStorage key from customer token ('nutriflow_token') to
// avoid session collisions if the same browser has both sessions open
export const getAdminToken = () => localStorage.getItem('nutriflow_admin_token')

adminApi.interceptors.request.use((config) => {
  const token = getAdminToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default adminApi
