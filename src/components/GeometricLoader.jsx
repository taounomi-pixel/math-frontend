import React from 'react';

const GeometricLoader = ({ size = 64, className = "" }) => {
  const isSmall = size < 30;
  
  return (
    <div 
      className={`geometric-loader-wrap ${className}`} 
      style={{ width: size, height: size }}
    >
      {/* Background floating shapes - only show if not small */}
      {!isSmall && (
        <>
          <div className="float-shape-load" style={{ width: size * 0.3, height: size * 0.3, left: '10%', animationDelay: '0s', clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
          <div className="float-shape-load" style={{ width: size * 0.25, height: size * 0.25, right: '15%', animationDelay: '0.5s', borderRadius: '50%' }}></div>
        </>
      )}
      
      {/* Main Morphing Shape */}
      <div 
        className="geometric-shape" 
        style={{ 
          width: isSmall ? size : size * 0.7, 
          height: isSmall ? size : size * 0.7 
        }}
      ></div>
      
      {/* Small orbiting center focus */}
      <div 
        className="pulsing-dot" 
        style={{ 
          width: Math.max(2, size * 0.15), 
          height: Math.max(2, size * 0.15) 
        }}
      ></div>
    </div>
  );
};

export default GeometricLoader;
