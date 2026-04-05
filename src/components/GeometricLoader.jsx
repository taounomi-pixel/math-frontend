import React from 'react';

const GeometricLoader = ({ size = 64, className = "" }) => {
  const isSmall = size < 40;

  if (isSmall) {
    return (
      <div 
        className={`geometric-loader-container ${className}`} 
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle 
            cx="50" cy="50" r="40" 
            className="loader-minimal loader-shape"
            strokeDasharray="80"
          />
        </svg>
      </div>
    );
  }

  return (
    <div 
      className={`geometric-loader-container ${className}`} 
      style={{ width: size, minHeight: size + 40 }}
    >
      <svg 
        viewBox="0 0 100 100" 
        className="w-full overflow-visible"
        style={{ height: size }}
      >
        <defs>
          <linearGradient id="waterlineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="var(--accent-primary)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        <rect x="0" y="49.5" width="100" height="1" fill="url(#waterlineGradient)" />
        <line x1="10" y1="50" x2="90" y2="50" stroke="var(--accent-primary)" strokeWidth="0.5" opacity="0.2" strokeDasharray="2 2" />

        <g className="shape-fall" style={{ transformBox: 'fill-box' }}>
          <path 
            className="loader-shape"
            d="M 50,15 L 20,45 L 80,45 Z" 
          />
          <path 
            className="loader-shape" 
            d="M 50,15 L 50,45" 
            opacity="0.5"
            strokeWidth="1.5"
          />
        </g>

        <circle className="loader-splash-particle" cx="50" cy="50" r="2.5" style={{ '--dx': '-25px', '--dy': '-20px' }} />
        <circle className="loader-splash-particle" cx="50" cy="50" r="1.8" style={{ '--dx': '25px', '--dy': '-20px' }} />
        <circle className="loader-splash-particle" cx="50" cy="50" r="3" style={{ '--dx': '0px', '--dy': '-35px' }} />
        
        <circle className="loader-ripple" cx="50" cy="50" r="5" />
        <circle className="loader-ripple" cx="50" cy="50" r="5" style={{ animationDelay: '0.15s' }} />

        <g className="shape-rise" style={{ transformBox: 'fill-box' }}>
          <path 
            className="loader-shape"
            d="M 50,10 L 75,35 L 50,60 L 25,35 Z" 
          />
          <path 
            className="loader-shape" 
            d="M 25,35 L 75,35 M 50,10 L 50,60" 
            opacity="0.4"
            strokeWidth="1.5"
          />
        </g>
      </svg>
      
      {!isSmall && (
        <div className="loader-text">
          Loading
        </div>
      )}
    </div>
  );
};

export default GeometricLoader;
