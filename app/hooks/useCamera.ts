import { useEffect, useRef, useState, useCallback } from 'react';
import type { CameraState } from '@/app/types';

const SAFARI_CAMERA_CONFIG: MediaStreamConstraints = {
  video: {
    facingMode: { ideal: 'environment' },
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 15 },
  },
  audio: false,
};

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraState, setCameraState] = useState<CameraState>('loading');
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    setCameraState('loading');
    setError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported in this browser');
      }

      const stream = await navigator.mediaDevices.getUserMedia(SAFARI_CAMERA_CONFIG);
      streamRef.current = stream;

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
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraState('disabled');
  }, []);

  const captureFrame = useCallback((): ImageData | null => {
    if (!videoRef.current || cameraState !== 'active') {
      return null;
    }

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

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
  }, [cameraState]);

  useEffect(() => {
    startCamera();

    return () => {
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
  };
}
