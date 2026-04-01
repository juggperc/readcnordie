'use client';

import { memo, useCallback } from 'react';
import { ZoomIn } from 'lucide-react';

interface ControlBarProps {
  onCapture: () => void;
  isProcessing: boolean;
  disabled: boolean;
  zoom?: number;
  maxZoom?: number;
  onZoomChange?: (zoom: number) => void;
}

export const ControlBar = memo(function ControlBar({ onCapture, isProcessing, disabled, zoom = 1, maxZoom = 5, onZoomChange }: ControlBarProps) {
  const handleZoomChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (onZoomChange) {
      onZoomChange(parseFloat(e.target.value));
    }
  }, [onZoomChange]);

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
            onChange={handleZoomChange}
            className="flex-1 h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
          />
          <span className="text-xs text-white/60 w-8">{zoom.toFixed(1)}x</span>
        </div>
      )}

      <button
        onClick={onCapture}
        disabled={disabled || isProcessing}
        className="relative w-18 h-18 rounded-full flex items-center justify-center disabled:opacity-50"
      >
        <div className="absolute inset-0 rounded-full border-4 border-[#e63946]" />
        <div className={`w-14 h-14 rounded-full ${isProcessing ? 'bg-[#e63946]' : 'bg-white'}`} />
      </button>
    </div>
  );
});