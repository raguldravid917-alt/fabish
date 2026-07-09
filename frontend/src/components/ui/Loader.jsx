import React from 'react';

const Loader = ({ size = 'large', text = '', className = '' }) => {
    const sizeClasses = {
        small: 'w-6 h-6',     // Buttons-ku
        medium: 'w-12 h-12',  // Card/Widget-ku
        large: 'w-24 h-24'    // Full Page / Layout loading-ku
    };

    return (
        <div className={`flex flex-col items-center justify-center min-h-[200px] ${className}`}>
            {/* Unga logo.png public folder-la iruntha direct ah work aagum */}
            <img
                src="/logo.png"
                alt="Loading..."
                className={`${sizeClasses[size]} animate-pulse object-contain drop-shadow-sm`}
            />
            {text && (
                <span className="mt-4 text-xs font-heading font-semibold tracking-[0.2em] text-[#729855] uppercase animate-pulse">
                    {text}
                </span>
            )}
        </div>
    );
};

export default Loader;