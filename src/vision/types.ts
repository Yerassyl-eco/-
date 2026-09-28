/** Gestures the engine can recognise. */
export type Gesture =
  | 'THUMBS_UP'
  | 'FIST'
  | 'POINT_LEFT'
  | 'POINT_RIGHT'
  | 'POINT_UP'
  | 'POINT_DOWN'
  | 'OPEN_PALM';

/** Gesture plus the two "no gesture" states. */
export type GestureOrNone = Gesture | 'UNKNOWN' | 'NONE';

export const ALL_GESTURES: Gesture[] = [
  'THUMBS_UP',
  'FIST',
  'POINT_LEFT',
  'POINT_RIGHT',
  'POINT_UP',
  'POINT_DOWN',
  'OPEN_PALM',
];

/** Concrete, actionable problems the Error Mode can report. */
export type IssueCode =
  | 'NO_HAND'
  | 'MULTIPLE_HANDS'
  | 'HAND_OUT_LEFT'
  | 'HAND_OUT_RIGHT'
  | 'HAND_OUT_TOP'
  | 'HAND_OUT_BOTTOM'
  | 'HAND_TOO_FAR'
  | 'HAND_TOO_CLOSE'
  | 'LOW_CONFIDENCE'
  | 'HAND_MOVING'
  | 'TOO_QUICK'
  | 'FINGERS_UNCLEAR'
  | 'FINGER_FORESHORTENED'
  | 'DIRECTION_AMBIGUOUS'
  | 'EXTRA_FINGERS'
  | 'FIST_LOOSE'
  | 'THUMB_NOT_UP'
  | 'FACE_NOT_VISIBLE'
  | 'FACE_TOO_LOW'
  | 'FACE_TOO_HIGH'
  | 'FACE_TOO_CLOSE'
  | 'FACE_TOO_FAR'
  | 'FACE_OFF_CENTER';

/** Minimal landmark shape (compatible with MediaPipe NormalizedLandmark). */
export interface Landmark {
  x: number;
  y: number;
  z: number;
}

/** One detected hand in a video frame. */
export interface HandObservation {
  /** 21 landmarks, normalised to the (non-mirrored) camera frame. */
  landmarks: Landmark[];
  /** Handedness / presence score from MediaPipe (0..1). */
  score: number;
}

/** One detected face (normalised 0..1 box in the non-mirrored frame). */
export interface FaceObservation {
  x: number;
  y: number;
  width: number;
  height: number;
  score: number;
}

export interface FrameInput {
  /** Timestamp in ms (performance.now()). */
  t: number;
  /** Frame width / height. */
  aspect: number;
  hands: HandObservation[];
  /**
   * Faces found in this frame. `undefined` means face detection was not run
   * on this frame (it is throttled), so the previous face state is kept.
   */
  faces?: FaceObservation[];
}

export interface IssueState {
  code: IssueCode;
  /** blocking issues prevent a gesture from being accepted. */
  blocking: boolean;
}

export type FaceStatus = 'unknown' | 'ok' | 'missing' | 'too-low' | 'too-high' | 'too-close' | 'too-far' | 'off-center';

/** Public, React-friendly snapshot of the engine state. */
export interface EngineSnapshot {
  handCount: number;
  handVisible: boolean;
  /** Gesture currently being held (smoothed), or UNKNOWN / NONE. */
  gesture: GestureOrNone;
  /** Smoothed confidence 0..1 of `gesture`. */
  confidence: number;
  /** 0..1 progress of the hold timer for `gesture`. */
  holdProgress: number;
  /** true once the gesture was held long enough (committed). */
  stable: boolean;
  /** Issue the user should see right now (debounced), or null. */
  issue: IssueCode | null;
  face: FaceStatus;
  fps: number;
}
