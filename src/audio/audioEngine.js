import { soundParameters } from '../../shared/mapping.js';
import { catalogue } from '../../shared/catalogue.js';

const MASTER = 0.8;
const SMOOTHING = 0.015;

export function prepareLoop(context, input, options = {}) {
  const channels = Array.from({ length: input.numberOfChannels }, (_, i) => input.getChannelData(i));
  const mono = index => channels.reduce((sum, data) => sum + data[index], 0) / channels.length;
  let buffer;
  if (options.kind === 'activity') {
    const lead = Math.round((options.leadSeconds ?? 1.5) * input.sampleRate);
    const gap = Math.round((options.gapSeconds ?? 7.5) * input.sampleRate);
    buffer = context.createBuffer(1, lead + input.length + gap, input.sampleRate);
    const out = buffer.getChannelData(0);
    const fade = Math.min(Math.round(input.sampleRate * 0.03), Math.floor(input.length / 2));
    for (let i = 0; i < input.length; i++) {
      const envelope = Math.min(1, i / fade, (input.length - 1 - i) / fade);
      out[lead + i] = mono(i) * envelope;
    }
  } else {
    const overlap = Math.min(Math.round(input.sampleRate * 0.5), Math.floor(input.length / 4));
    const length = input.length - overlap;
    buffer = context.createBuffer(1, length, input.sampleRate);
    const out = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      const original = i + overlap;
      if (original < input.length - overlap) out[i] = mono(original);
      else {
        const k = original - (input.length - overlap);
        const mix = k / overlap;
        out[i] = mono(original) * (1 - mix) + mono(k) * mix;
      }
    }
  }
  const out = buffer.getChannelData(0);
  let peak = 0;
  for (const sample of out) peak = Math.max(peak, Math.abs(sample));
  if (peak > 0.000001) {
    const calibration = 0.85 / peak;
    for (let i = 0; i < out.length; i++) out[i] *= calibration;
  }
  return buffer;
}

export class AudioEngine {
  constructor(onStatus = () => {}, onLayers = () => {}) {
    this.onStatus = onStatus;
    this.onLayers = onLayers;
    this.layers = new Map(catalogue.map(item => [item.id, {
      ...item, position: { ...item.position }, removed: false, loadStatus: 'idle',
      source: null, buffer: null, sourceStarts: 0, moveCount: 0, controller: null,
    }]));
    this.context = null;
    this.startedAt = null;
    this.busy = false;
    this.disposed = false;
  }
  notify() {
    if (!this.disposed) this.onLayers(Object.fromEntries([...this.layers].map(([id, layer]) => [id, layer.loadStatus])));
  }
  ensureContext() {
    if (this.context) return;
    this.context = new AudioContext({ latencyHint: 'interactive' });
    this.master = this.context.createGain();
    this.master.gain.value = 0;
    this.master.connect(this.context.destination);
    for (const layer of this.layers.values()) {
      layer.pan = this.context.createStereoPanner();
      layer.gain = this.context.createGain();
      layer.pan.connect(layer.gain).connect(this.master);
      this.applyPosition(layer, true);
    }
    this.context.onstatechange = () => {
      if (!this.busy && this.startedAt !== null && !this.disposed) {
        this.onStatus(this.context.state === 'running' ? 'playing' : 'paused');
      }
    };
  }
  smooth(param, value, instant = false) {
    const now = this.context.currentTime;
    if (typeof param.cancelAndHoldAtTime === 'function') param.cancelAndHoldAtTime(now);
    else { const held = param.value; param.cancelScheduledValues(now); param.setValueAtTime(held, now); }
    if (instant) param.setValueAtTime(value, now);
    else param.setTargetAtTime(value, now, SMOOTHING);
  }
  applyPosition(layer, instant = false) {
    const { pan, presence } = soundParameters(layer.position, layer.outerReductionDb ?? 0);
    this.smooth(layer.pan.pan, pan, instant);
    this.smooth(layer.gain.gain, layer.removed ? 0 : presence * layer.level, instant);
  }
  setPosition(id, position) {
    const layer = this.layers.get(id);
    layer.position = { ...position };
    layer.moveCount++;
    if (this.context) this.applyPosition(layer, this.context.state !== 'running');
  }
  setRemoved(id, removed) {
    const layer = this.layers.get(id);
    layer.removed = removed;
    if (this.context) this.applyPosition(layer, this.context.state !== 'running');
  }
  startLayer(layer) {
    if (layer.source || !layer.buffer || this.startedAt === null || this.disposed) return;
    layer.source = this.context.createBufferSource();
    layer.source.buffer = layer.buffer;
    layer.source.loop = true;
    layer.source.connect(layer.pan);
    const offset = Math.max(0, this.context.currentTime - this.startedAt) % layer.buffer.duration;
    layer.source.start(0, offset);
    layer.sourceStarts++;
    this.applyPosition(layer, true);
  }
  async loadLayer(id) {
    const layer = this.layers.get(id);
    if (this.disposed || layer.loadStatus === 'loading' || layer.buffer) return;
    const context = this.context;
    if (!context) return;
    layer.loadStatus = 'loading'; this.notify();
    const controller = new AbortController(); layer.controller = controller;
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(layer.file, { signal: controller.signal });
      if (!response.ok) throw new Error('Recording could not load');
      const decoded = await context.decodeAudioData(await response.arrayBuffer());
      if (this.disposed || this.context !== context) return;
      layer.buffer = prepareLoop(context, decoded, layer);
      layer.loadStatus = 'ready';
      // Join the current scene phase, never restart other layers.
      // Fade this layer only, even if its recording was retried late.
      this.startLayer(layer);
      if (context.state === 'running') {
        layer.gain.gain.cancelScheduledValues(context.currentTime);
        layer.gain.gain.setValueAtTime(0, context.currentTime);
        this.applyPosition(layer);
      }
    } catch {
      if (!this.disposed) layer.loadStatus = 'error';
    } finally {
      clearTimeout(timer); layer.controller = null; this.notify();
    }
  }
  async play() {
    if (this.busy || this.disposed) return;
    this.busy = true;
    try {
      this.ensureContext();
      // Set current arrangement before resuming a paused audio clock.
      for (const layer of this.layers.values()) this.applyPosition(layer, true);
      await this.context.resume();
      if (this.disposed) return;
      if (this.startedAt === null) this.startedAt = this.context.currentTime;
      this.smooth(this.master.gain, MASTER);
      this.onStatus('playing');
      for (const layer of this.layers.values()) {
        if (layer.buffer) this.startLayer(layer);
        else if (layer.loadStatus === 'idle') void this.loadLayer(layer.id);
      }
    } catch { if (!this.disposed) this.onStatus('error'); }
    finally { this.busy = false; }
  }
  async pause() {
    if (this.busy || this.startedAt === null) return;
    this.busy = true;
    try {
      this.smooth(this.master.gain, 0);
      await new Promise(resolve => setTimeout(resolve, 60));
      if (this.disposed) return;
      await this.context.suspend(); this.onStatus('paused');
    } finally { this.busy = false; }
  }
  async restart() {
    if (this.busy || this.startedAt === null) return;
    this.busy = true;
    try {
      if (this.context.state === 'running') {
        this.smooth(this.master.gain, 0);
        await new Promise(resolve => setTimeout(resolve, 60));
      }
      if (this.disposed) return;
      for (const layer of this.layers.values()) {
        if (layer.source) { layer.source.stop(); layer.source.disconnect(); layer.source = null; }
      }
      this.master.gain.cancelScheduledValues(this.context.currentTime);
      this.master.gain.setValueAtTime(0, this.context.currentTime);
      await this.context.resume();
      this.startedAt = this.context.currentTime;
      for (const layer of this.layers.values()) this.startLayer(layer);
      this.smooth(this.master.gain, MASTER);
      this.onStatus('playing');
    } finally { this.busy = false; }
  }
  snapshot() {
    const elapsed = this.startedAt === null ? 0 : this.context.currentTime - this.startedAt;
    return { contextState: this.context?.state ?? 'not-created', currentTime: this.context?.currentTime ?? 0,
      elapsed, sampleRate: this.context?.sampleRate ?? null,
      layers: Object.fromEntries([...this.layers].map(([id, layer]) => [id, {
        loadStatus: layer.loadStatus, removed: layer.removed, position: { ...layer.position },
        pan: layer.pan?.pan.value ?? null, gain: layer.gain?.gain.value ?? null,
        sourceStarts: layer.sourceStarts, moveCount: layer.moveCount,
        loopDuration: layer.buffer?.duration ?? null, phase: layer.buffer ? elapsed % layer.buffer.duration : null,
      }])) };
  }
  dispose() {
    this.disposed = true;
    for (const layer of this.layers.values()) {
      layer.controller?.abort();
      if (layer.source) { layer.source.stop(); layer.source.disconnect(); }
    }
    if (this.context) { this.context.onstatechange = null; void this.context.close(); }
  }
}
