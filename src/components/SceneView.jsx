import { useEffect, useRef, useState } from 'react';
import { AudioEngine } from '../audio/audioEngine.js';
import { constrainPosition, describePosition } from '../../shared/mapping.js';

function SoundIcon({ id }) {
  if (id === 'cafe_rain') return <svg width="22" height="26" viewBox="0 0 22 26" fill="none" aria-hidden="true"><path d="M11 2C9 6 4 10 4 15a7 7 0 0014 0c0-5-5-9-7-13Z" stroke="currentColor" strokeWidth="1.3"/><path d="M7 16c0 2 1.4 3.5 3 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>;
  if (id === 'cafe_room') return <svg width="25" height="25" viewBox="0 0 26 26" fill="none" aria-hidden="true"><path d="M5 21V7l8-3 8 3v14M5 21h16M13 4v17M5 15h16" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>;
  return <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true"><path d="m19 3-7 12M9 13l7 4-4 6-9-5 6-5Zm-3 5 5 3m-3-6 6 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

export default function SceneView({ scene, onEdit }) {
  const [sounds, setSounds] = useState(() => scene.sounds.map(s => ({ ...s, position: { ...s.position }, removed: false })));
  const [selected, setSelected] = useState(scene.sounds.find(s=>s.file)?.id ?? null);
  const [edited, setEdited] = useState(false);
  const [status, setStatus] = useState('ready');
  const [loadStatus, setLoadStatus] = useState({});
  const [dragging, setDragging] = useState(false);
  const map = useRef(null), engine = useRef(null), frame = useRef(null), pending = useRef(null);
  useEffect(() => {
    const instance = new AudioEngine(setStatus, setLoadStatus, scene.sounds.filter(s=>s.file));
    engine.current = instance;
    if (import.meta.env.DEV) window.__soundMapDebug = () => instance.snapshot();
    return () => { cancelAnimationFrame(frame.current); instance.dispose(); delete window.__soundMapDebug; };
  }, []);
  function move(id, next) {
    setEdited(true);
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
    setEdited(true);
    if (sounds.find(s=>s.id===id)?.file) engine.current.setRemoved(id, removed);
    setSounds(previous => previous.map(s => s.id === id ? { ...s, removed } : s));
    if (!removed) setSelected(id);
  }
  const current = sounds.find(s => s.id === selected);
  const playing = status === 'playing';
  const label = playing ? 'Pause' : status === 'paused' ? 'Resume' : status === 'error' ? 'Retry playback' : 'Play';
  const removed = sounds.filter(s => s.removed);
  const playable = sounds.filter(s=>s.file);
  return <main>
    <header><a className="wordmark" href="/">Sound Map<span className="wordmark-dot">·</span></a><span className="study-label">YOUR SCENE, INTERPRETED</span></header>
    <section className="intro"><p className="eyebrow">AN INTERPRETATION, YOURS TO RESHAPE</p><h1>Listen to<br/><em>the possibility.</em></h1><p className="lede scene-description">{scene.description}</p><p className="scene-invitation">{scene.interpretation}</p><button className="text-action" onClick={()=>{if(!edited || window.confirm('Leave this arrangement? Unsaved map changes will be lost.')) onEdit();}}>Edit description</button></section>
    <section className="experience" aria-label="Scene sound map">
      <p className="mode-note">{scene.mode === 'mock' ? 'Prepared test interpretation · no AI request' : 'AI-proposed arrangement · change it freely'}</p>
      {playable.length === 0 && <div className="silent-scene"><h2>A scene to keep in mind</h2><p>We couldn’t find playable matches in this small sound library. Your described sounds are preserved below as notes.</p><p className="stage-note">Saving blueprints arrives in the next build step.</p></div>}
      {playable.length > 0 && <>
      <div className={`sound-map ${playing ? 'is-playing' : ''} ${dragging ? 'is-dragging' : ''}`} ref={map}>
        <div className="wash" aria-hidden="true"/><div className="ring outer" aria-hidden="true"/><div className="ring inner" aria-hidden="true"/>
        <span className="edge-label left" aria-hidden="true">left</span><span className="edge-label right" aria-hidden="true">right</span>
        <div className="listener" aria-hidden="true"><span className="listener-point"/><span>you, listening</span></div>
        {playable.filter(s => !s.removed).map(sound => <button key={sound.id} data-sound-id={sound.id}
          className={`sound-marker ${sound.id === selected ? 'selected' : ''} ${loadStatus[sound.id] === 'error' ? 'unavailable' : ''}`}
          aria-label={`${sound.label}: ${describePosition(sound.position)}. Use arrow keys to move.`} aria-describedby="map-help"
          style={{ left: `${50 + sound.position.x * 43}%`, top: `${50 + sound.position.y * 43}%` }}
          onFocus={() => setSelected(sound.id)} onClick={() => setSelected(sound.id)}
          onPointerDown={e => { e.preventDefault(); e.currentTarget.focus(); e.currentTarget.setPointerCapture(e.pointerId); setSelected(sound.id); setDragging(true); }}
          onPointerMove={e => { if (e.currentTarget.hasPointerCapture(e.pointerId)) schedule(sound.id, e); }}
          onPointerUp={e => stopDrag(sound.id, e)} onPointerCancel={e => stopDrag(sound.id, e)} onLostPointerCapture={() => setDragging(false)} onKeyDown={e => keyMove(sound, e)}>
          <SoundIcon id={sound.soundId}/><span className="marker-label">{sound.label}{loadStatus[sound.id] === 'error' ? ' · unavailable' : ''}<small className={'origin ' + sound.origin}>{sound.origin === 'described' ? 'Described by you' : 'AI suggestion'}</small></span>
        </button>)}
      </div>
      <div className="scene-readout"><span className={`status-dot ${playing ? 'active' : ''}`}/><span>{current?.label} · {current?.removed ? 'removed from the scene' : current ? describePosition(current.position) : 'Select a sound'}</span></div>
      <div className="transport"><button className="play-button" onClick={() => playing ? engine.current.pause() : engine.current.play()}><span aria-hidden="true">{playing ? 'Ⅱ' : '▷'}</span>{label}</button><button className="restart-button" disabled={!['playing','paused'].includes(status)} onClick={() => engine.current.restart()}>↺ <span>Restart</span></button></div>
      <p className="play-status" role="status">{status === 'error' ? 'Playback couldn’t start. Your arrangement is still here — try again.' : status === 'paused' ? 'Paused. Rearrange the sounds, then continue from the same moment.' : playing ? 'The scene repeats. Cleaning has quiet pauses between activity.' : 'Press Play when you’re ready. Headphones help you hear left and right.'}</p>
      <div className="sound-choices" aria-label="Select a sound">{playable.filter(s => !s.removed).map(sound => <button key={sound.id} aria-pressed={sound.id === selected} onClick={() => setSelected(sound.id)}>{sound.label}</button>)}</div>
      <div className="selected-actions"><span>{current?.detail}</span>{current && !current.removed && <button onClick={() => remove(current.id, true)}>Remove {current.label.toLowerCase()}</button>}</div>
      <div className="load-notices" aria-live="polite">{sounds.filter(s => loadStatus[s.id] === 'error' || loadStatus[s.id] === 'loading').map(s => <p key={s.id}>{s.label} — {loadStatus[s.id] === 'loading' ? 'loading…' : <>couldn’t load. <button onClick={() => engine.current.loadLayer(s.id)}>Retry {s.label.toLowerCase()}</button></>}</p>)}</div>
      </>}
      {sounds.some(s=>!s.file && !s.removed) && <section className="sound-notes" aria-label="Unsupported sound notes"><h2>Sound notes</h2>{sounds.filter(s=>!s.file && !s.removed).map(s=><div key={s.id}><strong>{s.label}</strong><span>Described by you · Not available in the current sound library.</span><button className="text-action" onClick={()=>remove(s.id,true)}>Remove note</button></div>)}</section>}
      {removed.length > 0 && <div className="removed-sounds"><span>Removed sounds</span>{removed.map(s => <button key={s.id} onClick={() => remove(s.id, false)}>Restore {s.label.toLowerCase()}</button>)}</div>}
      <p id="map-help" className="map-help">Drag a sound, or focus it and use the arrow keys.<br/>Closer feels more present. Farther feels quieter.</p>
    </section>
    <footer><p className="test-note">{scene.mode === 'mock' ? 'Prepared test mode' : 'Live scene interpretation'}</p><p>An expressive space, not a room simulation.</p><a href="/audio/CREDITS.txt" target="_blank" rel="noreferrer">Recordings &amp; licences</a></footer>
  </main>;
}
