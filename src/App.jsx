import { useEffect, useRef, useState } from 'react';
import { AudioEngine } from './audio/audioEngine.js';
import { constrainPosition, describePosition } from '../shared/mapping.js';
import { catalogue } from '../shared/catalogue.js';

function SoundIcon({ id }) {
  if (id === 'cafe_rain') return <svg width="22" height="26" viewBox="0 0 22 26" fill="none" aria-hidden="true"><path d="M11 2C9 6 4 10 4 15a7 7 0 0014 0c0-5-5-9-7-13Z" stroke="currentColor" strokeWidth="1.3"/><path d="M7 16c0 2 1.4 3.5 3 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>;
  if (id === 'cafe_room') return <svg width="25" height="25" viewBox="0 0 26 26" fill="none" aria-hidden="true"><path d="M5 21V7l8-3 8 3v14M5 21h16M13 4v17M5 15h16" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>;
  return <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true"><path d="m19 3-7 12M9 13l7 4-4 6-9-5 6-5Zm-3 5 5 3m-3-6 6 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

export default function App() {
  const [sounds, setSounds] = useState(() => catalogue.map(s => ({ ...s, position: { ...s.position }, removed: false })));
  const [selected, setSelected] = useState('cafe_cleaning');
  const [status, setStatus] = useState('ready');
  const [loadStatus, setLoadStatus] = useState({});
  const [dragging, setDragging] = useState(false);
  const map = useRef(null), engine = useRef(null), frame = useRef(null), pending = useRef(null);
  useEffect(() => {
    const instance = new AudioEngine(setStatus, setLoadStatus);
    engine.current = instance;
    if (import.meta.env.DEV) window.__soundMapDebug = () => instance.snapshot();
    return () => { cancelAnimationFrame(frame.current); instance.dispose(); delete window.__soundMapDebug; };
  }, []);
  function move(id, next) {
    const bounded = constrainPosition(next);
    engine.current.setPosition(id, bounded);
    setSounds(previous => previous.map(s => s.id === id ? { ...s, position: bounded } : s));
  }
  function point(event) {
    const rect = map.current.getBoundingClientRect(), radius = rect.width * 0.43;
    return constrainPosition({ x: (event.clientX - rect.left - rect.width / 2) / radius, y: (event.clientY - rect.top - rect.height / 2) / radius });
  }
  function schedule(id, event) {
    pending.current = { id, position: point(event) };
    if (frame.current != null) return;
    frame.current = requestAnimationFrame(() => { frame.current = null; move(pending.current.id, pending.current.position); });
  }
  function stopDrag(id, event) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    cancelAnimationFrame(frame.current); frame.current = null;
    if (event.type === 'pointerup') move(id, point(event));
    event.currentTarget.releasePointerCapture(event.pointerId); setDragging(false);
  }
  function keyMove(sound, event) {
    const step = event.shiftKey ? 0.1 : 0.04;
    const offsets = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (!offsets[event.key]) return;
    event.preventDefault(); move(sound.id, { x: sound.position.x + offsets[event.key][0], y: sound.position.y + offsets[event.key][1] });
  }
  function remove(id, removed) {
    engine.current.setRemoved(id, removed);
    setSounds(previous => previous.map(s => s.id === id ? { ...s, removed } : s));
    if (!removed) setSelected(id);
  }
  const current = sounds.find(s => s.id === selected);
  const playing = status === 'playing';
  const label = playing ? 'Pause' : status === 'paused' ? 'Resume' : status === 'error' ? 'Retry playback' : 'Play';
  const removed = sounds.filter(s => s.removed);
  return <main>
    <header><a className="wordmark" href="/">Sound Map<span className="wordmark-dot">·</span></a><span className="study-label">CAFÉ LISTENING STUDY</span></header>
    <section className="intro"><p className="eyebrow">NEARLY CLOSING TIME</p><h1>A room,<br/><em>rearranged by ear.</em></h1><p className="lede">Rain outside. A quiet room.<br/>Someone sweeping before closing.</p><p className="scene-invitation">Let the rain stay where it is.<br/>Move the cleaning farther away.<br/>What changes in the scene?</p></section>
    <section className="experience" aria-label="Cafe sound map">
      <div className={`sound-map ${playing ? 'is-playing' : ''} ${dragging ? 'is-dragging' : ''}`} ref={map}>
        <div className="wash" aria-hidden="true"/><div className="ring outer" aria-hidden="true"/><div className="ring inner" aria-hidden="true"/>
        <span className="edge-label left" aria-hidden="true">left</span><span className="edge-label right" aria-hidden="true">right</span>
        <div className="listener" aria-hidden="true"><span className="listener-point"/><span>you, listening</span></div>
        {sounds.filter(s => !s.removed).map(sound => <button key={sound.id} data-sound-id={sound.id}
          className={`sound-marker ${sound.id === selected ? 'selected' : ''} ${loadStatus[sound.id] === 'error' ? 'unavailable' : ''}`}
          aria-label={`${sound.label}: ${describePosition(sound.position)}. Use arrow keys to move.`} aria-describedby="map-help"
          style={{ left: `${50 + sound.position.x * 43}%`, top: `${50 + sound.position.y * 43}%` }}
          onFocus={() => setSelected(sound.id)} onClick={() => setSelected(sound.id)}
          onPointerDown={e => { e.preventDefault(); e.currentTarget.focus(); e.currentTarget.setPointerCapture(e.pointerId); setSelected(sound.id); setDragging(true); }}
          onPointerMove={e => { if (e.currentTarget.hasPointerCapture(e.pointerId)) schedule(sound.id, e); }}
          onPointerUp={e => stopDrag(sound.id, e)} onPointerCancel={e => stopDrag(sound.id, e)} onLostPointerCapture={() => setDragging(false)} onKeyDown={e => keyMove(sound, e)}>
          <SoundIcon id={sound.id}/><span className="marker-label">{sound.label}{loadStatus[sound.id] === 'error' ? ' · unavailable' : ''}</span>
        </button>)}
      </div>
      <div className="scene-readout"><span className={`status-dot ${playing ? 'active' : ''}`}/><span>{current.label} · {current.removed ? 'removed from the scene' : describePosition(current.position)}</span></div>
      <div className="transport"><button className="play-button" onClick={() => playing ? engine.current.pause() : engine.current.play()}><span aria-hidden="true">{playing ? 'Ⅱ' : '▷'}</span>{label}</button><button className="restart-button" disabled={!['playing','paused'].includes(status)} onClick={() => engine.current.restart()}>↺ <span>Restart</span></button></div>
      <p className="play-status" role="status">{status === 'error' ? 'Playback couldn’t start. Your arrangement is still here — try again.' : status === 'paused' ? 'Paused. Rearrange the sounds, then continue from the same moment.' : playing ? 'The scene repeats. Cleaning has quiet pauses between activity.' : 'Press Play when you’re ready. Headphones help you hear left and right.'}</p>
      <div className="sound-choices" aria-label="Select a sound">{sounds.filter(s => !s.removed).map(sound => <button key={sound.id} aria-pressed={sound.id === selected} onClick={() => setSelected(sound.id)}>{sound.label}</button>)}</div>
      <div className="selected-actions"><span>{current.detail}</span>{!current.removed && <button onClick={() => remove(current.id, true)}>Remove {current.label.toLowerCase()}</button>}</div>
      <div className="load-notices" aria-live="polite">{sounds.filter(s => loadStatus[s.id] === 'error' || loadStatus[s.id] === 'loading').map(s => <p key={s.id}>{s.label} — {loadStatus[s.id] === 'loading' ? 'loading…' : <>couldn’t load. <button onClick={() => engine.current.loadLayer(s.id)}>Retry {s.label.toLowerCase()}</button></>}</p>)}</div>
      {removed.length > 0 && <div className="removed-sounds"><span>Removed sounds</span>{removed.map(s => <button key={s.id} onClick={() => remove(s.id, false)}>Restore {s.label.toLowerCase()}</button>)}</div>}
      <p id="map-help" className="map-help">Drag a sound, or focus it and use the arrow keys.<br/>Closer feels more present. Farther feels quieter.</p>
    </section>
    <footer><p className="test-note">Prepared audio test · three recordings · no AI requests</p><p>An expressive space, not a room simulation.</p><a href="/audio/CREDITS.txt" target="_blank" rel="noreferrer">Recordings &amp; licences</a></footer>
  </main>;
}
