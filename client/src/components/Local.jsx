import { Link } from 'react-router-dom'
import { useState } from 'react'
import './Game.css'

function PlayLocal() {
  const [board, setBoard] = useState(Array(9).fill(null))
  const [currentPlayer, setCurrentPlayer] = useState('X')
  const [winner, setWinner] = useState(null)
  
  const [xMoves, setXMoves] = useState([])
  const [oMoves, setOMoves] = useState([])

  const checkWinner = (squares) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6], //Check all possibilities for winning games
    ]

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i]
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a]
      }
    }
    return null
  }



  const handleClick = (index) => {
    if (board[index] || winner) 
      return

    const newBoard = [...board]
    let newXMoves = [...xMoves]
    let newOMoves = [...oMoves]

    newBoard[index] = currentPlayer 

    if (currentPlayer === 'X') {
      newXMoves.push(index) // Pushes the current index to x's moves when is its turn
      if (newXMoves.length > 3) {
        const oldestXIndex = newXMoves.shift() //removes the oldest one from the array
        newBoard[oldestXIndex] = null //clears that statement on the board
      }
      setXMoves(newXMoves)
    } else {
      newOMoves.push(index)
      if (newOMoves.length > 3) {
        const oldestOIndex = newOMoves.shift()
        newBoard[oldestOIndex] = null
      }
      setOMoves(newOMoves)
    }
    setBoard(newBoard)



    const gameWinner = checkWinner(newBoard)
    if (gameWinner) {
      setWinner(gameWinner)
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X')
    }
  }

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X')
    setWinner(null)
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
      <h1>Local Multiplayer</h1>
      
      <div className="game-layout">

        <div className="left-controls">
            {winner ? (
              <h2 className="status winner">
                {winner === 'X' ? 'Crosses Win!' : 'Circles Win!'}
              </h2>
            ) : (
              <h2 className="status">Current Player: {currentPlayer}</h2>
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

export default PlayLocal