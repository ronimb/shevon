import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { installShevonDesktopBridge } from './desktopBridge.ts'
import './index.css'

void installShevonDesktopBridge().finally(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => {
      void navigator.serviceWorker.register('./sw.js')
    })
  }
})
