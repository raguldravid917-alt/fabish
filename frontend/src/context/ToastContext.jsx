import React, { createContext, useState, useContext, useCallback } from 'react';
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

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Portal Container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none w-full max-w-sm">
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
