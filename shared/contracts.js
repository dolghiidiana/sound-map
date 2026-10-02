import { catalogue } from './catalogue.js';

export const MAX_DESCRIPTION = 3000;
const ids = catalogue.map(sound => sound.id);
const sourceFields = ['label', 'origin', 'evidence', 'soundId', 'x', 'y'];
const object = properties => ({ type: 'object', properties, required: Object.keys(properties), additionalProperties: false });
export const interpretationSchema = object({
  interpretation: { type: 'string', maxLength: 600 },
  sources: { type: 'array', maxItems: 20, items: object({
    label: { type: 'string', minLength: 1, maxLength: 100 },
    origin: { type: 'string', enum: ['described', 'suggested'] },
    evidence: { type: ['string', 'null'] },
    soundId: { type: ['string', 'null'], enum: [...ids, null] },
    x: { type: 'number', minimum: -1, maximum: 1 },
    y: { type: 'number', minimum: -1, maximum: 1 },
  }) },
});

function requireCondition(condition) {
  if (!condition) throw new Error('Invalid scene interpretation');
}
function exactKeys(value, keys) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    && Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));
}
export function validateDescriptionRequest(value) {
  requireCondition(exactKeys(value, ['description']));
  requireCondition(typeof value.description === 'string' && value.description.trim().length > 0 && value.description.length <= MAX_DESCRIPTION);
  return { description: value.description };
}

// Strict structure does not establish semantic fidelity: evaluate negation and
// meaning separately with real model responses and the writer's review.
export function validateInterpretation(value, description) {
  validateDescriptionRequest({ description });
  requireCondition(exactKeys(value, ['interpretation', 'sources']));
  requireCondition(typeof value.interpretation === 'string' && value.interpretation.length <= 600);
  requireCondition(Array.isArray(value.sources) && value.sources.length <= 20);
  const used = new Set();
  for (const source of value.sources) {
    requireCondition(exactKeys(source, sourceFields));
    requireCondition(typeof source.label === 'string' && source.label.trim().length > 0 && source.label.length <= 100);
    requireCondition(['described', 'suggested'].includes(source.origin));
    requireCondition(Number.isFinite(source.x) && Number.isFinite(source.y) && Math.hypot(source.x, source.y) <= 1);
    requireCondition(source.soundId === null || ids.includes(source.soundId));
    if (source.origin === 'described') {
      requireCondition(typeof source.evidence === 'string' && source.evidence.trim().length > 0 && description.includes(source.evidence));
    } else {
      requireCondition(source.evidence === null && source.soundId !== null);
    }
    if (source.soundId !== null) {
      requireCondition(!used.has(source.soundId));
      used.add(source.soundId);
    }
  }
  const hasDescribedMatch = value.sources.some(s => s.origin === 'described' && s.soundId !== null);
  // Never fill an entirely unsupported scene with unrelated suggested ambience.
  const sources = hasDescribedMatch ? value.sources : value.sources.filter(s => s.origin === 'described');
  return {
    interpretation: hasDescribedMatch ? value.interpretation : 'We couldn’t find playable matches for this scene yet. Your described sounds are still preserved. You can revise the scene or keep it as a silent blueprint.',
    sources: sources.map(source => ({ ...source })),
  };
}
