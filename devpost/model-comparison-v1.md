# Fixed-prompt model comparison — October 1, 2026

Completed exactly ten new interpretation requests: five scenes per model, one sample per scene/model. Prior successful Sol connection remains an additional separate baseline, excluded from comparison aggregates. No retries, tuning, model selection, reflection calls or audio listening test. Paused for Diana’s review.

## Fairness and boundaries

Frozen prompts, catalogue, schema, validation, five scene descriptions, low reasoning, max_output_tokens 2000, store:false, Standard service_tier default and 30-second timeout. Payloads for each pair differ only in model. Alternated model order by scene; sequential calls. First Sol request exactly equals baseline request. Five one-shot samples cannot establish a general reliability rate, a statistically reliable speed ranking, or perceived audio quality.
All ten HTTP200/completed responses passed local structural validation. Exact excerpts passed for described provenance; suggestions used null evidence. There were no unknown IDs, duplicates, or invalid disk coordinates. Structural success does not establish semantic fidelity.
Baseline response SHA256 unchanged: true.

## Side-by-side findings

- Explicit distance: both preserve all three described sources and left/right directions. Sol sweeping radius 0.25 repeats the baseline problem (baseline 0.20); Luna 0.522 is farther, but only mid-distance under the existing map language (far begins at 0.65). Neither clearly represents far away. Both place room tone close; its low fixed calibration helps keep it quiet.
- Ambiguous atmosphere: both keep the mood as one unsupported described note rather than inventing an audible room recording. This is restrained, though atmosphere is not literally a sound. No suggested filler needed removal.
- Unsupported bell: both preserve a described church-bell note with null soundId and playable rain. Sol bell radius 0.15 contradicts distant; Luna 0.364 is farther than its rain (0.20) but still not far. These are note coordinates, not audible bells.
- Entirely unsupported: both retain ocean waves and violin as two described notes, no substitutions or filler. Sol raw explanation says waves get more prominence, but waves radius 0.35 versus violin 0.25 contradicts that. Luna makes violin more prominent consistently (0.15 versus waves 0.35). Neither note plays.
- Negation: both exclude music and cleaning. Sol adds room tone labelled suggested with null evidence; Luna uses only described rain. Luna says restrained prominence but places rain at radius 0, its maximum prominence. No inference that either interpretation reflects the writer’s actual intention.

## Latency and cost

| Model | Calls | Mean / median seconds | Input / output tokens | Calculated USD cost | Conservative CAD budget debit |
|---|---:|---:|---:|---:|---:|
| gpt-6.1-sol | 5 | 5.549 / 4.243 | 2360 / 863 | $0.0133500 | $0.0290600 |
| gpt-6-luna | 5 | 2.526 / 2.614 | 2360 / 1024 | $0.0007480 | $0.0016140 |

USD figures use actual returned usage and published Standard rates, including reported cache writes/cached tokens. They are calculated charges, not invoice-verified dollars. Reasoning tokens are already within output tokens, not added twice. CAD ledger uses conservative cache-write allowance on uncached input, 1.60 CAD/USD and 25% overhead; not actual FX/tax. Baseline historical debit remains unchanged.
Pricing sources: https://developers.openai.com/api/docs/pricing ; https://developers.openai.com/api/docs/models/gpt-6-luna .
Project ledger total including baseline: CAD $0.0367390 / $10; no pending reservations.

## Each result

### explicit-distance — gpt-6.1-sol

Scene: A nearly empty cafe near closing time. Rain against the windows on my left. Someone is sweeping far away on the right. A quiet indoor hum remains.

Latency 5500 ms; USD $0.0027600; input 485, output 179, reasoning 0, cache {"cache_write_tokens":0,"cached_tokens":0}.

Raw model output:
```json
{
  "interpretation": "A restrained closing-time sound map: rain carries the left side, distant sweeping sits lightly to the right, and quiet room tone anchors the centre. Placement expresses the scene rather than simulating its acoustics.",
  "sources": [
    {
      "label": "Rain against the windows",
      "origin": "described",
      "evidence": "Rain against the windows on my left.",
      "soundId": "cafe_rain",
      "x": -0.55,
      "y": 0
    },
    {
      "label": "Distant sweeping",
      "origin": "described",
      "evidence": "Someone is sweeping far away on the right.",
      "soundId": "cafe_cleaning",
      "x": 0.25,
      "y": 0
    },
    {
      "label": "Quiet indoor hum",
      "origin": "described",
      "evidence": "A quiet indoor hum remains.",
      "soundId": "cafe_room",
      "x": 0,
      "y": 0.1
    }
  ]
}
```

| Source | Origin | Radius (0 near, 1 outer) | Relative presence* |
|---|---|---:|---:|
| Rain against the windows | described | 0.550 | 0.320 |
| Distant sweeping | described | 0.250 | 0.596 |
| Quiet indoor hum | described | 0.100 | 0.813 |

*Presence is that source’s distance multiplier, before fixed recording calibration; it is not a loudness comparison between different recordings. Top/bottom does not represent physical front/behind.

### explicit-distance — gpt-6-luna

Scene: A nearly empty cafe near closing time. Rain against the windows on my left. Someone is sweeping far away on the right. A quiet indoor hum remains.

Latency 3009 ms; USD $0.0001695; input 485, output 242, reasoning 76, cache {"cache_write_tokens":0,"cached_tokens":0}.

Raw model output:
```json
{
  "interpretation": "I’ve kept the rain and distant sweeping gently separated across the stereo field, with the indoor hum settled near the centre as a quiet closing-time bed.",
  "sources": [
    {
      "label": "Rain",
      "origin": "described",
      "evidence": "Rain against the windows on my left.",
      "soundId": "cafe_rain",
      "x": -0.55,
      "y": 0
    },
    {
      "label": "Someone sweeping",
      "origin": "described",
      "evidence": "Someone is sweeping far away on the right.",
      "soundId": "cafe_cleaning",
      "x": 0.5,
      "y": 0.15
    },
    {
      "label": "Quiet indoor hum",
      "origin": "described",
      "evidence": "A quiet indoor hum remains.",
      "soundId": "cafe_room",
      "x": 0,
      "y": 0
    }
  ]
}
```

| Source | Origin | Radius (0 near, 1 outer) | Relative presence* |
|---|---|---:|---:|
| Rain | described | 0.550 | 0.320 |
| Someone sweeping | described | 0.522 | 0.338 |
| Quiet indoor hum | described | 0.000 | 1.000 |

*Presence is that source’s distance multiplier, before fixed recording calibration; it is not a loudness comparison between different recordings. Top/bottom does not represent physical front/behind.

### ambiguous-atmosphere — gpt-6-luna

Scene: A cafe just before closing. The room feels quiet and expectant.

Latency 2614 ms; USD $0.0001353; input 468, output 177, reasoning 101, cache {"cache_write_tokens":0,"cached_tokens":0}.

Raw model output:
```json
{
  "interpretation": "A restrained central note captures the room’s quiet, expectant mood without adding sounds not described.",
  "sources": [
    {
      "label": "Quiet, expectant room",
      "origin": "described",
      "evidence": "The room feels quiet and expectant.",
      "soundId": null,
      "x": 0,
      "y": 0
    }
  ]
}
```

| Source | Origin | Radius (0 near, 1 outer) | Relative presence* |
|---|---|---:|---:|
| Quiet, expectant room | described | 0.000 | note only |

*Presence is that source’s distance multiplier, before fixed recording calibration; it is not a loudness comparison between different recordings. Top/bottom does not represent physical front/behind.

Application validation replaces the explanation with the standard no-playable-match message. The source notes are preserved. This is existing deterministic handling, not model wording or a prompt change.

### ambiguous-atmosphere — gpt-6.1-sol

Scene: A cafe just before closing. The room feels quiet and expectant.

Latency 9999 ms; USD $0.0038160; input 468, output 288, reasoning 197, cache {"cache_write_tokens":0,"cached_tokens":0}.

Raw model output:
```json
{
  "interpretation": "I’d leave the quiet, expectant atmosphere as a restrained central note rather than assume a specific audible room tone or closing activity.",
  "sources": [
    {
      "label": "Quiet, expectant atmosphere before closing",
      "origin": "described",
      "evidence": "A cafe just before closing. The room feels quiet and expectant.",
      "soundId": null,
      "x": 0,
      "y": 0
    }
  ]
}
```

| Source | Origin | Radius (0 near, 1 outer) | Relative presence* |
|---|---|---:|---:|
| Quiet, expectant atmosphere before closing | described | 0.000 | note only |

*Presence is that source’s distance multiplier, before fixed recording calibration; it is not a loudness comparison between different recordings. Top/bottom does not represent physical front/behind.

Application validation replaces the explanation with the standard no-playable-match message. The source notes are preserved. This is existing deterministic handling, not model wording or a prompt change.

### unsupported-bell — gpt-6.1-sol

Scene: Rain taps the cafe window. A church bell rings in the distance.

Latency 4171 ms; USD $0.0022860; input 468, output 135, reasoning 0, cache {"cache_write_tokens":0,"cached_tokens":0}.

Raw model output:
```json
{
  "interpretation": "I would give the rain a gentle leftward emphasis and keep the distant bell nearer the centre with a slight rightward offset. The bell remains a note because the catalogue has no matching recording.",
  "sources": [
    {
      "label": "Rain tapping the cafe window",
      "origin": "described",
      "evidence": "Rain taps the cafe window.",
      "soundId": "cafe_rain",
      "x": -0.35,
      "y": 0
    },
    {
      "label": "Distant church bell",
      "origin": "described",
      "evidence": "A church bell rings in the distance.",
      "soundId": null,
      "x": 0.15,
      "y": 0
    }
  ]
}
```

| Source | Origin | Radius (0 near, 1 outer) | Relative presence* |
|---|---|---:|---:|
| Rain tapping the cafe window | described | 0.350 | 0.484 |
| Distant church bell | described | 0.150 | note only |

*Presence is that source’s distance multiplier, before fixed recording calibration; it is not a loudness comparison between different recordings. Top/bottom does not represent physical front/behind.

### unsupported-bell — gpt-6-luna

Scene: Rain taps the cafe window. A church bell rings in the distance.

Latency 2364 ms; USD $0.0001488; input 468, output 204, reasoning 75, cache {"cache_write_tokens":0,"cached_tokens":0}.

Raw model output:
```json
{
  "interpretation": "Keep the rain close and gentle, with the distant bell as a quieter written cue; the placements are expressive rather than a literal room map.",
  "sources": [
    {
      "label": "Rain tapping the cafe window",
      "origin": "described",
      "evidence": "Rain taps the cafe window.",
      "soundId": "cafe_rain",
      "x": -0.2,
      "y": 0
    },
    {
      "label": "Distant church bell",
      "origin": "described",
      "evidence": "A church bell rings in the distance.",
      "soundId": null,
      "x": 0.35,
      "y": 0.1
    }
  ]
}
```

| Source | Origin | Radius (0 near, 1 outer) | Relative presence* |
|---|---|---:|---:|
| Rain tapping the cafe window | described | 0.200 | 0.661 |
| Distant church bell | described | 0.364 | note only |

*Presence is that source’s distance multiplier, before fixed recording calibration; it is not a loudness comparison between different recordings. Top/bottom does not represent physical front/behind.

### entirely-unsupported — gpt-6-luna

Scene: Ocean waves crash under a cliff. A violin plays a slow melody.

Latency 2008 ms; USD $0.0001323; input 468, output 171, reasoning 45, cache {"cache_write_tokens":0,"cached_tokens":0}.

Raw model output:
```json
{
  "interpretation": "I’d keep the two described sounds distinct and restrained: waves broad and low in the scene, with the slow violin melody more prominent. Neither has a faithful match in the supplied catalogue.",
  "sources": [
    {
      "label": "Ocean waves crashing",
      "origin": "described",
      "evidence": "Ocean waves crash",
      "soundId": null,
      "x": 0,
      "y": 0.35
    },
    {
      "label": "Slow violin melody",
      "origin": "described",
      "evidence": "A violin plays a slow melody.",
      "soundId": null,
      "x": 0.15,
      "y": 0
    }
  ]
}
```

| Source | Origin | Radius (0 near, 1 outer) | Relative presence* |
|---|---|---:|---:|
| Ocean waves crashing | described | 0.350 | note only |
| Slow violin melody | described | 0.150 | note only |

*Presence is that source’s distance multiplier, before fixed recording calibration; it is not a loudness comparison between different recordings. Top/bottom does not represent physical front/behind.

Application validation replaces the explanation with the standard no-playable-match message. The source notes are preserved. This is existing deterministic handling, not model wording or a prompt change.

### entirely-unsupported — gpt-6.1-sol

Scene: Ocean waves crash under a cliff. A violin plays a slow melody.

Latency 3831 ms; USD $0.0022960; input 468, output 136, reasoning 0, cache {"cache_write_tokens":0,"cached_tokens":0}.

Raw model output:
```json
{
  "interpretation": "I would place the crashing waves slightly left and the slow violin slightly right, giving the waves a little more prominence while keeping the arrangement restrained. Neither sound has a faithful match in the supplied catalogue, so both remain notes.",
  "sources": [
    {
      "label": "Crashing ocean waves",
      "origin": "described",
      "evidence": "Ocean waves crash under a cliff.",
      "soundId": null,
      "x": -0.35,
      "y": 0
    },
    {
      "label": "Slow violin melody",
      "origin": "described",
      "evidence": "A violin plays a slow melody.",
      "soundId": null,
      "x": 0.25,
      "y": 0
    }
  ]
}
```

| Source | Origin | Radius (0 near, 1 outer) | Relative presence* |
|---|---|---:|---:|
| Crashing ocean waves | described | 0.350 | note only |
| Slow violin melody | described | 0.250 | note only |

*Presence is that source’s distance multiplier, before fixed recording calibration; it is not a loudness comparison between different recordings. Top/bottom does not represent physical front/behind.

Application validation replaces the explanation with the standard no-playable-match message. The source notes are preserved. This is existing deterministic handling, not model wording or a prompt change.

### negation — gpt-6.1-sol

Scene: Rain outside a quiet cafe. There is no music and nobody is sweeping or cleaning.

Latency 4243 ms; USD $0.0021920; input 471, output 125, reasoning 0, cache {"cache_write_tokens":0,"cached_tokens":0}.

Raw model output:
```json
{
  "interpretation": "A restrained map gives the rain a modest off-centre presence, with subtle room tone anchoring the quiet interior. Placement is expressive rather than a simulation of the cafe layout.",
  "sources": [
    {
      "label": "Rain",
      "origin": "described",
      "evidence": "Rain outside a quiet cafe.",
      "soundId": "cafe_rain",
      "x": -0.35,
      "y": 0.1
    },
    {
      "label": "Quiet room tone",
      "origin": "suggested",
      "evidence": null,
      "soundId": "cafe_room",
      "x": 0.08,
      "y": 0
    }
  ]
}
```

| Source | Origin | Radius (0 near, 1 outer) | Relative presence* |
|---|---|---:|---:|
| Rain | described | 0.364 | 0.470 |
| Quiet room tone | suggested | 0.080 | 0.847 |

*Presence is that source’s distance multiplier, before fixed recording calibration; it is not a loudness comparison between different recordings. Top/bottom does not represent physical front/behind.

### negation — gpt-6-luna

Scene: Rain outside a quiet cafe. There is no music and nobody is sweeping or cleaning.

Latency 2633 ms; USD $0.0001621; input 471, output 230, reasoning 155, cache {"cache_write_tokens":0,"cached_tokens":0}.

Raw model output:
```json
{
  "interpretation": "I’d let the steady rain carry the scene, placed centrally and with restrained prominence to keep the cafe quiet around it.",
  "sources": [
    {
      "label": "Rain",
      "origin": "described",
      "evidence": "Rain outside",
      "soundId": "cafe_rain",
      "x": 0,
      "y": 0
    }
  ]
}
```

| Source | Origin | Radius (0 near, 1 outer) | Relative presence* |
|---|---|---:|---:|
| Rain | described | 0.000 | 1.000 |

*Presence is that source’s distance multiplier, before fixed recording calibration; it is not a loudness comparison between different recordings. Top/bottom does not represent physical front/behind.

## Frozen source hashes

```json
{
  "server/ai.mjs": "57428cacd4426df545e67d1b9e884c2cbffe528e725ed79af81293271be1639a",
  "shared/contracts.js": "731d15fb639f9f822f143ec9c20e60dc12a3d612eb3aee9e2f110ff52724683e",
  "shared/catalogue.js": "065cc8f9dccedd3b163906a7714f2d3990db5a8ad4c13a6755d448379a0423e9",
  "tests/fixtures/comparison-scenes.js": "5e406ed4dbaf491f9f0b603ca4eaf08bfc4590e8d60255b332862f2c1ff60223"
}
```

Raw evidence remains in ignored .local/model-comparison-v1; original connection evidence in .local/connection-check. API keys and request headers excluded. App remains AI_MODE=mock. No model or prompt change selected.
