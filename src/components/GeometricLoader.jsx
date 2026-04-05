import React from 'react';

/**
 * GeometricLoader Component
 * 
 * A simplified mathematical grid-tiling loader.
 * Uses a rhythmic 4-color sliding animation to represent calculating/loading states.
 */
const GeometricLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-transparent">
      {/* 🟦 Mathematical Grid-tiling Loader (L13 Style) */}
      <div className="math-grid-loader"></div>
      
      {/* Standard Platform Support Text */}
      <div className="mt-6 text-xs font-black tracking-[0.3em] opacity-80 animate-pulse uppercase" style={{ color: 'var(--accent-primary)' }}>
        Loading
      </div>
    </div>
  );
};

export default GeometricLoader;
