---
name: Vision Motion
description: A hands-free vision screening run like a colourful psychophysics lab session.
colors:
  paper: "#f5f4f0"
  field: "#ffffff"
  ink: "#111111"
  graphite: "#55554f"
  rule: "#d9d8d2"
  rule-strong: "#b9b8b1"
  scope: "#121212"
  cobalt: "#2457ff"
  cobalt-wash: "#e6ecff"
  cobalt-text: "#1f4be0"
  violet: "#7c3aed"
  violet-wash: "#efe7fd"
  violet-text: "#6a2fd6"
  coral: "#d23b26"
  coral-wash: "#fce8e4"
  coral-text: "#b8321f"
  teal: "#0a7c6e"
  teal-wash: "#def2ee"
  sun: "#f5a300"
  sun-wash: "#fff1d1"
  amber: "#8a5300"
  amber-line: "#e08a00"
  amber-wash: "#f6ecdc"
  range-green: "#17703f"
  range-wash: "#e2f1e8"
typography:
  display:
    fontFamily: "Prata, Times New Roman, serif"
    fontSize: "54px"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Prata, Times New Roman, serif"
    fontSize: "48px"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  result-figure:
    fontFamily: "Prata, Times New Roman, serif"
    fontSize: "56px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.01em"
  card-title:
    fontFamily: "Prata, Times New Roman, serif"
    fontSize: "40px"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  statement:
    fontFamily: "Prata, Times New Roman, serif"
    fontSize: "26px"
    fontWeight: 400
    lineHeight: 1.375
    letterSpacing: "-0.01em"
  wordmark:
    fontFamily: "Prata, Times New Roman, serif"
    fontSize: "20px"
    fontWeight: 400
    letterSpacing: "0.04em"
  lead:
    fontFamily: "Geist Variable, Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 400
    lineHeight: 1.375
  readout:
    fontFamily: "Geist Variable, Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 600
    lineHeight: 1
  action:
    fontFamily: "Geist Variable, Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.25
  body:
    fontFamily: "Geist Variable, Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.6
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
    lineHeight: 1.4
  label:
    fontFamily: "Geist Variable, Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: "18px"
    letterSpacing: "0.06em"
  numeral:
    fontFamily: "Geist Mono Variable, Geist Mono, ui-monospace, SF Mono, Menlo, monospace"
    fontSize: "13px"
    fontWeight: 400
    letterSpacing: "0"
    fontFeature: "'tnum'"
rounded:
  hair: "2px"
  icon: "12px"
  control: "14px"
  card: "24px"
  pill: "9999px"
spacing:
  cell-gap: "6px"
  row: "8px"
  sm: "12px"
  cue: "14px"
  md: "16px"
  gutter: "24px"
  card-mobile: "28px"
  card: "40px"
  page-mobile: "20px"
  page: "40px"
  section: "40px"
components:
  instruction-card:
    backgroundColor: "{colors.cobalt}"
    textColor: "{colors.field}"
    typography: "{typography.lead}"
    rounded: "{rounded.card}"
    padding: "40px"
    height: "clamp(300px, 42vh, 380px)"
  result-card:
    backgroundColor: "{colors.cobalt}"
    textColor: "{colors.field}"
    rounded: "{rounded.card}"
    padding: "36px"
  gesture-cue-primary:
    backgroundColor: "{colors.cobalt}"
    textColor: "{colors.field}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
    padding: "14px 16px"
  gesture-cue:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "14px 16px"
  gesture-cue-glyph:
    backgroundColor: "{colors.cobalt-wash}"
    textColor: "{colors.cobalt-text}"
    rounded: "{rounded.icon}"
    size: "44px"
  response-cell:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "12px 14px"
    height: "56px"
  response-cell-selected:
    backgroundColor: "{colors.cobalt-wash}"
    textColor: "{colors.cobalt-text}"
    rounded: "{rounded.control}"
    padding: "12px 14px"
    height: "56px"
  response-cell-confirmed:
    backgroundColor: "{colors.cobalt}"
    textColor: "{colors.field}"
    rounded: "{rounded.control}"
    padding: "12px 14px"
    height: "56px"
  confirm-button:
    backgroundColor: "{colors.cobalt}"
    textColor: "{colors.field}"
    rounded: "{rounded.control}"
    height: "44px"
  step-pill-current:
    backgroundColor: "{colors.cobalt}"
    textColor: "{colors.field}"
    typography: "{typography.numeral}"
    rounded: "{rounded.pill}"
    size: "28px"
  stimulus-field:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
  stimulus-tag:
    backgroundColor: "{colors.cobalt-wash}"
    textColor: "{colors.cobalt-text}"
    typography: "{typography.numeral}"
    rounded: "{rounded.pill}"
    padding: "2px 10px"
  scope:
    backgroundColor: "{colors.scope}"
    textColor: "{colors.field}"
    rounded: "{rounded.control}"
  error-band:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    padding: "12px 16px"
  status-attention:
    backgroundColor: "{colors.amber-wash}"
    textColor: "{colors.amber}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "4px 12px"
  status-within-range:
    backgroundColor: "{colors.range-wash}"
    textColor: "{colors.range-green}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "4px 12px"
---

# Design System: Vision Motion

## Overview

**Creative North Star: "The Colour-Coded Lab Session"**

The screen is still a psychophysics experiment runner: a protocol, a stimulus field, a camera that works as a measuring instrument, and a time-coded response log, all on warm paper ruled with hairlines. What changed is the voice. Each of the five tests now owns one saturated colour (cobalt, violet, coral, teal, sun), and that colour floods the moments that carry instruction or outcome: the instruction cards, the result header, the primary gesture action, the selected answer and the test's step in the progression. Everything else stays paper, ink and hairline, so the colour reads as "you are in test 03" rather than as decoration.

Headings are set in Prata, an elegant high-contrast display serif at a single regular weight, over Geist for reading text and Geist Mono for numbers. Reading sizes went up (17px body, 19 to 22px lead text) for older users and for legibility in a screen recording. Instructions arrive as a centred deck of colour cards, one at a time, with earlier cards settling into a stack behind. Surfaces that hold colour or a measurement are softly rounded (14 to 24px) and lifted by one soft shadow. Rows, logs and report sheets stay flat and ruled.

The instrument keeps its lab equipment: a scope-black camera well with a graticule and centre reticle, telemetry rows, a live gesture readout, and an amber SIGNAL band for Error Mode that names the fix.

**Key Characteristics:**
- Paper ground, ink text, graphite secondary text, 1px hairline rules for rows and sheets.
- One saturated colour per test, applied through the active theme (accent, on, wash, text); calibration, preparation and the final report use cobalt.
- Colour fills instruction cards, result headers, primary actions, selection and progress; it never tints a stimulus.
- Amber means adjust (Error Mode, attention status). Soft green appears only on the "within screening range" status.
- Prata display headings at weight 400; Geist reading text; Geist Mono for numbers only.
- Rounded, softly lifted colour and measurement surfaces; flat ruled rows. No gradients, no glass.

## Colors

A warm paper-and-ink base carrying five saturated test colours, one amber adjust signal and one soft range green.

### Primary (per-test accents)
Each test theme supplies four values that the app root exposes as `--accent`, `--accent-on`, `--accent-wash` and `--accent-text` for the current phase. Components always consume the variables, never a fixed hue.
- **Test Cobalt** (`cobalt`, wash `cobalt-wash`, text `cobalt-text`): 01 visual acuity, and the theme for camera setup, preparation and the final report. White on the fill.
- **Radial Violet** (`violet`, `violet-wash`, `violet-text`): 02 radial figure (astigmatism). White on the fill.
- **Duochrome Coral** (`coral`, `coral-wash`, `coral-text`): 03 duochrome. White on the fill.
- **Amsler Teal** (`teal`, `teal-wash`; the fill doubles as its text colour): 04 Amsler grid. White on the fill.
- **Plate Sun** (`sun`, `sun-wash`): 05 colour vision. The only theme with ink (`ink`) text on its fill.

Where the accent lands: instruction card and result card fills, the primary Gesture Cue, the confirmed answer and mobile confirm button, the selected answer (wash fill, accent border, accent text), hold-progress bars, the stimulus field's 6px top band and progress rule, the live instrument state and stable gesture readout, report and section labels, and the test's own step in the session bar.

### Secondary
- **Adjust Amber** (`amber`): text for Error Mode categories, the "Поправьте" state, the attention status and mismatched log answers. AA as small text on paper.
- **Amber Line** (`amber-line`): non-text amber: the 2px Error Mode band edge, warning dots, the attention status dot.
- **Amber Wash** (`amber-wash`): fill of the attention status pill.

### Tertiary
- **Range Green** (`range-green`) on **Range Wash** (`range-wash`): the "В пределах скрининга" status pill only.

### Neutral
- **Lab Paper** (`paper`): page ground, session bar (95%), mobile response bar, Error Mode band.
- **Stimulus White** (`field`): the stimulus field ground, secondary cue and answer-cell fills; text on accent fills.
- **Ink** (`ink`): primary text, the "ok" telemetry dot, the settling hold bar, the mobile response bar's top rule, text on the sun fill.
- **Graphite** (`graphite`): secondary text, labels at rest, counters, timecodes.
- **Hairline** (`rule`): every 1px divider, row rule, resting cell and cue border, progression connector track.
- **Strong Hairline** (`rule-strong`): idle dots, upcoming step rings, unread deck dots, the response-cross centre, info-level Error Mode edge, scrollbar thumb.
- **Scope Black** (`scope`): the camera well, with a 50% white graticule.

### Named Rules
**The One Test, One Colour Rule.** Each screen speaks in exactly one accent: the active test's theme. The only place several test colours appear together is where the five tests are shown as a set (welcome strip, session-bar progression, final-report bars).

**The Theme Variable Rule.** Components read `--accent`, `--accent-on`, `--accent-wash` and `--accent-text`. Never hard-code a test hue inside a component; switching phase must recolour everything at once.

**The Amber Means Adjust Rule.** Amber marks something the user can correct or should review. Always pair it with words (and the triangle glyph in Error Mode). Never pair it with alarm wording, and never let a test accent stand in for it.

**The Clinical Ground Rule.** Stimulus colours (duochrome red and green, plate palettes, pure black optotypes) are test material, not palette. They live only inside the stimulus field; UI tokens frame the field but never tint the stimulus.

The focus ring (2px, 2px offset), text selection and caret stay fixed cobalt on every theme.

## Typography

**Display Font:** Prata (with Times New Roman, serif)
**Body Font:** Geist Variable (with Geist, ui-sans-serif, system-ui), stylistic sets `ss01` and `cv11`
**Label/Mono Font:** Geist Mono Variable (with ui-monospace, SF Mono, Menlo), numbers only

**Character:** A refined, high-contrast serif gives each heading a calm, almost editorial elegance; a neutral grotesk does the reading and the operating; a monospace carries only measured values.

### Hierarchy
- **Display** (Prata 400, 38–40px mobile / 52–54px from 640px, 1.08–1.1, -0.01em, balanced): the page heading on welcome and above the instruction deck. Up to 16ch when it is a sentence.
- **Headline** (Prata 400, 36px / 48px, 1.1): test titles in the Protocol Header; the final report title runs larger (40px / 60px, 1.05).
- **Result figure** (Prata 400, 40px / 56px, line-height 1): the one-line outcome on a result card ("Уровень 2").
- **Card title** (Prata 400, 30px / 40px, 1.25): the title on an instruction card.
- **Statement** (Prata 400, 26px, 1.375, up to 40ch): the trial prompt and the "next test" line; 22px for test names in the final summary table.
- **Wordmark** (Prata 400, 20px, 0.04em): "Vision Motion" in the session bar.
- **Lead** (Geist 400, 19px / 22px, 1.375, up to 32–48ch): instruction-card text, result sentence, welcome intro.
- **Readout** (Geist 600, 22px / 28px from 1024px, 1): the live gesture name in the instrument, in the accent once stable.
- **Action** (Geist 600, 18px primary / 16px secondary, 1.25): Gesture Cue action text; answer labels are 16px 500.
- **Body** (Geist 400, 17px, 1.6, up to 62ch): report rows and prose.
- **Body small** (Geist 400, 15px): the most-used UI size: hints, subtitles, telemetry values, deck paging.
- **Caption** (Geist 400, 13–14px): gesture names under actions, log rows, data labels, footnotes.
- **Label** (Geist 600, 13px/18px, 0.06em, uppercase): instrument rows, section and report labels, table headers, state words.
- **Numeral** (Geist Mono, tabular, 12–15px): step numbers, card counters (03 / 05), test index, trial numbers, timecodes, confidence, session code, stimulus tags.

### Named Rules
**The Serif Speaks, The Sans Operates Rule.** Prata sets headings, card titles, result figures, prompts and the wordmark, always at 400 and never bolded. Geist sets everything the user reads to act: instructions, actions, labels, telemetry.

**The Mono Is For Measurement Rule.** Geist Mono shows numbers and codes only. Words, labels included, are always Geist.

**The Weight Ceiling Rule.** Geist stops at 600, used for actions, labels, the readout and the current step. Emphasis otherwise comes from size, ink versus graphite, or the accent.

## Layout

A 12-column grid inside a 1440px container, 24px column gaps, page gutters 20px mobile / 40px from 640px, top padding 32px / 48px from 1024px. From 1024px the stage takes 9 columns and the instrument 3, sticky 96px from the top; camera-setup screens split 5 columns of protocol and 6 of instrument (from column 7). Below 1024px the instrument moves above the content, capped at 420px, with scope and readout side by side (1.1fr / 1fr). On mobile, test answers move to a response bar pinned to the bottom and the page gets 192px of bottom padding.

The instruction deck is centred in the stage column, capped at 760px, text centred above it: heading, then a card stack 300–380px tall (`clamp(300px, 42vh, 380px)`), then a paging row (Назад, progress dots, Далее), then the gesture cues in a 1.4fr / 1fr pair and a one-line gesture hint.

The session bar spans the grid: wordmark 3 columns, progression 6, session code / timecode / sound toggle 3; below 1024px the progression wraps to its own row.

Rhythm below the coloured cards is set by hairline rows: telemetry rows 8px vertical padding, cues 14px, report rows 16px, answer cells 6px apart, sections 40px apart. Report and result sheets use an 11rem label column beside content capped at 62ch.

**The Colour Card, Ruled Sheet Rule.** Instruction and outcome sit on a filled colour card; supporting detail sits below it as a ruled sheet: a label, a rule, hairline-divided rows. Never nest cards inside cards, and never box report rows.

## Elevation & Depth

A hybrid: soft single shadows lift the surfaces that hold colour or a measurement, and tonal steps (paper, white field, black scope) plus hairlines do the rest. Layers over content (session bar, mobile response bar, Error Mode band) use paper at 95% or opaque paper with a rule on the leading edge, not a shadow.

### Shadow Vocabulary
- **Card** (`box-shadow: 0 1px 2px rgba(17,17,17,0.06), 0 18px 40px -22px rgba(17,17,17,0.28)`): result and report cards, stacked instruction cards, the primary Gesture Cue, the stimulus field, the camera scope.
- **Lift** (`box-shadow: 0 2px 4px rgba(17,17,17,0.06), 0 30px 60px -28px rgba(17,17,17,0.4)`): the current instruction card only, at the front of the deck.

### Named Rules
**The One Soft Shadow Rule.** A surface gets at most one soft, ink-tinted, downward shadow, and only if it is a colour card, the primary action or a measurement surface. Rows, cells, pills and bars stay flat.

## Shapes

Softly rounded. Cards and the stimulus field use 24px; controls, answer cells, the camera scope and the welcome test tiles use 14px; icon boxes inside cues and cards use 12–16px; steps, tags, status tokens, progress dots and deck paging buttons are full pills. Rules, telemetry rows and log rows stay square. Status and telemetry dots are 6–8px circles.

The scope keeps the lab's own geometry: ticks every 10% along each edge (longer every 50%) and a 12px centre reticle at 50% white. The answer cross keeps a small hairline plus at its centre, like a fixation cross.

## Components

### Instruction Deck (signature)
Instructions shown one card at a time in the centre of the screen.
- **Card:** accent fill with accent-on text, 24px corners, 28px padding (40px from 640px). Top row: a 56px icon box (16px corners, accent-on at 16% mix) with a 28px Lucide pictogram, and a mono "03 / 05" counter at 80% opacity. Bottom: Prata card title and lead text up to 32ch.
- **Stack:** up to two earlier cards stay behind, each 18px higher and 5% smaller per step, at 45% then 25% opacity, with the Card shadow. The current card carries Lift.
- **Arrival:** the new card rises 28px and scales from 0.96 over 520ms (expo-out); the stack re-settles over 420ms. Cards auto-advance every 4.2s; pointing right or left pages manually.
- **Paging:** pill-shaped Назад / Далее text buttons (44px targets, white on hover) flanking progress dots: 10px pills, the current one 28px wide, read ones in the accent, unread in strong hairline.
- **Actions:** a primary thumbs-up Gesture Cue and a secondary open-palm "Сначала" cue.

### Gesture Cue
An action driven by a gesture; also a real button.
- **Structure:** 44px icon box (12px corners) with a 22px gesture pictogram; action text (Action type) with the Russian gesture name below in 14px; a mono hold percentage at the right while held.
- **Primary:** accent fill, accent-on text, 14px corners, Card shadow; icon box is accent-on at 16%; gesture name at 85% opacity.
- **Secondary:** white field fill, 1px hairline border turning ink on hover; icon box in accent-wash with accent-text pictogram.
- **Hold:** a 4px bar along the bottom edge scales from the left with hold progress (90ms linear): accent on secondary, accent-on at 55% on primary.
- **Hover / Disabled:** lifts 1px; disabled at 40% opacity.

### Response Map
- **Layouts:** a vertical list for pairs and triples; a 3×3 cross for four directions with a hairline plus at the centre.
- **Cell:** white field, 1px hairline, 14px corners, at least 56px tall (64px compact), pictogram plus 16px medium label. Hover turns the border to the accent.
- **Selected:** accent border, accent-wash fill, accent text, "Выбрано" label. **Confirmed:** accent fill, accent-on text, check.
- **Hold:** the 4px accent bar from the Gesture Cue.

### Mobile Response Bar
Pinned bottom, paper fill, 1px ink top rule, safe-area padding. A state label turns accent once an answer is chosen. Answer buttons are 48px tall, 14px corners, 2–4 equal columns, styled like Response Map cells. After a selection, Подтвердить (accent fill, 2fr, 44px) sits beside Отмена (hairline border, 1fr).

### Result and Report Cards
- **Test result:** accent card (24px, 28–36px padding, Card shadow) with a "Результат скрининга" line and a pill (accent-on at 16%) naming the status, the Prata result figure with a caption, and a lead sentence up to 48ch. Report rows follow below.
- **Final report:** accent card with the Prata report title and a row of five 56×10px pill bars in each test's colour.
- **Report row:** hairline above, an accent label in an 11rem column, 17px body up to 62ch.
- **Status token:** a label-type pill with an 8px dot. Attention: amber-wash fill, amber text, amber-line dot, "Обратить внимание". Within range: range-wash fill, range-green text and dot, "В пределах скрининга". The words always carry the meaning.

### Stimulus Field
White measurement field, 1px hairline border, 24px corners, Card shadow, at least 240px tall. A 6px accent band runs along the top edge; observation progress fills that band from the left over an accent-wash track. Corner tags are mono 13px pills: level in accent-wash with accent text, size in 90% white with graphite text. When the stimulus paints its own ground (duochrome), the white ground is dropped.

### Instrument (camera as measuring tool)
- **Header:** "Камера" label with fps in mono graphite; on the right a state label with a 6px dot: accent and blinking when tracking, amber for adjust, graphite for demo, starting or no camera.
- **Scope:** 4:3 scope-black well, 14px corners, Card shadow, graticule and reticle; video and hand skeleton mirrored.
- **Telemetry rows:** Рука and Лицо: graphite label, 15px value, solid 6px dot (accent live, amber-line warn, ink ok, strong hairline idle), hairline below.
- **Gesture readout:** a state label with mono confidence, the Readout-size gesture name with its pictogram (accent once stable, a check on acceptance), and a 2px hold bar (ink while settling, accent once stable).
- **Signal row:** "Сигнал" with an all-clear state, or the Error Mode category.

### Error Mode Band
Paper at 95% over the scope, 12×16px padding, 2px amber-line edge (strong hairline for info-level messages). An amber category label with a triangle glyph, a live dot, a 15px medium title and a 14px graphite hint naming the fix. The band sits on the scope's bottom edge and moves to the top when the problem is at the bottom of the frame; below 1024px it becomes an in-flow block under the readout with a 2px top edge.

### Session Bar
Sticky, paper at 95% with a 2px backdrop blur, 1px hairline bottom. Prata wordmark with a 13px graphite subline (from 1280px), a phase label, then five 28px mono step pills joined by 3px rounded connectors. Done and current steps fill with their own test's colour (current at 600); upcoming steps show a strong-hairline ring. A connector fills in the preceding test's colour once that test is done (300ms). Session code, timecode and a sound toggle sit on the right in graphite.

### Session Log
A time-coded table under an accent "Журнал ответов" label: trial, time, answer, expected, latency, in 14px rows with hairlines; mono graphite numbers; the awaiting row shows a blinking 6px accent dot. Mismatches are marked in amber, matches in ink.

### Icons
Lucide stroke pictograms: gestures at 1.5–1.75px stroke (thumbs up, fist, open palm, a pointer rotated for four directions), status glyphs (check, triangle, arrows) at 2px. Sizes 13–28px.

## Do's and Don'ts

### Do:
- **Do** drive every coloured element from `--accent`, `--accent-on`, `--accent-wash` and `--accent-text`, so one theme switch recolours the whole phase.
- **Do** show instructions as the centred Instruction Deck: one accent card at a time, at most two older cards stacked behind, 520ms card-in arrival.
- **Do** give every gesture-driven control a hold bar that fills from the left at 90ms linear.
- **Do** show the gesture that triggers every action, as a pictogram plus its name.
- **Do** set headings, card titles, result figures and prompts in Prata 400, and everything the user operates in Geist.
- **Do** set counters, timecodes, levels and confidence in Geist Mono with tabular numerals.
- **Do** put outcome on an accent card and detail in ruled rows beneath it.
- **Do** use 24px corners on cards and the stimulus field, 14px on controls, cells and the scope, pills for tags, steps and status.
- **Do** pair every status colour with words; amber only for adjust or attention, range green only for within range.
- **Do** keep stimulus colours and pure black optotypes inside the stimulus field, on its white ground.
- **Do** collapse all animation and transitions under prefers-reduced-motion.

### Don't:
- **Don't** use gradients, glassmorphism or blur-as-material. The session bar's 2px backdrop blur under 95% paper is the ceiling.
- **Don't** stack shadows or use hard offset shadows. One soft Card shadow, or Lift for the front instruction card.
- **Don't** mix two test colours on one screen outside the five-test set displays.
- **Don't** use amber or range green as a decorative accent, or a test accent as a warning.
- **Don't** put a label or kicker above a heading.
- **Don't** bold Prata, and don't set words in Geist Mono.
- **Don't** nest cards inside cards or wrap report rows in boxes.
- **Don't** blink anything except the tracking dot in the instrument header and the awaiting dot in the session log.
