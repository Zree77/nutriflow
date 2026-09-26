import axios from 'axios'

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/nutriflow'}`


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
