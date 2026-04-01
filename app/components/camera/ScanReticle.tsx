'use client';

import type { CameraState } from '@/app/types';

interface ScanReticleProps {
  state: CameraState;
}

export function ScanReticle({ state }: ScanReticleProps) {
  const isError = state === 'error';
  const strokeColor = isError ? 'var(--destructive)' : 'var(--foreground)';

  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 size-36 -translate-x-1/2 -translate-y-1/2 opacity-25">
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