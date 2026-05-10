import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '14px',
            borderRadius: '10px',
            border: '1px solid rgba(26,24,22,0.1)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          },
          success: {
            iconTheme: { primary: '#2d5a3d', secondary: '#fff' },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
