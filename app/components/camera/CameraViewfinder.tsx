'use client';

import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CameraState } from '@/app/types';
import { ScanReticle } from './ScanReticle';
import { ControlBar } from './ControlBar';
import { Camera } from 'lucide-react';

interface CameraViewfinderProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  cameraState: CameraState;
  error: string | null;
  onCapture: () => void;
  isProcessing: boolean;
  zoom?: number;
  maxZoom?: number;
  onZoomChange?: (zoom: number) => void;
}

export const CameraViewfinder = memo(function CameraViewfinder({
  videoRef,
  cameraState,
  error,
  onCapture,
  isProcessing,
  zoom,
  maxZoom,
  onZoomChange,
}: CameraViewfinderProps) {
  const isActive = cameraState === 'active';
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
            className="absolute inset-0 flex items-center justify-center bg-black/60"
          >
            <div className="flex flex-col items-center gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              >
                <Camera className="w-8 h-8 text-white/60" />
              </motion.div>
              <p className="text-white/60 text-sm">Initializing camera...</p>
            </div>
          </motion.div>
        )}

        {hasError && error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute inset-0 flex items-center justify-center bg-black/80"
          >
            <div className="text-center px-6">
              <p className="text-[#e63946] mb-2">Camera Access Denied</p>
              <p className="text-white/60 text-sm">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ControlBar
        onCapture={onCapture}
        isProcessing={isProcessing}
        disabled={!isActive}
        zoom={zoom}
        maxZoom={maxZoom}
        onZoomChange={onZoomChange}
      />
    </div>
  );
});
