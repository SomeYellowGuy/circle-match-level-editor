import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import UnsupportedBrowserPage from './UnsupportedBrowserPage';

const root = ReactDOM.createRoot(document.getElementById('root'));

if (typeof window.showDirectoryPicker === "undefined") {
  root.render(<UnsupportedBrowserPage />);
} else {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}