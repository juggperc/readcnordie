import { useCallback, useRef, useState, useEffect } from 'react';
import type { Worker, LoggerMessage } from 'tesseract.js';
import type { OCRResult } from '@/app/types';

export function useOCR() {
  const workerRef = useRef<Worker | null>(null);
  const recognizingRef = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initWorker = async () => {
      setIsLoading(true);
      setLoadingProgress(0);

      try {
        const { createWorker, PSM } = await import('tesseract.js');
        
        const logger = (m: LoggerMessage) => {
          if (typeof m.progress === 'number') {
            setLoadingProgress(Math.round(m.progress * 100));
          }
        };

        const worker = await createWorker('chi_sim', 1, { logger });

        await worker.setParameters({
          tessedit_pageseg_mode: PSM.SINGLE_CHAR,
        });

        if (mounted) {
          workerRef.current = worker;
          setIsReady(true);
          setIsLoading(false);
        } else {
          await worker.terminate();
        }
      } catch {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initWorker();

    return () => {
      mounted = false;
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  const recognize = useCallback(async (imageData: ImageData): Promise<OCRResult | null> => {
    if (recognizingRef.current) {
      return null;
    }

    const worker = workerRef.current;
    if (!worker) {
      return null;
    }

    recognizingRef.current = true;

    try {
      const processedData = preprocessImage(imageData);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      canvas.width = processedData.width;
      canvas.height = processedData.height;
      ctx.putImageData(processedData, 0, 0);

      const { data } = await worker.recognize(canvas);
      const text = data.text.trim();

      if (text.length === 0) {
        return null;
      }

      return {
        text: text.charAt(0),
        confidence: data.confidence,
      };
    } catch {
      return null;
    } finally {
      recognizingRef.current = false;
    }
  }, []);

  return {
    recognize,
    isLoading,
    loadingProgress,
    isReady,
  };
}

function preprocessImage(imageData: ImageData): ImageData {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return imageData;

  const scale = 2;
  const width = imageData.width * scale;
  const height = imageData.height * scale;

  canvas.width = width;
  canvas.height = height;

  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return imageData;

  tempCanvas.width = imageData.width;
  tempCanvas.height = imageData.height;
  tempCtx.putImageData(imageData, 0, 0);

  ctx.scale(scale, scale);
  ctx.drawImage(tempCanvas, 0, 0);

  const scaledImageData = ctx.getImageData(0, 0, width, height);
  const data = scaledImageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const contrast = 1.8;
    const adjusted = ((gray - 128) * contrast) + 128;
    const threshold = adjusted > 140 ? 255 : 0;

    data[i] = threshold;
    data[i + 1] = threshold;
    data[i + 2] = threshold;
  }

  return scaledImageData;
}