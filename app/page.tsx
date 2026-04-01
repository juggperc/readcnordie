'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { CameraViewfinder } from '@/app/components/camera/CameraViewfinder';
import { CharacterCard } from '@/app/components/character/CharacterCard';
import { SentenceBuilder } from '@/app/components/sentence/SentenceBuilder';
import { useCamera } from '@/app/hooks/useCamera';
import { useOCR } from '@/app/hooks/useOCR';
import { useApp } from '@/app/components/providers/AppProvider';
import { findCharacter } from '@/lib/character-data';
export default function Home() {
  const { videoRef, cameraState, error, captureFrame, zoom, setZoom, maxZoom } = useCamera();
  const { recognize, isReady } = useOCR();
  const { setIsProcessing, activeCard, setActiveCard, setLastScanned } = useApp();
  const [isCapturing, setIsCapturing] = useState(false);
  const isCapturingRef = useRef(false);
  const handleCaptureRef = useRef<() => Promise<void>>(async () => {});

  const handleCapture = useCallback(async () => {
    if (isCapturingRef.current || !isReady) return;

    isCapturingRef.current = true;
    setIsCapturing(true);
    setIsProcessing(true);

    try {
      const frameData = captureFrame();
      if (!frameData) {
        isCapturingRef.current = false;
        setIsCapturing(false);
        setIsProcessing(false);
        return;
      }

      const result = await recognize(frameData);
      if (!result?.text) {
        isCapturingRef.current = false;
        setIsCapturing(false);
        setIsProcessing(false);
        return;
      }

      const char = result.text.charAt(0);
      const charData = await findCharacter(char);
      if (!charData) {
        isCapturingRef.current = false;
        setIsCapturing(false);
        setIsProcessing(false);
        return;
      }

      const charDataWithConfidence = { ...charData, confidence: result.confidence };
      setLastScanned(charDataWithConfidence);
      setActiveCard(charDataWithConfidence);
    } catch (error) {
      console.error('Capture error:', error);
    } finally {
      isCapturingRef.current = false;
      setIsCapturing(false);
      setIsProcessing(false);
    }
  }, [captureFrame, isReady, recognize, setActiveCard, setIsProcessing, setLastScanned]);

  useEffect(() => {
    handleCaptureRef.current = handleCapture;
  }, [handleCapture]);

  const handleCloseCard = useCallback(() => {
    setActiveCard(null);
  }, [setActiveCard]);

  const handleRetry = useCallback(() => {
    setActiveCard(null);
    setTimeout(() => {
      handleCaptureRef.current();
    }, 100);
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
            onRetry={handleRetry}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
