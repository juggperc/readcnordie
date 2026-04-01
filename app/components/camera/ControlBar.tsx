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
    <div className="absolute bottom-0 left-0 right-0 z-[60] flex flex-col items-center gap-4 px-6 pb-safe-bottom pt-2">
      {onZoomChange && (
        <div className="flex w-full max-w-xs items-center gap-3">
          <ZoomIn className="size-4 text-muted-foreground" aria-hidden />
          <input
            type="range"
            min={1}
            max={maxZoom}
            step={0.1}
            value={zoom}
            onChange={handleZoomChange}
            aria-label="Camera zoom"
            className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-muted [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground"
          />
          <span className="w-8 text-right text-xs tabular-nums text-muted-foreground">
            {zoom.toFixed(1)}×
          </span>
        </div>
      )}

      <button
        type="button"
        onClick={onCapture}
        disabled={disabled || isProcessing}
        aria-label={isProcessing ? 'Recognizing character' : 'Capture character'}
        className="relative flex size-[4.5rem] items-center justify-center rounded-full disabled:opacity-50"
      >
        <span className="absolute inset-0 rounded-full border-[3px] border-foreground/90" />
        <span
          className={
            isProcessing
              ? 'size-14 rounded-full bg-foreground/90'
              : 'size-14 rounded-full bg-background ring-1 ring-border'
          }
        />
      </button>
    </div>
  );
});