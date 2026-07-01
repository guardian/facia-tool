import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

const App = () => (
	<h1>Hello world</h1>
)


createRoot(document.getElementById('react-mount')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
