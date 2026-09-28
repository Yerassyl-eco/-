---
name: Vision Motion
description: A hands-free vision screening run like a psychophysics lab session.
colors:
  paper: "#f5f4f0"
  field: "#ffffff"
  ink: "#111111"
  graphite: "#6f6f6a"
  rule: "#d9d8d2"
  rule-strong: "#b9b8b1"
  cobalt: "#2457ff"
  cobalt-wash: "#e7ecfb"
  amber: "#8a5300"
  amber-line: "#e08a00"
  scope: "#121212"
typography:
  display:
    fontFamily: "Geist Variable, Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "44px"
    fontWeight: 500
    lineHeight: 1.08
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Geist Variable, Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "40px"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  statement:
    fontFamily: "Geist Variable, Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "30px"
    fontWeight: 400
    lineHeight: 1.25
  readout:
    fontFamily: "Geist Variable, Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Geist Variable, Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 500
    lineHeight: 1.25
  body:
    fontFamily: "Geist Variable, Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.625
    fontFeature: "'ss01', 'cv11'"
  body-sm:
    fontFamily: "Geist Variable, Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.375
  caption:
    fontFamily: "Geist Variable, Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Geist Variable, Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 560
    lineHeight: "16px"
    letterSpacing: "0.1em"
  wordmark:
    fontFamily: "Geist Variable, Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    letterSpacing: "0.18em"
  numeral:
    fontFamily: "Geist Mono Variable, Geist Mono, ui-monospace, SF Mono, Menlo, monospace"
    fontSize: "13px"
    fontWeight: 400
    letterSpacing: "0"
    fontFeature: "'tnum'"
rounded:
  none: "0px"
  hair: "2px"
  dot: "9999px"
spacing:
  cell-gap: "6px"
  row: "8px"
  sm: "12px"
  cue: "14px"
  md: "16px"
  gutter: "24px"
  page-mobile: "20px"
  page: "40px"
  section: "40px"
components:
  gesture-cue:
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    padding: "14px 0"
  gesture-cue-primary:
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    padding: "14px 0"
  gesture-cue-glyph:
    textColor: "{colors.ink}"
    rounded: "{rounded.hair}"
    size: "40px"
  gesture-cue-glyph-primary-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.hair}"
    size: "40px"
  gesture-cue-glyph-active:
    backgroundColor: "{colors.cobalt}"
    textColor: "{colors.field}"
    rounded: "{rounded.hair}"
    size: "40px"
  response-cell:
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.hair}"
    padding: "12px 14px"
    height: "56px"
  response-cell-selected:
    backgroundColor: "{colors.cobalt-wash}"
    textColor: "{colors.cobalt}"
    rounded: "{rounded.hair}"
    padding: "12px 14px"
    height: "56px"
  response-cell-confirmed:
    backgroundColor: "{colors.cobalt}"
    textColor: "{colors.field}"
    rounded: "{rounded.hair}"
    padding: "12px 14px"
    height: "56px"
  confirm-button:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.hair}"
    height: "44px"
  stimulus-field:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
  stimulus-tag:
    textColor: "{colors.graphite}"
    typography: "{typography.numeral}"
    rounded: "{rounded.hair}"
    padding: "2px 6px"
  scope:
    backgroundColor: "{colors.scope}"
    textColor: "{colors.field}"
    rounded: "{rounded.none}"
  error-band:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    padding: "12px 16px"
  text-link:
    textColor: "{colors.graphite}"
    typography: "{typography.body-sm}"
    height: "44px"
---

# Design System: Vision Motion

## Overview

**Creative North Star: "The Lab Session"**

The screen is a psychophysics experiment runner, not a health app. Each surface is one bench station: a protocol, a stimulus field, a camera that works as a measuring instrument, and a time-coded response log. The page is warm off-white paper ruled with 1px hairlines. There are no cards, no hero and no dashboard tiles. Structure comes from the 12-column grid, ink rules that open each section, and the tracked uppercase labels you would find on a lab datasheet.

Density is calm but technical. Big, plain Geist headings carry the human instruction in Russian. Short English technical labels (CAM 01, TRACKING, SESSION LOG) and Geist Mono numerals carry the instrument voice. Colour is nearly absent. Cobalt shows up only when the system is sensing something or the user is acting, and amber only when the user needs to adjust. So one glance at a screen recording tells you what the machine is doing right now.

The only ornament is the lab's own equipment: crop marks on frame corners, the graticule and centre reticle on the camera scope, and fixation crosses. Every gesture-driven control shares one signature. A 2px cobalt baseline fills from the left while the user holds the gesture.

**Key Characteristics:**
- Paper ground, ink text, graphite secondary text, 1px hairline rules. Flat throughout.
- Cobalt is reserved for live signal, hold progress, the current step, selection and focus.
- Amber means adjust (Error Mode, review status). It never means alarm.
- The dark scope and the white stimulus field are the only two surfaces that differ from paper.
- Tracked uppercase sans labels, mono tabular numerals, medium-weight headings.
- Corners are 0 or 2px. Only 6px status dots are round.

## Colors

The palette is almost monochrome, with one cobalt signal and one amber warning.

### Primary
- **Signal Cobalt** (`cobalt`): marks live recognition and progress only. It appears on the TRACKING state, the stable-gesture readout, hold-progress baselines, the current step number and its underline in the session bar, the awaiting trial number in the log, the observation-progress rule on the stimulus field, selected and confirmed answers, the focus ring (2px outline, 2px offset), text selection and the caret.
- **Cobalt Wash** (`cobalt-wash`): the fill of a selected but not yet confirmed answer cell. Cobalt text and border sit on it.

### Secondary
- **Adjust Amber** (`amber`): text colour for Error Mode categories, the ADJUST state, the Review status and mismatched log answers. It is dark enough to pass AA as small text on paper.
- **Amber Line** (`amber-line`): the non-text amber, used for the 2px top or bottom edge of the Error Mode band, warning dots and the square Review marker.

### Neutral
- **Lab Paper** (`paper`): page ground, session bar (95% opacity), mobile response bar, Error Mode band.
- **Stimulus White** (`field`): the pure white ground inside the stimulus field only. Also used as text on cobalt and on the scope.
- **Ink** (`ink`): primary text. Also the section-opening rule, primary cue glyph border and hover fill, the confirm button fill, and the "ok" / within-range mark.
- **Graphite** (`graphite`): secondary text, labels, counters and timecodes at rest.
- **Hairline** (`rule`): every 1px divider, row rule, frame border, and resting cell border.
- **Strong Hairline** (`rule-strong`): idle status dots, secondary cue glyph border, the response-cross reticle, text-link underline, scrollbar thumb, and the info-level Error Mode edge.
- **Scope Black** (`scope`): the camera well behind the video, with a white graticule at 50% alpha.

### Named Rules
**The Live Signal Rule.** Cobalt means the system is sensing or the user is acting right now. Never use it for decoration, section headings or static emphasis. If nothing is live, the screen shows no cobalt apart from the current step number.

**The Amber Means Adjust Rule.** Amber marks something the user can correct or should review. Always pair it with words and a mark (triangle glyph, square dot). Never pair it with alarm wording.

**The Clinical Ground Rule.** Stimulus colours (duochrome red and green, colour-plate palettes, pure black optotypes) are test material, not palette. They live only inside the stimulus field. Never reuse them in UI chrome, and never let UI tokens tint a stimulus.

## Typography

**Display Font:** Geist Variable (with Geist, ui-sans-serif, system-ui)
**Body Font:** Geist Variable, with stylistic sets `ss01` and `cv11` on body
**Label/Mono Font:** Geist Mono Variable (with ui-monospace, SF Mono, Menlo), for numerals only

**Character:** A neutral neo-grotesk used at medium weight for instruction, next to a monospace that only ever shows numbers. The pairing reads like a lab datasheet: human sentences above, measured values beside them.

### Hierarchy
- **Display** (500, 34px mobile / 44px from 640px, 1.08): the first heading on welcome, calibration and preparation screens. Balanced wrap. Up to 16ch when it is a sentence.
- **Headline** (500, 30px / 40px, 1.1): protocol titles (test name, report title). Always sits in the Protocol Header grid, with its index in a mono column on the same baseline.
- **Statement** (400, 26px / 30px, 1.25, up to 30ch): the one-sentence result of a single test.
- **Readout** (500, 20px / 26px from 1024px, line-height 1): the live gesture name in the instrument, in cobalt once the gesture is stable.
- **Title** (500, 17px): primary gesture-cue action, report test names (17px regular).
- **Body** (400, 16px, 1.5 base / 1.625 in report rows, 46–62ch): instruction paragraphs, report prose.
- **Body small** (400, 15px): the most-used text size. Secondary cue actions, answer cells, subtitles, hints.
- **Caption** (400, 13–14px): log rows (14px), vocabulary actions and footnotes (13px).
- **Label** (560, 12px/16px, 0.1em, uppercase): instrument rows, table headers, section headings, status tokens, state words (TRACKING, HOLD, CONFIRMED).
- **Numeral** (Geist Mono, tabular, 12–15px): step numbers, protocol index (01/05), trial numbers, timecodes, confidence, latency, session code, stimulus tags.
- **Wordmark** (600, 13px, 0.18em): "VISION MOTION" in the session bar only.

### Named Rules
**The Mono Is For Measurement Rule.** Geist Mono shows numbers and codes: counters, timecodes, confidence, latency, levels, session IDs. Words, labels included, are always set in Geist sans.

**The Medium Ceiling Rule.** Headings stop at weight 500. Labels use 560. Only the wordmark and the current step number go to 600. Nothing is bold for emphasis. Emphasis comes from ink versus graphite.

## Layout

The layout is a 12-column grid inside a 1440px max container, with 24px column gaps. Page gutters are 20px on mobile and 40px from 640px. Top padding is 32px, or 48px from 1024px. At 1024px and up, the stage takes 9 columns and the instrument takes 3. The instrument sticks 96px from the top, below the session bar. Calibration screens split 5 columns for the protocol and 6 columns (starting at column 7) for the instrument. Below 1024px the instrument moves above the content, capped at 420px wide. There its scope and readout sit side by side in a 1.1fr / 1fr split. On mobile, answers move to a response bar pinned to the bottom edge, and the page gets 192px of bottom padding so content clears it.

The session bar is sticky and runs across the full width on the same 12-column grid: wordmark in 3 columns, the 01–05 progression in 6, session code, timecode and sound toggle in 3. Below 1024px the progression wraps to its own row.

Rhythm is set by hairline rows, not boxes. Telemetry and log rows use 8px vertical padding, cue rows 14px and report rows 16px. Answer cells sit 6px apart, and sections are separated by 40px. An ink rule opens each major block (cue list, summary table, Important, Next). Hairlines separate the rows inside it. Report and result sheets use an 11rem label column beside a content column capped at 62ch.

**The Ruled Sheet Rule.** Group content with a rule above it and a label beside or above it. Never wrap it in a filled box. The ink rule opens a block and hairline rules divide it.

## Elevation & Depth

There are no shadows anywhere. Depth comes from three things: the tonal step between paper, the white stimulus field and the black scope; a thin frame line (1px hairline, 2px for the Error Mode edge); and a 95% paper overlay for layers that sit above content (session bar, mobile response bar, Error Mode band over the scope). The mobile response bar is set off by a 1px ink top rule, not a shadow.

**The Flat Bench Rule.** Every surface is flat. When something needs to sit above something else, give it an opaque paper fill and a rule on its leading edge.

## Shapes

Corners are square or hairline-rounded (2px). Interactive frames use 2px: cue glyph boxes, answer cells, the confirm and cancel buttons, the camera-permission button and stimulus tags. Large frames stay square: the stimulus field, the camera scope, rules and progress bars. Only the 6px status dots are fully round. The square 6px amber marker (Review) and the 6px ink ring (Within screening range) are deliberate shape contrasts, so status never depends on colour.

Crop marks are 12px L-shaped corner brackets drawn at 1px in currentColor. They frame the stimulus field and the camera scope, and nothing else. The scope carries a graticule: ticks every 10% along each edge, longer every 50%, plus a 12px centre reticle, all at 50% white. The answer cross has a small hairline plus at its centre, like a fixation cross.

## Components

### Gesture Cue (signature)
An action row driven by a gesture. It is also a real button for mouse and keyboard.
- **Structure:** a 40px square glyph box (2px corners, 1px border) holding a 20px gesture pictogram, then the action text with the gesture name as a graphite label below it, then a right-aligned "HOLD" label that becomes a live percentage.
- **Baseline:** a 1px hairline along the bottom. On top of it, a 2px cobalt bar scales from the left with hold progress (90ms linear).
- **Primary:** 17px medium action text, ink-bordered glyph box that fills ink with paper icon on hover. Always opened by a 1px ink rule above.
- **Secondary:** 15px action text, strong-hairline glyph box that turns ink-bordered on hover.
- **Active (gesture in view):** the glyph box fills cobalt with a white icon.
- **Disabled:** 40% opacity.

### Response Map
Every answer is shown next to the gesture that selects it.
- **Layouts:** a vertical list for pairs and triples, and a 3×3 cross for four directions with a hairline plus at the centre.
- **Cell:** 1px hairline border, 2px corners, at least 56px tall (64px in the compact cross), with a pictogram and label. Hovering turns the border ink.
- **Selected:** cobalt border, cobalt-wash fill, cobalt text, plus the word "Выбрано".
- **Confirmed:** solid cobalt with white text and a check.
- **Hold:** the same 2px cobalt baseline as the Gesture Cue.

### Mobile Response Bar
- Pinned to the bottom with a paper fill, a 1px ink top rule, and padding that respects the safe area.
- A state label (RESPONSE / CONFIRM · answer / CONFIRMED) turns cobalt once an answer is chosen.
- Answer buttons are 48px tall, in 2–4 equal columns, styled like Response Map cells.
- After a selection, a Confirm button (ink fill, paper text, 44px tall, 2fr) sits beside a Cancel button (hairline border, 1fr). Both keep the hold baseline.

### Instrument (camera as measuring tool)
- **Header:** the label "CAM 01" in ink, with fps and resolution in mono graphite. On the right, a state label with a dot: TRACKING in cobalt, ADJUST in amber, or DEMO / STARTING / OFFLINE in graphite.
- **Scope:** a 4:3 scope-black well with crop marks and a graticule. The video and hand skeleton are mirrored.
- **Telemetry rows:** HAND and FACE. Each row pairs a graphite label with a mono ink value and a solid 6px dot (cobalt live, amber warn, ink ok, strong hairline idle), with a hairline below.
- **Gesture readout:** GESTURE DETECTED / ACCEPTED label with mono confidence, the Readout-size gesture name with its pictogram, and a 2px hold bar (ink while settling, cobalt once stable).
- **Signal row:** SIGNAL · CLEAR at rest, or the Error Mode category.

### Error Mode Band
- **Style:** paper at 95% over the scope, 12px × 16px padding, with a 2px amber-line edge (a strong hairline for info-level messages such as no hand).
- **Content:** an amber category label with a triangle glyph, a "LIVE" dot, a 15px medium title and a 14px graphite hint that names the fix.
- **Placement:** the band sits on the scope's bottom edge. It moves to the top edge when the issue is at the bottom of the frame (hand out at the bottom, face too low), so it never covers the region being corrected. Below 1024px it becomes an in-flow block under the readout, with a 2px top edge.

### Stimulus Field
A white measurement field with a 1px hairline frame and crop marks, at least 240px tall. Corner tags (level, size) sit in mono 12px graphite on 85% white with 2px corners. Observation progress shows as a 2px cobalt rule along the top edge. When a stimulus paints its own ground (duochrome), the white field is dropped.

### Session Bar
Sticky at the top, 95% paper, 1px hairline bottom. The wordmark comes first, then the phase label, then numbered steps 01–05 joined by hairline connectors. Completed connectors fill ink from the left (300ms). The current step is cobalt 600 with a 2px cobalt underline that draws in. On the right sit the session code and timecode (mono, graphite) and a Sound on/off toggle as a label-style text button.

### Session Log
A time-coded table. An ink rule under the "SESSION LOG" label and an "NN / NN recorded" counter. Columns are Trial, Time, Answer, (Expected), Latency. Rows are 14px with hairlines. Trial, time and latency are mono graphite, and answers carry their gesture pictogram. The awaiting row shows the trial number in cobalt and a slowly blinking cobalt dot. In results, a mismatch is marked with an amber cross and a match with an ink check.

### Report Row and Status Token
- **Report row:** a hairline on top, a graphite label in an 11rem column, and 16px body up to 62ch.
- **Status token:** a label with a 6px mark. "REVIEW" is amber with a square amber-line mark. "WITHIN SCREENING RANGE" is ink with a round ink ring.

### Text Link
A 15px graphite link underlined in strong hairline, with a 4px underline offset and a 44px target. It turns ink on hover. It is used only for secondary navigation such as "Вернуться к началу".

### Icons
Lucide stroke pictograms. Gestures use a 1.5px stroke: thumbs up, fist, open palm, and one pointer glyph rotated for the four directions. Status glyphs (check, triangle, arrows) use a 2px stroke. Sizes run 13px to 24px.

## Do's and Don'ts

### Do:
- **Do** give every gesture-driven control the 2px cobalt hold baseline, filling from the left at 90ms linear.
- **Do** show the gesture that triggers every action, as a pictogram plus its English name label.
- **Do** open each major block with a 1px ink rule and divide its rows with 1px `rule` hairlines.
- **Do** set counters, timecodes, levels and confidence in Geist Mono with tabular numerals, and everything else in Geist.
- **Do** pair every status colour with a word and a shape-distinct mark (square for Review, ring for within range, triangle for Error Mode).
- **Do** keep interactive corners at 2px and large frames square.
- **Do** use `enter` (220ms, expo-out, 6px rise) for new content and readouts, and `draw-x` for rules that appear. Collapse all motion under prefers-reduced-motion.
- **Do** keep stimulus colours and pure black optotypes inside the stimulus field, on its white ground.

### Don't:
- **Don't** use shadows, gradients, glass or blur-as-material. The session bar's 2px backdrop blur under 95% paper is the ceiling.
- **Don't** wrap content in filled cards or tiles. Use ruled sheets.
- **Don't** use cobalt for anything that isn't live, in progress, current, selected or focused.
- **Don't** mark success with a colour. Success is ink with a check or ring.
- **Don't** put a label above a heading. The protocol index sits in its own mono column on the title's baseline.
- **Don't** add ornament beyond the bench's own equipment: crop marks, graticule, reticle, fixation cross.
- **Don't** blink anything except the TRACKING dot in the instrument header and the awaiting-response dot in the session log. Telemetry dots stay solid.
- **Don't** set words in Geist Mono. Mono is for measured values only.
