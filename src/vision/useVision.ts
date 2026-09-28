import { useSyncExternalStore } from 'react';
import { visionRuntime } from './VisionRuntime';

/** Throttled vision state for React (never re-renders per video frame). */
export function useVision() {
  return useSyncExternalStore(visionRuntime.subscribe, visionRuntime.getState);
}
