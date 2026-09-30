import { useEffect, useRef, useState } from 'react';
import { AudioEngine } from './audio/audioEngine.js';
import { constrainPosition, describePosition } from '../shared/mapping.js';

export default function App() {
  const [position, setPosition] = useState({ x: -0.4, y: -0.36 });
  const [status, setStatus] = useState('ready');
  const [dragging, setDragging] = useState(false);
  const map = useRef(null);
  const engine = useRef(null);
  const frame = useRef(null);
  const pending = useRef(null);
  useEffect(() => {
    engine.current = new AudioEngine(setStatus);
    // Local development inspection only; no telemetry or production global.
    if (import.meta.env.DEV) window.__soundMapDebug = () => engine.current?.snapshot();
    return () => { cancelAnimationFrame(frame.current); engine.current.dispose(); delete window.__soundMapDebug; };
  }, []);
  function move(next) {
    const bounded = constrainPosition(next);
    engine.current.setPosition(bounded);
    setPosition(bounded);
  }
  function point(event) {
    const rect = map.current.getBoundingClientRect();
    const radius = rect.width * 0.43;
    return constrainPosition({ x: (event.clientX - rect.left - rect.width / 2) / radius,
      y: (event.clientY - rect.top - rect.height / 2) / radius });
  }
  function schedule(event) {
    pending.current = point(event);
    if (frame.current != null) return;
    frame.current = requestAnimationFrame(() => { frame.current = null; move(pending.current); });
  }
  function stopDrag(event) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    cancelAnimationFrame(frame.current); frame.current = null;
    if (event.type === 'pointerup') move(point(event));
    event.currentTarget.releasePointerCapture(event.pointerId);
    setDragging(false);
  }
  function keyMove(event) {
    const step = event.shiftKey ? 0.1 : 0.04;
    const offsets = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (!offsets[event.key]) return;
    event.preventDefault();
    move({ x: position.x + offsets[event.key][0], y: position.y + offsets[event.key][1] });
  }
  const playing = status === 'playing';
  const label = playing ? 'Pause' : status === 'paused' ? 'Resume' : status === 'loading' ? 'Loading rain…' : status === 'error' ? 'Retry playback' : 'Play';
  return <main>
    <header><a className="wordmark" href="/">Sound Map<span className="wordmark-dot">·</span></a><span className="study-label">FIRST LISTENING STUDY</span></header>
    <section className="intro"><p className="eyebrow">A LITTLE SPACE TO LISTEN</p><h1>Let the rain<br/><em>find its place.</em></h1><p className="lede">One sound. A different feeling.<br/>Move the rain and hear what changes.</p></section>
    <section className="experience" aria-label="Rain sound map">
      <div className={`sound-map ${playing ? 'is-playing' : ''} ${dragging ? 'is-dragging' : ''}`} ref={map}>
        <div className="wash" aria-hidden="true"/><div className="ring outer" aria-hidden="true"/><div className="ring inner" aria-hidden="true"/>
        <span className="edge-label left" aria-hidden="true">left</span><span className="edge-label right" aria-hidden="true">right</span>
        <div className="listener" aria-hidden="true"><span className="listener-point"/><span>you, listening</span></div>
        <button className="sound-marker" aria-label={`Rain: ${describePosition(position)}. Use arrow keys to move.`} aria-describedby="map-help"
          style={{ left: `${50 + position.x * 43}%`, top: `${50 + position.y * 43}%` }}
          onPointerDown={e => { e.preventDefault(); e.currentTarget.focus(); e.currentTarget.setPointerCapture(e.pointerId); setDragging(true); }}
          onPointerMove={e => { if (e.currentTarget.hasPointerCapture(e.pointerId)) schedule(e); }}
          onPointerUp={stopDrag} onPointerCancel={stopDrag} onLostPointerCapture={() => setDragging(false)} onKeyDown={keyMove}>
          <svg width="22" height="26" viewBox="0 0 22 26" fill="none" aria-hidden="true"><path d="M11 2C9 6 4 10 4 15a7 7 0 0014 0c0-5-5-9-7-13Z" stroke="currentColor" strokeWidth="1.3"/><path d="M7 16c0 2 1.4 3.5 3 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
          <span className="marker-label">Rain</span>
        </button>
      </div>
      <div className="scene-readout"><span className={`status-dot ${playing ? 'active' : ''}`}/><span>{describePosition(position)}</span></div>
      <div className="transport"><button className="play-button" disabled={status === 'loading'} onClick={() => playing ? engine.current.pause() : engine.current.play()}><span aria-hidden="true">{playing ? 'Ⅱ' : '▷'}</span>{label}</button><button className="restart-button" disabled={!['playing','paused'].includes(status)} onClick={() => engine.current.restart()}>↺ <span>Restart</span></button></div>
      <p className="play-status" role="status">{status === 'error' ? 'The rain couldn’t load. Your arrangement is still here — try again.' : status === 'paused' ? 'Paused. Move the rain, then resume from the same moment.' : playing ? 'Listening. The recording repeats gently.' : status === 'loading' ? 'Preparing the recording…' : 'Press Play when you’re ready. Headphones help you hear left and right.'}</p>
      <p id="map-help" className="map-help">Drag the rain, or focus it and use the arrow keys.<br/>Closer feels more present. Farther feels quieter.</p>
    </section>
    <footer><p className="test-note">Prepared audio test · one recorded sound · no AI requests</p><p>An expressive space, not a room simulation.</p><a href="/audio/CREDITS.txt" target="_blank" rel="noreferrer">Recording &amp; licence</a></footer>
  </main>;
}
