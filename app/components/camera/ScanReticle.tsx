'use client';

import type { CameraState } from '@/app/types';

interface ScanReticleProps {
  state: CameraState;
}

export function ScanReticle({ state }: ScanReticleProps) {
  const isError = state === 'error';
  const strokeColor = isError ? '#e63946' : '#e63946';

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 pointer-events-none opacity-30">
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M20 50 L20 20 L50 20"
          stroke={strokeColor}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M150 20 L180 20 L180 50"
          stroke={strokeColor}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M180 150 L180 180 L150 180"
          stroke={strokeColor}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M50 180 L20 180 L20 150"
          stroke={strokeColor}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}