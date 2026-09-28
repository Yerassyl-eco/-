// Copies MediaPipe WASM runtime into /public and downloads the ML models once,
// so the app runs fully locally (no CDN needed at runtime).
import { cpSync, existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const wasmSrc = resolve(root, 'node_modules/@mediapipe/tasks-vision/wasm');
const wasmDst = resolve(root, 'public/mediapipe/wasm');

if (existsSync(wasmSrc)) {
  mkdirSync(wasmDst, { recursive: true });
  cpSync(wasmSrc, wasmDst, { recursive: true });
  console.log('[setup-assets] MediaPipe WASM copied to public/mediapipe/wasm');
} else {
  console.warn('[setup-assets] @mediapipe/tasks-vision not installed yet, skipping WASM copy');
}

const models = [
  {
    file: 'public/models/hand_landmarker.task',
    url: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
  },
  {
    file: 'public/models/blaze_face_short_range.tflite',
    url: 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
  },
];

for (const m of models) {
  const dst = resolve(root, m.file);
  if (existsSync(dst) && statSync(dst).size > 1000) continue;
  try {
    const res = await fetch(m.url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    mkdirSync(dirname(dst), { recursive: true });
    writeFileSync(dst, Buffer.from(await res.arrayBuffer()));
    console.log(`[setup-assets] downloaded ${m.file}`);
  } catch (e) {
    console.warn(`[setup-assets] could not download ${m.file} (${e.message}); the app will fall back to the CDN at runtime`);
  }
}
