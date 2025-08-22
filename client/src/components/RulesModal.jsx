import './RulesModal.css'

function RulesModal({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Dynamic TicTacToe Rules</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <p>The game works exactly like TicTacToe does!</p>
          <p>Only difference is that you only get 3 moves at a time, after the fourth move is played, your oldest move will delete itself, being replaced by the newest one.</p>
          <p>Try to keep up and don't lose track of your opponent moves.</p>
          <p>Good luck!</p>
          <button className="game-button" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

export default RulesModal