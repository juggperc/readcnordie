import { useEffect, useRef, useState, useCallback } from 'react';
import type { CameraState } from '@/app/types';

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cameraState, setCameraState] = useState<CameraState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [maxZoom, setMaxZoom] = useState(5);

  // Use ref to avoid stale closure in captureFrame
  const cameraStateRef = useRef<CameraState>('loading');
  cameraStateRef.current = cameraState;

  const applyZoom = useCallback((zoomLevel: number) => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (track) {
      try {
        const capabilities = track.getCapabilities() as MediaTrackCapabilities & { zoom?: { min: number; max: number } };
        if (capabilities.zoom) {
          track.applyConstraints({
            zoom: zoomLevel
          } as MediaTrackConstraintSet);
          setZoom(zoomLevel);
        }
      } catch {
        // Zoom failed silently - don't update state
      }
    }
  }, []);

  const startCamera = useCallback(async () => {
    setCameraState('loading');
    setError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported in this browser');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 15 },
        },
        audio: false,
      });
      streamRef.current = stream;

      // Get max zoom after stream starts
      const track = stream.getVideoTracks()[0];
      if (track) {
        const capabilities = track.getCapabilities() as MediaTrackCapabilities & { zoom?: { min: number; max: number } };
        if (capabilities.zoom) {
          const stored = Number(localStorage.getItem('cameraZoom') || '1');
          const initialZoom = Math.min(Math.max(stored, 1), capabilities.zoom.max);
          applyZoom(initialZoom);
        }
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setCameraState('active');
        };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access camera';
      setError(errorMessage);
      setCameraState('error');
    }
  }, [applyZoom]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraState('disabled');
  }, []);

  const captureFrame = useCallback((): ImageData | null => {
    if (!videoRef.current || cameraStateRef.current !== 'active') {
      return null;
    }

    const video = videoRef.current;

    // Reuse canvas to avoid memory leaks
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d', { willReadFrequently: true });

    if (!context) {
      return null;
    }

    const size = Math.min(video.videoWidth, video.videoHeight, 600);
    const x = (video.videoWidth - size) / 2;
    const y = (video.videoHeight - size) / 2;

    canvas.width = size;
    canvas.height = size;
    context.drawImage(video, x, y, size, size, 0, 0, size, size);

    return context.getImageData(0, 0, size, size);
  }, []);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setCameraState('loading');
      setError(null);

      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera API not supported in this browser');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 15 },
          },
          audio: false,
        });

        if (!mounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = stream;

        const track = stream.getVideoTracks()[0];
        if (track) {
          const capabilities = track.getCapabilities() as MediaTrackCapabilities & { zoom?: { min: number; max: number } };
          if (capabilities.zoom) {
            setMaxZoom(capabilities.zoom.max);
            const stored = Number(localStorage.getItem('cameraZoom') || '1');
            const deviceMax = capabilities.zoom.max;
            const initialZoom = Math.min(Math.max(stored, 1), deviceMax);
            applyZoom(initialZoom);
          }
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            if (mounted) setCameraState('active');
          };
        }
      } catch (err) {
        if (mounted) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to access camera';
          setError(errorMessage);
          setCameraState('error');
        }
      }
    };

    init();

    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setCameraState('disabled');
    };
  }, [applyZoom]);

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