import { useCallback, useRef, useState, useEffect } from 'react';
import type { Worker, LoggerMessage } from 'tesseract.js';
import type { OCRResult } from '@/app/types';

const canvasPool = {
  main: null as HTMLCanvasElement | null,
  temp: null as HTMLCanvasElement | null,
};

function getMainCanvas(): HTMLCanvasElement {
  if (!canvasPool.main) {
    canvasPool.main = document.createElement('canvas');
  }
  return canvasPool.main;
}

function getTempCanvas(): HTMLCanvasElement {
  if (!canvasPool.temp) {
    canvasPool.temp = document.createElement('canvas');
  }
  return canvasPool.temp;
}

type PreprocessVariant = 'default' | 'high_contrast' | 'binarized';

interface PreprocessConfig {
  scale: number;
  contrast: number;
  threshold: number;
}

const PREPROCESS_CONFIGS: Record<PreprocessVariant, PreprocessConfig> = {
  default: { scale: 2, contrast: 1.8, threshold: 140 },
  high_contrast: { scale: 2, contrast: 2.5, threshold: 120 },
  binarized: { scale: 2, contrast: 3, threshold: 128 },
};

const CONFIDENCE = {
  EXCELLENT: 0.85,
  GOOD: 0.65,
  RETRY: 0.45,
  REJECT: 0.25,
};

interface RecognizeResult {
  status: 'success' | 'low_confidence' | 'busy' | 'error';
  result?: OCRResult;
  message?: string;
}

function preprocessImage(imageData: ImageData, variant: PreprocessVariant = 'default'): ImageData {
  const config = PREPROCESS_CONFIGS[variant];
  const canvas = getMainCanvas();
  const ctx = canvas.getContext('2d');
  if (!ctx) return imageData;

  const width = imageData.width * config.scale;
  const height = imageData.height * config.scale;

  canvas.width = width;
  canvas.height = height;

  const tempCanvas = getTempCanvas();
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return imageData;

  tempCanvas.width = imageData.width;
  tempCanvas.height = imageData.height;
  tempCtx.putImageData(imageData, 0, 0);

  ctx.scale(config.scale, config.scale);
  ctx.drawImage(tempCanvas, 0, 0);

  const scaledImageData = ctx.getImageData(0, 0, width, height);
  const data = scaledImageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const adjusted = ((gray - 128) * config.contrast) + 128;
    const threshold = adjusted > config.threshold ? 255 : 0;

    data[i] = threshold;
    data[i + 1] = threshold;
    data[i + 2] = threshold;
  }

  return scaledImageData;
}

export function useOCR() {
  const workerRef = useRef<Worker | null>(null);
  const recognizingRef = useRef(false);
  const workerRecycleCount = useRef(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const MAX_RECOGNITIONS_BEFORE_RECYCLE = 50;

  const createNewWorker = useCallback(async (): Promise<Worker> => {
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

    return worker;
  }, []);

  // Get or create worker (handles recovery from crashes)
  const getWorker = useCallback(async (): Promise<Worker | null> => {
    if (!workerRef.current) {
      try {
        workerRef.current = await createNewWorker();
      } catch {
        return null;
      }
    }
    return workerRef.current;
  }, [createNewWorker]);

  const recycleWorker = useCallback(async () => {
    if (workerRef.current) {
      try {
        await workerRef.current.terminate();
      } catch {
        // Worker might already be dead, ignore error
      }
      workerRef.current = null;
    }
    workerRef.current = await createNewWorker();
  }, [createNewWorker]);

  const recoverWorker = useCallback(async () => {
    workerRef.current = null;
    return getWorker();
  }, [getWorker]);

  useEffect(() => {
    let mounted = true;

    const initWorker = async () => {
      setIsLoading(true);
      setLoadingProgress(0);

      try {
        const worker = await createNewWorker();

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
  }, [createNewWorker]);

  // Recognize with a specific preprocessing variant
  const recognizeWithVariant = useCallback(async (
    imageData: ImageData,
    variant: PreprocessVariant
  ): Promise<{ text: string; confidence: number } | null> => {
    const worker = await getWorker();
    if (!worker) return null;

    const processed = preprocessImage(imageData, variant);
    const canvas = getMainCanvas();
    canvas.width = processed.width;
    canvas.height = processed.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.putImageData(processed, 0, 0);

    try {
      const { data } = await worker.recognize(canvas);
      const text = data.text.trim();
      const confidence = data.confidence / 100;

      if (text.length === 0) return null;

      return {
        text: text.charAt(0),
        confidence,
      };
    } catch {
      return null;
    }
  }, [getWorker]);

  const majorityVote = useCallback(async (
    imageData: ImageData
  ): Promise<{ text: string; confidence: number; method: string } | null> => {
    const variants: PreprocessVariant[] = ['default', 'high_contrast', 'binarized'];
    const results: Array<{ text: string; confidence: number; variant: PreprocessVariant }> = [];

    for (const variant of variants) {
      const result = await recognizeWithVariant(imageData, variant);
      if (result) {
        results.push({ ...result, variant });
      }
    }

    if (results.length === 0) return null;

    const voteCounts = new Map<string, number>();
    for (const result of results) {
      voteCounts.set(result.text, (voteCounts.get(result.text) || 0) + 1);
    }

    let bestText = '';
    let bestVotes = 0;
    for (const [text, votes] of voteCounts.entries()) {
      if (votes > bestVotes) {
        bestVotes = votes;
        bestText = text;
      }
    }

    const bestResult = results
      .filter(r => r.text === bestText)
      .sort((a, b) => b.confidence - a.confidence)[0];

    return {
      text: bestText,
      confidence: bestResult.confidence,
      method: 'majority_vote',
    };
  }, [recognizeWithVariant]);

  const recognizeWithRetry = useCallback(async (
    imageData: ImageData,
    maxAttempts: number = 3
  ): Promise<RecognizeResult> => {
    const defaultResult = await recognizeWithVariant(imageData, 'default');
    
    if (!defaultResult) {
      return { status: 'error', message: 'No text detected' };
    }

    const { text, confidence } = defaultResult;

    if (confidence >= CONFIDENCE.EXCELLENT) {
      return {
        status: 'success',
        result: { text, confidence },
      };
    }

    if (confidence >= CONFIDENCE.GOOD) {
      return {
        status: 'success',
        result: { text, confidence },
      };
    }

    if (confidence >= CONFIDENCE.RETRY && maxAttempts >= 2) {
      const highContrastResult = await recognizeWithVariant(imageData, 'high_contrast');
      
      if (highContrastResult && highContrastResult.confidence > confidence) {
        if (highContrastResult.confidence >= CONFIDENCE.EXCELLENT) {
          return {
            status: 'success',
            result: { 
              text: highContrastResult.text, 
              confidence: highContrastResult.confidence 
            },
          };
        }
      }

      if (maxAttempts >= 3) {
        const binarizedResult = await recognizeWithVariant(imageData, 'binarized');
        
        if (binarizedResult && binarizedResult.confidence > confidence) {
          if (binarizedResult.confidence >= CONFIDENCE.EXCELLENT) {
            return {
              status: 'success',
              result: { 
                text: binarizedResult.text, 
                confidence: binarizedResult.confidence 
              },
            };
          }
        }

        const allResults = [
          { text, confidence, variant: 'default' as const },
          ...(highContrastResult ? [{ ...highContrastResult, variant: 'high_contrast' as const }] : []),
          ...(binarizedResult ? [{ ...binarizedResult, variant: 'binarized' as const }] : []),
        ];
        const best = allResults.sort((a, b) => b.confidence - a.confidence)[0];
        
        return {
          status: best.confidence >= CONFIDENCE.GOOD ? 'success' : 'low_confidence',
          result: { text: best.text, confidence: best.confidence },
          message: best.confidence < CONFIDENCE.GOOD ? 'Low confidence result' : undefined,
        };
      }

      if (highContrastResult && highContrastResult.confidence > confidence) {
        return {
          status: highContrastResult.confidence >= CONFIDENCE.GOOD ? 'success' : 'low_confidence',
          result: { text: highContrastResult.text, confidence: highContrastResult.confidence },
        };
      }
    }

    if (confidence < CONFIDENCE.RETRY) {
      const voteResult = await majorityVote(imageData);
      if (voteResult) {
        return {
          status: voteResult.confidence >= CONFIDENCE.GOOD ? 'success' : 'low_confidence',
          result: { text: voteResult.text, confidence: voteResult.confidence },
          message: voteResult.method,
        };
      }
    }

    return {
      status: confidence >= CONFIDENCE.GOOD ? 'success' : 'low_confidence',
      result: { text, confidence },
      message: confidence < CONFIDENCE.GOOD ? 'Low confidence result' : undefined,
    };
  }, [recognizeWithVariant, majorityVote]);

  const recognize = useCallback(async (imageData: ImageData): Promise<OCRResult | null> => {
    if (recognizingRef.current) {
      return null;
    }

    const worker = await getWorker();
    if (!worker) {
      return null;
    }

    recognizingRef.current = true;

    try {
      const result = await recognizeWithRetry(imageData);

      workerRecycleCount.current++;
      if (workerRecycleCount.current >= MAX_RECOGNITIONS_BEFORE_RECYCLE) {
        await recycleWorker();
        workerRecycleCount.current = 0;
      }

      return result.result || null;
    } catch (error) {
      await recoverWorker();
      workerRecycleCount.current = 0;
      return null;
    } finally {
      recognizingRef.current = false;
    }
  }, [getWorker, recognizeWithRetry, recycleWorker, recoverWorker]);

  return {
    recognize,
    isLoading,
    loadingProgress,
    isReady,
  };
}
