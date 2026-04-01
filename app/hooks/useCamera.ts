import { useEffect, useRef, useState, useCallback } from 'react';
import type { CameraState } from '@/app/types';

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mountedRef = useRef(true);
  const [cameraState, setCameraState] = useState<CameraState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [maxZoom, setMaxZoom] = useState(5);

  const cameraStateRef = useRef<CameraState>('loading');
  cameraStateRef.current = cameraState;

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const applyZoom = useCallback((zoomLevel: number) => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    try {
      const caps = track.getCapabilities() as MediaTrackCapabilities & { zoom?: { min: number; max: number } };
      if (caps.zoom) {
        track.applyConstraints({ zoom: zoomLevel } as MediaTrackConstraintSet);
        setZoom(zoomLevel);
      }
    } catch { /* zoom not supported */ }
  }, []);

  const startCamera = useCallback(async () => {
    if (!mountedRef.current) return;
    setCameraState('loading');
    setError(null);

    stopCamera();

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera API not supported in this browser');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30, max: 30 },
        },
        audio: false,
      });

      if (!mountedRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      streamRef.current = stream;

      const track = stream.getVideoTracks()[0];
      if (track) {
        const caps = track.getCapabilities() as MediaTrackCapabilities & { zoom?: { min: number; max: number } };
        if (caps.zoom) {
          setMaxZoom(caps.zoom.max);
          const stored = Number(localStorage.getItem('cameraZoom') || '1');
          applyZoom(Math.min(Math.max(stored, 1), caps.zoom.max));
        }
      }

      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;

        await new Promise<void>((resolve) => {
          if (video.readyState >= 1) {
            resolve();
            return;
          }
          const handler = () => {
            video.removeEventListener('loadedmetadata', handler);
            resolve();
          };
          video.addEventListener('loadedmetadata', handler);
        });

        try {
          await video.play();
        } catch { /* autoplay may be blocked */ }

        if (mountedRef.current) {
          setCameraState('active');
        }
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to access camera');
        setCameraState('error');
      }
    }
  }, [applyZoom, stopCamera]);

  const captureFrame = useCallback((): ImageData | null => {
    const video = videoRef.current;
    if (!video || cameraStateRef.current !== 'active') return null;

    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;

    const size = Math.min(video.videoWidth, video.videoHeight, 600);
    const x = (video.videoWidth - size) / 2;
    const y = (video.videoHeight - size) / 2;

    canvas.width = size;
    canvas.height = size;
    ctx.drawImage(video, x, y, size, size, 0, 0, size, size);

    return ctx.getImageData(0, 0, size, size);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    startCamera();

    return () => {
      mountedRef.current = false;
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  return {
    videoRef,
    cameraState,
    error,
    startCamera,
    stopCamera,
    captureFrame,
    zoom,
    setZoom: applyZoom,
    maxZoom,
  };
}
