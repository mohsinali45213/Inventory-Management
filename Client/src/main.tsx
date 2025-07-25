import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ModalProvider } from './context/ModalContext.tsx';

createRoot(document.getElementById('root')!).render(
  <ModalProvider>
    <App />
  </ModalProvider>
);
