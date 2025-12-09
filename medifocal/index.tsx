// CRITICAL: Process polyfill MUST be first - before any other imports
// This is required by ae_sdk library which uses Node.js process object
// Use direct path to avoid Vite alias resolution issues
// @ts-ignore
import process from '../node_modules/process/browser.js';

// Set up process polyfill globally for browser BEFORE any other code runs
if (typeof window !== 'undefined') {
  (window as any).process = process;
  (globalThis as any).process = process;
  // Ensure process.env exists
  if (!process.env) {
    process.env = {};
  }
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';

// Register Service Worker for PWA (Mobile App Support)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration);
      })
      .catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
  });
}

// Global error handler for chunk loading failures (including QUIC errors)
window.addEventListener('error', (event) => {
  // Check if it's a chunk loading error (including QUIC protocol errors)
  if (event.message && (
    event.message.includes('Failed to fetch dynamically imported module') ||
    event.message.includes('Loading chunk') ||
    event.message.includes('Unexpected token') ||
    event.message.includes('QUIC') ||
    event.message.includes('ERR_QUIC') ||
    event.message.includes('ERR_FAILED')
  )) {
    const scriptSrc = (event.target as HTMLScriptElement)?.src;
    if (scriptSrc && scriptSrc.includes('/assets/')) {
      console.warn('Chunk loading error detected, will retry:', scriptSrc);
      // Retry by reloading the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      event.preventDefault();
    }
  }
}, true);

// Handle unhandled promise rejections (common with dynamic imports and QUIC errors)
window.addEventListener('unhandledrejection', (event) => {
  const errorMessage = event.reason?.message || event.reason?.toString() || '';
  if (errorMessage && (
    errorMessage.includes('Failed to fetch dynamically imported module') ||
    errorMessage.includes('Loading chunk') ||
    errorMessage.includes('Unexpected token') ||
    errorMessage.includes('QUIC') ||
    errorMessage.includes('ERR_QUIC') ||
    errorMessage.includes('ERR_FAILED')
  )) {
    console.warn('Chunk loading promise rejection, will retry:', errorMessage);
    setTimeout(() => {
      window.location.reload();
    }, 2000);
    event.preventDefault();
  }
});

// Listen for service worker messages about chunk errors
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CHUNK_LOAD_ERROR') {
      console.warn('Service worker reported chunk load error, reloading:', event.data.url);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);
   