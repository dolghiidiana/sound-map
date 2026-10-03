import { catalogue } from '../../shared/catalogue.js';

export const storageKey = 'sound-map.blueprints.v1';
const text = (v, max, empty = false) => typeof v === 'string' && v.length <= max && (empty || !!v.trim());
const position = p => p && Number.isFinite(p.x) && Number.isFinite(p.y) && Math.hypot(p.x,p.y) <= 1.000001;
const revision = n => Number.isSafeInteger(n) && n >= 0;
export function validateBlueprint(b) {
  if (!b || b.schemaVersion !== 1 || !text(b.id,100) || !text(b.description,3000) || !text(b.title,140) || !text(b.interpretation,600,true) || !text(b.catalogueVersion,100) || ![b.createdAt,b.savedAt].every(t => typeof t === 'string' && Number.isFinite(Date.parse(t))) || !revision(b.mapRevision)) throw new Error('Blueprint format not supported');
  const r = b.reflection;
  if (!r || !text(r.text,3000,true) || typeof r.needsReview !== 'boolean' || !revision(r.reviewedMapRevision) || r.reviewedMapRevision > b.mapRevision) throw new Error('Invalid reflection');
  if (!Array.isArray(b.sources) || b.sources.length > 20) throw new Error('Invalid sources');
  const ids = new Set(), recordings = new Set();
  const sources = b.sources.map(s => {
    if (!text(s.id,100) || ids.has(s.id) || !text(s.label,100) || !['described','suggested'].includes(s.origin) || !(s.soundId === null || text(s.soundId,100)) || typeof s.removed !== 'boolean' || !position(s.position) || !position(s.initialPosition)) throw new Error('Invalid source');
    if (s.origin === 'described' ? !text(s.evidence,3000) || !b.description.includes(s.evidence) : s.evidence !== null) throw new Error('Invalid provenance');
    if (s.soundId !== null && recordings.has(s.soundId)) throw new Error('Duplicate recording');
    ids.add(s.id); if (s.soundId !== null) recordings.add(s.soundId);
    return {id:s.id,label:s.label,origin:s.origin,evidence:s.evidence,soundId:s.soundId,initialPosition:{...s.initialPosition},position:{...s.position},removed:s.removed};
  });
  return {schemaVersion:1,id:b.id,title:b.title,description:b.description,createdAt:b.createdAt,savedAt:b.savedAt,catalogueVersion:b.catalogueVersion,interpretation:b.interpretation,sources,reflection:{...r},mapRevision:b.mapRevision};
}
export function makeBlueprint(scene, state, now = new Date().toISOString()) {
  return validateBlueprint({schemaVersion:1,id:scene.id,title:scene.description.trim().split('\n')[0].slice(0,140),description:scene.description,createdAt:scene.createdAt ?? now,savedAt:now,catalogueVersion:scene.catalogueVersion ?? 'cafe-v1',interpretation:scene.interpretation,sources:state.sounds,reflection:state.reflection,mapRevision:state.mapRevision});
}
export function restoreBlueprint(blueprint) {
  const b = validateBlueprint(blueprint);
  return {...b, mode:'saved', sounds:b.sources.map(s => ({...catalogue.find(c => c.id === s.soundId),...s}))};
}
function readRaw(storage) {
  const raw = storage.getItem(storageKey);
  if (raw === null) return [];
  const entries = JSON.parse(raw);
  if (!Array.isArray(entries)) throw new Error('Saved collection is unreadable');
  return entries;
}
export function listBlueprints(storage) {
  try {
    storage ??= localStorage;
    const entries = readRaw(storage), scenes = []; let unreadable = 0;
    const seen = new Set();
    for (const entry of entries) { try { const b=validateBlueprint(entry); if(seen.has(b.id)) throw Error(); seen.add(b.id); scenes.push(b); } catch { unreadable++; } }
    return {scenes:scenes.sort((a,b)=>Date.parse(b.savedAt)-Date.parse(a.savedAt)),error:unreadable ? 'Some saved scenes could not be read. Their stored data has been kept.' : ''};
  } catch { return {scenes:[],error:'Saved scenes could not be read in this browser. Stored data has not been changed.'}; }
}
export function saveBlueprint(blueprint, storage = localStorage) {
  const valid=validateBlueprint(blueprint), entries=readRaw(storage);
  // Refuse an ambiguous update, preserving damaged data rather than replacing it.
  const matches=entries.filter(e=>e?.id === valid.id);
  if(matches.length > 1) throw new Error('Ambiguous saved identity');
  if(matches.length) validateBlueprint(matches[0]);
  const updated=entries.filter(e=>e?.id !== valid.id);
  updated.push(valid);
  storage.setItem(storageKey,JSON.stringify(updated));
  return valid;
}
