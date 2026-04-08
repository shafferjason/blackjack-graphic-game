import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GameSettingsProvider } from './config/GameSettingsContext'

// When a new service worker activates (via skipWaiting + clientsClaim),
// reload so the user immediately sees the latest deploy.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload()
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GameSettingsProvider>
      <App />
    </GameSettingsProvider>
  </StrictMode>,
)
