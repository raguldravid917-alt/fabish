import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Prevent duplicate Google Identity Services initializations
(function() {
  if (typeof window === 'undefined') return;
  
  let rawId = null;
  let initialized = false;
  let initParams = {};

  window.google = window.google || {};
  window.google.accounts = window.google.accounts || {};

  Object.defineProperty(window.google.accounts, 'id', {
    configurable: true,
    enumerable: true,
    get() {
      return rawId;
    },
    set(newId) {
      rawId = newId;
      if (newId && typeof newId === 'object') {
        let originalInit = newId.initialize;
        Object.defineProperty(newId, 'initialize', {
          configurable: true,
          enumerable: true,
          get() {
            return function(options) {
              // Merge all options (like client_id, callback, etc.)
              Object.assign(initParams, options);
              
              if (options.callback || options.native_callback) {
                // If this call has a callback, initialize immediately
                if (!initialized) {
                  initialized = true;
                  if (originalInit) {
                    originalInit.call(newId, initParams);
                  }
                }
              } else {
                // If it doesn't have a callback, defer it for a short time
                // to see if a call with a callback comes (e.g. from GoogleLogin).
                setTimeout(() => {
                  if (!initialized) {
                    initialized = true;
                    if (originalInit) {
                      originalInit.call(newId, initParams);
                    }
                  }
                }, 100);
              }
            };
          },
          set(newInitVal) {
            originalInit = newInitVal;
          }
        });
      }
    }
  });
})();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
