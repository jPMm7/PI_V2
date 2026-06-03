import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx' // <-- IMPORTAR

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider> {/* <-- ENVOLVER A APP NESTE COMPONENTE */}
      <App />
    </AuthProvider>
  </StrictMode>,
)