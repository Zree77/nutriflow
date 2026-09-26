import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AdminApp from './admin/AdminApp.jsx'
import { BrowserRouter } from 'react-router-dom'

const isAdmin = window.location.pathname.startsWith('/admin')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isAdmin
      ? <BrowserRouter><AdminApp /></BrowserRouter>
      : <App />
    }
  </StrictMode>,
)
