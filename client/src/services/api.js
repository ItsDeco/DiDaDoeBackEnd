import axios from 'axios'

const getBackendURL = () => {
  if (import.meta.env.VITE_BACKEND_URL) {
    return `${import.meta.env.VITE_BACKEND_URL}/api`
  }
  
  if (import.meta.env.PROD) {
    return 'https://didadoeback.onrender.com/api'
  }
  
  return 'http://localhost:5000/api'
}

const API_BASE_URL = getBackendURL()

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