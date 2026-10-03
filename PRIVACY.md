# Data and local operation

This proof of concept is intended for invented, non-sensitive scenes.

| Action | Data flow |
|---|---|
| Create sound map, live mode | Description, available-sound catalogue, instructions and response schema go through the local Node helper to OpenAI. |
| Suggest reflection, live mode | Changed sound labels, before/after pan and prominence, and removals go to OpenAI. Original scene, existing reflection and full blueprint are excluded. |
| Move, play, pause, remove, restore | Browser-local state and audio only; no AI request. |
| Save / Open | Blueprint stored in localStorage in this browser at this exact origin. No AI request or cloud sync. |
| Prepared test mode | Fixed responses; no paid AI request. This is labelled in the interface. |

AI requests use store:false. This application setting is not a guarantee of zero provider retention. There is no microphone recording, audio upload, account system or analytics in the app.

Saved blueprints include descriptions, sources, positions, provenance, removed sounds and the writer's reflection/review state. Anyone able to use the same browser profile may access them. Clearing site data removes them; changing ports or browsers opens a different local store. Unsaved work lives in memory and may be lost when closing the page. Saving failure preserves that memory but does not create a backup.

The API key stays in the local helper's ignored .env, never in a VITE_ variable or client bundle. Keep .env and .local private. The ignored cost ledger records usage and reservations, not scene text. Local development/evaluation fixtures may contain invented test material; do not publish raw local evidence without review.

The helper binds to loopback and validates origin, host, input limits and structured results. This local prototype is not a hardened public service; public hosting is deferred. Do not expose its development ports to the internet.
