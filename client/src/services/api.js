import axios from 'axios'

// Use environment variable in production, localhost in development
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL 
  ? `${import.meta.env.VITE_BACKEND_URL}/api`
  : 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
})

export const healthCheck = async () => {
  try {
    const response = await api.get('/health')
    return response.data
  } catch (error) {
    console.error('Health check failed:', error)
    throw error
  }
}

export const getGames = async () => {
  try {
    const response = await api.get('/games')
    return response.data
  } catch (error) {
    console.error('Get games failed:', error)
    throw error
  }
}

export default api