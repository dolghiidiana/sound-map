import test from 'node:test';
import assert from 'node:assert/strict';
import { constrainPosition, soundParameters } from '../shared/mapping.js';
import { prepareLoop } from '../src/audio/audioEngine.js';
import { catalogue } from '../shared/catalogue.js';

test('the map keeps off-map pointer movement bounded without changing its direction', () => {
  const p = constrainPosition({ x: 3, y: 4 });
  assert.equal(Math.hypot(p.x, p.y), 1);
  assert.ok(Math.abs(p.x / p.y - 3 / 4) < 1e-12);
  assert.throws(() => constrainPosition({ x: NaN, y: 0 }));
});
test('farther reduces prominence monotonically, while symmetric positions preserve it', () => {
  let last = Infinity;
  for (let i = 0; i <= 100; i++) {
    const p = soundParameters({ x: i / 100, y: 0 });
    assert.ok(p.presence <= last);
    assert.equal(p.presence, soundParameters({ x: -i / 100, y: 0 }).presence);
    assert.equal(p.pan, i / 100);
    last = p.presence;
  }
  assert.equal(soundParameters({ x: 0, y: 0 }).presence, 1);
  assert.ok(Math.abs(last - 0.12589254) < 1e-7);
});
test('positions on a ring retain presence while panning changes', () => {
  const first = soundParameters({ x: 0.5, y: 0 });
  const next = soundParameters({ x: 0, y: 0.5 });
  assert.equal(first.presence, next.presence);
  assert.notEqual(first.pan, next.pan);
});
test('loop preparation smooths a discontinuous wrap without clipping or empty output', () => {
  const data = Float32Array.from({ length: 4000 }, (_, i) => (i / 4000) * 0.8 - 0.4);
  let output;
  const context = { createBuffer(channels, length, sampleRate) {
    output = new Float32Array(length);
    return { length, sampleRate, getChannelData: () => output };
  } };
  prepareLoop(context, { length: data.length, sampleRate: 1000, numberOfChannels: 1, getChannelData: () => data });
  assert.equal(output.length, 3500);
  assert.ok(Math.abs(output.at(-1) - output[0]) < 0.005);
  assert.ok(output.every(sample => Number.isFinite(sample) && Math.abs(sample) <= 0.851));
});

test('activity preparation preserves silent gaps and fades recording edges', () => {
  const data = Float32Array.from({ length: 1000 }, () => 0.2);
  let output;
  const context = { createBuffer(channels, length, sampleRate) {
    output = new Float32Array(length);
    return { length, sampleRate, getChannelData: () => output };
  } };
  const loop = prepareLoop(context, { length: 1000, sampleRate: 1000, numberOfChannels: 1, getChannelData: () => data }, { kind: 'activity', leadSeconds: 1.5, gapSeconds: 7.5 });
  assert.equal(loop.length, 10000);
  assert.ok(output.slice(0, 1500).every(v => v === 0));
  assert.ok(output.slice(2500).every(v => v === 0));
  assert.equal(output[1500], 0);
  assert.equal(output[2499], 0);
  assert.ok(output[1800] > 0.8);
});

test('three maximum-position layers retain mix headroom without changing one another', () => {
  const maximum = catalogue.reduce((sum, layer) => sum + layer.level * 0.85 * 0.8, 0);
  assert.ok(maximum < 1);
  assert.equal(new Set(catalogue.map(layer => layer.id)).size, 3);
});
