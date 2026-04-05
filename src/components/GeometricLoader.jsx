import React from 'react';

/**
 * GeometricLoader Component
 * 
 * A simplified mathematical grid-tiling loader.
 * Refined for perfect centering with an animated dot cycle.
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
         - All caps: LOADING
         - Tracking compensation: mr-[-0.5em] for tracking-[0.5em]
         - Mathematical Dot Cycle: 1->2->3->2->1 
      */}
      {showText && (
        <div 
          className="mt-6 text-[10px] font-bold tracking-[0.5em] mr-[-0.5em] opacity-80 uppercase text-center flex items-center justify-center" 
          style={{ color: 'var(--accent-primary)' }}
        >
          <span className="animate-pulse">LOADING</span>
          <span className="math-loading-dots"></span>
        </div>
      )}
    </div>
  );
};

export default GeometricLoader;
