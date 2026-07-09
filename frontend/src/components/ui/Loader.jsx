import React from 'react';

// size props vachi namma perusa (page loading) or chinnatha (button loading) use pannikalam
const Loader = ({ size = 'large', text = '', className = '' }) => {
    const sizeClasses = {
        small: 'w-6 h-6',     // Buttons-ku
        medium: 'w-12 h-12',  // Card/Widget-ku
        large: 'w-24 h-24'    // Full Page loading-ku
    };

    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            {/* Tailwind animate-pulse unga logo-va azhaga fade in/out panni premium feel tharum */}
            <img
                src="/logo.png"
                alt="Loading..."
                className={`${sizeClasses[size]} animate-pulse object-contain drop-shadow-sm`}
            />
            {text && (
                <span className="mt-4 text-xs font-heading font-semibold tracking-[0.2em] text-gray-400 uppercase animate-pulse">
                    {text}
                </span>
            )}
        </div>
    );
};

export default Loader;