import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './RulesModal.css'

function OnlineModal({ isOpen, onClose }) {
  const [showJoinInput, setShowJoinInput] = useState(false)
  const [gameCode, setGameCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleCreateGame = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/games/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        onClose()
        navigate(`/play-online/${data.roomCode}`)
      } else {
        setError('Failed to create game room')
      }
    } catch (err) {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinGame = () => {
    setShowJoinInput(true)
    setError('')
  }

  const handleJoinSubmit = async (e) => {
    e.preventDefault()
    if (!gameCode.trim()) return
    
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/games/${gameCode}`)
      const data = await response.json()
      
      if (data.success) {
        if (data.room.playerCount >= 2) {
          setError('Game room is full')
        } else {
          onClose()
          navigate(`/play-online/${gameCode}`)
        }
      } else {
        setError('Game room not found')
      }
    } catch (err) {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
    setShowJoinInput(false)
    setGameCode('')
    setError('')
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
          {error && (
            <div style={{ 
              color: '#e07a5f', 
              marginBottom: '1rem', 
              textAlign: 'center',
              fontSize: '0.9rem'
            }}>
              {error}
            </div>
          )}
          
          {!showJoinInput ? (
            <>
              <div className="online-buttons">
                <button 
                  className="game-button" 
                  onClick={handleCreateGame}
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Game'}
                </button>
                <button className="game-button" onClick={handleJoinGame}>
                  Join Game
                </button>
              </div>
            </>
          ) : (
            
            <>

              <p>Enter the 4-digit game code:</p>
              <form onSubmit={handleJoinSubmit} className="join-form">
                <input
                  type="text"
                  placeholder="Enter game code"
                  value={gameCode}
                  onChange={(e) => setGameCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="game-code-input"
                  autoFocus
                  maxLength="4"
                />
                <div className="online-buttons">
                  <button 
                    type="submit" 
                    className="game-button" 
                    disabled={!gameCode.trim() || gameCode.length !== 4 || loading}
                  >
                    {loading ? 'Joining...' : 'Join'}
                  </button>

                  <button 
                    type="button" 
                    className="game-button" 
                    onClick={() => setShowJoinInput(false)}
                  >
                    Back
                  </button>

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