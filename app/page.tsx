'use client';

import { useCallback, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { CameraViewfinder } from '@/app/components/camera/CameraViewfinder';
import { ControlBar } from '@/app/components/camera/ControlBar';
import { CharacterCard } from '@/app/components/character/CharacterCard';
import { SentenceBuilder } from '@/app/components/sentence/SentenceBuilder';
import { useCamera } from '@/app/hooks/useCamera';
import { useOCR } from '@/app/hooks/useOCR';
import { useApp } from '@/app/components/providers/AppProvider';
import { findCharacter } from '@/lib/character-data';

export default function Home() {
  const { videoRef, cameraState, error, captureFrame, zoom, setZoom, maxZoom } = useCamera();
  const { recognize, isReady, isLoading: isOcrLoading } = useOCR();
  const { setIsProcessing, activeCard, setActiveCard, setLastScanned } = useApp();
  const [isCapturing, setIsCapturing] = useState(false);
  const busyRef = useRef(false);
  const pendingRetryRef = useRef(false);

  const doCapture = useCallback(async () => {
    if (busyRef.current || !isReady) return;

    busyRef.current = true;
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

      const withConfidence = { ...charData, confidence: result.confidence };
      setLastScanned(withConfidence);
      setActiveCard(withConfidence);
    } catch (err) {
      console.error('Capture error:', err);
    } finally {
      busyRef.current = false;
      setIsCapturing(false);
      setIsProcessing(false);
    }
  }, [captureFrame, isReady, recognize, setActiveCard, setIsProcessing, setLastScanned]);

  const handleCapture = useCallback(() => {
    doCapture();
  }, [doCapture]);

  const handleCloseCard = useCallback(() => {
    setActiveCard(null);
  }, [setActiveCard]);

  const handleRetry = useCallback(() => {
    setActiveCard(null);
    pendingRetryRef.current = true;
    requestAnimationFrame(() => {
      if (pendingRetryRef.current) {
        pendingRetryRef.current = false;
        doCapture();
      }
    });
  }, [setActiveCard, doCapture]);

  return (
    <main className="relative h-full w-full">
      <SentenceBuilder />

      <div className="absolute inset-0 pt-16">
        <CameraViewfinder
          videoRef={videoRef}
          cameraState={cameraState}
          error={error}
          isOcrReady={isReady}
        />
      </div>

      <AnimatePresence>
        {activeCard && (
          <CharacterCard
            character={activeCard}
            onClose={handleCloseCard}
            onRetry={handleRetry}
          />
        )}
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[70]">
        <div className="pointer-events-auto">
          <ControlBar
            onCapture={handleCapture}
            isProcessing={isCapturing || isOcrLoading}
            disabled={cameraState !== 'active' || !isReady}
            zoom={zoom}
            maxZoom={maxZoom}
            onZoomChange={setZoom}
          />
        </div>
      </div>
    </main>
  );
}
