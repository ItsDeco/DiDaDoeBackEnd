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
    gameOver: false,
    xMoves: [],
    oMoves: []
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
        
        if (data.players.length === 2 && data.gameState.currentPlayer === myPlayer.symbol) {
          setIsMyTurn(true)
          setStatus('Your turn!')
        } else if (data.players.length === 2) {
          setIsMyTurn(false)
          setStatus("Opponent's turn...")
        } else {
          setStatus(`You will be playing as ${myPlayer.symbol}, waiting for opponent...`)
        }
      }
    })

    newSocket.on('game-start', (data) => {
      setGameState(data.gameState)
      setPlayers(data.players)
      
      const myPlayer = data.players.find(p => p.id === newSocket.id)
      if (myPlayer) {
        const myPlayerSymbol = myPlayer.symbol
        setMySymbol(myPlayerSymbol)
        
        if (data.gameState.currentPlayer === myPlayerSymbol) {
          setIsMyTurn(true)
          setStatus('Your turn!')
        } else {
          setIsMyTurn(false)
          setStatus("Opponent's turn...")
        }
      }
    })

    newSocket.on('move-made', (data) => {
      console.log('Move made received:', data)
      setGameState(data.gameState)
      
      if (data.gameState.gameOver) {
        const isWinner = data.gameState.winner === newSocket.mySymbol
        setStatus(isWinner ? 'You won! Disconnecting...' : 'You lost! Disconnecting...')
        setIsMyTurn(false)
        
        setTimeout(() => {
          newSocket.disconnect()
          navigate('/')
        }, 3000)
      } else {
        if (data.gameState.currentPlayer === newSocket.mySymbol) {
          setIsMyTurn(true)
          setStatus('Your turn!')
        } else {
          setIsMyTurn(false)
          setStatus("Opponent's turn...")
        }
      }
    })

    newSocket.on('player-left', (data) => {
      setStatus('Opponent disconnected, closing the room...')
      setPlayers(data.players)
      setGameState(data.gameState)
      setIsMyTurn(false)
      
      setTimeout(() => {
        newSocket.disconnect()
        navigate('/')
      }, 3000)
    })

    newSocket.on('error', (data) => {
      console.error('Game error:', data.message)
      setStatus(`Error: ${data.message}`)
    })

    return () => {
      newSocket.disconnect()
    }
  }, [roomCode, navigate])

  useEffect(() => {
    if (socket && mySymbol) {
      socket.mySymbol = mySymbol
    }
  }, [socket, mySymbol])

  const handleClick = (index) => {
    console.log('Click attempt:', { index, isMyTurn, mySymbol, currentPlayer: gameState.currentPlayer })
    
    if (gameState.board[index] || gameState.winner || gameState.gameOver) {
      console.log('Move blocked: square occupied or game over')
      return
    }
    
    if (!socket || !isMyTurn) {
      console.log('Move blocked: no socket or not my turn')
      return
    }
    
    console.log('Sending move to server')
    socket.emit('make-move', { index })
  }

  const renderSquare = (index) => (
    <button
      key={index}
      className={`invisible-square square-${index}`}
      onClick={() => handleClick(index)}
    >
      {gameState.board[index] && (
        <div className={`player-mark ${gameState.board[index] === 'X' ? 'x' : 'o'}`}></div>
      )}
    </button>
  )

  const handleBackToHome = () => {
    if (socket) {
      socket.disconnect()
    }
    navigate('/')
  }

  return (
    <div className="game-container">
      <h1>Online Game</h1>
      {gameState.winner ? (
        <h2 className="status-waiting">
          {gameState.winner === mySymbol ? 'You Won! Disconnecting...' : 'You Lost :c Disconnecting...'}
        </h2>
      ) : (
        <h2 className="status-waiting">{status}</h2>
      )}
      
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