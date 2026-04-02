'use client';

import { useEffect, useRef, useCallback, memo } from 'react';
import HanziWriter from 'hanzi-writer';

interface StrokeAnimationProps {
  character: string;
  size?: number;
}

export const StrokeAnimation = memo(function StrokeAnimation({ character, size = 150 }: StrokeAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<HanziWriter | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.innerHTML = '';
    writerRef.current = null;

    const writer = HanziWriter.create(el, character, {
      width: size,
      height: size,
      padding: 5,
      strokeColor: '#d4a574',
      radicalColor: '#e63946',
      strokeAnimationSpeed: 0.6,
      delayBetweenStrokes: 100,
      showCharacter: false,
    });

    writerRef.current = writer;

    const timer = setTimeout(() => writer.animateCharacter(), 200);

    return () => {
      clearTimeout(timer);
      writerRef.current = null;
      el.innerHTML = '';
    };
  }, [character, size]);

  const handleReplay = useCallback(() => {
    writerRef.current?.animateCharacter();
  }, []);

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        ref={containerRef}
        className="hanzi-writer"
        style={{ width: size, height: size }}
      />
      <button
        type="button"
        onClick={handleReplay}
        className="text-xs text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Replay stroke animation"
        tabIndex={0}
      >
        Replay animation
      </button>
    </div>
  );
});
