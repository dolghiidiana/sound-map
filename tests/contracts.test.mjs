import test from 'node:test';
import assert from 'node:assert/strict';
import { validateDescriptionRequest, validateInterpretation } from '../shared/contracts.js';
import { buildInterpretationRequest, parseInterpretationResponse } from '../server/ai.mjs';
const description = 'Rain outside. A church bell rings.';
const rain = () => ({ label: 'Rain', origin: 'described', evidence: 'Rain', soundId: 'cafe_rain', x: -0.4, y: 0.2 });
const result = () => ({ interpretation: 'I placed rain nearby.', sources: [rain()] });

test('request accepts only a bounded nonempty description', () => {
  assert.equal(validateDescriptionRequest({ description }).description, description);
  for (const value of [{ description: ' ' }, { description: 'x'.repeat(3001) }, { description, model: 'anything' }, { description, catalogue: [] }]) assert.throws(() => validateDescriptionRequest(value));
});
test('rejects unknown, duplicate and malformed playback assignments', () => {
  for (const patch of [{ soundId: 'church_bell' }, { x: 1, y: 1 }, { x: NaN }, { y: Infinity }, { file: 'https://example.com' }, { label: ' ' }, { origin: 'assumed' }, { evidence: 'Not in the description' }]) {
    const value = result(); Object.assign(value.sources[0], patch);
    assert.throws(() => validateInterpretation(value, description));
  }
  const value = result(); value.sources.push(rain());
  assert.throws(() => validateInterpretation(value, description));
});
test('preserves unsupported described notes without audible substitution', () => {
  const value = result(); value.sources.push({ label: 'Church bell', origin: 'described', evidence: 'church bell', soundId: null, x: 0, y: 0.8 });
  const validated = validateInterpretation(value, description);
  assert.equal(validated.sources[1].soundId, null);
  assert.equal(validated.sources[1].evidence, 'church bell');
  assert.notEqual(validated.sources[1], value.sources[1]);
});
test('no described match suppresses suggested filler and misleading explanation', () => {
  const value = { interpretation: 'Listen to my invented rain.', sources: [
    { label: 'Church bell', origin: 'described', evidence: 'church bell', soundId: null, x: 0, y: 0.5 },
    { ...rain(), origin: 'suggested', evidence: null },
  ] };
  const validated = validateInterpretation(value, description);
  assert.equal(validated.sources.length, 1);
  assert.match(validated.interpretation, /couldn’t find playable matches/);
});
test('suggestions cannot claim evidence or unsupported recordings', () => {
  for (const patch of [{ origin: 'suggested' }, { origin: 'suggested', evidence: null, soundId: null }]) {
    const value = result(); Object.assign(value.sources[0], patch);
    assert.throws(() => validateInterpretation(value, description));
  }
});
test('provider payload contains only scene and compact catalogue; no files/history/tools', () => {
  const request = buildInterpretationRequest(description, 'gpt-6.1-sol');
  assert.equal(request.store, false);
  assert.equal(request.text.format.strict, true);
  assert.deepEqual(Object.keys(JSON.parse(request.input)).sort(), ['catalogue','description']);
  for (const item of JSON.parse(request.input).catalogue) assert.deepEqual(Object.keys(item).sort(), ['description','id','label']);
  for (const key of ['tools','previous_response_id','conversation']) assert.equal(key in request, false);
  assert.throws(() => buildInterpretationRequest(description, 'unapproved'));
});
test('incomplete/refused/malformed provider replies never become a fallback map', () => {
  const response = { status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(result()) }] }] };
  assert.equal(parseInterpretationResponse(response, description).sources.length, 1);
  assert.throws(() => parseInterpretationResponse({ ...response, status: 'incomplete' }, description));
  assert.throws(() => parseInterpretationResponse({ status: 'completed', output: [{ type: 'message', content: [{ type: 'refusal', refusal: 'No' }] }] }, description));
  assert.throws(() => parseInterpretationResponse({ status: 'completed', output: [] }, description));
});
