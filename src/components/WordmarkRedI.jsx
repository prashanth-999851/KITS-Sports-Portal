import React from 'react';

/**
 * WordmarkRedI: Renders the custom red lowercase 'i' for KiTS wordmarks,
 * matching the reference logo with a bright red vertical stem (#F32636) and a separate circular red dot.
 * All dimensions use CSS-relative 'em' units so it scales proportionally across all font sizes, headings, and body text.
 */
export default function WordmarkRedI({ className = '' }) {
  return (
    <span
      className={`inline-block relative align-baseline select-none ${className}`}
      style={{
        width: '0.28em',
        height: '0.64em',
        verticalAlign: '0',
        margin: '0 0.06em',
      }}
      aria-hidden="true"
    >
      {/* Circular Red Dot */}
      <span
        className="absolute rounded-full"
        style={{
          width: '0.24em',
          height: '0.24em',
          backgroundColor: '#F32636',
          bottom: 'calc(100% + 0.09em)',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />
      {/* Vertical Red Stem */}
      <span
        className="block mx-auto"
        style={{
          width: '0.19em',
          height: '100%',
          backgroundColor: '#F32636',
        }}
      />
    </span>
  );
}

/**
 * KiTS: Standard KiTS wordmark component with accessible text and custom red 'i'.
 */
export function KiTS({ className = '' }) {
  return (
    <span 
      className={`inline-block whitespace-nowrap tracking-normal ${className}`} 
      style={{ letterSpacing: '0.04em' }}
      aria-label="KiTS"
    >
      K<WordmarkRedI /><span className="sr-only">i</span>TS
    </span>
  );
}

