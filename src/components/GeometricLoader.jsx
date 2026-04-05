import React from 'react';

const GeometricLoader = ({ size = 'full', className = '' }) => {
  // Minimal mode for small buttons
  if (size === 'small' || (typeof size === 'number' && size < 40)) {
    return (
      <svg viewBox="0 0 50 50" className={`animate-spin ${className}`} style={{ width: size, height: size, color: 'var(--accent-primary)' }}>
        <rect x="15" y="15" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" />
      </svg>
    );
  }

  // Full Narrative Mode
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg viewBox="0 0 120 160" className="w-32 h-40 overflow-visible text-blue-500" style={{ color: 'var(--accent-primary)' }}>
        <defs>
          {/* Premium Glow Effect */}
          <filter id="premium-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Masking for Submergence Effect */}
          <clipPath id="clip-above-water">
            <rect x="-20" y="-50" width="160" height="150" />
          </clipPath>
          <clipPath id="clip-below-water">
            <rect x="-20" y="100" width="160" height="100" />
          </clipPath>
        </defs>

        {/* =========================================
           SHAPES (Dual-Layered for Submergence)
           ========================================= */}

        {/* 1. Falling Triangle (Top Part) */}
        <polygon
          points="60,20 80,55 40,55"
          fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"
          filter="url(#premium-glow)"
          clipPath="url(#clip-above-water)"
          className="loader-shape-a"
        />
        {/* 1. Falling Triangle (Submerged Part - 10% Opacity) */}
        <polygon
          points="60,20 80,55 40,55"
          fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"
          opacity="0.1"
          clipPath="url(#clip-below-water)"
          className="loader-shape-a"
        />

        {/* 2. Rising Diamond (Top Part) */}
        <rect
          x="45" y="85" width="30" height="30"
          fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"
          filter="url(#premium-glow)"
          clipPath="url(#clip-above-water)"
          className="loader-shape-b"
        />
        {/* 2. Rising Diamond (Submerged Part - 10% Opacity) */}
        <rect
          x="45" y="85" width="30" height="30"
          fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"
          opacity="0.1"
          clipPath="url(#clip-below-water)"
          className="loader-shape-b"
        />

        {/* =========================================
           THE SPLASH PARTICLES (Triggered at 38%)
           ========================================= */}
        <g className="loader-splashes">
          {[...Array(6)].map((_, i) => (
            <circle 
              key={i} 
              cx="60" cy="100" r="1.5" 
              fill="currentColor" 
              className={`loader-splash loader-splash-${i + 1}`} 
            />
          ))}
        </g>

        {/* =========================================
           WINDING WATER SURFACE (Surface only, no fill)
           ========================================= */}
        
        {/* Layer 2: Main Dynamic Wave Path */}
        <path 
          d="M 0 100 Q 30 108 60 100 T 120 100" 
          fill="none" stroke="currentColor" strokeWidth="2" 
          opacity="0.7" 
          filter="url(#premium-glow)" 
          className="loader-wave-main" 
        />
        
        {/* Layer 3: Depth Wave 1 */}
        <path d="M 0 100 Q 30 115 60 100 T 120 100" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3" className="loader-wave-depth-1" />

        {/* Layer 4: Depth Wave 2 */}
        <path d="M 0 100 Q 30 125 60 100 T 120 100" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.15" className="loader-wave-depth-2" />

      </svg>
      
      <div className="mt-2 text-xs font-black tracking-[0.3em] opacity-80 animate-pulse" style={{ color: 'var(--accent-primary)' }}>
        LOADING
      </div>
    </div>
  );
};

export default GeometricLoader;
