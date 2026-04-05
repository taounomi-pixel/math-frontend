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
          <filter id="premium-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 🔴 NEW: The SINGLE Dynamic Water Surface (Replacing ALL old line/ripple layers) 🔴 */}
        <path
          /* Start as a flat static wave */
          d="M 0 100 Q 30 108 60 100 T 120 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          opacity="0.6"
          filter="url(#premium-glow)"
          className="loader-water-surface"
        />

        {/* Shape A: Falling Triangle (Keeps physics) */}
        <polygon
          points="60,20 80,55 40,55"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
          filter="url(#premium-glow)"
          className="loader-shape-a"
        />

        {/* Shape B: Rising Diamond (Keeps physics) */}
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
      
      <div className="mt-2 text-xs font-black tracking-[0.3em] opacity-80 animate-pulse" style={{ color: 'var(--accent-primary)' }}>
        LOADING
      </div>
    </div>
  );
};

export default GeometricLoader;
