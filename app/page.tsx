'use client';

import { useCallback, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { CameraViewfinder } from '@/app/components/camera/CameraViewfinder';
import { CharacterCard } from '@/app/components/character/CharacterCard';
import { SentenceBuilder } from '@/app/components/sentence/SentenceBuilder';
import { useCamera } from '@/app/hooks/useCamera';
import { useOCR } from '@/app/hooks/useOCR';
import { useApp } from '@/app/components/providers/AppProvider';
import { findCharacter } from '@/lib/character-data';
import type { CharacterData } from '@/app/types';

export default function Home() {
  const { videoRef, cameraState, error, captureFrame, zoom, setZoom, maxZoom } = useCamera();
  const { recognize, isReady } = useOCR();
  const { setIsProcessing, activeCard, setActiveCard, setLastScanned } = useApp();
  const [isCapturing, setIsCapturing] = useState(false);

  const handleCapture = useCallback(async () => {
    if (isCapturing || !isReady) return;

    setIsCapturing(true);
    setIsProcessing(true);

    try {
      const frameData = captureFrame();
      if (!frameData) return;

      const result = await recognize(frameData);
      if (!result?.text) return;

      const char = result.text.charAt(0);
      const charData = await findCharacter(char);
      if (!charData) return;

      setLastScanned(charData);
      setActiveCard(charData);
    } finally {
      setIsCapturing(false);
      setIsProcessing(false);
    }
  }, [captureFrame, isCapturing, isReady, recognize, setActiveCard, setIsProcessing, setLastScanned]);

  const handleCloseCard = useCallback(() => {
    setActiveCard(null);
  }, [setActiveCard]);

  return (
    <main className="relative h-full w-full">
      <SentenceBuilder />

      <div className="absolute inset-0 pt-16">
        <CameraViewfinder
          videoRef={videoRef}
          cameraState={cameraState}
          error={error}
          onCapture={handleCapture}
          isProcessing={isCapturing}
          zoom={zoom}
          maxZoom={maxZoom}
          onZoomChange={setZoom}
        />
      </div>

      <AnimatePresence>
        {activeCard && (
          <CharacterCard
            character={activeCard}
            onClose={handleCloseCard}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
