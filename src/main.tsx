import '@total-typescript/ts-reset'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(
  document.getElementById('touren-react') as HTMLElement
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
