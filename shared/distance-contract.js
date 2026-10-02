import { interpretationSchema, validateInterpretation } from './contracts.js';
export const distanceRadii = Object.freeze({ near: 0.2, mid: 0.55, far: 0.85 });
export function semanticPosition(distance, side) {
  if (!Object.hasOwn(distanceRadii, distance) || !['left','centre','right'].includes(side)) throw new Error('Invalid semantic position');
  const radius = distanceRadii[distance];
  // Initial visual placement only. y has no front/behind meaning. The writer
  // can drag freely afterward; this never quantizes manual movement.
  const x = radius * ({ left: -0.8, centre: 0, right: 0.8 }[side]);
  return { x, y: Math.sqrt(Math.max(0, radius * radius - x * x)) };
}
export const distanceSchema = structuredClone(interpretationSchema);
const item = distanceSchema.properties.sources.items;
delete item.properties.x; delete item.properties.y;
item.properties.distance = { type: 'string', enum: ['near','mid','far'] };
item.properties.side = { type: 'string', enum: ['left','centre','right'] };
item.required = Object.keys(item.properties);
export function validateDistanceInterpretation(value, description) {
  if (!Array.isArray(value?.sources)) throw new Error('Invalid sources');
  const mapped = value.sources.map(source => {
    if (!source || Object.keys(source).length !== item.required.length || !item.required.every(key=>Object.hasOwn(source,key))) throw new Error('Invalid source fields');
    const { distance, side, ...rest } = source;
    return { ...rest, ...semanticPosition(distance, side) };
  });
  const validated = validateInterpretation({ ...value, sources: mapped },description);
  // Retain semantics as initial provenance, not as a constraint on future edits.
  return { ...validated, sources: validated.sources.map(source => {
    const index=mapped.findIndex(candidate=>candidate===source || (candidate.label===source.label && candidate.evidence===source.evidence && candidate.soundId===source.soundId && candidate.x===source.x && candidate.y===source.y));
    return { ...source, initialDistance:value.sources[index].distance, initialSide:value.sources[index].side };
  }) };
}
