# Slice 2 verification — listening review pending

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

## Remaining evidence

Diana subsequently found Cleaning too prominent at the outer edge. After an authorized Cleaning-only extra attenuation beyond half-radius (up to 6 dB extra at the edge), she reported more natural background recession and approved retaining it. The agreed interpretation is farther away inside the same cafe, not outside or behind a wall. Inner-half level, Rain, Room, pan and timing remain unchanged. Existing six tests/build and a position-grid comparison passed for the adjustment. Learner Remove/Restore and three-layer transport checks remain to finish the review.

Diana briefly tested the three-layer scene and reported a short natural pause between sweeping cycles, followed by resumption. During audible sweeping she could hear position changes while rain remained underneath. She then explicitly paused work for today and wants to continue the listening review later. This is partial learner evidence, not approval of the full slice. No later-stage work is authorized during the pause.

Diana must judge repetition, relative loudness, audible prominence and useful scene change. Room tone and sweeping are source-verified recordings, but neither is listener-approved yet. Mechanical continuity does not prove that repetition is unobtrusive. The test is prepared audio, not an AI interpretation.

Suggested check: headphones, around 90 seconds; move cleaning near/far during an audible sweep with rain/room fixed. Try Remove/Restore and Pause/Resume during a gap. Report anything distracting before the slice is marked complete or committed.

## Reproduction/evidence

`npm test`, `npm run build`; use project-local npm command in README if npm is unavailable. Ignored local harness .local/slice-2-check.cjs, detailed report .local/slice-2-verification.json and screenshots .local/slice-2-*.png remain available. Audio source/terms/hash records are in AUDIO_CREDITS.md. No subjective naturalness or exact ear-level latency is claimed.
