import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { SignalRProvider } from './context/SignalRContext' // Asegúrate de tener este archivo
import { NotificacionesProvider } from "./context/NotificacionesProvider.tsx";
import useAuth from './hooks/useAuth'

// Componente wrapper para usar el hook dentro del árbol de AuthProvider
function ProvidersWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const token = user?.token || null;
  return (
    <SignalRProvider token={token}>
      {children}
    </SignalRProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ProvidersWrapper>
        <NotificacionesProvider>
          <App />
        </NotificacionesProvider>
      </ProvidersWrapper>
    </AuthProvider>
  </StrictMode>,
)
