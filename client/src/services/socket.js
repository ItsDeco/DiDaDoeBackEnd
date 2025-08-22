import { io } from 'socket.io-client'

// Use environment variable in production, localhost in development
const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

class SocketService {
  constructor() {
    this.socket = null
    this.connected = false
  }

  connect() {
    if (this.socket) return this.socket

    this.socket = io(SOCKET_URL)

    this.socket.on('connect', () => {
      console.log('Connected to server:', this.socket.id)
      this.connected = true
    })

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server')
      this.connected = false
    })

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.connected = false
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data)
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }
}

export default new SocketService()