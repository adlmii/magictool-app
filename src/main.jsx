import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<App />)

const loader = document.getElementById('app-loader')
if (loader) {
  loader.style.opacity = '0'
  setTimeout(() => loader.remove(), 300)
}