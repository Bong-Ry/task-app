// 変更後
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom' // ★追加

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* ★BrowserRouterでAppを囲う */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
