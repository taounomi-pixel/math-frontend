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
          {/* Premium Glow Effect (Crucial) */}
          <filter id="premium-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* =========================================
           THE WATER COMPLEX (Multi-Layered Texture)
           ========================================= */}
        
        {/* Layer 1: The Base "Water Body" Depth (Static/Subtle) */}
        <rect x="0" y="100" width="120" height="60" fill="currentColor" opacity="0.05" />

        {/* 🔴 Layer 2: Main Dynamic Wave Path (Top, with glow) 🔴 */}
        <path 
          d="M 0 100 Q 30 108 60 100 T 120 100" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          opacity="0.6" 
          filter="url(#premium-glow)" 
          className="loader-wave-main" 
        />
        
        {/* Layer 3: Depth Wave 1 (Subtle offset) */}
        <path d="M 0 100 Q 30 115 60 100 T 120 100" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3" className="loader-wave-depth-1" />

        {/* Layer 4: Depth Wave 2 (Deeper, darker texture) */}
        <path d="M 0 100 Q 30 125 60 100 T 120 100" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.15" className="loader-wave-depth-2" />

        {/* =========================================
           THE RIPPLE COMPLEX (Concentric Rings)
           ========================================= */}
        <ellipse cx="60" cy="100" rx="15" ry="4" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0" className="loader-ripple-1" />
        <ellipse cx="60" cy="100" rx="15" ry="4" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0" className="loader-ripple-2" />

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
