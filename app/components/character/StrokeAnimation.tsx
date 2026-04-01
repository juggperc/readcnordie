'use client';

import { useEffect, useRef } from 'react';
import HanziWriter from 'hanzi-writer';

interface StrokeAnimationProps {
  character: string;
  size?: number;
}

export function StrokeAnimation({ character, size = 150 }: StrokeAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<HanziWriter | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const writer = HanziWriter.create(containerRef.current, character, {
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

    setTimeout(() => {
      writer.animateCharacter();
    }, 300);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [character, size]);

  const handleReplay = () => {
    if (writerRef.current) {
      writerRef.current.animateCharacter();
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        ref={containerRef}
        className="hanzi-writer"
        style={{ width: size, height: size }}
      />
      <button
        onClick={handleReplay}
        className="text-xs text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors"
      >
        Replay animation
      </button>
    </div>
  );
}
