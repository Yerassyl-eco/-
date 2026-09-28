# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
- **Hackathon jury (ADMIT HACKATHON 2026, case "MOTION: Камера вместо джойстика")** evaluate the project through a **video recording** of someone completing the screening with gestures. The design must read clearly on a recorded screen.
- **General adults of any age, older people included**, who want a quick, calm, preliminary vision check at home in front of a laptop or phone, without keyboard or mouse.

## Product Purpose
Vision Motion is a browser-based preliminary vision screening that the user controls entirely with hand gestures in front of a regular webcam. It walks the user through five visual tests and gives a separate result after each test plus a final summary. Success: a person completes the whole flow hands-free, understands every step, and gets clear, neutral results. On the video, the jury should see that the site understands the person's movements and guides them through the test.

## Positioning
The camera replaces keyboard and mouse. Real-time hand tracking runs locally in the browser, with its own rule-based gesture engine and an Error Mode that explains exactly what the user is doing wrong and how to correct the movement. A neighbouring "online eye test" site cannot claim this without a working gesture engine.

## Operating Context
- Laptop webcam (MacBook FaceTime camera for the demo) or a phone's front camera; Chrome/Safari on localhost or HTTPS.
- The user sits about arm's length from the screen, one hand free for gestures; in the Amsler test the other hand covers one eye.
- Gestures: thumbs up (continue), fist (confirm), point left/right/up/down (choose), open palm (cancel / repeat). An answer always needs fist confirmation.
- Flow: Landing → camera check → preparation → 5 tests (Tumbling E acuity, radial figure, duochrome, Amsler grid, colour plates) → per-test result → final result.

## Capabilities and Constraints
- React + TypeScript + Vite + Tailwind; MediaPipe Tasks Vision (HandLandmarker, FaceDetector) running locally; no backend; results in localStorage.
- Video is never sent to a server or stored.
- Test stimuli must stay clinically neutral: symbols pure black on white, duochrome red/green halves, Amsler grid, generated pseudo-isochromatic plates. Their sizes and colours are part of the test, not decoration.
- Medical wording: "предварительный скрининг", never a diagnosis; the final screen always states the result is not a medical diagnosis and suggests an ophthalmologist when needed.
- Language: Russian UI.
- Open: logo and brand colours exist but have not been provided yet (see Brand Commitments).

## Brand Commitments
- Name: **VISION MOTION** (typographic wordmark; no pictorial logo). Subtitle: "Digital vision screening".
- Binding palette from the team: background `#F5F4F0` (warm off-white), text `#111111`, secondary `#6F6F6A`, borders `#D9D8D2`, one restrained accent: cobalt `#2457FF`, used sparingly for active state, recognition, progress, key controls. Amber for Error Mode, green only for success. No gradients.
- Binding typography: a neo-grotesk (Geist chosen from the team's list Inter / Geist / IBM Plex; it covers Cyrillic).
- Language: Russian copy with short English technical labels (VISION MOTION, 01 / 05, TRACKING).
- Refused by the team: landing-page hero, SaaS cards everywhere, glassmorphism, purple/blue AI gradients, giant gradient buttons, heavy shadows, cartoon medical illustration, stock photos, gamification, colourful UI, "AI health app" look, traditional navbar.
- Voice: friendly, calm, technological, not frightening; addresses the user directly.

## Evidence on Hand
- Working product with end-to-end verification through a simulated camera (real MediaPipe on real hand photos).
- No testimonials, users, clinical validation, accuracy figures, or partners exist. Future work must not invent them.

## Product Principles
1. The gesture is the interface: every step must be completable hands-free, and the current allowed gestures are always visible.
2. Never leave the user guessing: feedback on recognition is immediate, and errors name the concrete fix.
3. Calm and trustworthy over flashy: it is a health-adjacent check that people of any age should feel safe using.
4. Honest medical framing: screening, not diagnosis; no alarming language.
5. Readable on camera: the key state (recognised gesture, selected answer, progress) must be legible in a screen recording.

## Accessibility & Inclusion
- Older users: large type, high contrast (WCAG AA minimum), generous targets for the fallback buttons.
- Colour is never the only carrier of meaning (the colour tests themselves excepted).
- Reduced-motion support; sound optional.
