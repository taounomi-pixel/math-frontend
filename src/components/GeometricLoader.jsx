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

          {/* 🔴 NEW: Unified Masking for Perfect Seams 🔴
              White = Full Opacity (Above Water)
              Grey #191919 (~10%) = Submerged Opacity
               meeting exactly at y=100
          */}
          <mask id="loader-submergence-mask">
            <rect x="-20" y="-50" width="160" height="150" fill="white" />
            <rect x="-20" y="100" width="160" height="100" fill="#222" />
          </mask>
        </defs>

        {/* =========================================
           SHAPES (Unified with Masking)
           ========================================= */}

        {/* 1. Falling Triangle (Unified) */}
        <g mask="url(#loader-submergence-mask)">
          <polygon
            points="60,20 80,55 40,55"
            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"
            filter="url(#premium-glow)"
            className="loader-shape-a"
          />
        </g>

        {/* 2. Rising Diamond (Unified) */}
        <g mask="url(#loader-submergence-mask)">
          <rect
            x="45" y="85" width="30" height="30"
            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"
            filter="url(#premium-glow)"
            className="loader-shape-b"
          />
        </g>

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
          opacity="0.8" 
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
