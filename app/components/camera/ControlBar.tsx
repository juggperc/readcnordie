'use client';

import { motion } from 'framer-motion';
import { Camera, Zap, ImageIcon, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ControlBarProps {
  onCapture: () => void;
  isProcessing: boolean;
  disabled: boolean;
  zoom?: number;
  maxZoom?: number;
  onZoomChange?: (zoom: number) => void;
}

export function ControlBar({ onCapture, isProcessing, disabled, zoom = 1, maxZoom = 5, onZoomChange }: ControlBarProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 pb-safe-bottom px-6 py-6 flex flex-col items-center gap-4">
      {onZoomChange && (
        <div className="flex items-center gap-3 w-full max-w-xs">
          <ZoomIn className="w-4 h-4 text-white/60" />
          <input
            type="range"
            min={1}
            max={maxZoom}
            step={0.1}
            value={zoom}
            onChange={(e) => onZoomChange(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
          />
          <span className="text-xs text-white/60 w-8">{zoom.toFixed(1)}x</span>
        </div>
      )}

      <div className="flex items-center justify-between w-full">
        <Button
          variant="ghost"
          size="icon"
          className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white"
        >
          <Zap className="w-5 h-5" />
        </Button>

        <motion.button
          onClick={onCapture}
          disabled={disabled || isProcessing}
          className="relative w-18 h-18 rounded-full flex items-center justify-center disabled:opacity-50"
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
        >
          <div className="absolute inset-0 rounded-full border-4 border-[#e63946]" />
          <motion.div
            className="w-14 h-14 rounded-full bg-white"
            animate={{
              scale: isProcessing ? 0.8 : 1,
              backgroundColor: isProcessing ? '#e63946' : '#ffffff',
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          />
          {isProcessing && (
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-white/30"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              style={{
                borderTopColor: 'white',
              }}
            />
          )}
        </motion.button>

        <Button
          variant="ghost"
          size="icon"
          className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white"
        >
          <ImageIcon className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
