import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { SplitConfigProvider } from './components/SplitConfigManager'
import { ApiKeyProvider } from './hooks/useApiKey'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ApiKeyProvider>
      <SplitConfigProvider>
        <App />
      </SplitConfigProvider>
    </ApiKeyProvider>
  </React.StrictMode>,
)