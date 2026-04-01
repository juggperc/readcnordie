import { useCallback, useRef, useState, useEffect } from 'react';
import type { Worker, LoggerMessage } from 'tesseract.js';
import type { OCRResult } from '@/app/types';

const RECOGNIZE_TIMEOUT_MS = 8_000;
const WORKER_INIT_TIMEOUT_MS = 30_000;

function getOrCreateCanvas(ref: { current: HTMLCanvasElement | null }): HTMLCanvasElement {
  if (!ref.current) {
    ref.current = document.createElement('canvas');
  }
  return ref.current;
}

function preprocessImage(
  imageData: ImageData,
  mainCanvas: HTMLCanvasElement,
  tempCanvas: HTMLCanvasElement,
): ImageData {
  const SCALE = 2;
  const CONTRAST = 1.8;
  const THRESHOLD = 140;

  const width = imageData.width * SCALE;
  const height = imageData.height * SCALE;

  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return imageData;
  tempCanvas.width = imageData.width;
  tempCanvas.height = imageData.height;
  tempCtx.putImageData(imageData, 0, 0);

  const ctx = mainCanvas.getContext('2d');
  if (!ctx) return imageData;
  mainCanvas.width = width;
  mainCanvas.height = height;
  ctx.save();
  ctx.scale(SCALE, SCALE);
  ctx.drawImage(tempCanvas, 0, 0);
  ctx.restore();

  const scaledData = ctx.getImageData(0, 0, width, height);
  const d = scaledData.data;

  for (let i = 0; i < d.length; i += 4) {
    const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    const adjusted = ((gray - 128) * CONTRAST) + 128;
    const val = adjusted > THRESHOLD ? 255 : 0;
    d[i] = val;
    d[i + 1] = val;
    d[i + 2] = val;
  }

  return scaledData;
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); },
    );
  });
}

export function useOCR() {
  const workerRef = useRef<Worker | null>(null);
  const busyRef = useRef(false);
  const mountedRef = useRef(true);
  const initPromiseRef = useRef<Promise<Worker | null> | null>(null);
  const mainCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const destroyWorker = useCallback(async () => {
    const w = workerRef.current;
    workerRef.current = null;
    initPromiseRef.current = null;
    if (w) {
      try { await w.terminate(); } catch { /* already dead */ }
    }
  }, []);

  const createWorker = useCallback(async (): Promise<Worker | null> => {
    const { createWorker: create, PSM } = await import('tesseract.js');

    const logger = (m: LoggerMessage) => {
      if (typeof m.progress === 'number' && mountedRef.current) {
        setLoadingProgress(Math.round(m.progress * 100));
      }
    };

    const worker = await withTimeout(
      create('chi_sim', 1, { logger }),
      WORKER_INIT_TIMEOUT_MS,
      'Worker init',
    );

    await worker.setParameters({
      tessedit_pageseg_mode: PSM.SINGLE_CHAR,
    });

    return worker;
  }, []);

  const ensureWorker = useCallback(async (): Promise<Worker | null> => {
    if (workerRef.current) return workerRef.current;

    if (initPromiseRef.current) return initPromiseRef.current;

    const promise = (async () => {
      try {
        const w = await createWorker();
        if (!mountedRef.current) {
          await w?.terminate();
          return null;
        }
        workerRef.current = w;
        if (mountedRef.current) {
          setIsReady(true);
          setIsLoading(false);
        }
        return w;
      } catch (err) {
        console.error('Worker creation failed:', err);
        if (mountedRef.current) {
          setIsLoading(false);
        }
        initPromiseRef.current = null;
        return null;
      }
    })();

    initPromiseRef.current = promise;
    return promise;
  }, [createWorker]);

  useEffect(() => {
    mountedRef.current = true;
    setIsLoading(true);
    setLoadingProgress(0);

    ensureWorker();

    return () => {
      mountedRef.current = false;
      destroyWorker();
    };
  }, [ensureWorker, destroyWorker]);

  const recognize = useCallback(async (imageData: ImageData): Promise<OCRResult | null> => {
    if (busyRef.current) return null;

    busyRef.current = true;

    try {
      let worker = await ensureWorker();
      if (!worker) return null;

      const mainCanvas = getOrCreateCanvas(mainCanvasRef);
      const tempCanvas = getOrCreateCanvas(tempCanvasRef);
      const processed = preprocessImage(imageData, mainCanvas, tempCanvas);

      mainCanvas.width = processed.width;
      mainCanvas.height = processed.height;
      const ctx = mainCanvas.getContext('2d');
      if (!ctx) return null;
      ctx.putImageData(processed, 0, 0);

      let data;
      try {
        const result = await withTimeout(
          worker.recognize(mainCanvas),
          RECOGNIZE_TIMEOUT_MS,
          'OCR recognize',
        );
        data = result.data;
      } catch (err) {
        console.warn('OCR attempt failed, recycling worker:', err);
        await destroyWorker();
        worker = await ensureWorker();
        if (!worker) return null;

        try {
          const retryResult = await withTimeout(
            worker.recognize(mainCanvas),
            RECOGNIZE_TIMEOUT_MS,
            'OCR recognize retry',
          );
          data = retryResult.data;
        } catch (retryErr) {
          console.error('OCR retry also failed:', retryErr);
          await destroyWorker();
          return null;
        }
      }

      const text = data.text.trim();
      if (text.length === 0) return null;

      return {
        text: text.charAt(0),
        confidence: data.confidence / 100,
      };
    } catch (err) {
      console.error('OCR recognize error:', err);
      await destroyWorker();
      return null;
    } finally {
      busyRef.current = false;
    }
  }, [ensureWorker, destroyWorker]);

  return {
    recognize,
    isLoading,
    loadingProgress,
    isReady,
  };
}
