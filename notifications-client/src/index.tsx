import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import "./index.css"


createRoot(document.getElementById('react-mount')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
