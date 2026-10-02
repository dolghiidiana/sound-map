# Sound Map — a writer's scene

Local creative prototype: describe an invented scene, receive an AI-proposed sound map, press Play, and move sounds to hear the atmosphere change. Step 2 is reviewed and committed. Step 3 interpretation integration passed mechanical verification and Diana's hands-on review; it is not the complete product. Reflection and saved blueprints arrive in Step 4.

The cafe scene is the proof-of-concept example, not the whole product. The broader vision is a writer exploring a scene through adjustable sound relationships. This build is deliberately limited to three recordings; broader audible scene coverage remains future work.

## Run

Node24 is required. On this computer, run `start.ps1` or:

```powershell
node .local/tooling/package/bin/npm-cli.js run dev
```

For a fresh checkout with npm: `npm ci`, copy `.env.example` to `.env`, then `npm run dev`. The default template uses mock mode and needs no key. Use the prepared example button in mock mode; other descriptions deliberately fail instead of pretending a fixture is an AI interpretation.

Open **http://127.0.0.1:5173**. The launcher runs Vite and the helper on fixed loopback ports5173/3001 in one Node process. Stop with Ctrl+C. If a port is occupied, stop the previous Sound Map process; don't silently change the origin. `npm run build` checks the browser bundle; the production bundle alone does not run the AI helper.

## Live interpretation

The private .env contains OPENAI_API_KEY, OPENAI_MODEL=gpt-6-luna, AI_MODE=live and AI_BUDGET_CAD=10. Never prefix secrets with VITE_. Never share or commit .env. Restart after changing helper settings. Luna is provisional for interpretation based on devpost/model-comparison-v1.md and devpost/distance-retest-v2.md; reflection is not assigned a model until separately evaluated.

Only Create sound map makes a paid request. It sends the description plus the compact catalogue, interpretation instructions and schema to OpenAI Responses, with store:false and no conversation history or audio upload. This is not a promise of zero provider retention. Use invented/non-sensitive descriptions. Browser movement, playback and Remove/Restore do not invoke AI.

The helper checks local Origin/Host, JSON type, body/input limits, trusted catalogue IDs and provenance. It rejects malformed replies and preserves input on failure. No automatic retries or secret-bearing provider errors are displayed. A cancelled request can still be billable.

## Budget

Existing local ledger `.local/ai-usage.jsonl` is ignored by Git. It records reservations and actual token usage, without scene text. One request at a time under an exclusive lock. CAD0.25 is reserved conservatively before a request; returned usage replaces the reservation with a cost estimate. Unconfirmed usage remains reserved and blocks further paid calls until reviewed. Missing/corrupt ledger fails closed, never resets spending to zero. On a fresh checkout, stay in mock mode until the prior ledger is restored or a genuinely new zero-usage ledger is deliberately initialized.

CAD10 cap; review threshold CAD8. CAD estimates include conservative cache-write, FX1.60 and25% overhead allowances, not invoice-confirmed charges. Keep the ledger when resuming. Do not delete a lock/reservation to force another call without checking what happened.

## What to try

Enter a cafe with rain on the left, someone sweeping farther away on the right and a quiet room hum. Create the map, review its description/provenance, then Play and move a marker. AI chooses initial near/mid/far categories; ordinary code maps them to radii0.20/0.55/0.85. Manual movement is continuous. Horizontal position controls stereo; radial distance controls prominence, not walls or physical room geometry.

Unsupported described sounds remain removable/restorable notes. A wholly unsupported scene stays silent with an Edit option; saving is not built yet. Pause/Resume retains playback progress; Restart keeps positions. A failed audio layer can be retried independently. Sweeping repetition fatigue is recorded for later polish; its timing has not been changed.

## Verification and evidence

`npm test` and `npm run build`. Current Step3 evidence: devpost/slice-3-verification.md. Original connection/comparison reports are preserved. Browser harnesses and raw API results are local ignored evidence. Mechanical checks are not a substitute for the writer's listening review.

Recordings and redistribution licences: AUDIO_CREDITS.md and public/audio/CREDITS.txt. All playback files stay local; attribution and licence obligations still apply to public distribution.
