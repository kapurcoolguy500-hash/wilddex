import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// We no longer use a service worker (an old one cached stale builds and blanked
// the screen after deploys). Proactively unregister any leftover registration so
// existing visitors heal; sw.js itself also self-destructs on activation.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .getRegistrations?.()
    .then((regs) => regs.forEach((r) => r.unregister()))
    .catch(() => {})
}
