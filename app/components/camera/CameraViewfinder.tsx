'use client';

import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CameraState } from '@/app/types';
import { ScanReticle } from './ScanReticle';
import { Camera } from 'lucide-react';

interface CameraViewfinderProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  cameraState: CameraState;
  error: string | null;
  isOcrReady?: boolean;
}

export const CameraViewfinder = memo(function CameraViewfinder({
  videoRef,
  cameraState,
  error,
  isOcrReady = true,
}: CameraViewfinderProps) {
  const isLoading = cameraState === 'loading';
  const hasError = cameraState === 'error';

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />

      <ScanReticle state={cameraState} />

      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-background/70"
          >
            <div className="flex flex-col items-center gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              >
                <Camera className="size-8 text-muted-foreground" />
              </motion.div>
              <p className="text-sm text-muted-foreground">Starting camera…</p>
            </div>
          </motion.div>
        )}

        {!isLoading && !hasError && !isOcrReady && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-background/60"
          >
            <p className="text-sm text-muted-foreground">Loading text recognition…</p>
          </motion.div>
        )}

        {hasError && error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute inset-0 flex items-center justify-center bg-background/90"
          >
            <div className="px-6 text-center">
              <p className="mb-2 text-sm font-medium text-destructive">Camera unavailable</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
