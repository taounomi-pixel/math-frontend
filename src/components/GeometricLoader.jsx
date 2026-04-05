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
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        {/* Waterfall/Waterline Effect (Subtle) */}
        <line x1="20" y1="50" x2="80" y2="50" stroke="var(--accent-primary)" strokeWidth="0.5" opacity="0.15" strokeDasharray="1 1" />

        {/* Animation 1: Shape A (Pyramid/Falling) */}
        <g className="shape-fall">
          <path 
            className="loader-shape"
            d="M 50,15 L 25,45 L 75,45 Z" 
          />
          <line x1="50" y1="15" x2="50" y2="45" className="loader-shape" opacity="0.6" />
        </g>

        {/* Animation 2: Splash Particles */}
        <circle className="loader-splash-particle" cx="50" cy="50" r="1.5" style={{ '--dx': '-15px', '--dy': '-20px', '--dx2': '-30px', '--dy2': '-5px' }} />
        <circle className="loader-splash-particle" cx="50" cy="50" r="1" style={{ '--dx': '15px', '--dy': '-20px', '--dx2': '30px', '--dy2': '-5px' }} />
        <circle className="loader-splash-particle" cx="50" cy="50" r="2" style={{ '--dx': '0px', '--dy': '-30px', '--dx2': '0px', '--dy2': '-45px' }} />
        
        {/* Animation 3: Ripple */}
        <circle className="loader-ripple" cx="50" cy="50" r="6" />
        <circle className="loader-ripple" cx="50" cy="50" r="6" style={{ animationDelay: '0.2s' }} />

        {/* Animation 4: Shape B (Diamond/Rising) */}
        <g className="shape-rise">
          <path 
            className="loader-shape"
            d="M 50,10 L 70,30 L 50,50 L 30,30 Z" 
          />
          <line x1="30" y1="30" x2="70" y2="30" className="loader-shape" opacity="0.4" />
          <line x1="50" y1="10" x2="50" y2="50" className="loader-shape" opacity="0.4" />
        </g>
      </svg>
    </div>
  );
};

export default GeometricLoader;
