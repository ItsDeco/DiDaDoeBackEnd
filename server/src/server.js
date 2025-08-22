import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server } from 'socket.io'

// Load environment variables
dotenv.config()

const app = express()
const server = createServer(app)

// Socket.IO setup for real-time multiplayer
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
})

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}))
app.use(morgan('combined'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Test routes
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'DiDaDoe Server is running!', 
    timestamp: new Date().toISOString(),
    connected_clients: io.engine.clientsCount
  })
})

app.get('/api/games', (req, res) => {
  res.json({ 
    message: 'Games endpoint working!',
    games: []
  })
})

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id)
  
  // Test event
  socket.emit('welcome', { message: 'Connected to DiDaDoe server!' })
  
  socket.on('test-message', (data) => {
    console.log('Received test message:', data)
    socket.emit('test-response', { message: 'Server received your message!' })
  })
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Something went wrong!' })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📱 Client URL: ${process.env.CLIENT_URL || "http://localhost:5173"}`)
  console.log(`🔗 Test API: http://localhost:${PORT}/api/health`)
})