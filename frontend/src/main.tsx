import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import Maintenance from './components/Maintenance/Maintenance'
import './index.css'

const isMaintenance = import.meta.env.VITE_MAINTENANCE_MODE === 'true'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isMaintenance ? <Maintenance /> : <App />}
  </React.StrictMode>
)
