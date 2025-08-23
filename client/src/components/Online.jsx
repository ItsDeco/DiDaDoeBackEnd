import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import './Game.css'

function Online() {
  const { roomCode } = useParams()
  const navigate = useNavigate()
  const [socket, setSocket] = useState(null)
  const [gameState, setGameState] = useState({
    board: Array(9).fill(null),
    currentPlayer: 'X',
    winner: null,
    gameOver: false
  })
  const [players, setPlayers] = useState([])
  const [mySymbol, setMySymbol] = useState(null)
  const [status, setStatus] = useState('Connecting...')
  const [isMyTurn, setIsMyTurn] = useState(false)

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'
    const newSocket = io(socketUrl)
    setSocket(newSocket)

    newSocket.emit('join-room', {
      roomCode: roomCode,
      playerName: `Player`
    })

    newSocket.on('player-joined', (data) => {
      setPlayers(data.players)
      setGameState(data.gameState)
      
      const myPlayer = data.players.find(p => p.id === newSocket.id)
      if (myPlayer) {
        setMySymbol(myPlayer.symbol)
        setStatus(`You will be playing as ${myPlayer.symbol}, waiting for opponent...`)
      }
    })

    newSocket.on('game-start', (data) => {
      setStatus('Game started!')
      setGameState(data.gameState)
      setPlayers(data.players)
      checkTurn(data.gameState.currentPlayer)
    })

    newSocket.on('move-made', (data) => {
      setGameState(data.gameState)
      
      if (data.gameState.gameOver) {
        if (data.gameState.winner === 'draw') {
          setStatus("It's a draw!")
        } else {
          setStatus(data.gameState.winner === mySymbol ? 'You won! 🎉' : 'You lost! 😢')
        }
        setIsMyTurn(false)
      } else {
        checkTurn(data.gameState.currentPlayer)
      }
    })

    newSocket.on('player-left', (data) => {
      setStatus('Opponent disconnected. Waiting for new player...')
      setPlayers(data.players)
    })

    newSocket.on('error', (data) => {
      console.error('Game error:', data.message)
      setStatus(`Error: ${data.message}`)
    })

    return () => {
      newSocket.disconnect()
    }
  }, [roomCode])

  const checkTurn = (currentPlayer) => {
    if (currentPlayer === mySymbol) {
      setIsMyTurn(true)
      setStatus('Your turn!')
    } else {
      setIsMyTurn(false)
      setStatus("Opponent's turn...")
    }
  }

  const handleSquareClick = (index) => {
    if (!socket || !isMyTurn || gameState.board[index] || gameState.gameOver) {
      return
    }

    socket.emit('make-move', { index })
  }

  const renderSquare = (index) => {
    const value = gameState.board[index]
    let className = 'square'
    
    if (value === 'X') className += ' square-x'
    if (value === 'O') className += ' square-o'
    
    return (
      <button
        key={index}
        className={className}
        onClick={() => handleSquareClick(index)}
        disabled={!isMyTurn || gameState.gameOver}
      >
        {value && (
          <img
            src={value === 'X' ? '/src/assets/x.png' : '/src/assets/o.png'}
            alt={value}
            className="square-image"
          />
        )}
      </button>
    )
  }

  const handleBackToHome = () => {
    if (socket) {
      socket.disconnect()
    }
    navigate('/')
  }

  return (
    <div className="game-container">
      <h1>Online Game</h1>
      <h2 className= "status-waiting">{status}</h2>
      
      <div className="game-layout">

        <div className="left-controls">

          <h2 className="status room-code"><strong>Room Code:</strong> {roomCode}</h2>
          <h2 className="status"><strong>Players:</strong> {players.length}/2</h2>
          <h2 className="status"><strong>You are:</strong> {mySymbol || 'Connecting...'}</h2>
          <button className="game-button back-button" onClick={handleBackToHome}>
            Back to Home
          </button>
    
        </div>

      <div className="board-container">
        <div className="board-board">
          <div className="horizontal-line-1"></div>
          <div className="horizontal-line-2"></div>
          {Array(9).fill(null).map((_, index) => renderSquare(index))}
        </div>

      </div>

    </div>

  </div>

  )
}

export default Online