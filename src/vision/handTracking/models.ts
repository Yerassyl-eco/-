import { FaceDetector, FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

const BASE = import.meta.env.BASE_URL;
const LOCAL_WASM = `${BASE}mediapipe/wasm`;
const CDN_WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm';

const HAND_MODEL = {
  local: `${BASE}models/hand_landmarker.task`,
  cdn: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
};
const FACE_MODEL = {
  local: `${BASE}models/blaze_face_short_range.tflite`,
  cdn: 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
};

export interface VisionModels {
  hands: HandLandmarker;
  face: FaceDetector | null;
  delegate: 'GPU' | 'CPU';
}

/** Loads models from the local copy (see scripts/setup-assets.mjs), falling back to the CDN. */
export async function loadVisionModels(): Promise<VisionModels> {
  try {
    return await loadFrom(LOCAL_WASM, HAND_MODEL.local, FACE_MODEL.local);
  } catch (e) {
    console.warn('[vision] local MediaPipe assets unavailable, using CDN', e);
    return loadFrom(CDN_WASM, HAND_MODEL.cdn, FACE_MODEL.cdn);
  }
}

async function loadFrom(wasmBase: string, handPath: string, facePath: string): Promise<VisionModels> {
  const fileset = await FilesetResolver.forVisionTasks(wasmBase);

  const createHands = (delegate: 'GPU' | 'CPU') =>
    HandLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: handPath, delegate },
      runningMode: 'VIDEO',
      numHands: 2,
      minHandDetectionConfidence: 0.55,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

  // `?delegate=cpu` forces CPU inference (useful on machines with a weak GPU).
  const forceCpu = new URLSearchParams(window.location.search).get('delegate') === 'cpu';
  let delegate: 'GPU' | 'CPU' = forceCpu ? 'CPU' : 'GPU';
  let hands: HandLandmarker;
  try {
    hands = await createHands(delegate);
  } catch {
    delegate = 'CPU';
    hands = await createHands('CPU');
  }

  let face: FaceDetector | null = null;
  try {
    face = await FaceDetector.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: facePath, delegate },
      runningMode: 'VIDEO',
      minDetectionConfidence: 0.5,
    });
  } catch {
    // Face checks are advisory; the app keeps working without them.
    face = null;
  }
  return { hands, face, delegate };
}
