'use client';

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { CameraState } from '@/app/types';

interface ScanReticleProps {
  state: CameraState;
}

export function ScanReticle({ state }: ScanReticleProps) {
  const isProcessing = state === 'processing';
  const isError = state === 'error';

  return (
    <motion.div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 pointer-events-none"
      animate={{
        scale: isProcessing ? [1, 1.02, 1] : 1,
        opacity: isError ? [1, 0.5, 1] : 1,
      }}
      transition={{
        scale: { repeat: isProcessing ? Infinity : 0, duration: 0.8 },
        opacity: { repeat: isError ? Infinity : 0, duration: 0.4 },
      }}
    >
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.path
          d="M20 50 L20 20 L50 20"
          stroke={isError ? '#e63946' : '#e63946'}
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5 }}
        />
        <motion.path
          d="M150 20 L180 20 L180 50"
          stroke={isError ? '#e63946' : '#e63946'}
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        />
        <motion.path
          d="M180 150 L180 180 L150 180"
          stroke={isError ? '#e63946' : '#e63946'}
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
        <motion.path
          d="M50 180 L20 180 L20 150"
          stroke={isError ? '#e63946' : '#e63946'}
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        />
      </svg>
    </motion.div>
  );
}
