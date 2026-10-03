---
doc: checklist
status: approved
---

# Build Checklist

Build mode: learn, explicitly chosen by Diana. Pause for hands-on review after each verified slice; do not advance before the current slice works and is reviewed.

Diana approved Step 3 after the integrated writer journey review on October 2. Step 4 was approved by Diana on October 2; group technical checks and pause for meaningful product review rather than individual micro-checks.

The five slices below translate the approved technical blueprint. Learn mode and Git are authorized. Slice 1 passed mechanical checks and Diana's listening review, committed as 50964e3. Slice 2 passed, checkpoint 2eb48da; Step3 integration passed hands-on review; purposeful paid interpretation tests are recorded in the local ledger.

## Slices

- [x] **1. Move one sound and immediately hear it change**
  Becomes usable: A local, calm circular map with one licensed recording, Play/Pause/Resume/Restart, and an expressive movable marker. Prepared test arrangement is clearly labelled.
  Why now: Proves the central audio risk before investing in the surrounding product; includes setup rather than a separate scaffolding step.
  PRD ref: `prd.md > Playback and Expressive Movement`, `prd.md > Look and Feel`
  Spec ref: `spec.md > Sound Map and Movement Mapping`, `spec.md > Audio Engine and Shared Transport`, `spec.md > Where It Runs and How Someone Tries It`, `spec.md > Design Priorities Carried into Build`
  Build: Resolve npm availability, pin minimal dependencies, verify licence and source for one recording, implement the single-layer map and transport with subtle rings. No AI calls, auto-play, realistic-room claims or administrative UI.
  Verify (mechanical): Start at fixed local origin; run production build and mapping tests. In browser verify silence until Play, valid marker bounds, smooth AudioParam updates with stable source nodes, before-Play/paused movement, Resume continuity and Restart. Confirm no network requests while dragging and inspect console for errors. Inspect asset licence evidence.
  Learner check: On headphones, press Play and move the marker left/right and nearer/farther. Try Pause, move, Resume and Restart. Report whether movement feels immediate, smooth and creatively understandable.
  Commit: `Prove single-sound interactive map`

- [x] **2. Explore the three-layer repeating cafe**
  Becomes usable: Rain, room ambience and cleaning repeat together; one layer can move, disappear and return without disturbing others.
  Why now: Proves the approved scene's useful audible contrast and natural repetition before AI interpretation.
  PRD ref: `prd.md > Playback and Expressive Movement`, `prd.md > Removing Sounds`, `prd.md > Audio Layer Load Failure`
  Spec ref: `spec.md > Repeating Recordings and Catalogue`, `spec.md > Audio Engine and Shared Transport`, `spec.md > Material Risks and Required Proof`
  Build: Source/license remaining recordings, prepare smooth loops and natural cleaning gaps, calibrate mix, implement independent remove/restore and failed-layer retry. Keep marker guidance subtle.
  Verify (mechanical): Verify independent pan/gain paths and mix headroom. Simulate one failed load; others continue and retry affects only that layer. Verify retained positions, stale-load exclusion, and Pause/Resume during a gap. Inspect all audio licence records; check loop boundaries and document what can and cannot be established without human listening.
  Learner check: Hear several repetitions. Move cleaning farther while keeping rain/room fixed. Report distracting repetition, clicks or weak prominence changes; try remove/restore. Fix the weak layer before proceeding.
  Commit: `Add independent repeating cafe layers`

- [x] **3. Describe a scene and hear a validated AI interpretation**
  Becomes usable: A description produces a genuine proposed arrangement with provenance and preserved unsupported notes; failure retains the original text.
  Why now: Connects real AI to the already-proven sound interaction and tests fidelity before model selection.
  PRD ref: `prd.md > Scene Interpretation and Provenance`, `prd.md > Unsupported Sounds`, `prd.md > No Playable Matches`, `prd.md > Initial Interpretation Failure`
  Spec ref: `spec.md > Local AI Helper and Validation`, `spec.md > External AI Contract, Models and Budget`, `spec.md > Small Model Comparison`
  Build: Implement bounded local helper, key isolation, schemas/validators, cost reservations and ledger. Verify API contract/pricing/account access before real calls. Compare five invented scenes across Sol/Luna, with no automatic retries; stage minimal reflection cases for the next slice. Keep prepared test mode visibly distinct.
  Verify (mechanical): Test unknown/duplicate IDs, malformed/out-of-range output, evidence validation, no-match rule, request exclusions, stale results, refusals/timeouts and preservation of text. Verify no credentials in browser and budget accounting survives restart. Log actual usage/latency for bounded real tests and compare semantic results, not just valid JSON.
  Learner check: Describe the cafe, hear the arrangement and reshape it. Review both models' interpretations, including unsupported and negated sounds; help choose the model based on useful interpretation quality.
  Commit: `Connect validated scene interpretation`

- [x] **4. Preserve the writer's choices and reopen them**
  Becomes usable: Optional requested reflection stays writer-controlled; saved scenes reopen with arrangement, notes, removals and review state intact.
  Why now: Adds the useful lasting outcome after the core creative experience works.
  PRD ref: `prd.md > Writer-Approved Reflection`, `prd.md > Save and Reopen Blueprint`, `prd.md > Saved Scenes`, `prd.md > Save Failure`
  Spec ref: `spec.md > Reflection and Writer Ownership`, `spec.md > Blueprint Repository and Saved Scenes`, `spec.md > Data Model and Lifetime`
  Build: Add explicit Suggest reflection and use/edit/dismiss behavior, minimal change payload, needsReview flag and localStorage save/list/open. Never invoke AI automatically after map changes. Run the planned two reflection cases for each comparison model within the remaining CAD10 budget. Evaluate reflection separately; do not inherit provisional interpretation model Luna automatically. Prior extra connection/distance/integration calls are recorded and count toward the same budget.
  Verify (mechanical): Test exclusion of description/reflection/blueprint from reflection requests, stale reply protection, failure/blank save, non-blocking review and no automatic calls on map change. Round-trip all blueprint fields; reopen/edit/save retains one ID. Force storage failure, verify memory remains intact and leaving warns. Confirm no autoplay or AI request on reopening.
  Learner check: Request a suggestion intentionally, edit or reject it, move a sound and save despite needsReview. Close/reopen; verify all choices remain and repeat Save updates the same scene.
  Commit: `Save writer-owned sonic blueprints`

- [x] **5. Verify and polish the complete creative journey**
  Becomes usable: The complete local proof is coherent, tested and ready for hands-on review and demo preparation.
  Why now: Polish the approved journey after all behaviors work, without adding features.
  PRD ref: `prd.md > The Core Journey`, `prd.md > Governing Product Priority`, `prd.md > Other States`
  Spec ref: `spec.md > Verification and Build Order After Approval`, `spec.md > Look and Feel`, `spec.md > Important Failure Modes`
  Build: Fix integration issues, keyboard/focus/readability and unobtrusive support UI. Finish README, licence credits and recording instructions. Keep hosting/export/advanced audio deferred.
  Verify (mechanical): Clean local start at documented origin, targeted tests and build pass, full PRD behavior walkthrough including failure fixtures, repository privacy/asset review, no paid requests on movement/save/open, and screen/audio capture check. Distinguish technical checks from learner listening evidence.
  Learner check: Explore freely and try awkward inputs; ideally have another writer make a creative choice and explain it. Report confusing or broken behavior and desired refinements before readiness is confirmed.
  Commit: `Polish and verify the complete sound-map journey`

## Hands-on Checkpoints

Slice 1 passed four Node tests, production build, automated Edge/OfflineAudioContext checks and Diana's repeated listening review. No fixes requested. Checkpoint 50964e3. Slice 2 listening and transport review passed.

- [x] Early usable behavior explored — slice 1 immediate/smooth movement and slice 2 natural cafe loop listening before AI integration
- [x] Integrated real interpretation and creative choices explored — slice 3 model comparison
- [x] Final kick-the-tires exploration and feedback completed

## Final Review

Polish boundary approved October 2: essential items first, optional work deferred. Evaluate Rain and sweeping before proposing changes; no automatic asset replacement or timing edits. Provide a current usage/time estimate before starting.

- [x] Demo framing: introduce the cafe as the proof-of-concept example of the writer-focused Sound Map, clearly distinguish broader potential from the current three-recording capability, and avoid implying unproven atmospheric impact. No scope or library expansion required.

- [x] Review creative impact and demo design: Diana hears movement but the overall scene remains broadly similar; a strong atmospheric transformation is not yet demonstrated. Assess with her during polish without assuming more complex audio is the answer.

- [x] Review Rain recording: sounds exposed/direct rather than heard indoors through closed cafe windows. Treat as asset/acoustic-character feedback, separate from AI placement.

- [x] Assess repeated sweeping fatigue during final polish: Diana found it a little annoying after many test loops. Consider longer quiet gaps or less frequent activity if needed; no audio change made yet.

- [x] Make Remove easier to notice and read: Diana found the small control too subtle. Keep the map central.

- [x] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [x] Learning activity complete — actual sweeping timing change and before/after listening, with a recap connecting AI versus browser responsibilities; reference code route supplied, not toured
- [x] Optional edit addressed through the retained timing change. Optional transfer reflection offered at handoff; no answer required or recorded.
- [x] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: Sweeping repetition feedback became one gap adjustment, mechanically checked and accepted by Diana after listening. Recap and app map provided October 3.
Route and stops: Reference only: SceneView.move -> soundParameters -> AudioEngine.setPosition/applyPosition/smooth.
Edit outcome: 14-second trailing gap retained, approximately 24-second total cycle. No extra exercise needed.
Reflection: Optional transfer question offered at handoff; answer not required. No personal learning claim made.
Activity mode: Evidence-based recap of completed build practice, not an interactive code tour.

## Revisions

- Diana approved retaining the Cleaning-only 6 dB extra outer attenuation after listening. Its meaning is more distant/secondary within the same cafe, not outdoors or behind a wall. Rain and Room stay unchanged; this does not generalize the curve to other sounds. Remove/Restore and transport subsequently passed; Step 2 approved.

- During slice 2 review, Diana found Cleaning too prominent at the edge and authorized a Cleaning-only listening trial: preserve the inner half and ease in an additional 6 dB reduction toward the edge. Rain/Room, pan and timing are unchanged. Subsequently approved for Cleaning only; do not generalize it.

- npm was absent from PATH; npm 12.2.0 is installed only in ignored .local/tooling. README documents its launch command plus normal npm commands for a fresh checkout. No system-wide installation.
- First source is an unchanged licensed Ogg recording, decoded once with mono/crossfade/calibration prepared in memory. This preserves the spec's predecoded playback approach without introducing an audio conversion dependency; WAV was a preference, not a requirement.
- Slice 1 has no local AI helper because no AI call is needed to prove movement. Vite runs alone at the approved fixed origin; the helper arrives with real interpretation in slice 3.

## October 3 essential polish evidence

Retained approximately 24-second sweeping cycle after Diana's listening approval; Rain accepted for prototype, especially farther away. Remove now noticed and useful. These review items are resolved; preceding descriptions preserve the original feedback. Code checkpoint aabae12.

30 tests and production build pass. Isolated mock browser save/reload/reopen/update journey passes; no POSTs from moving/saving/opening. 390px layout and offline script-free app map checked visually. Standard start.ps1 successfully starts mock mode on5173/3001. Screen/system-audio capture deferred with final video production; instructions in DEMO.md, not claimed tested.

Learning recap uses the actual timing adjustment plus Diana's before/after listening. Reference code route is in app-map.html; no interactive code tour claimed. No additional coding exercise required to repeat that activity. Final whole-product exploration/readiness remains pending; Step5 not checked prematurely.

## Final approval — October 3

Diana explored naturally, reported nothing confusing or broken, and explicitly called the prototype ready for demo preparation. Build and final review complete. The cafe remains a limited proof of concept; dramatic atmosphere transformation is not claimed. No further functionality requested. Screen/system-audio capture moves to demo preparation under the approved video deferral; this checklist does not claim capture has passed. Next official step:6-ship, not yet started.
