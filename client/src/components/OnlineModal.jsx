import { useState } from 'react'
import { Link } from 'react-router-dom'
import './RulesModal.css'

function OnlineModal({ isOpen, onClose }) {
  const [showJoinInput, setShowJoinInput] = useState(false)
  const [gameCode, setGameCode] = useState('')

  const handleJoinGame = () => {
    setShowJoinInput(true)
  }

  const handleJoinSubmit = (e) => {
    e.preventDefault()
    if (gameCode.trim()) {
      // Handle join game logic here
      console.log('Joining game with code:', gameCode)
      onClose()
      setShowJoinInput(false)
      setGameCode('')
    }
  }

  const handleClose = () => {
    onClose()
    setShowJoinInput(false)
    setGameCode('')
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-header">
          <h2>{!showJoinInput ? 'Play Online' : 'Join Game'}</h2>

          <button className="close-button" onClick={handleClose}>×</button>

        </div>
        
        <div className="modal-body">
          {!showJoinInput ? (
            <>

              <div className="online-buttons">

                <Link to="/play-online" onClick={handleClose}>
                  <button className="game-button">Create Game</button>
                </Link>

                <button className="game-button" onClick={handleJoinGame}>Join Game</button>

              </div>

            </>

          ) : (
            <>
              <form onSubmit={handleJoinSubmit} className="join-form">
                <input type="text" placeholder="Enter game code" value={gameCode} onChange={(e) => setGameCode(e.target.value)} className="game-code-input" autoFocus/>

                <div className="online-buttons">

                <Link to="/play-online" onClick={handleClose}>
                  <button type="submit" className="game-button" disabled={!gameCode.trim()}> Join </button>
                </Link>
                  <button type="button" className="game-button" onClick={() => setShowJoinInput(false)}>Back </button>

                </div>

              </form>
            </>
          )}

        </div>
      </div>
    </div>
  )
}

export default OnlineModal