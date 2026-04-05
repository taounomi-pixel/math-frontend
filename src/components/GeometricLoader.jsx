import React from 'react';

/**
 * GeometricLoader Component
 * 
 * A simplified mathematical grid-tiling loader.
 * Clean version: Only the animated grid, no text.
 * 
 * Props:
 * - size: Size of the grid square in px (default 50)
 * - className: Additional classes for the container
 */
const GeometricLoader = ({ size = 50, className = "" }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      {/* 🟦 Mathematical Grid-tiling Loader */}
      <div 
        className="math-grid-loader" 
        style={{ 
          '--loader-size': `${size}px`,
          width: 'var(--loader-size)',
          height: 'var(--loader-size)' 
        }}
      ></div>
    </div>
  );
};

export default GeometricLoader;
