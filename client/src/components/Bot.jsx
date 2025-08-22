import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './Game.css'

function PlayBot() {
  const [board, setBoard] = useState(Array(9).fill(null))
  const [currentPlayer, setCurrentPlayer] = useState('X')
  const [winner, setWinner] = useState(null)
  const [currentTurns, setCurrentTurns] = useState(0)
  const [bestTurns, setBestTurns] = useState(0)
  
  const [xMoves, setXMoves] = useState([])
  const [oMoves, setOMoves] = useState([])

  useEffect(() => {
    const savedBestTurns = localStorage.getItem('didadoe-best-turns')
    if (savedBestTurns) {
      setBestTurns(parseInt(savedBestTurns))
    }
  }, [])

  useEffect(() => {
    if (winner && currentTurns > bestTurns) {
      setBestTurns(currentTurns)
      localStorage.setItem('didadoe-best-turns', currentTurns.toString())
    }
  }, [winner, currentTurns, bestTurns])

  const checkWinner = (squares) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ]

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i]
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a]
      }
    }
    return null
  }

  //BOT AI =================
  const minimax = (squares, xMovesList, oMovesList, depth, isMaximizing, alpha = -Infinity, beta = Infinity) => {
    const winner = checkWinner(squares)
    
    if (winner === 'O') 
      return 10 - depth
    
    if (winner === 'X') 
      return depth - 10

    if (depth > 8) 
      return 0

    if (isMaximizing) {
      let bestScore = -Infinity
      for (let i = 0; i < 9; i++) {
        if (squares[i] === null) {
          const newSquares = [...squares]
          const newOMoves = [...oMovesList]
          newSquares[i] = 'O'
          newOMoves.push(i)
          
          if (newOMoves.length > 3) {
            const oldestOIndex = newOMoves.shift()
            newSquares[oldestOIndex] = null
          }
          
          const score = minimax(newSquares, xMovesList, newOMoves, depth + 1, false, alpha, beta)
          bestScore = Math.max(score, bestScore)
          
          alpha = Math.max(alpha, bestScore)
          if (beta <= alpha) break
        }
      }
      return bestScore
    } else {
      let bestScore = Infinity
      for (let i = 0; i < 9; i++) {
        if (squares[i] === null) {
          const newSquares = [...squares]
          const newXMoves = [...xMovesList]
          
          newSquares[i] = 'X'
          newXMoves.push(i)
          
          if (newXMoves.length > 3) {
            const oldestXIndex = newXMoves.shift()
            newSquares[oldestXIndex] = null
          }
          
          const score = minimax(newSquares, newXMoves, oMovesList, depth + 1, true, alpha, beta)
          bestScore = Math.min(score, bestScore)
          beta = Math.min(beta, bestScore)
          if (beta <= alpha) break
        }
      }
      return bestScore
    }
  }

  const getBestMove = (squares, xMovesList, oMovesList) => {
    let bestScore = -Infinity
    let bestMove = 0

    for (let i = 0; i < 9; i++) {
      if (squares[i] === null) {
        const newSquares = [...squares]
        const newOMoves = [...oMovesList]
        
        newSquares[i] = 'O'
        newOMoves.push(i)
        
        if (newOMoves.length > 3) {
          const oldestOIndex = newOMoves.shift()
          newSquares[oldestOIndex] = null
        }
        
        const score = minimax(newSquares, xMovesList, newOMoves, 0, false)
        
        if (score > bestScore) {
          bestScore = score
          bestMove = i
        }
      }
    }
    return bestMove
  }

  const handleClick = (index) => {
    if (board[index] || winner || currentPlayer === 'O') return
    
    const newBoard = [...board]
    let newXMoves = [...xMoves]
    
    newBoard[index] = 'X'
    newXMoves.push(index)
    
    if (newXMoves.length > 3) {
      const oldestXIndex = newXMoves.shift()
      newBoard[oldestXIndex] = null
    }
    
    setXMoves(newXMoves)
    setBoard(newBoard)

    const gameWinner = checkWinner(newBoard)
    if (gameWinner) {
      setWinner(gameWinner)
    } else {
      setCurrentPlayer('O')
    }
  }

  useEffect(() => {
    if (currentPlayer === 'O' && !winner) {
      const timer = setTimeout(() => {
        const bestMove = getBestMove([...board], [...xMoves], [...oMoves])
        
        const newBoard = [...board]
        let newOMoves = [...oMoves]
        
        newBoard[bestMove] = 'O'
        newOMoves.push(bestMove)
        
        if (newOMoves.length > 3) {
          const oldestOIndex = newOMoves.shift()
          newBoard[oldestOIndex] = null
        }
        
        setOMoves(newOMoves)
        setBoard(newBoard)
        setCurrentTurns(prev => prev + 1)

        const gameWinner = checkWinner(newBoard)
        if (gameWinner) {
          setWinner(gameWinner)
        } else {
          setCurrentPlayer('X')
        }
      }, 800)
      
      return () => clearTimeout(timer)
    }
  }, [currentPlayer, board, winner, xMoves, oMoves])

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X')
    setWinner(null)
    setCurrentTurns(0)
    setXMoves([])
    setOMoves([])
  }

  const renderSquare = (index) => (
    <button
      key={index}
      className={`invisible-square square-${index}`}
      onClick={() => handleClick(index)}
    >
      {board[index] && (
        <div className={`player-mark ${board[index] === 'X' ? 'x' : 'o'}`}></div>
      )}
    </button>
  )


  return (
    <div className="game-container">
      <h1>Player vs Bot</h1>
      
      <div className="game-layout">

        <div className="left-controls">
            <h2 className="status">
              Best Game: {bestTurns} Turns
            </h2>
            {winner ? (
              <h2 className="status winner">
                {winner === 'X' ? 'Crosses Win!' : 'Circles Win!'}
              </h2>
            ) : (
              <h2 className="status">
                {currentPlayer === 'X' ? 'Your Turn' : 'Bot is thinking...'}
              </h2>
            )}

          <Link to="/">
            <button className="game-button back-button">Back to Home</button>
          </Link>

        </div>

        <button className="reset-button" onClick={resetGame} title="New Game">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
          </svg>
        </button>

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

export default PlayBot