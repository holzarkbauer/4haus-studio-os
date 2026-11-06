import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { installAuthFetch } from './utils/authFetch';
import { MotionConfig } from 'motion/react';

// Seguridad: cada petición a /api lleva la identidad verificable del usuario.
installAuthFetch();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Quien activó "reducir movimiento" en su sistema ve los cambios sin animación. */}
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </StrictMode>,
);
