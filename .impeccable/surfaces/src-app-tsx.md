---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: []
---

Scope: the whole screening application (single continuous route, all states). Visitor mode: Operate.
Audience / job: an adult at arm's length from a laptop camera completes five vision tests hands-free; a jury watches a screen recording.
Constraints: stimuli stay clinically neutral (pure black on white field, duochrome red/green, Amsler grid, generated plates); no diagnosis wording; gestures always visible; team palette and Geist pinned.
Memorable moment: the live instrument panel names the gesture the instant it is recognised and the response lands in the session log.

## Direction contract

THESIS: A vision-science lab session, not a health app. The screen is a psychophysics experiment runner: protocol, stimulus field, instrument, response log. It refuses the category default of cards, hero and dashboard.

OWN-WORLD: Warm off-white field #F5F4F0, ink #111111, graphite #6F6F6A, hairlines #D9D8D2 at 1px, cobalt #2457FF only for live signal and progress, amber for SIGNAL warnings. Geist for text, Geist Mono for labels, counters, timecodes. Zero or 2px radii, no shadows, 12-column grid, crop marks and fixation crosses as the only ornament.

STORY: The visitor calibrates the instrument, reads each protocol, answers stimuli with the hand, watches each answer get logged, and leaves with a calm, report-like summary.

FIRST VIEWPORT: Session bar across the top (VISION MOTION, session code, 01—05 progression rule, timecode). Left 5 columns: protocol title and three short imperative lines. Right 7 columns: the camera as instrument with face frame, hand skeleton, telemetry rows HAND / FACE / SIGNAL. Primary action: the thumbs-up cue sits under the protocol.

FORM: Psychophysics experiment runner, position 4 of the ordered list, seed key 23d93d9b.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
