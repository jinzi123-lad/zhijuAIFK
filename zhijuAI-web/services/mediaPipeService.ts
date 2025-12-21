
import { Hands, Results } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

// Helper to check if MediaPipe is available in global scope (via importmap)
// Note: In a real webpack/vite environment, you might import these directly.
// But with importmap, we rely on the window object or direct imports if types align.
// For this environment, we'll assume the Hands class is available globally or we use the dynamic import from window if needed.
// However, since we defined them in importmap, we can try to use them if the environment supports ESM resolving.

// We will use a singleton pattern to manage the Hands instance
class MediaPipeService {
  private hands: Hands | null = null;
  private camera: Camera | null = null;

  async initializeHands(videoElement: HTMLVideoElement, onResults: (results: Results) => void) {
    if (this.hands) {
        // Already initialized, just update callback if needed, or teardown and restart
        // For simplicity, we just create a new one or reuse.
    }

    // Initialize Hands
    this.hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      }
    });

    this.hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    this.hands.onResults(onResults);

    // Initialize Camera
    if (videoElement) {
      this.camera = new Camera(videoElement, {
        onFrame: async () => {
          if (this.hands) {
            await this.hands.send({ image: videoElement });
          }
        },
        width: 1280,
        height: 720
      });

      await this.camera.start();
    }
  }

  stop() {
    if (this.camera) {
      // Camera stop method might not be exposed directly in all versions, 
      // but usually stopping the stream on video element is enough.
      // @ts-ignore
      if(this.camera.stop) this.camera.stop(); 
      this.camera = null;
    }
    if (this.hands) {
      this.hands.close();
      this.hands = null;
    }
  }
}

export const mediaPipeService = new MediaPipeService();
