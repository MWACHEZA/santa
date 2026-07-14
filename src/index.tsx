import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { wakeUpBackend } from './services/api';

// Pre-warm the Render.com backend as soon as the page loads so it's ready when the user logs in
wakeUpBackend();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
