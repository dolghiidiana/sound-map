import { soundParameters } from '../../shared/mapping.js';

const LEVEL = 0.8;
const MASTER = 0.8;
const SMOOTHING = 0.015;

// Crossfade the end into the beginning once, before playback. No work on dragging.
export function prepareLoop(context, input) {
  const overlap = Math.min(Math.round(input.sampleRate * 0.5), Math.floor(input.length / 4));
  const length = input.length - overlap;
  const buffer = context.createBuffer(1, length, input.sampleRate);
  const out = buffer.getChannelData(0);
  const channels = Array.from({ length: input.numberOfChannels }, (_, i) => input.getChannelData(i));
  const mono = (index) => channels.reduce((sum, channel) => sum + channel[index], 0) / channels.length;
  for (let i = 0; i < length; i++) {
    const original = i + overlap;
    if (original < input.length - overlap) out[i] = mono(original);
    else {
      const k = original - (input.length - overlap);
      const mix = k / overlap;
      out[i] = mono(original) * (1 - mix) + mono(k) * mix;
    }
  }
  // This quiet field recording needs a fixed calibration, not a changing mix level.
  // Leave headroom and avoid amplifying a silent/invalid file.
  let peak = 0;
  for (const sample of out) peak = Math.max(peak, Math.abs(sample));
  if (peak > 0.000001) {
    const calibration = 0.85 / peak;
    for (let i = 0; i < length; i++) out[i] *= calibration;
  }
  return buffer;
}

export class AudioEngine {
  constructor(onStatus = () => {}) {
    this.onStatus = onStatus;
    this.position = { x: -0.4, y: -0.36 };
    this.context = null;
    this.source = null;
    this.buffer = null;
    this.busy = false;
    this.sourceStarts = 0;
    this.moveCount = 0;
    this.generation = 0;
    this.disposed = false;
  }
  ensureContext() {
    if (this.context) return;
    this.context = new AudioContext({ latencyHint: 'interactive' });
    this.pan = this.context.createStereoPanner();
    this.gain = this.context.createGain();
    this.master = this.context.createGain();
    this.master.gain.value = 0;
    this.pan.connect(this.gain).connect(this.master).connect(this.context.destination);
    this.context.onstatechange = () => {
      if (!this.busy && this.source && !this.disposed) this.onStatus(this.context.state === 'running' ? 'playing' : 'paused');
    };
    this.applyPosition(true);
  }
  setPosition(position) {
    this.position = position;
    this.moveCount++;
    if (this.context) this.applyPosition(this.context.state !== 'running');
  }
  smooth(param, value, instant = false) {
    const now = this.context.currentTime;
    if (typeof param.cancelAndHoldAtTime === 'function') param.cancelAndHoldAtTime(now);
    else { const held = param.value; param.cancelScheduledValues(now); param.setValueAtTime(held, now); }
    if (instant) param.setValueAtTime(value, now);
    else param.setTargetAtTime(value, now, SMOOTHING);
  }
  applyPosition(instant = false) {
    const { pan, presence } = soundParameters(this.position);
    this.smooth(this.pan.pan, pan, instant);
    this.smooth(this.gain.gain, presence * LEVEL, instant);
  }
  async load() {
    if (this.buffer) return;
    const response = await fetch('/audio/rain-effib.ogg');
    if (!response.ok) throw new Error('Recording could not load');
    const decoded = await this.context.decodeAudioData(await response.arrayBuffer());
    this.buffer = prepareLoop(this.context, decoded);
  }
  startSource() {
    this.source = this.context.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.loop = true;
    this.source.connect(this.pan);
    this.startedAt = this.context.currentTime;
    this.source.start();
    this.sourceStarts++;
  }
  async play() {
    if (this.busy || this.disposed) return;
    this.busy = true;
    const generation = this.generation;
    this.onStatus('loading');
    try {
      this.ensureContext();
      await this.context.resume();
      await this.load();
      if (this.disposed || this.generation !== generation) return;
      this.applyPosition(true);
      if (!this.source) this.startSource();
      this.smooth(this.master.gain, MASTER);
      this.onStatus('playing');
    } catch (error) {
      if (!this.disposed) { this.onStatus('error'); await this.context?.suspend(); }
    } finally { this.busy = false; }
  }
  async pause() {
    if (this.busy || !this.source) return;
    this.busy = true;
    try {
      this.smooth(this.master.gain, 0);
      await new Promise(resolve => setTimeout(resolve, 60));
      await this.context.suspend();
      this.onStatus('paused');
    } finally { this.busy = false; }
  }
  async restart() {
    if (this.busy || !this.source) return;
    this.busy = true;
    try {
      if (this.context.state === 'running') {
        this.smooth(this.master.gain, 0);
        await new Promise(resolve => setTimeout(resolve, 60));
      }
      this.source.stop(); this.source.disconnect(); this.source = null;
      this.master.gain.cancelScheduledValues(this.context.currentTime);
      this.master.gain.setValueAtTime(0, this.context.currentTime);
      await this.context.resume();
      this.applyPosition(true);
      this.startSource();
      this.smooth(this.master.gain, MASTER);
      this.onStatus('playing');
    } finally { this.busy = false; }
  }
  snapshot() {
    return { contextState: this.context?.state ?? 'not-created', sourceStarts: this.sourceStarts,
      currentTime: this.context?.currentTime ?? 0,
      elapsed: this.source ? (this.context.currentTime - this.startedAt) % this.buffer.duration : 0,
      pan: this.pan?.pan.value ?? null, gain: this.gain?.gain.value ?? null,
      position: { ...this.position }, moveCount: this.moveCount,
      loopDuration: this.buffer?.duration ?? null, sampleRate: this.context?.sampleRate ?? null };
  }
  dispose() {
    this.disposed = true; this.generation++;
    if (this.source) { this.source.stop(); this.source.disconnect(); }
    if (this.context) { this.context.onstatechange = null; this.context.close(); }
  }
}
