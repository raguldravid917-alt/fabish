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

// Single-initialization guard for Google Identity Services to prevent duplicate initialize warnings
if (typeof window !== 'undefined') {
  let initializedClientId = null;

  const patchAccountsId = (accountsObj) => {
    if (accountsObj?.id && !accountsObj.id._guarded) {
      const origInit = accountsObj.id.initialize;
      accountsObj.id.initialize = function (config) {
        if (initializedClientId && initializedClientId === config?.client_id) {
          return; // Suppress duplicate initialize call
        }
        initializedClientId = config?.client_id;
        return origInit.call(this, config);
      };
      accountsObj.id._guarded = true;
    }
  };

  const patchGoogle = (gObj) => {
    if (!gObj) return;
    if (gObj.accounts) {
      patchAccountsId(gObj.accounts);
    } else {
      let _acc = gObj.accounts;
      try {
        Object.defineProperty(gObj, 'accounts', {
          configurable: true,
          enumerable: true,
          get() { return _acc; },
          set(accVal) {
            _acc = accVal;
            if (accVal) patchAccountsId(accVal);
          }
        });
      } catch (e) {
        // Fallback
      }
    }
  };

  if (window.google) {
    patchGoogle(window.google);
  } else {
    let _g = window.google;
    try {
      Object.defineProperty(window, 'google', {
        configurable: true,
        enumerable: true,
        get() { return _g; },
        set(gVal) {
          _g = gVal;
          if (gVal) patchGoogle(gVal);
        }
      });
    } catch (e) {
      // Fallback
    }
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
