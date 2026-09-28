import type { FaceDetector, HandLandmarker, NormalizedLandmark } from '@mediapipe/tasks-vision';
import { CameraError, openCamera, stopStream, type CameraErrorCode } from './camera/camera';
import { GestureEngine, type EngineOptions } from './gestureEngine/GestureEngine';
import { drawOverlay, type OverlayTone } from './handTracking/drawOverlay';
import { loadVisionModels } from './handTracking/models';
import type { EngineSnapshot, FaceObservation, Gesture, HandObservation } from './types';

export type RuntimeStatus = 'idle' | 'requesting' | 'loading' | 'ready' | 'error' | 'demo';

export interface RuntimeState {
  status: RuntimeStatus;
  cameraError: CameraErrorCode | null;
  modelError: string | null;
  engine: EngineSnapshot;
}

type Listener = () => void;

const FACE_EVERY_N_FRAMES = 5;
const PUBLISH_INTERVAL_MS = 90;

/**
 * Owns the camera stream, MediaPipe models and the per-frame loop.
 * Per-frame work (inference + canvas drawing) never touches React; React reads
 * a throttled snapshot through `subscribe/getState` (useSyncExternalStore).
 */
class VisionRuntime {
  readonly engine = new GestureEngine();
  private state: RuntimeState;
  private listeners = new Set<Listener>();
  private stream: MediaStream | null = null;
  private hands: HandLandmarker | null = null;
  private face: FaceDetector | null = null;
  private modelsPromise: Promise<void> | null = null;
  private video: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private raf = 0;
  private lastVideoTime = -1;
  private lastTs = 0;
  private frame = 0;
  private lastFaces: FaceObservation[] | null = null;
  private lastPublish = 0;

  constructor() {
    this.state = { status: 'idle', cameraError: null, modelError: null, engine: this.engine.getSnapshot() };
  }

  subscribe = (fn: Listener) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };

  getState = () => this.state;

  onGesture(fn: (g: Gesture) => void) {
    return this.engine.onCommit(fn);
  }

  setOptions(opts: Partial<EngineOptions>) {
    Object.assign(this.engine.options, opts);
  }

  private set(patch: Partial<RuntimeState>) {
    this.state = { ...this.state, ...patch };
    for (const l of this.listeners) l();
  }

  /** DEV demo mode: no camera, gestures are injected by the developer. */
  enableDemo() {
    this.set({ status: 'demo', cameraError: null });
  }

  simulate(g: Gesture) {
    this.engine.simulate(g);
    this.set({ engine: this.engine.getSnapshot() });
  }

  /** Request the camera and load models (idempotent). */
  async start() {
    if (this.state.status === 'demo') return;
    if (this.state.status === 'requesting' || this.state.status === 'loading') return;
    if (this.state.status === 'ready' && this.stream?.active) return;

    this.set({ status: 'requesting', cameraError: null, modelError: null });
    this.modelsPromise ??= loadVisionModels()
      .then((m) => {
        this.hands = m.hands;
        this.face = m.face;
      })
      .catch((e) => {
        this.modelsPromise = null;
        throw e;
      });

    try {
      this.stream = await openCamera();
    } catch (e) {
      this.set({ status: 'error', cameraError: e instanceof CameraError ? e.code : 'UNKNOWN' });
      return;
    }
    this.stream.getVideoTracks()[0]?.addEventListener('ended', () => {
      this.stopLoop();
      this.set({ status: 'error', cameraError: 'STREAM_ENDED' });
    });
    this.bindVideo();

    this.set({ status: 'loading' });
    try {
      await this.modelsPromise;
    } catch (e) {
      this.set({
        status: 'error',
        modelError: 'Не удалось загрузить модель распознавания рук. Проверьте интернет-соединение и обновите страницу.',
      });
      console.error(e);
      return;
    }
    this.set({ status: 'ready' });
    this.startLoop();
  }

  /** Called by the CameraView component when its elements mount. */
  attach(video: HTMLVideoElement, canvas: HTMLCanvasElement) {
    this.video = video;
    this.canvas = canvas;
    this.bindVideo();
    if (this.state.status === 'ready') this.startLoop();
  }

  detach(video: HTMLVideoElement) {
    if (this.video === video) {
      this.stopLoop();
      this.video = null;
      this.canvas = null;
    }
  }

  stop() {
    this.stopLoop();
    stopStream(this.stream);
    this.stream = null;
    this.set({ status: 'idle' });
  }

  private bindVideo() {
    const v = this.video;
    if (!v || !this.stream) return;
    if (v.srcObject !== this.stream) {
      v.srcObject = this.stream;
      v.muted = true;
      v.playsInline = true;
      void v.play().catch(() => undefined);
    }
  }

  private startLoop() {
    if (this.raf || !this.video) return;
    const tick = () => {
      this.raf = requestAnimationFrame(tick);
      this.processFrame();
    };
    this.raf = requestAnimationFrame(tick);
  }

  private stopLoop() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  private processFrame() {
    const v = this.video;
    const hands = this.hands;
    if (!v || !hands || v.readyState < 2 || !v.videoWidth) return;
    // Only run inference on new video frames.
    if (v.currentTime === this.lastVideoTime) return;
    this.lastVideoTime = v.currentTime;

    let ts = performance.now();
    if (ts <= this.lastTs) ts = this.lastTs + 1; // MediaPipe needs strictly increasing timestamps
    this.lastTs = ts;
    this.frame++;

    let handLms: NormalizedLandmark[][] = [];
    const observations: HandObservation[] = [];
    try {
      const res = hands.detectForVideo(v, ts);
      handLms = res.landmarks;
      res.landmarks.forEach((l, i) => {
        observations.push({ landmarks: l, score: res.handedness[i]?.[0]?.score ?? 0.5 });
      });
    } catch (e) {
      console.warn('hand detection failed', e);
      return;
    }

    let faces: FaceObservation[] | undefined;
    if (this.face && this.frame % FACE_EVERY_N_FRAMES === 0) {
      try {
        const r = this.face.detectForVideo(v, ts);
        const W = v.videoWidth;
        const H = v.videoHeight;
        faces = r.detections
          .filter((d) => d.boundingBox)
          .map((d) => ({
            x: d.boundingBox!.originX / W,
            y: d.boundingBox!.originY / H,
            width: d.boundingBox!.width / W,
            height: d.boundingBox!.height / H,
            score: d.categories[0]?.score ?? 0,
          }));
        this.lastFaces = faces;
      } catch {
        /* advisory only */
      }
    }

    const snap = this.engine.process({ t: ts, aspect: v.videoWidth / v.videoHeight, hands: observations, faces });

    // Draw overlay.
    const c = this.canvas;
    if (c) {
      if (c.width !== v.videoWidth || c.height !== v.videoHeight) {
        c.width = v.videoWidth;
        c.height = v.videoHeight;
      }
      const ctx = c.getContext('2d');
      if (ctx) {
        const real = snap.gesture !== 'NONE' && snap.gesture !== 'UNKNOWN';
        const tone: OverlayTone = snap.stable
          ? 'stable'
          : snap.issue && snap.issue !== 'NO_HAND' && !snap.issue.startsWith('FACE')
            ? 'warning'
            : real
              ? 'holding'
              : 'tracking';
        drawOverlay(ctx, c.width, c.height, handLms, this.engine.options.faceCheck ? this.lastFaces : null, tone, snap.holdProgress);
      }
    }

    // Publish to React at a limited rate (or immediately on meaningful change).
    const prev = this.state.engine;
    const changed =
      prev.gesture !== snap.gesture ||
      prev.issue !== snap.issue ||
      prev.stable !== snap.stable ||
      prev.handCount !== snap.handCount ||
      prev.face !== snap.face;
    if (changed || ts - this.lastPublish > PUBLISH_INTERVAL_MS) {
      this.lastPublish = ts;
      this.set({ engine: snap });
    }
  }
}

export const visionRuntime = new VisionRuntime();
