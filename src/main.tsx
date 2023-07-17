import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.scss';

const bodyElement = document.getElementsByTagName('body').item(0) as HTMLElement;

if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  bodyElement.setAttribute('data-bs-theme', 'dark');
} else {
  bodyElement.setAttribute('data-bs-theme', 'light');
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  bodyElement.setAttribute('data-bs-theme', e.matches ? 'dark' : 'light');
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
