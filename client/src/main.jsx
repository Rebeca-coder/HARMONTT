import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/styles.css';

// Punto de entrada: buscamos <div id="root"> y le decimos a React que dibuje App ahí.
createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
