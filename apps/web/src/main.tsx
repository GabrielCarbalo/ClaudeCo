import App from './App'
import './index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('#root not found in index.html')

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
)
