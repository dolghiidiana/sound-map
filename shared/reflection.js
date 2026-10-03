import { catalogue } from './catalogue.js';
import { soundParameters } from './mapping.js';

function exact(value, keys) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).sort().join() !== [...keys].sort().join()) throw new Error('Invalid reflection fields');
}
export function validateChanges(input) {
  exact(input, ['changes']);
  if (!Array.isArray(input.changes) || input.changes.length < 1 || input.changes.length > 20) throw new Error('No bounded changes');
  return { changes: input.changes.map(change => {
    exact(change, ['label','before','after','removed']);
    if (typeof change.label !== 'string' || !change.label.trim() || change.label.length > 100 || typeof change.removed !== 'boolean') throw new Error('Invalid change');
    for (const point of [change.before, change.after]) {
      exact(point, ['pan','presence']);
      if (!Number.isFinite(point.pan) || Math.abs(point.pan) > 1 || !Number.isFinite(point.presence) || point.presence < 0 || point.presence > 1) throw new Error('Invalid relationship');
    }
    return { label: change.label, before: {...change.before}, after: {...change.after}, removed: change.removed };
  }) };
}
// Only differences from the original proposal leave the browser. No source IDs,
// descriptions, reflections, evidence excerpts or unrelated layers are included.
export function reflectionChanges(sounds) {
  return { changes: sounds.filter(s => s.removed || s.position.x !== s.initialPosition.x || s.position.y !== s.initialPosition.y).map(s => {
    const reduction = catalogue.find(c => c.id === s.soundId)?.outerReductionDb ?? 0;
    const relation = position => { const {pan,presence} = soundParameters(position,reduction); return {pan,presence}; };
    return {label:s.label,before:relation(s.initialPosition),after:relation(s.position),removed:s.removed};
  }) };
}
export function validateSuggestion(value) {
  exact(value, ['suggestion']);
  if (typeof value.suggestion !== 'string' || !value.suggestion.trim() || value.suggestion.length > 600) throw new Error('Invalid suggestion');
  return {suggestion:value.suggestion};
}
