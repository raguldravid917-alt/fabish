import React from 'react';
import { Sparkles } from 'lucide-react';

const AuthCard = ({ title, subtitle, error, shake = false, children }) => {
  return (
    <div 
      className={`bg-white border border-[#eae8d8] p-8 md:p-12 w-full max-w-[520px] shadow-[0_12px_40px_rgba(0,0,0,0.035)] rounded-lg transition-all ${
        shake ? 'animate-shake' : ''
      }`}
    >
      {/* Header */}
      <div className="text-center border-b border-[#eae8d8] pb-6 mb-8 relative">
        <div className="absolute top-0 right-0 text-[#729855]">
          <Sparkles className="w-4 h-4" />
        </div>
        {subtitle && (
          <span className="text-[10px] font-heading font-bold text-[#729855] uppercase tracking-[0.2em] block mb-2">
            {subtitle}
          </span>
        )}
        <h1 className="serif-title text-3xl md:text-4xl text-black font-normal uppercase tracking-wide">
          {title}
        </h1>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-3.5 text-xs font-semibold mb-6 text-center rounded-none animate-fade-in">
          {error}
        </div>
      )}

      {/* Children Form Content */}
      <div className="space-y-6">
        {children}
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
        .animate-shake {
          animation: shake 0.25s ease-in-out 2;
        }
        .animate-fade-in {
          animation: fadeIn 0.25s ease forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default AuthCard;
