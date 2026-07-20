import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [bottomOffset, setBottomOffset] = useState(0);

  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  useEffect(() => {
    const updateOffset = () => {
      const elements = document.querySelectorAll(
        '[class*="fixed"][class*="bottom-0"], [class*="sticky"][class*="bottom-0"], [data-sticky-bottom="true"]'
      );
      
      let maxBottomHeight = 0;
      elements.forEach((el) => {
        if (el.id === 'toast-container-root' || el.contains(document.getElementById('toast-container-root'))) {
          return;
        }
        
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        
        const isVisible = 
          rect.height > 0 && 
          rect.height < 150 && 
          style.display !== 'none' && 
          style.visibility !== 'hidden' && 
          parseFloat(style.opacity || '1') > 0 &&
          rect.top < window.innerHeight - 5;
          
        if (isVisible) {
          const occupiedHeight = window.innerHeight - rect.top;
          if (occupiedHeight > maxBottomHeight) {
            maxBottomHeight = occupiedHeight;
          }
        }
      });

      let keyboardHeight = 0;
      if (window.visualViewport) {
        const vv = window.visualViewport;
        keyboardHeight = Math.max(0, window.innerHeight - (vv.offsetTop + vv.height));
      }
      
      setBottomOffset(Math.max(keyboardHeight, maxBottomHeight));
    };

    window.addEventListener('resize', updateOffset);
    window.addEventListener('scroll', updateOffset);
    
    let visualViewportListener = null;
    if (window.visualViewport) {
      visualViewportListener = updateOffset;
      window.visualViewport.addEventListener('resize', visualViewportListener);
      window.visualViewport.addEventListener('scroll', visualViewportListener);
    }
    
    const observer = new MutationObserver(updateOffset);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });

    updateOffset();

    return () => {
      window.removeEventListener('resize', updateOffset);
      window.removeEventListener('scroll', updateOffset);
      if (window.visualViewport && visualViewportListener) {
        window.visualViewport.removeEventListener('resize', visualViewportListener);
        window.visualViewport.removeEventListener('scroll', visualViewportListener);
      }
      observer.disconnect();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Portal Container */}
      <div 
        id="toast-container-root"
        className="fixed z-[9999] flex flex-col gap-3 pointer-events-none w-[calc(100%-2rem)] max-w-[384px] left-1/2 -translate-x-1/2 lg:left-auto lg:translate-x-0 lg:right-5 lg:w-full lg:max-w-sm"
        style={{
          bottom: bottomOffset > 0 
            ? `calc(${bottomOffset}px + env(safe-area-inset-bottom) + 12px)`
            : `calc(20px + env(safe-area-inset-bottom))`,
        }}
      >
        {toasts.map((toast) => {
          let bgColor = 'bg-white';
          let borderLeftColor = 'border-l-[4px] border-l-[#729855]';
          let Icon = CheckCircle;
          let iconColor = 'text-[#729855]';

          if (toast.type === 'error') {
            bgColor = 'bg-white';
            borderLeftColor = 'border-l-[4px] border-l-red-500';
            Icon = AlertCircle;
            iconColor = 'text-red-500';
          } else if (toast.type === 'info') {
            bgColor = 'bg-white';
            borderLeftColor = 'border-l-[4px] border-l-blue-500';
            Icon = Info;
            iconColor = 'text-blue-500';
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start p-4 rounded-none shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-gray-100 ${bgColor} ${borderLeftColor} animate-slide-in transition-all duration-300`}
              style={{
                fontFamily: '"Outfit", sans-serif',
              }}
            >
              <div className="flex-shrink-0 mr-3 mt-0.5">
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
              <div className="flex-grow mr-2">
                <p className="text-[14px] font-medium text-black leading-tight">
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 text-gray-400 hover:text-black transition-colors bg-transparent border-none cursor-pointer p-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Global CSS for sliding animations */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </ToastContext.Provider>
  );
};
