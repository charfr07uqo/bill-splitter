import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { SplitConfigProvider } from './components/SplitConfigManager'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SplitConfigProvider>
      <App />
    </SplitConfigProvider>
  </React.StrictMode>,
)