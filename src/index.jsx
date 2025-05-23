import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
import './styles/theme.css'; // Asegúrate de que esta importación esté presente

// Crear root con createRoot en lugar de ReactDOM.render
const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);