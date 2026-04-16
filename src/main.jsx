import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import PrintPage from './PrintPage.jsx'
import './index.css'

const root = document.getElementById('root')

// Rota /print usada exclusivamente pelo Puppeteer para gerar o PDF
if (window.location.pathname === '/print') {
  ReactDOM.createRoot(root).render(<PrintPage />)
} else {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}
