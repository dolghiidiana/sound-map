# Sound Map — cafe listening study

Slice 1 is reviewed and checkpointed; slice 2 adds rain, quiet room tone and occasional sweeping and awaits listening review. Prepared audio test, **no AI requests**. Not the complete approved product. Saved scenes, descriptions, AI interpretation and reflections are not built yet.

## Run on this computer

Open PowerShell in this folder:

```powershell
node .local/tooling/package/bin/npm-cli.js run dev
```

Open **http://127.0.0.1:5173**. This session uses a project-local npm 12.2.0 because npm was absent from PATH. The ignored `.local/tooling/` is not part of the public source. `start.ps1` provides a shortcut on Diana's computer.

For a fresh checkout with Node 24 and npm installed:

```powershell
npm ci
npm run dev
npm test
npm run build
```

Pinned packages: React/React DOM 19.3.0, Vite 8.3.1, React plugin 6.1.1. See package-lock.json. No API key is needed for this slice.

## Listening check

1. Use headphones at a comfortable volume. The page is silent before Play.
2. Move Rain before playing; Play uses its current position.
3. Drag left/right, then close to/away from the central listening point. You can also focus the marker and use arrow keys (Shift for larger steps).
4. Pause, move the marker and Resume. Audio should continue from its paused moment.
5. Restart intentionally begins the loop again, preserving the arrangement.

The vertical direction has no front/behind meaning. Radial distance changes volume; horizontal position changes stereo pan. A 15 ms smoothing time constant avoids abrupt parameter jumps; device latency still matters. Actual perceived immediacy and naturalness require human listening. The source repeats after a prepared crossfade and is not yet a final cafe asset.

The app decodes the local recording only when Play is first pressed. It reuses the same looping source during moves and Pause/Resume. Restart replaces it. No network calls happen for movement and no data is transmitted to AI.

See [AUDIO_CREDITS.md](AUDIO_CREDITS.md) for the recording's CC BY-SA 3.0 terms. This browser-only first slice intentionally has no API helper yet.

## Slice 2 — three-layer listening review

The current app now contains Rain, Room and Cleaning. Select a marker or its small name button, then move it. Remove applies only to the selected sound; Removed sounds provides Restore at the previous position. A failed file shows Retry for that layer alone.

Rain keeps the reviewed slice-1 pan/gain behavior. Room is a quiet indoor recording. Cleaning uses a real broom recording with quiet gaps; dragging during a gap changes its next audible activity. Keep rain/room fixed and move cleaning while it is audible to compare near/far clearly.

The shared audio clock preserves gap timing across Pause/Resume. Restart begins all loaded layers again while keeping marker positions and removals. Recording files load independently: a slow or failed file cannot block the others. No AI, reflection, saving or interpretation is added in this slice.

Run `npm test` for six focused tests and `npm run build` for the production build. Detailed slice-2 verification is in devpost/slice-2-verification.md. Human listening for a few cycles is still required before the second working checkpoint.
