# Slice 2 verification — passed

## Scope

Three recorded layers only: rain, quiet indoor room tone, occasional sweeping. No AI requests or later-stage features. Slice 1 passed Diana's listening review and is recoverable at 50964e3.

## Mechanical verification

- Six Node tests passed: bounds, radial attenuation, pan at constant radius, loop crossfade, activity gaps/fades, conservative three-layer headroom.
- Vite production build passed with three-layer interface.
- Automated Edge 154.0.4258.37: moving cleaning changed only its pan/gain. Rain and room values and source-start counts remained unchanged. No audio/API requests occurred during the drag.
- Removing cleaning faded only that source to silence; Restore kept its previous position and the same running source. Other sources continued unchanged.
- Waited until the cleaning loop's quiet interval; Pause held elapsed time exactly, paused marker edit applied on Resume, and Resume continued the same three source nodes. Restart reset scene elapsed time and replaced each source without changing positions.
- Forced cleaning-load failure left rain and room playing. Retrying recovered cleaning at the current shared scene phase without restarting either other recording.
- Offline-rendered a 60-second all-near three-layer mix: peak approximately 0.5324, below clipping. This is signal evidence, not a subjective listening test.
- Prepared durations: rain 25.897s; room 16.807s; cleaning 17.760s (8.760s recording plus 9s combined quiet gap). Fixed peak calibration 0.85 per buffer. The sum of maximum channel bounds stays below 1 without adaptive changes to other layers.
- No page/console errors in the successful normal browser run. Desktop and narrow screenshots inspected; no horizontal overflow at 390px.

## Diana's hands-on review — passed

Diana reports convincing position changes while Rain continues underneath and natural short pauses between sweeping cycles. She approved retaining the revised Cleaning-only outer attenuation: farther away and secondary inside the same cafe, not outside or behind a wall. Rain and Room remain unchanged.

Remove/Restore passed: Cleaning returns to its prior position without interrupting Rain or Room. Pause -> reposition -> Resume continues the scene; Restart begins the layers again while keeping positions. Diana explicitly approved Step 2 and requested Step 3 without further micro-checks.

Polish follow-up: Remove's small font made it easy to miss. This is not a functional blocker. These are Diana's listening observations, not a universal acoustic guarantee. Prepared audio remains distinct from genuine AI interpretation.
## Reproduction/evidence

`npm test`, `npm run build`; use project-local npm command in README if npm is unavailable. Ignored local harness .local/slice-2-check.cjs, detailed report .local/slice-2-verification.json and screenshots .local/slice-2-*.png remain available. Audio source/terms/hash records are in AUDIO_CREDITS.md. No subjective naturalness or exact ear-level latency is claimed.

