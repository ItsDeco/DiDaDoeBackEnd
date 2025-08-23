import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server } from 'socket.io'

dotenv.config()

const app = express()
const server = createServer(app)

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
})

const gameRooms = new Map()

function generateRoomCode() {
  let code
  do {
    code = Math.floor(1000 + Math.random() * 9000).toString()
  } while (gameRooms.has(code))
  return code
}

app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}))
app.use(morgan('combined'))
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'DiDaDoe Server is running!', 
    timestamp: new Date().toISOString(),
    connected_clients: io.engine.clientsCount,
    active_rooms: gameRooms.size
  })
})

app.post('/api/games/create', (req, res) => {
  const roomCode = generateRoomCode()
  
  const gameRoom = {
    code: roomCode,
    players: [],
    gameState: {
      board: Array(9).fill(null),
      currentPlayer: 'X',
      winner: null,
      gameOver: false
    },
    createdAt: new Date()
  }
  
  gameRooms.set(roomCode, gameRoom)
  
  res.json({
    success: true,
    roomCode: roomCode,
    message: 'Game room created successfully'
  })
})

app.get('/api/games/:code', (req, res) => {
  const { code } = req.params
  const room = gameRooms.get(code)
  
  if (!room) {
    return res.status(404).json({
      success: false,
      message: 'Game room not found'
    })
  }
  
  res.json({
    success: true,
    room: {
      code: room.code,
      playerCount: room.players.length,
      gameStarted: room.players.length === 2
    }
  })
})

// Socket.IO Game Logic
io.on('connection', (socket) => {
  console.log('User connected:', socket.id)
  
  // Join game room
  socket.on('join-room', (data) => {
    const { roomCode, playerName } = data
    const room = gameRooms.get(roomCode)
    
    if (!room) {
      socket.emit('error', { message: 'Room not found' })
      return
    }
    
    if (room.players.length >= 2) {
      socket.emit('error', { message: 'Room is full' })
      return
    }
    
    // Add player to room
    const player = {
      id: socket.id,
      name: playerName || `Player ${room.players.length + 1}`,
      symbol: room.players.length === 0 ? 'X' : 'O'
    }
    
    room.players.push(player)
    socket.join(roomCode)
    socket.roomCode = roomCode
    socket.playerSymbol = player.symbol
    
    console.log(`Player ${player.name} (${player.symbol}) joined room ${roomCode}`)
    
    // Notify room about player join
    io.to(roomCode).emit('player-joined', {
      player: player,
      players: room.players,
      gameState: room.gameState
    })
    
    // Start game if 2 players
    if (room.players.length === 2) {
      io.to(roomCode).emit('game-start', {
        message: 'Game started! X goes first.',
        gameState: room.gameState,
        players: room.players
      })
    }
  })
  
  // Handle game moves
  socket.on('make-move', (data) => {
    const { index } = data
    const roomCode = socket.roomCode
    const room = gameRooms.get(roomCode)
    
    if (!room || room.players.length !== 2) {
      socket.emit('error', { message: 'Game not ready' })
      return
    }
    
    // Check if it's player's turn
    if (room.gameState.currentPlayer !== socket.playerSymbol) {
      socket.emit('error', { message: 'Not your turn' })
      return
    }
    
    // Check if position is valid
    if (room.gameState.board[index] !== null || room.gameState.gameOver) {
      socket.emit('error', { message: 'Invalid move' })
      return
    }
    
    // Make the move
    room.gameState.board[index] = socket.playerSymbol
    
    // Check for winner
    const winner = checkWinner(room.gameState.board)
    if (winner) {
      room.gameState.winner = winner
      room.gameState.gameOver = true
    } else if (room.gameState.board.every(cell => cell !== null)) {
      room.gameState.winner = 'draw'
      room.gameState.gameOver = true
    } else {
      // Switch turns
      room.gameState.currentPlayer = room.gameState.currentPlayer === 'X' ? 'O' : 'X'
    }
    
    // Broadcast move to all players in room
    io.to(roomCode).emit('move-made', {
      gameState: room.gameState,
      move: {
        player: socket.playerSymbol,
        index: index
      }
    })
  })
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
    
    if (socket.roomCode) {
      const room = gameRooms.get(socket.roomCode)
      if (room) {
        // Remove player from room
        room.players = room.players.filter(p => p.id !== socket.id)
        
        // Notify remaining players
        socket.to(socket.roomCode).emit('player-left', {
          message: 'Opponent disconnected',
          players: room.players
        })
        
        // Delete room if empty
        if (room.players.length === 0) {
          gameRooms.delete(socket.roomCode)
          console.log(`Room ${socket.roomCode} deleted`)
        }
      }
    }
  })
})

function checkWinner(board) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ]
  
  for (let line of lines) {
    const [a, b, c] = line
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a]
    }
  }
  return null
}

const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📱 Client URL: ${process.env.CLIENT_URL || "http://localhost:5173"}`)
})