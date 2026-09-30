# Slice 1 verification — listening review passed

30 September 2026. No AI requests. Only one rain recording; no later slice is built.

## Passed mechanical checks

- Node v24.19.0, npm 12.2.0 locally; pinned dependency install succeeded.
- Four Node tests: circular bounds/finite coordinates, monotonic radial attenuation, constant-radius pan independence, crossfade continuity/finite samples.
- Vite production build succeeded.
- Automated desktop Edge 154.0.4258.37: no AudioContext or recording request before Play; moving before Play affects initial parameters; successful decode and looping playback after user gesture.
- Dragging right changed pan to about 0.814 and reduced gain. Source-start count stayed 1 during dragging and Pause/Resume. No audio/API requests during dragging (browser favicon fetching is unrelated).
- Paused AudioContext clock remained constant. Moving while paused was used on Resume; clock continued. Restart increased source-start count to 2, reset elapsed playback below 0.5 seconds, and retained marker coordinates.
- Actual recording rendered in OfflineAudioContext: left/right extremes routed energy to the expected channel. Far/near energy ratio matched the -18 dB mapping. Prepared duration approximately 25.897 seconds, calibrated peak 0.85, RMS 0.04694, wrap sample difference about 0.00000083. These are numerical checks, not proof of natural sound.
- A forced recording-load failure showed Retry playback without creating a source.
- No page JavaScript/console errors in the final successful run. Desktop screenshot inspected; narrow 390px layout had no horizontal overflow.

## Diana's listening review

Diana tested repeatedly and reported smooth, immediate movement, convincing perceived placement, no noticed clicks, restarts, lag, gaps or dragging discrepancies. Near/far prominence was audible and neither too strong nor too weak. Pause/reposition/Resume and Restart behaved as expected. She requested no fixes and explicitly approved recording this checkpoint and proceeding to slice 2. Her perception of spatial placement is user feedback, not a claim of physical front/behind simulation.

## Limits of the evidence

Perceived immediacy, clicks/roughness, audible left/right placement, useful near/far prominence, comfortable loudness, and whether this recording is pleasant enough to continue with. The automated browser does not establish these subjective outcomes or measure ear-level latency. Multiple-layer independence belongs to slice 2, not this result.

## Evidence and reproduction

Standard project checks: `npm test`, `npm run build`. On this machine use `node .local/tooling/package/bin/npm-cli.js` in place of `npm` if needed. The browser harness and detailed snapshots/screenshots are retained in ignored `.local/browser-check.cjs`, `.local/browser-verification.json`, and `.local/listening-study-*.png`. It uses the bundled Playwright installation; no extra test dependency was added to the project.

Recording SHA-256: `1CDE527E87B77510B532EB60DC5C2D429BF4342F0D9D293F1E7B8C6751A77073`. Source and redistribution terms are documented in AUDIO_CREDITS.md and public/audio/CREDITS.txt.

Mechanical checks and learner review are complete. Slice 1 can be committed and checked; slice 2 is now authorized. No claim of broader listener validation or multi-layer success yet.
