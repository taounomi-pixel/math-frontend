import React from 'react';

/**
 * GeometricLoader Component
 * 
 * A simplified mathematical grid-tiling loader.
 * Refined for perfect centering and responsive sizing.
 * 
 * Props:
 * - size: Size of the grid square in px (default 50)
 * - showText: Whether to show the 'Loading' label below (default true)
 * - className: Additional classes for the container
 */
const GeometricLoader = ({ size = 50, showText = true, className = "", ...props }) => {
  return (
    <div 
      className={`flex flex-col items-center justify-center ${className}`}
      {...props}
    >
      {/* 🟦 Mathematical Grid-tiling Loader */}
      <div 
        className="math-grid-loader" 
        style={{ 
          '--loader-size': `${size}px`,
          width: 'var(--loader-size)',
          height: 'var(--loader-size)' 
        }}
      ></div>
      
      {/* 
         Standard Platform Support Text 
         Using negative margin-right to compensate for tracking-[0.4em] centering offset
      */}
      {showText && (
        <div 
          className="mt-4 text-[10px] font-black tracking-[0.4em] mr-[-0.4em] opacity-60 animate-pulse uppercase text-center" 
          style={{ color: 'var(--accent-primary)' }}
        >
          Loading
        </div>
      )}
    </div>
  );
};

export default GeometricLoader;
