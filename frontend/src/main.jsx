import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'

// Create a client with production-ready default stale time (5 mins), 30 mins gcTime, retry: 2
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000,    // 30 minutes
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      placeholderData: (previousData) => previousData,
    },
  },
});

// Single-initialization guard for Google Identity Services
if (typeof window !== 'undefined') {
  let isInitialized = false;
  let activeClientId = null;

  const setupGuard = () => {
    if (window.google?.accounts?.id && !window.google.accounts.id._guarded) {
      const origInit = window.google.accounts.id.initialize;
      window.google.accounts.id.initialize = function (config) {
        if (isInitialized && activeClientId === config?.client_id) {
          // Already initialized for this client_id — skip duplicate GSI logger warnings
          return;
        }
        isInitialized = true;
        activeClientId = config?.client_id;
        return origInit.call(this, config);
      };
      window.google.accounts.id._guarded = true;
    }
  };

  if (window.google?.accounts?.id) {
    setupGuard();
  } else {
    let _g = window.google;
    Object.defineProperty(window, 'google', {
      configurable: true,
      enumerable: true,
      get() {
        return _g;
      },
      set(val) {
        _g = val;
        if (val?.accounts?.id) {
          setTimeout(setupGuard, 0);
        }
      }
    });
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
