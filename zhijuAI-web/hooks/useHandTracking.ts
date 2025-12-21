
import { useEffect, useState, useRef } from 'react';
import { mediaPipeService } from '../services/mediaPipeService';
import { HandResults } from '../types';

export const useHandTracking = (enabled: boolean = false) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [results, setResults] = useState<HandResults | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    let active = true;

    const startTracking = async () => {
      if (enabled && videoRef.current) {
        setIsInitializing(true);
        try {
          await mediaPipeService.initializeHands(videoRef.current, (res: any) => {
            if (active) {
              setResults(res);
            }
          });
        } catch (error) {
          console.error("Failed to initialize MediaPipe Hands:", error);
        } finally {
          setIsInitializing(false);
        }
      }
    };

    if (enabled) {
      startTracking();
    } else {
      mediaPipeService.stop();
      setResults(null);
    }

    return () => {
      active = false;
      mediaPipeService.stop();
    };
  }, [enabled]);

  return { videoRef, results, isInitializing };
};
