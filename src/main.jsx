// main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// 부트스트랩 JS가 App.jsx에서 import되었으므로 여기서는 생략

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)