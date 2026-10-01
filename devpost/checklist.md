---
doc: checklist
status: approved
---

# Build Checklist

Build mode: learn, explicitly chosen by Diana. Pause for hands-on review after each verified slice; do not advance before the current slice works and is reviewed.

Session resumed at Diana's request during slice 2 listening review. Her feedback confirms natural sweeping pauses and audible positional movement with rain underneath. Full review remains unfinished; complete the remaining listening checks before marking slice 2 complete or advancing.

The five slices below translate the approved technical blueprint. Learn mode and Git are authorized. Slice 1 passed mechanical checks and Diana's listening review, committed as 50964e3. Slice 2 is next; no paid requests.

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

- [ ] **2. Explore the three-layer repeating cafe**
  Becomes usable: Rain, room ambience and cleaning repeat together; one layer can move, disappear and return without disturbing others.
  Why now: Proves the approved scene's useful audible contrast and natural repetition before AI interpretation.
  PRD ref: `prd.md > Playback and Expressive Movement`, `prd.md > Removing Sounds`, `prd.md > Audio Layer Load Failure`
  Spec ref: `spec.md > Repeating Recordings and Catalogue`, `spec.md > Audio Engine and Shared Transport`, `spec.md > Material Risks and Required Proof`
  Build: Source/license remaining recordings, prepare smooth loops and natural cleaning gaps, calibrate mix, implement independent remove/restore and failed-layer retry. Keep marker guidance subtle.
  Verify (mechanical): Verify independent pan/gain paths and mix headroom. Simulate one failed load; others continue and retry affects only that layer. Verify retained positions, stale-load exclusion, and Pause/Resume during a gap. Inspect all audio licence records; check loop boundaries and document what can and cannot be established without human listening.
  Learner check: Hear several repetitions. Move cleaning farther while keeping rain/room fixed. Report distracting repetition, clicks or weak prominence changes; try remove/restore. Fix the weak layer before proceeding.
  Commit: `Add independent repeating cafe layers`

- [ ] **3. Describe a scene and hear a validated AI interpretation**
  Becomes usable: A description produces a genuine proposed arrangement with provenance and preserved unsupported notes; failure retains the original text.
  Why now: Connects real AI to the already-proven sound interaction and tests fidelity before model selection.
  PRD ref: `prd.md > Scene Interpretation and Provenance`, `prd.md > Unsupported Sounds`, `prd.md > No Playable Matches`, `prd.md > Initial Interpretation Failure`
  Spec ref: `spec.md > Local AI Helper and Validation`, `spec.md > External AI Contract, Models and Budget`, `spec.md > Small Model Comparison`
  Build: Implement bounded local helper, key isolation, schemas/validators, cost reservations and ledger. Verify API contract/pricing/account access before real calls. Compare five invented scenes across Sol/Luna, with no automatic retries; stage minimal reflection cases for the next slice. Keep prepared test mode visibly distinct.
  Verify (mechanical): Test unknown/duplicate IDs, malformed/out-of-range output, evidence validation, no-match rule, request exclusions, stale results, refusals/timeouts and preservation of text. Verify no credentials in browser and budget accounting survives restart. Log actual usage/latency for bounded real tests and compare semantic results, not just valid JSON.
  Learner check: Describe the cafe, hear the arrangement and reshape it. Review both models' interpretations, including unsupported and negated sounds; help choose the model based on useful interpretation quality.
  Commit: `Connect validated scene interpretation`

- [ ] **4. Preserve the writer's choices and reopen them**
  Becomes usable: Optional requested reflection stays writer-controlled; saved scenes reopen with arrangement, notes, removals and review state intact.
  Why now: Adds the useful lasting outcome after the core creative experience works.
  PRD ref: `prd.md > Writer-Approved Reflection`, `prd.md > Save and Reopen Blueprint`, `prd.md > Saved Scenes`, `prd.md > Save Failure`
  Spec ref: `spec.md > Reflection and Writer Ownership`, `spec.md > Blueprint Repository and Saved Scenes`, `spec.md > Data Model and Lifetime`
  Build: Add explicit Suggest reflection and use/edit/dismiss behavior, minimal change payload, needsReview flag and localStorage save/list/open. Never invoke AI automatically after map changes. Run the planned two reflection cases for each comparison model within the same total 14-call evaluation allowance.
  Verify (mechanical): Test exclusion of description/reflection/blueprint from reflection requests, stale reply protection, failure/blank save, non-blocking review and no automatic calls on map change. Round-trip all blueprint fields; reopen/edit/save retains one ID. Force storage failure, verify memory remains intact and leaving warns. Confirm no autoplay or AI request on reopening.
  Learner check: Request a suggestion intentionally, edit or reject it, move a sound and save despite needsReview. Close/reopen; verify all choices remain and repeat Save updates the same scene.
  Commit: `Save writer-owned sonic blueprints`

- [ ] **5. Verify and polish the complete creative journey**
  Becomes usable: The complete local proof is coherent, tested and ready for hands-on review and demo preparation.
  Why now: Polish the approved journey after all behaviors work, without adding features.
  PRD ref: `prd.md > The Core Journey`, `prd.md > Governing Product Priority`, `prd.md > Other States`
  Spec ref: `spec.md > Verification and Build Order After Approval`, `spec.md > Look and Feel`, `spec.md > Important Failure Modes`
  Build: Fix integration issues, keyboard/focus/readability and unobtrusive support UI. Finish README, licence credits and recording instructions. Keep hosting/export/advanced audio deferred.
  Verify (mechanical): Clean local start at documented origin, targeted tests and build pass, full PRD behavior walkthrough including failure fixtures, repository privacy/asset review, no paid requests on movement/save/open, and screen/audio capture check. Distinguish technical checks from learner listening evidence.
  Learner check: Explore freely and try awkward inputs; ideally have another writer make a creative choice and explain it. Report confusing or broken behavior and desired refinements before readiness is confirmed.
  Commit: `Polish and verify the complete sound-map journey`

## Hands-on Checkpoints

Slice 1 passed four Node tests, production build, automated Edge/OfflineAudioContext checks and Diana's repeated listening review. No fixes requested. Checkpoint 50964e3. Slice 2's three-layer listening review remains required.

- [ ] Early usable behavior explored — slice 1 immediate/smooth movement and slice 2 natural cafe loop listening before AI integration
- [ ] Integrated real interpretation and creative choices explored — slice 3 model comparison
- [ ] Final kick-the-tires exploration and feedback completed

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — follow a marker move through two or three actual code locations, connecting AI versus browser responsibilities
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: Not started.
Route and stops: To be drawn from actual finished code.
Edit outcome: Not offered yet.
Reflection: Not offered yet; any personal answer belongs in ignored learner-profile.md.
Activity mode: Planned live app/editor tour, adapted to Diana's preference.

## Revisions

- Diana approved retaining the Cleaning-only 6 dB extra outer attenuation after listening. Its meaning is more distant/secondary within the same cafe, not outdoors or behind a wall. Rain and Room stay unchanged; this does not generalize the curve to other sounds. Continue outstanding Step 2 learner checks.

- During slice 2 review, Diana found Cleaning too prominent at the edge and authorized a Cleaning-only listening trial: preserve the inner half and ease in an additional 6 dB reduction toward the edge. Rain/Room, pan and timing are unchanged. Await listening feedback before adopting or generalizing this curve.

- npm was absent from PATH; npm 12.2.0 is installed only in ignored .local/tooling. README documents its launch command plus normal npm commands for a fresh checkout. No system-wide installation.
- First source is an unchanged licensed Ogg recording, decoded once with mono/crossfade/calibration prepared in memory. This preserves the spec's predecoded playback approach without introducing an audio conversion dependency; WAV was a preference, not a requirement.
- Slice 1 has no local AI helper because no AI call is needed to prove movement. Vite runs alone at the approved fixed origin; the helper arrives with real interpretation in slice 3.
