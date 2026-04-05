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

        {/* Water Surface Line */}
        <line x1="10" y1="100" x2="110" y2="100" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />

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
