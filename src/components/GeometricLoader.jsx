import React from 'react';

const GeometricLoader = ({ size = 'full', className = '' }) => {
  // Minimal mode for small buttons
  if (size === 'small' || (typeof size === 'number' && size < 40)) {
    return (
      <svg 
        viewBox="0 0 50 50" 
        className={`animate-spin ${className}`} 
        style={{ width: size, height: size, color: 'var(--accent-primary)' }}
      >
        <rect x="15" y="15" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" />
      </svg>
    );
  }

  // Full Narrative Mode
  return (
    <div className={`flex flex-col items-center justify-center ${className}`} style={{ color: 'var(--accent-primary)' }}>
      <svg viewBox="0 0 120 160" className="w-32 h-40 overflow-visible">
        <defs>
          {/* Premium Glow Effect */}
          <filter id="premium-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Authentic Water Waves (Static Base Layer) */}
        <path d="M 0 100 Q 30 108 60 100 T 120 100" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" filter="url(#premium-glow)" />
        <path d="M 0 100 Q 30 92 60 100 T 120 100" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.1" />

        {/* 🔴 NEW: Dynamic Ripple Layer (Activated on Collision) 🔴 */}
        <g className="loader-ripple-layer">
          <ellipse cx="60" cy="100" rx="20" ry="6" fill="none" stroke="currentColor" strokeWidth="3" opacity="0" className="loader-ripple loader-ripple-1" />
          <ellipse cx="60" cy="100" rx="20" ry="6" fill="none" stroke="currentColor" strokeWidth="2" opacity="0" className="loader-ripple loader-ripple-2" />
        </g>

        {/* Shape A: Falling Triangle */}
        <polygon
          points="60,20 80,55 40,55"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
          filter="url(#premium-glow)"
          className="loader-shape-a"
        />

        {/* Ripple Effects at Waterline (Y=100) */}
        <ellipse cx="60" cy="100" rx="15" ry="4" fill="none" stroke="currentColor" strokeWidth="2" className="loader-ripple loader-ripple-1" />
        <ellipse cx="60" cy="100" rx="15" ry="4" fill="none" stroke="currentColor" strokeWidth="1.5" className="loader-ripple loader-ripple-2" />

        {/* Shape B: Rising Diamond */}
        <rect
          x="45" y="85" width="30" height="30"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
          filter="url(#premium-glow)"
          className="loader-shape-b"
        />
      </svg>
      
      {/* Loading Text */}
      <div className="mt-2 text-xs font-black tracking-[0.3em] opacity-80 animate-pulse">
        LOADING
      </div>
    </div>
  );
};

export default GeometricLoader;
