import { Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './components/Home'
import PlayLocal from './components/Local'
import PlayBot from './components/Bot'
import PlayOnline from './components/Online'

function App() {
  return (
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/play-local" element={<PlayLocal />} />
          <Route path="/play-bot" element={<PlayBot />} />
          <Route path="/play-online" element={<PlayOnline />} />
        </Routes>
      </div>
  )
}

export default App