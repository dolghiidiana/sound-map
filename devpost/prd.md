---
doc: prd
status: approved
---

# Sound Map for a Writer's Scene — Product Requirements

Working descriptive label; final name undecided. A writer hears and reshapes an interpretation of one scene, then saves a sonic blueprint as a writing reference.
Source: scope.md > Who It's For; The Unique Kernel.

## The Core Journey

### Governing Product Priority

PRD approved by Diana on September 30, 2026, with no additional functionality requested. The creative sound-map experience remains the center of the product: describe a scene -> AI interprets it -> hear the interpretation -> move or change something -> immediately hear the scene differently.

Give that interaction the most attention in technical feasibility, design, and polish. Saving, recovery, reflection, and limitation handling remain lightweight, unobtrusive supporting features; they must not turn the experience into an administrative workflow. Carry this priority into the technical plan and build without adding scope.

Source: scope.md > The Core Loop; What "Working" Looks Like.

1. The writer opens a quiet invitation to describe a scene, enters a short description, and requests a sound map.
2. The result presents labeled sounds around a central listening point, with a short explanation. Described sounds and AI suggestions are visibly distinct. Unsupported sounds remain visible as notes.
3. The writer presses Play; audio never starts automatically.
4. While listening, the writer moves sound sources to change left/right position and near/far presence, and can remove sounds. Changes are audible immediately.
5. Before saving, AI proposes a short reflection on the changes. The writer can accept it, edit it, replace it, or delete it completely.
6. Save blueprint preserves the scene, final arrangement, provenance, removed sounds, unsupported notes, and only the writer-approved reflection. The writer can reopen the blueprint in the app.

## Screens and Layout

### Describe the Scene

A simple title or invitation, one large centered text area, a short example beneath it, and one clear primary action: Create sound map. No dashboard, menus, or settings-heavy first screen.

Create sound map remains disabled while the description is empty or contains only whitespace. Its inactive state is visually clear but gentle. Entering descriptive text activates it; no empty-field error message is needed. This is a non-whitespace check, not an AI judgment of the writing's quality or an unspecified minimum length.

Acceptance: empty and spaces-only input leave the button disabled; entering a scene description enables it; clearing the field disables it again without an error message.

Example supplied by Diana: "A nearly empty café near closing time. Rain against the windows. Staff cleaning somewhere in the background."

### Explore the Sound Map

The map is the main result, with sound sources around a central listening point. Each has a simple label and clearly visible origin: described by the writer or suggested by AI. A short plain-language interpretation sits nearby. One clear Play control initiates listening. The experience should communicate: "This is how the AI heard my scene, and now I can change it."

### Review and Save

One short editable reflection field is sufficient; a separate reflection flow is unnecessary. Saved scenes provides reopening through a small list, not a project-management dashboard. Precise placement is a visual-layout refinement, not an additional workflow.

## Look and Feel

Calm, creative, immediately understandable, quiet, spacious, slightly cinematic, and focused on imagination. It should feel like entering a creative space. Avoid productivity-dashboard styling and prominent technical audio controls. Specific colors and typography have not been selected; later recommendations must preserve this established direction.

## Features and Behavior

### Scene Interpretation and Provenance

Source: scope.md > The Unique Kernel; The POC Boundary.

AI proposes sound sources and relationships from one description using a small licensed library. It explains the arrangement briefly. Suggested additions are not represented as the writer's words or actual memories.

Acceptance: a result distinguishes explicit sounds from suggestions before playback. An added room hum, for example, is visibly marked suggested. The explanation must not promise behind-the-listener audio.

### Playback and Expressive Movement
 
Initial-interpretation failure behavior is defined under States and Boundaries.


Source: scope.md > The POC Boundary; Risks to Resolve.

The map expresses relationships, not a physically accurate room. Left/right placement changes the stereo position. Moving farther from the listening point reduces presence, primarily through volume; moving closer makes the sound more prominent. Simple filtering or reverberation is conditional on feasibility and perceptual usefulness, not a promised effect. No realistic behind-you positioning.

Acceptance: there is silence until Play is pressed. During playback, moving a source produces an immediately audible corresponding change. The core proof uses a small scene with three to five layers, not unlimited sound generation.

The map remains editable before Play, during playback, and while paused, without separate editing modes. Before Play, marker movement shapes the arrangement silently; pressing Play uses the current positions. While paused, the writer can reposition sounds and then resume to hear that updated arrangement. Live movement during playback continues to produce immediate audible changes.

Acceptance: move a marker before Play and verify playback uses its new position; pause, move it again, and verify resumed playback uses the latest position. No editing-mode switch is required.

Pause preserves the playback position. Resume continues from that point using the current arrangement. A separate Restart control begins playback from the start of the scene using the current arrangement. Keep Play/Pause/Resume and Restart simple and visually unobtrusive.

Acceptance: pause partway through a scene, adjust a marker, and resume; playback continues from the paused point with the updated position. Restart begins the scene from the start rather than restoring the AI's original arrangement.

### Unsupported Sounds

Source: scope.md > Risks to Resolve.

An unavailable described sound stays visible with its origin and an explicit playback limitation, for example: "Church bell — described by you. Not available in the current sound library." It can remain in the saved blueprint as a sound note. Never silently replace or discard it.

Acceptance: an unavailable church bell is visibly unsupported, makes no substituted sound, and is retained in the saved blueprint if kept. The first version does not need substitute suggestions or previews.

### No Playable Matches

If none of the described sounds can be played, present a constructive explanation and visible blueprint notes rather than an empty, apparently broken map. Preserve the described sounds and their origin. Do not automatically invent substitute sounds to fill the scene.

Suggested wording supplied by Diana: "We couldn't find playable matches for this scene yet. Your described sounds are still preserved. You can revise the scene or save it as a silent blueprint."

Offer two actions: edit the scene description and try again, or save the scene as a blueprint without audio. A silent blueprint is a valid fallback; it does not replace the audible core demonstration for supported scenes.

Acceptance: a description with no playable matches produces the explanation, retained sound notes with provenance, and both actions. Editing allows revision and another attempt; saving preserves the description and notes without claiming playable audio.

### Audio Layer Load Failure

If one sound cannot load during playback, the other layers continue normally. Clearly mark the failed source on the map as temporarily unavailable, for example: "Rain — couldn't load." Provide a Retry action for that sound alone; retry must not restart the whole scene or disturb the arrangement or other playing sounds.

If retry fails, retain the sound visibly as part of the intended scene and blueprint, but keep it silent. Do not replace it automatically. This is a temporary playback failure, distinct from an unsupported sound with no library match.

Acceptance: fail one layer while others play; those layers continue, all positions remain unchanged, and the failed layer shows its status and retry action. Retrying affects only that layer. Repeated failure preserves its identity and intended placement without a substitute.

### Removing Sounds

The writer can remove a source from the final audible scene. It moves into a small Removed sounds area rather than disappearing. Each entry has a simple Restore action that returns it to the map. Preserve its previous position where feasible; this is the preferred restoration behavior, not a new history feature. The saved blueprint records removed sounds rather than losing the creative decision.

Acceptance: removing a playing source removes it from the active map and audible mix and places it in Removed sounds. Restore returns that source to the map with its provenance preserved, preferably at its previous position. No complicated history system or undo stack is included. Removal should feel safe and reversible without cluttering exploration.

### Writer-Approved Reflection

Source: scope.md > The Unique Kernel; What "Working" Looks Like.

AI proposes one short reflection combining observable changes with tentative possible meaning. Example: "You moved the cleaning sounds farther away and made the rain more prominent. This may make the scene feel more isolated and inward."

The writer can accept, edit, replace, or delete it. The app must not claim to know intention. A blank reflection is valid. Only the version approved through the writer's save action is preserved as the final why.

Acceptance: rewriting or deleting the suggestion changes what is saved; rejected AI wording does not reappear as the approved reflection.

Reflection is optional support, not a requirement for a complete blueprint. If AI cannot generate a suggestion, show a small non-blocking message: "Reflection suggestion wasn't available. You can add your own or save without one." The writer can write their own reflection or leave it blank and save normally. Preserve any existing writer text when a request fails.

Acceptance: an unsuccessful reflection request does not prevent saving, discard existing reflection text, or mark the scene incomplete. A writer-entered reflection or a blank reflection can be saved without a successful AI response.

If the map changes after the writer edits their reflection, preserve the existing text visibly and mark it as needing review. Suggested notice supplied by Diana: "You changed the sound map after writing this reflection. Review it before saving."

The writer can keep the reflection as-is, edit it, clear it, or explicitly request a new AI suggestion based on the updated map. Never automatically overwrite the writer's reflection. The writer owns the final meaning; the app only notices that the underlying scene changed.

Review is non-blocking. Keep the needs-review marker visible and show a lightweight reminder near Save. If the writer chooses Save, allow it without a confirmation dialog and preserve the reflection exactly as written. Saving does not establish that the reflection was reviewed against the updated map; do not imply otherwise. The experience should remain creative and fluid rather than administrative.

Acceptance: changing the map leaves reflection text intact and shows the review notice. A fresh AI suggestion is requested only by the writer. Keeping, editing, and clearing remain available without requiring new AI output.

Acceptance: Save succeeds with the needs-review reminder present, without a blocking review dialog; the saved reflection matches the visible text exactly.

### Save and Reopen Blueprint

Source: scope.md > The Core Loop; What "Working" Looks Like.

Required contents:
- Original description.
- Final sources kept and their described/suggested origin.
- Final left/right and near/far relationships.
- Removed sounds.
- Unsupported sounds retained as notes.
- Writer-approved reflection, including an intentionally blank reflection.

Acceptance: reopening restores the saved arrangement, provenance, notes, removed sounds, and approved reflection so the writer can continue from the same creative state after closing the app and returning another day. Readable document or image export is desirable later, not required for this first proof.

### Save Failure

If saving fails, keep the writer on the current scene with all in-memory work intact, including positions, notes, removed sounds, and reflection. Show a calm specific message: "We couldn't save this blueprint yet. Your scene is still here."

Offer Retry save and allow continued editing before another attempt. If the writer chooses to leave, clearly warn that current unsaved changes may be lost. Do not clear the map, reset the reflection, navigate back to the beginning, or claim success. Preserving in-memory state and offering Retry is sufficient for this version; no draft recovery system is required.

Acceptance: force a save failure and confirm the visible scene and reflection are unchanged, editing still works, and Retry is available. Leaving after failure warns about unsaved changes. This warning is distinct from the non-blocking reflection-review reminder.

### Saved Scenes

Saving changes to an opened scene updates that existing scene, rather than automatically creating a duplicate. The first save creates the entry; subsequent saves of that scene retain its identity and replace its saved creative state. Version history and a separate Save as new version action are deferred. Acceptance: reopen, edit, save, and reopen again; the same list entry contains the revised state without an extra entry.

A simple Saved scenes area lists saved blueprints with a scene title or the first line of its description, the date saved, and an Open action. Opening restores the sound map, saved positions, unsupported notes, removed sounds, and writer-approved reflection.

For a browser-based first version, Diana accepts saving locally on that device, with the limitation clearly explained. Accounts, cloud sync, folders, search, and complex project management are outside this proof of concept. The exact placement of Saved scenes should respect the quiet description-first opening.

Acceptance: save a scene, close the app, return using the same browser on that device, find its list entry, and Open it to restore the saved creative state. Local saving must not be presented as cloud backup or cross-device access.

## States and Boundaries

### Initial Interpretation Failure

If the initial interpretation fails before a map appears, keep the writer on the scene-description screen with their original text intact. Show a short specific message rather than a technical error screen or vague failure notice. Diana's wording: "We couldn't create a sound map for this scene right now. Your description is still here — you can try again or revise it."

The writer can retry the same description, edit it and retry, or leave the failed attempt without losing what they typed during the current session. Do not invent an undisclosed fallback interpretation. An unfinished description does not need to survive closing the browser. Persistence is focused on intentionally saved scenes; draft autosave is deferred unless later user needs justify it.

Acceptance: a failed interpretation leaves the input unchanged and editable, visibly explains that map creation failed, and permits a deliberate retry. No fabricated successful result is shown.

### Other States

- First use: invitation, empty description field, example, primary action.
- Interpretation ready: visible map and explanation, no autoplay.
- Playing: audible scene and interactive source movement.
- Unsupported source: visible sound note with clear limitation; no silent substitution.
- No playable matches: constructive explanation, preserved described sound notes, Edit scene and Save without audio actions; no automatic substitutes.
- Reflection ready: editable proposal; blank accepted.
- Saved/reopened: preserved choices as described above.
- Empty input: Create sound map is gently disabled for empty or whitespace-only text; no error message.
- Initial interpretation failure: retain the description in the current session and allow editing or retry; no undisclosed fallback.
- Audio failure: mark and retry the affected layer independently while other layers continue.
- Reflection failure: a non-blocking message; own text or blank reflection can still be saved.
- Save failure: retain the entire current scene, offer Retry, allow editing, and warn of potential loss if leaving.

## Product Decisions

- One writer and one scene: keep the prototype focused on a writing decision.
- Audio is essential; a map alone does not deliver the intended payoff.
- A small licensed library is enough; polished generated audio is unnecessary.
- The writer chooses when playback begins.
- Two understandable audio relationships take priority over unreliable spatial complexity.
- Provenance stays visible; AI interpretation is open to disagreement.
- Preserve the writer's why through an editable AI proposal, never assumed intent.
- Preserve unsupported sounds as notes; substitute suggestions can wait.
- If nothing can play, allow revision or a silent blueprint so the writer's creative intent is not lost.

## What We're Building

The describe, interpret, listen, reshape, reflect, save, and reopen loop above for a short supported scene, with honest unsupported notes. No code or technical architecture has been chosen. Feasibility must be tested against the small hackathon scope.

## Deferred From the POC

Substitute suggestions, document/image export, finished audio-production export, larger libraries, broader creative audiences, and polished generative audio. Accounts, cloud sync, folders, search, version history, Save as new version, undo stacks, and draft autosave are also deferred. They are not required to establish the core creative experience.

## Non-Goals

Professional sound editing, arbitrary scene coverage, accurate room simulation, and asserting a memory's true sound or the writer's emotional intention.

## Review and Remaining Refinements

The core journey, persistence, editing, reflection ownership, and principal recovery states have been defined. Diana approved this PRD on September 30, 2026. No implementation has begun. The next official step is 4-spec.

The descriptive project label is not a final name. Specific colors, typography, and control placement remain presentation refinements within the agreed calm, spacious, slightly cinematic direction. Review format is not established; no visual planning page has been requested. Technical feasibility, audio-library selection, and optional distance effects belong in 4-spec after PRD approval.

The review should confirm that these requirements accurately capture Diana's decisions. Do not restart the interview or silently expand scope.
