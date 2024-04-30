import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.js';
import UnsupportedBrowserPage from './UnsupportedBrowserPage.jsx';

function isElectron() {
  // Renderer process
  if (typeof window !== 'undefined' && typeof window.process === 'object' && window.process.type === 'renderer') {
      return true;
  }

  // Main process
  if (typeof process !== 'undefined' && typeof process.versions === 'object' && !!process.versions.electron) {
      return true;
  }

  // Detect the user agent when the `nodeIntegration` option is set to true
  if (typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent.indexOf('Electron') >= 0) {
      return true;
  }

  return false;
}


const root = ReactDOM.createRoot(document.getElementById('root'));

if (!isElectron()) {
  root.render(<UnsupportedBrowserPage />);
} else {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}