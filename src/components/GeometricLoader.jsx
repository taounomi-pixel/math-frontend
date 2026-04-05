import React from 'react';

const GeometricLoader = ({ size = 'full', className = '' }) => {
  // 🔴 NEW: Secondary Dot-Grid Loader for Small Components 🔴
  if (size === 'small' || (typeof size === 'number' && size < 40)) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="loader" style={{ width: size === 'small' ? '30px' : size }}></div>
      </div>
    );
  }

  // Full Narrative Mode (12s Cycle: T -> R -> P -> R)
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg viewBox="0 0 120 160" className="w-32 h-40 overflow-visible text-blue-500" style={{ color: 'var(--accent-primary)' }}>
        <defs>
          <filter id="premium-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <mask id="loader-submergence-mask">
            <rect x="-20" y="-50" width="160" height="150" fill="white" />
            <rect x="-20" y="100" width="160" height="100" fill="#222" />
          </mask>
        </defs>

        {/* 1. Triangle Shape */}
        <g mask="url(#loader-submergence-mask)">
          <polygon
            points="60,20 80,55 40,55"
            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"
            filter="url(#premium-glow)"
            className="loader-shape-t"
          />
        </g>

        {/* 2. Rect Shape */}
        <g mask="url(#loader-submergence-mask)">
          <rect
            x="45" y="25" width="30" height="30"
            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"
            filter="url(#premium-glow)"
            className="loader-shape-r"
          />
        </g>

        {/* 3. Pentagon Shape */}
        <g mask="url(#loader-submergence-mask)">
          <polygon
            points="60,20 80,35 73,58 47,58 40,35"
            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"
            filter="url(#premium-glow)"
            className="loader-shape-p"
          />
        </g>

        {/* =========================================
           WINDING WATER SURFACE (Surface only, no fill)
           ========================================= */}
        <path 
          d="M 0 100 Q 30 108 60 100 T 120 100" 
          fill="none" stroke="currentColor" strokeWidth="2" 
          opacity="0.8" 
          filter="url(#premium-glow)" 
          className="loader-wave-main" 
        />
        <path d="M 0 100 Q 30 115 60 100 T 120 100" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3" className="loader-wave-depth-1" />
        <path d="M 0 100 Q 30 125 60 100 T 120 100" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.15" className="loader-wave-depth-2" />

        {/* Splash Particles */}
        <g className="loader-splashes">
          {[...Array(6)].map((_, i) => (
            <circle key={i} cx="60" cy="100" r="1.5" fill="currentColor" className={`loader-splash loader-splash-${i + 1}`} />
          ))}
        </g>
      </svg>
      
      <div className="mt-2 text-xs font-black tracking-[0.3em] opacity-80 animate-pulse" style={{ color: 'var(--accent-primary)' }}>
        LOADING
      </div>
    </div>
  );
};

export default GeometricLoader;
