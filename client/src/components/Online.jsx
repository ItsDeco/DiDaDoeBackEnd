import { Link } from 'react-router-dom'
import './Game.css'

function PlayOnline() {
  return (
    <div>
      <h1 style={{animation: 'fadeIn 0s'}}>Play Online</h1>
      <p style={{ fontStyle: 'italic', color: '#999', justifyContent: 'center', display: 'flex', padding: '2vh 0'}}>
        Coming soon!</p>
      <Link to="/">
        <button className="game-button">Back to Home</button>
      </Link>
    </div>
  )
}

export default PlayOnline