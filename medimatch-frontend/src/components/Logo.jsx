import React from 'react';

export default function Logo({ size = 40, forPanel = false }) {
  const id = `lg${size}`;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width={size} height={size}>
      <defs>
        <linearGradient id={`bg${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#0d9488' }} />
          <stop offset="100%" style={{ stopColor: '#0f766e' }} />
        </linearGradient>
        <linearGradient id={`ecg${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#5eead4' }} />
          <stop offset="100%" style={{ stopColor: '#99f6e4' }} />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="200" height="200" rx="44" fill={`url(#bg${id})`} />
      <path d="M32,22 L22,22 L22,32" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="5" strokeLinecap="round" />
      <path d="M168,22 L178,22 L178,32" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="5" strokeLinecap="round" />
      <path d="M32,178 L22,178 L22,168" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="5" strokeLinecap="round" />
      <path d="M168,178 L178,178 L178,168" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="5" strokeLinecap="round" />
      <rect x="76" y="38" width="48" height="124" rx="14" fill="white" />
      <rect x="38" y="76" width="124" height="48" rx="14" fill="white" />
      <polyline
        points="30,100 55,100 65,70 78,130 90,88 102,112 114,78 126,122 138,100 170,100"
        fill="none" stroke={`url(#ecg${id})`} strokeWidth="7"
        strokeLinecap="round" strokeLinejoin="round"
      />
      <circle cx="30" cy="100" r="7" fill="white" />
      <circle cx="170" cy="100" r="7" fill="white" />
    </svg>
  );
}