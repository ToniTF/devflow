import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

// Crear root con createRoot en lugar de ReactDOM.render
const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);