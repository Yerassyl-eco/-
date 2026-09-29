---
name: Vision Motion
description: A hands-free vision screening run like a colourful psychophysics lab session.
colors:
  paper: "#f5f4f0"
  paper-2: "#ecebe5"
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
  live: "#1d9a50"
typography:
  display:
    fontFamily: "Manrope Variable, Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "54px"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-0.025em"
  landing-display:
    fontFamily: "Manrope Variable, Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(40px, min(4.7vw, 7.2vh), 76px)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.015em"
  headline:
    fontFamily: "Manrope Variable, Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "48px"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  result-figure:
    fontFamily: "Manrope Variable, Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "56px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.025em"
  card-title:
    fontFamily: "Manrope Variable, Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "40px"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  statement:
    fontFamily: "Manrope Variable, Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 400
    lineHeight: 1.375
    letterSpacing: "-0.025em"
  wordmark:
    fontFamily: "Manrope Variable, Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    letterSpacing: "0.2em"
  lead:
    fontFamily: "Manrope Variable, Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 400
    lineHeight: 1.375
  readout:
    fontFamily: "Manrope Variable, Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 600
    lineHeight: 1
  action:
    fontFamily: "Manrope Variable, Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.25
  body:
    fontFamily: "Manrope Variable, Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: "Manrope Variable, Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.375
  caption:
    fontFamily: "Manrope Variable, Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.4
  label:
    fontFamily: "Manrope Variable, Manrope, ui-sans-serif, system-ui, sans-serif"
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
  start-disc:
    backgroundColor: "{colors.cobalt}"
    textColor: "{colors.field}"
    rounded: "{rounded.pill}"
    size: "87px"
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

The screen is still a psychophysics experiment runner: a protocol, a stimulus field, a camera that works as a measuring instrument, and a time-coded response log, all on warm paper ruled with hairlines. Each of the five tests owns one saturated colour (cobalt, violet, coral, teal, sun), and that colour floods the moments that carry instruction or outcome: the instruction cards, the result header, the primary gesture action, the selected answer and the test's step in the progression. Everything else stays paper, ink and hairline, so the colour reads as "you are in test 03" rather than as decoration.

One family carries every word: Manrope, a calm geometric-humanist grotesk, set light-handed at 400 for display and page headings and 500 for card and section headings, with tight negative tracking at size. Geist Mono carries numbers only. Reading sizes stay large (17px body, 19 to 22px lead text) for older users and for legibility in a screen recording. Instructions arrive as a centred deck of colour cards, one at a time, with earlier cards settling into a stack behind. Surfaces that hold colour or a measurement are softly rounded (14 to 24px) and lifted by one soft shadow. Rows, logs and report sheets stay flat and ruled.

The instrument keeps its lab equipment: a scope-black camera well with a graticule and centre reticle, telemetry rows, a live gesture readout, and an amber SIGNAL band for Error Mode that names the fix. The landing is the same instrument seen from the front: a macro iris under an optical reticle on a slightly deeper off-white paper, with the camera running headless behind it and a single cobalt start disc.

**Key Characteristics:**
- Paper ground, ink text, graphite secondary text, 1px hairline rules for rows and sheets; the landing sits on the deeper paper-2.
- One saturated colour per test, applied through the active theme (accent, on, wash, text); camera setup, preparation, the vision map and the final report use cobalt.
- Colour fills instruction cards, result headers, primary actions, selection and progress; it never tints a stimulus.
- Amber means adjust (Error Mode, attention status). Soft range green appears only on the "within screening range" status; the brighter live green only as the landing's camera-live dot.
- Manrope for every word (400 display and page headings, 500 card and section headings); Geist Mono for numbers only.
- Rounded, softly lifted colour and measurement surfaces; flat ruled rows. No gradients, no glass.

## Colors

A warm paper-and-ink base carrying five saturated test colours, one amber adjust signal and two functional greens.

### Primary (per-test accents)
Each test theme supplies four values that the app root exposes as `--accent`, `--accent-on`, `--accent-wash` and `--accent-text` for the current phase. Components always consume the variables, never a fixed hue.
- **Test Cobalt** (`cobalt`, wash `cobalt-wash`, text `cobalt-text`): 01 visual acuity, and the theme for camera setup, preparation, the vision map and the final report. White on the fill. Also the fixed colour of the landing's start disc, hold arc and thumbs-up pictogram.
- **Radial Violet** (`violet`, `violet-wash`, `violet-text`): 02 radial figure (astigmatism). White on the fill.
- **Duochrome Coral** (`coral`, `coral-wash`, `coral-text`): 03 duochrome. White on the fill.
- **Amsler Teal** (`teal`, `teal-wash`; the fill doubles as its text colour): 04 Amsler grid. White on the fill.
- **Plate Sun** (`sun`, `sun-wash`): 05 colour vision. The only theme with ink (`ink`) text on its fill; its accent text on paper is also ink.

Where the accent lands: instruction card and result card fills, the primary Gesture Cue, the confirmed answer and mobile confirm button, the selected answer (wash fill, accent border, accent text), hold-progress bars, the stimulus field's 6px top band and progress rule, the live instrument state and stable gesture readout, report and section labels, the index pill in the Protocol Header, and the test's own step in the session bar.

### Secondary
- **Adjust Amber** (`amber`): text for Error Mode categories, the "Поправьте" state, the attention status, mismatched log answers and the landing's warning line. AA as small text on paper.
- **Amber Line** (`amber-line`): non-text amber: the 2px Error Mode band edge, warning dots, the attention status dot, the vision map's gap hatch.
- **Amber Wash** (`amber-wash`): fill of the attention status pill and the gap hatch ground.

### Tertiary
- **Range Green** (`range-green`) on **Range Wash** (`range-wash`): the "В пределах скрининга" status pill only.
- **Live Green** (`live`): the static 8px camera-live dot on the landing's status line, nothing else.

### Neutral
- **Lab Paper** (`paper`): page ground, session bar (95%), mobile response bar, Error Mode band.
- **Deep Paper** (`paper-2`): the landing ground only; one step deeper than paper so the white reticle and the iris read against it.
- **Stimulus White** (`field`): the stimulus field ground, secondary cue and answer-cell fills; text on accent fills; the landing reticle's measuring ring and the crosshair where it crosses the iris.
- **Ink** (`ink`): primary text, the "ok" telemetry dot, the settling hold bar, the mobile response bar's top rule, text on the sun fill, the landing's drawn icons and locked range brackets.
- **Graphite** (`graphite`): secondary text, labels at rest, counters, timecodes, the landing's resting margin notes and brackets.
- **Hairline** (`rule`): every 1px divider, row rule, resting cell and cue border, progression connector track.
- **Strong Hairline** (`rule-strong`): idle dots, upcoming step rings, unread deck dots, the response-cross centre, info-level Error Mode edge, scrollbar thumb, the landing crosshair outside the iris and the hold arc's track.
- **Scope Black** (`scope`): the camera well, with a 50% white graticule.

### Named Rules
**The One Test, One Colour Rule.** Each screen speaks in exactly one accent: the active test's theme. The only place several test colours appear together is where the five tests are shown as a set (session-bar progression, vision map, per-test details progression, final-report bars and summary numbers).

**The Theme Variable Rule.** Components read `--accent`, `--accent-on`, `--accent-wash` and `--accent-text`. Never hard-code a test hue inside a component; switching phase must recolour everything at once. The landing is the one surface outside the theme system and uses cobalt directly.

**The Amber Means Adjust Rule.** Amber marks something the user can correct or should review. Always pair it with words (and the triangle glyph in Error Mode). Never pair it with alarm wording, and never let a test accent stand in for it.

**The Clinical Ground Rule.** Stimulus colours (duochrome red and green, plate palettes, pure black optotypes) are test material, not palette. They live only inside the stimulus field; UI tokens frame the field but never tint the stimulus.

The focus ring (2px, 2px offset), text selection and caret stay fixed cobalt on every theme.

## Typography

**Display Font:** Manrope Variable (with Manrope, ui-sans-serif, system-ui)
**Body Font:** Manrope Variable (same stack)
**Label/Mono Font:** Geist Mono Variable (with ui-monospace, SF Mono, Menlo), numbers only

**Character:** One quiet, open grotesk does everything with words; hierarchy comes from size, a light 400 at display sizes against 500 and 600 in the working layers, and tight tracking as type grows. A monospace carries only measured values.

### Hierarchy
- **Display** (400, 40px mobile / 52–54px from 640px, 1.08–1.1, -0.025em, balanced): the page heading on calibration and above the instruction deck; the vision map and details headings run 44–56px at 1.05. Up to 16ch when it is a sentence.
- **Landing display** (400, `clamp(40px, min(4.7vw, 7.2vh), 76px)`, 1.1, -0.015em): the landing headline only, sized against both width and height so it fits one viewport.
- **Headline** (400, 36px / 48px, 1.1, -0.025em): test titles in the Protocol Header; the final report title runs larger (40px / 60px, 1.05).
- **Result figure** (400, 40px / 56px, line-height 1): the one-line outcome on a result card ("Уровень 2").
- **Card title** (500, 30px / 40px, 1.25, -0.015em): the title on an instruction card; detail-slide titles 32–38px; section headings such as the vision map's 24px.
- **Statement** (400, 26px, 1.375, up to 40ch): the trial prompt and the "next test" line; 22px for test names in the final summary table.
- **Wordmark** (600, 15px, 0.2em, uppercase "VISION MOTION"): the session bar at 15px; the landing at 15px, 16.5px from 1024px.
- **Lead** (400, 19px / 22px, 1.375, up to 32–48ch): instruction-card text, result sentence. The landing intro runs `clamp(18px, 1.5vw, 23px)` at 1.5, ink at 80%.
- **Readout** (600, 22px / 28px from 1024px, 1): the live gesture name in the instrument, in the accent once stable.
- **Action** (600, 18px primary / 16px secondary, 1.25): Gesture Cue action text; answer labels are 16px 500.
- **Body** (400, 17px, 1.6, up to 62ch): report rows, prose, the landing's hands-free points (16px / 17px).
- **Body small** (400, 15px): the most-used UI size: hints, subtitles, the Protocol Header subline, the deck sub-line (500), telemetry values, deck paging.
- **Caption** (400, 12–14px): gesture names under actions, log rows, data labels, footnotes; the landing footnote is one 12px graphite line.
- **Label** (600, 13px/18px, 0.06em, uppercase): instrument rows, section and report labels, table headers, state words.
- **Numeral** (Geist Mono, tabular, 12–15px): step numbers, card counters (03 / 05), the test index pill, trial numbers, timecodes, confidence, session code, stimulus tags.

### Named Rules
**The One Voice Rule.** Manrope sets every word in the interface. Display and page headings stay at 400 and never go bold; card and section headings step up to 500; the working layer (actions, labels, readout, wordmark) uses 600.

**The Mono Is For Measurement Rule.** Geist Mono shows numbers and codes only. Words, labels included, are always Manrope. The landing's 01—05 counter is the one place numerals use Manrope tabular figures, because there it is part of the composition rather than a measurement.

**The Weight Ceiling Rule.** Manrope stops at 600, used for actions, labels, the readout, the wordmark and the current step. Emphasis otherwise comes from size, ink versus graphite, or the accent.

**The Heading Stands Alone Rule.** Nothing sits above a heading. Test indexes go inline in the heading as an accent pill; context lines (English sublines, deck sub-lines) go below it in 15px graphite.

**The Stimulus Type Exception.** Test material keeps its own type: duochrome optotypes and plate digits are set in Arial (Helvetica, sans-serif) as clinical stimulus, sized by the test. This is stimulus, not UI type, and never appears outside the stimulus field.

## Layout

A 12-column grid inside a 1440px container, 24px column gaps, page gutters 20px mobile / 40px from 640px, top padding 32px / 48px from 1024px. From 1024px the stage takes 9 columns and the instrument 3, sticky 96px from the top; camera-setup screens split 5 columns of protocol and 6 of instrument (from column 7). Below 1024px the instrument moves above the content, capped at 420px, with scope and readout side by side (1.1fr / 1fr). On mobile, test answers move to a response bar pinned to the bottom and the page gets 192px of bottom padding.

The instruction deck is centred in the stage column, capped at 760px, text centred above it: heading with its 15px sub-line below, then a card stack 300–380px tall (`clamp(300px, 42vh, 380px)`), then a paging row (Назад, progress dots, Далее), then the gesture cues in a 1.4fr / 1fr pair and a one-line gesture hint.

The session bar spans the grid: wordmark 3 columns, progression 6, session code / timecode / sound toggle 3; below 1024px the progression wraps to its own row.

The landing is a single full-height viewport with no session bar, gutters of 4.2vw from 1024px: wordmark left and the 01—05 counter right along the top; a 12-column body with the text column in 5 columns (starting 12vh down) and the iris scope in 7, sized `min(84vh, 56vw, 980px)`, with the FOCUS / ALIGN / SCAN margin notes hung off its right edge; the camera status line right-aligned and the footnote along the bottom. Below 1024px the iris moves above the text, capped at 260–380px, and the margin notes run in a row beneath it.

Rhythm below the coloured cards is set by hairline rows: telemetry rows 8px vertical padding, cues 14px, report rows 16px, answer cells 6px apart, sections 40px apart. Report and result sheets use an 11rem label column beside content capped at 62ch.

**The Colour Card, Ruled Sheet Rule.** Instruction and outcome sit on a filled colour card; supporting detail sits below it as a ruled sheet: a label, a rule, hairline-divided rows. Never nest cards inside cards, and never box report rows.

## Elevation & Depth

A hybrid: soft single shadows lift the surfaces that hold colour or a measurement, and tonal steps (paper, white field, black scope) plus hairlines do the rest. Layers over content (session bar, mobile response bar, Error Mode band) use paper at 95% or opaque paper with a rule on the leading edge, not a shadow. The landing is entirely flat: the start disc carries no shadow, and depth comes from the iris image alone.

### Shadow Vocabulary
- **Card** (`box-shadow: 0 1px 2px rgba(17,17,17,0.06), 0 18px 40px -22px rgba(17,17,17,0.28)`): result and report cards, stacked instruction cards, the primary Gesture Cue, the stimulus field, the camera scope.
- **Lift** (`box-shadow: 0 2px 4px rgba(17,17,17,0.06), 0 30px 60px -28px rgba(17,17,17,0.4)`): the current instruction card only, at the front of the deck.

### Named Rules
**The One Soft Shadow Rule.** A surface gets at most one soft, ink-tinted, downward shadow, and only if it is a colour card, the primary action or a measurement surface. Rows, cells, pills, bars and the landing stay flat.

## Shapes

Softly rounded. Cards and the stimulus field use 24px; controls, answer cells and the camera scope use 14px; icon boxes inside cues and cards use 12–16px; steps, tags, status tokens, the index pill, progress dots, deck paging buttons and the landing start disc are full pills or circles. Rules, telemetry rows and log rows stay square. Status and telemetry dots are 6–8px circles.

The scope keeps the lab's own geometry: ticks every 10% along each edge (longer every 50%) and a 12px centre reticle at 50% white. The answer cross keeps a small hairline plus at its centre, like a fixation cross. The landing reticle is the same geometry at scale: a white 1.5px measuring ring, a 1px crosshair, a small centre plus and a pair of range brackets, all non-scaling hairlines.

## Components

### Instruction Deck (signature)
Instructions shown one card at a time in the centre of the screen.
- **Heading:** display title with a 15px medium graphite sub-line below it (test index and name); never a label above.
- **Card:** accent fill with accent-on text, 24px corners, 28px padding (40px from 640px). Top row: a 56px icon box (16px corners, accent-on at 16% mix) with a 28px Lucide pictogram, and a mono "03 / 05" counter at 80% opacity. Bottom: card title and lead text up to 32ch.
- **Stack:** up to two earlier cards stay behind, each 18px higher and 5% smaller per step, at 45% then 25% opacity, with the Card shadow. The current card carries Lift.
- **Arrival:** the new card rises 28px and scales from 0.96 over 520ms (expo-out); the stack re-settles over 420ms. Cards auto-advance every 4.2s; pointing right or left pages manually.
- **Paging:** pill-shaped Назад / Далее text buttons (44px targets, white on hover) flanking progress dots: 10px pills, the current one 28px wide, read ones in the accent, unread in strong hairline.
- **Actions:** a primary thumbs-up Gesture Cue and a secondary open-palm "Сначала" cue.

### Protocol Header
The test heading: the index as a mono accent pill ("03/05", 15px medium, full round) inline at the start of the h1, then the title; the English technical subline and any status token in a 15px graphite row below. An optional aside aligns right.

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
- **Test result:** accent card (24px, 28–36px padding, Card shadow) with a "Результат скрининга" line and a pill (accent-on at 16%) naming the status, the result figure with a caption, and a lead sentence up to 48ch. Report rows follow below.
- **Final report:** accent card with the report title and a row of five 56×10px pill bars in each test's colour.
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
Sticky, paper at 95% with a 2px backdrop blur, 1px hairline bottom. The uppercase Manrope wordmark with a 13px graphite subline (from 1280px), a phase label, then five 28px mono step pills joined by 3px rounded connectors. Done and current steps fill with their own test's colour (current at 600); upcoming steps show a strong-hairline ring. A connector fills in the preceding test's colour once that test is done (300ms). Session code, timecode and a sound toggle sit on the right in graphite.

### Session Log
A time-coded table under an accent "Журнал ответов" label: trial, time, answer, expected, latency, in 14px rows with hairlines; mono graphite numbers; the awaiting row shows a blinking 6px accent dot. Mismatches are marked in amber, matches in ink.

### Landing Iris Scope (signature)
The landing visual: a procedurally painted macro iris on canvas (iris 60% of the square) under an SVG optical reticle.
- **Reticle:** a white 1.5px measuring ring at 80% of the half-width; a 1px crosshair in strong hairline beyond the iris and white at 55% across it; a white ring around the pupil and a small white centre plus. The ring and crosshair draw in over 1100ms (expo-out, 250ms delay) while the iris resolves from 0.965 scale and 14px blur over 1400ms.
- **Range brackets:** a pair of 1.25px side brackets, graphite at rest; when a hand is in frame they turn ink and close in by 26 units over 600ms.
- **Pupil:** near-black, breathing to 1.045 scale over a 7s cycle; contracts to 0.86 over 700ms when a hand is in frame.
- **Hold:** the start gesture's progress draws as a 3px cobalt arc on the measuring ring, clockwise from 12 o'clock, visible only while holding (90ms linear).
- **Margin notes:** FOCUS / ALIGN / SCAN, uppercase 11.5–12px, 0.08em tracking; graphite 400 at rest, ink 500 when live (face found, hand in frame, holding), 300ms.

### Landing Start
- **Start disc:** a flat cobalt circle (76px, 87px from 1024px) with a white 30px arrow, no shadow; scales to 1.04 on hover and 0.98 on press. While a thumbs-up is held, a strong-hairline track and a 2.5px cobalt arc ring it 7px out; otherwise no ring.
- **Prompt:** "Покажите [thumbs-up] чтобы начать" beside it at the lead size, the pictogram in cobalt.
- **Live line:** one 15px line beneath: amber with a triangle for Error Mode, cobalt while holding, graphite guidance otherwise.
- **Hands-free points:** three rows (Без клавиатуры, Без мыши, Только ваши жесты) with 30–34px ink icons drawn at 1.1px stroke: an object inside a slashed circle for the refusals, the open hand for the gesture.
- **Camera line:** 12.5px graphite with an 8px dot (static live green when ready, blinking graphite while connecting, strong hairline in demo) and a face-scan pictogram that turns cobalt when a face is found. On a camera error it becomes an amber title, a graphite hint and a pill "Разрешить камеру" button with an ink hairline that fills ink on hover.

### Icons
Lucide stroke pictograms: gestures at 1.5–1.75px stroke (thumbs up, fist, open palm, a pointer rotated for four directions), status glyphs (check, triangle, arrows) at 2px. Sizes 13–28px. The landing uses a lighter 1.1–1.6px stroke at 24–34px, with its prohibition marks drawn to match.

## Do's and Don'ts

### Do:
- **Do** drive every coloured element from `--accent`, `--accent-on`, `--accent-wash` and `--accent-text`, so one theme switch recolours the whole phase.
- **Do** show instructions as the centred Instruction Deck: one accent card at a time, at most two older cards stacked behind, 520ms card-in arrival.
- **Do** give every gesture-driven control a hold indicator that fills at 90ms linear: a bar from the left on cues and cells, a clockwise arc from 12 o'clock on round controls.
- **Do** show the gesture that triggers every action, as a pictogram plus its name.
- **Do** set every word in Manrope: display and page headings at 400 with negative tracking, card and section headings at 500, the working layer at 600.
- **Do** set counters, timecodes, levels and confidence in Geist Mono with tabular numerals.
- **Do** put outcome on an accent card and detail in ruled rows beneath it.
- **Do** use 24px corners on cards and the stimulus field, 14px on controls, cells and the scope, pills for tags, steps and status.
- **Do** pair every status colour with words; amber only for adjust or attention, range green only for within range, live green only for the camera-live dot.
- **Do** keep stimulus colours, pure black optotypes and Arial stimulus type inside the stimulus field.
- **Do** collapse all animation and transitions under prefers-reduced-motion.

### Don't:
- **Don't** use gradients, glassmorphism or blur-as-material. The session bar's 2px backdrop blur under 95% paper is the ceiling.
- **Don't** stack shadows or use hard offset shadows. One soft Card shadow, or Lift for the front instruction card.
- **Don't** mix two test colours on one screen outside the five-test set displays.
- **Don't** use amber or either green as a decorative accent, or a test accent as a warning.
- **Don't** put a label, kicker or eyebrow above a heading.
- **Don't** bold display headings, go above 600, or set words in Geist Mono.
- **Don't** nest cards inside cards or wrap report rows in boxes.
- **Don't** blink anything except waiting and tracking status dots: the instrument tracking dot, the session-log awaiting dot and the landing's connecting dot.
