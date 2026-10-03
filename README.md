# Sound Map — a writer's scene

Sound Map is a creative perception tool for writers. A writer describes a scene, and AI proposes audible relationships using the available recordings: which sounds feel close or distant, prominent or in the background, to the left or right.

The writer listens, moves or removes sounds, and explores those relationships to discover the scene they meant. They can save the arrangement and an optional reflection as a sonic blueprint—a creative reference to return to while writing.

## Why this is different

Most AI writing tools return more words. Sound Map uses sound as another way to perceive a scene and make creative decisions. AI proposes an interpretation; the writer remains the author, choosing what to keep, change or remove and what those choices mean.

## The current proof of concept

The café scene is the proof-of-concept example, not the whole product vision. This local prototype uses three recordings: rain, indoor room tone and sweeping. It rearranges available sounds; it does not generate arbitrary audio or implement broader audible scene coverage. Unsupported sounds remain silent blueprint notes rather than being replaced automatically.

Interpretation, reflection and browser-local saved blueprints passed hands-on review. Essential polish and final user review are complete; the prototype is approved for demo preparation. Submission preparation remains.

## Run

Node24 is required. On this computer, open PowerShell in the project folder and run `./start.ps1`. The launcher finds the installed runtime. Alternatively, if Node is on PATH:

```powershell
node .local/tooling/package/bin/npm-cli.js run dev
```

For a fresh checkout with npm: `npm ci`, copy `.env.example` to `.env`, then `npm run dev`. The default template uses mock mode and needs no key. Use the prepared example button in mock mode; other descriptions deliberately fail instead of pretending a fixture is an AI interpretation.

Open **http://127.0.0.1:5173**. The launcher runs Vite and the helper on fixed loopback ports5173/3001 in one Node process. Stop with Ctrl+C. If a port is occupied, stop the previous Sound Map process; don't silently change the origin. `npm run build` checks the browser bundle; the production bundle alone does not run the AI helper.

## Live interpretation

The private .env contains OPENAI_API_KEY, OPENAI_MODEL=gpt-6-luna, AI_MODE=live and AI_BUDGET_CAD=10. Never prefix secrets with VITE_. Never share or commit .env. Restart after changing helper settings. Luna is provisional for interpretation based on devpost/model-comparison-v1.md and devpost/distance-retest-v2.md; Sol is provisional for reflection after its separate comparison (devpost/reflection-comparison-v1.md), configured by OPENAI_REFLECTION_MODEL=gpt-6.1-sol.

In live mode, Create sound map makes a paid interpretation request containing the description plus compact catalogue, interpretation instructions and schema. Suggest reflection makes a separate paid request only when explicitly pressed; it sends changed sound labels, before/after pan and prominence, and removals, never the original description or existing reflection. Both use OpenAI Responses with store:false, no conversation history and no audio upload. This is not a promise of zero provider retention. Use invented/non-sensitive descriptions. Browser movement, playback, Remove/Restore, Save and Open do not invoke AI. See PRIVACY.md.

The helper checks local Origin/Host, JSON type, body/input limits, trusted catalogue IDs and provenance. It rejects malformed replies and preserves input on failure. No automatic retries or secret-bearing provider errors are displayed. A cancelled request can still be billable.

## Budget

Existing local ledger `.local/ai-usage.jsonl` is ignored by Git. It records reservations and actual token usage, without scene text. One request at a time under an exclusive lock. CAD0.25 is reserved conservatively before a request; returned usage replaces the reservation with a cost estimate. Unconfirmed usage remains reserved and blocks further paid calls until reviewed. Missing/corrupt ledger fails closed, never resets spending to zero. On a fresh checkout, stay in mock mode until the prior ledger is restored or a genuinely new zero-usage ledger is deliberately initialized.

CAD10 cap; review threshold CAD8. CAD estimates include conservative cache-write, FX1.60 and25% overhead allowances, not invoice-confirmed charges. Keep the ledger when resuming. Do not delete a lock/reservation to force another call without checking what happened.

## What to try

Enter a cafe with rain on the left, someone sweeping farther away on the right and a quiet room hum. Create the map, review its description/provenance, then Play and move a marker. AI chooses initial near/mid/far categories; ordinary code maps them to radii0.20/0.55/0.85. Manual movement is continuous. Horizontal position controls stereo; radial distance controls prominence, not walls or physical room geometry.

Unsupported described sounds remain removable/restorable notes. A wholly unsupported scene stays silent with an Edit option; Save blueprint without audio preserves it. Pause/Resume retains playback progress; Restart keeps positions. A failed audio layer can be retried independently. Sweeping repeats about every 24 seconds following listening review. Rain is accepted for this prototype but can sound exposed rather than heard through closed windows; distance reduces prominence without simulating a wall or window.

The temporary free review preview at port5175 is separate from the standard app at5173. Saved scenes belong to their browser and exact origin: changing browser or port does not carry them over. Do not clear site data to troubleshoot missing scenes.

For a concise demo outline see devpost/DEMO.md; for the code reference and learning recap open devpost/app-map.html directly in a browser. No hosting or build step is needed for that map.

## Reflection and saved scenes

Below the map, write an optional reflection or request a separate AI proposal. Use suggestion explicitly to adopt it; edits and dismissals remain yours. Map changes preserve existing text and mark it for non-blocking review. Saving does not clear that review flag. A failed or pending reflection never blocks Save.

Save blueprint stores the description, provenance, positions, removals, unsupported notes and reflection in this browser on this device. Back to scenes opens the entry screen; expand Saved scenes to reopen silently. Saving an opened scene updates the same entry. Clearing site data removes these blueprints; this is not cloud backup. Storage failure retains the in-memory scene and offers Retry. Browser leave warnings are best-effort.

## Verification and evidence

`npm test` and `npm run build`. Current Step3 evidence: devpost/slice-3-verification.md. Original connection/comparison reports are preserved. Browser harnesses and raw API results are local ignored evidence. Mechanical checks are not a substitute for the writer's listening review.

Recordings and redistribution licences: AUDIO_CREDITS.md and public/audio/CREDITS.txt. All playback files stay local; attribution and licence obligations still apply to public distribution.

### Reflection ownership regression

`npm run test:reflection-ui` runs the actual interface in isolated headless Edge with mock API responses; it never starts the live helper or loads .env. It covers Suggest -> Use -> Clear -> Suggest again, response timing, double clicks, stale replies and saving an unaccepted proposal. It requires an existing Playwright installation and Edge. If Playwright is outside this project's module search path, set PLAYWRIGHT_MODULE to that installation's index.js; TEST_BROWSER_CHANNEL optionally selects another installed Chromium channel. No dependency is installed automatically. The normal `npm test` suite remains independent of browser tooling.
