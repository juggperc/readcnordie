import { useCallback, useRef, useState, useEffect } from 'react';
import type { OCRResult } from '@/app/types';

const RECOGNIZE_TIMEOUT_MS = 10_000;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out`)), ms);
    promise.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); },
    );
  });
}

function getOrCreateCanvas(ref: { current: HTMLCanvasElement | null }): HTMLCanvasElement {
  if (!ref.current) ref.current = document.createElement('canvas');
  return ref.current;
}

function preprocessImage(
  imageData: ImageData,
  mainCanvas: HTMLCanvasElement,
  tempCanvas: HTMLCanvasElement,
): HTMLCanvasElement {
  const SCALE = 2;
  const CONTRAST = 1.8;
  const THRESHOLD = 140;

  const w = imageData.width * SCALE;
  const h = imageData.height * SCALE;

  tempCanvas.width = imageData.width;
  tempCanvas.height = imageData.height;
  const tempCtx = tempCanvas.getContext('2d')!;
  tempCtx.putImageData(imageData, 0, 0);

  mainCanvas.width = w;
  mainCanvas.height = h;
  const ctx = mainCanvas.getContext('2d')!;
  ctx.save();
  ctx.scale(SCALE, SCALE);
  ctx.drawImage(tempCanvas, 0, 0);
  ctx.restore();

  const scaled = ctx.getImageData(0, 0, w, h);
  const d = scaled.data;
  for (let i = 0; i < d.length; i += 4) {
    const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    const val = ((gray - 128) * CONTRAST + 128) > THRESHOLD ? 255 : 0;
    d[i] = val;
    d[i + 1] = val;
    d[i + 2] = val;
  }
  ctx.putImageData(scaled, 0, 0);
  return mainCanvas;
}

type TesseractWorker = Awaited<ReturnType<typeof import('tesseract.js')['createWorker']>>;

interface WarmWorker {
  worker: TesseractWorker;
  used: boolean;
}

export function useOCR() {
  const warmRef = useRef<WarmWorker | null>(null);
  const warmingRef = useRef<Promise<WarmWorker | null> | null>(null);
  const busyRef = useRef(false);
  const mountedRef = useRef(true);
  const mainCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const warmUpWorker = useCallback(async (): Promise<WarmWorker | null> => {
    if (warmRef.current && !warmRef.current.used) return warmRef.current;
    if (warmingRef.current) return warmingRef.current;

    const promise = (async (): Promise<WarmWorker | null> => {
      try {
        const { createWorker, PSM } = await import('tesseract.js');

        const worker = await createWorker('chi_sim', 1, {
          logger: (m) => {
            if (typeof m.progress === 'number' && mountedRef.current) {
              setLoadingProgress(Math.round(m.progress * 100));
            }
          },
        });

        await worker.setParameters({
          tessedit_pageseg_mode: PSM.SINGLE_CHAR,
        });

        if (!mountedRef.current) {
          await worker.terminate();
          return null;
        }

        const warm: WarmWorker = { worker, used: false };
        warmRef.current = warm;

        if (mountedRef.current) {
          setIsReady(true);
          setIsLoading(false);
        }

        return warm;
      } catch (err) {
        console.error('Worker warm-up failed:', err);
        if (mountedRef.current) setIsLoading(false);
        return null;
      } finally {
        warmingRef.current = null;
      }
    })();

    warmingRef.current = promise;
    return promise;
  }, []);

  const terminateWorker = useCallback(async (w: TesseractWorker) => {
    try { await w.terminate(); } catch { /* already dead */ }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    setIsLoading(true);
    setLoadingProgress(0);
    warmUpWorker();

    return () => {
      mountedRef.current = false;
      warmingRef.current = null;
      if (warmRef.current) {
        terminateWorker(warmRef.current.worker);
        warmRef.current = null;
      }
    };
  }, [warmUpWorker, terminateWorker]);

  const recognize = useCallback(async (imageData: ImageData): Promise<OCRResult | null> => {
    if (busyRef.current) return null;
    busyRef.current = true;

    try {
      const warm = await warmUpWorker();
      if (!warm) return null;

      warm.used = true;
      warmRef.current = null;

      const mainCanvas = getOrCreateCanvas(mainCanvasRef);
      const tempCanvas = getOrCreateCanvas(tempCanvasRef);
      const canvas = preprocessImage(imageData, mainCanvas, tempCanvas);

      try {
        const { data } = await withTimeout(
          warm.worker.recognize(canvas, {}, { text: true }),
          RECOGNIZE_TIMEOUT_MS,
          'OCR',
        );

        const text = data.text.trim();
        if (!text.length) return null;

        return { text: text.charAt(0), confidence: data.confidence / 100 };
      } finally {
        terminateWorker(warm.worker);

        if (mountedRef.current) {
          warmUpWorker();
        }
      }
    } catch (err) {
      console.error('OCR error:', err);
      return null;
    } finally {
      busyRef.current = false;
    }
  }, [warmUpWorker, terminateWorker]);

  return { recognize, isLoading, loadingProgress, isReady };
}
