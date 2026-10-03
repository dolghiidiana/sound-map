import { useEffect, useRef, useState } from 'react';
import SceneView from './components/SceneView.jsx';
import SavedScenes from './components/SavedScenes.jsx';
import { catalogue } from '../shared/catalogue.js';
import { validateDistanceInterpretation } from '../shared/distance-contract.js';
const example='Rain against the windows on my left. Someone is sweeping far away on the right. A quiet indoor hum remains.';
export default function App(){
 const [description,setDescription]=useState(''),[scene,setScene]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[config,setConfig]=useState(null);
 const active=useRef(null),generation=useRef(0);
 const [connectionAttempt,setConnectionAttempt]=useState(0);
 useEffect(()=>{const controller=new AbortController();fetch('/api/status',{signal:controller.signal,cache:'no-store'}).then(r=>{if(!r.ok)throw Error();return r.json();}).then(value=>{setConfig(value);setError('');}).catch(()=>{if(!controller.signal.aborted)setError('The local helper is not connected. Your description is still here. Check the connection to try again.');});return()=>{controller.abort();active.current?.abort();generation.current++;};},[connectionAttempt]);
 async function create(event){
  event.preventDefault();if(busy||!description.trim()||description.length>3000)return;
  const version=++generation.current,controller=new AbortController();active.current=controller;setBusy(true);setError('');
  const timer=setTimeout(()=>controller.abort(),35000);
  try{
   const response=await fetch('/api/interpret',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({description}),signal:controller.signal});
   const data=await response.json();if(!response.ok)throw new Error(data.error?.message || 'We couldn’t create a sound map. Your description is still here.');
   if(version!==generation.current)return;
   // Validate again before resolving a trusted local file. Never use model URLs.
   const validated=validateDistanceInterpretation({interpretation:data.interpretation,sources:data.sources.map(({label,origin,evidence,soundId,initialDistance,initialSide})=>({label,origin,evidence,soundId,distance:initialDistance,side:initialSide}))},description);
   const sounds=validated.sources.map((source,index)=>{
    const recording=catalogue.find(s=>s.id===source.soundId);
    return {...recording,...source,id:source.soundId??'note-'+index,position:{x:source.x,y:source.y},initialPosition:{x:source.x,y:source.y},removed:false};
   });
   setScene({...validated,sounds,description,mode:data.mode,model:data.model,id:crypto.randomUUID()});
  }catch(e){if(version===generation.current)setError(controller.signal.aborted?'The interpretation took too long. Your description is still here. The budget record may need review before retrying.':e.message);}
  finally{clearTimeout(timer);if(version===generation.current)setBusy(false);}
 }
 function cancel(){generation.current++;active.current?.abort();setBusy(false);setError('Request cancelled here. Your description is still here; an already-sent AI request may still be charged.');}
 if(scene)return <SceneView key={scene.id} scene={scene} onEdit={()=>{setDescription(scene.description);setScene(null);}}/>;
 return <main className="entry-page"><header><span className="wordmark">Sound Map<span className="wordmark-dot">·</span></span><span className="study-label">A SPACE FOR YOUR SCENE</span></header>
 <section className="scene-entry"><p className="eyebrow">START WITH A SMALL MOMENT</p><h1>What does your<br/><em>scene sound like?</em></h1><p className="entry-intro">Describe a place, a moment, the sounds around your character.<br/>Hear one possible interpretation. Then make it yours.</p>
 {config?.mode==='mock' && <p className="mode-note">Prepared test mode · no AI requests. <button className="text-action" disabled={busy} onClick={()=>setDescription(config.example)}>Use prepared example</button></p>}
 <form onSubmit={create}><label htmlFor="scene-description">Your scene</label><textarea id="scene-description" value={description} disabled={busy} maxLength={3000} onChange={e=>setDescription(e.target.value)} placeholder="A nearly empty café near closing time. Rain against the windows. Someone sweeping farther away." rows={6}/><p className="example">For example: {example}</p><div className="entry-actions"><button className="play-button" disabled={!description.trim()||busy||!config} type="submit">{busy?'Interpreting your scene…':'Create sound map'}</button>{busy&&<button className="text-action" type="button" onClick={cancel}>Cancel</button>}</div></form>
 {error&&<p className="entry-error" role="alert">{error}</p>}{!config&&error&&<button className="text-action" type="button" onClick={()=>{setError('Checking the local connection…');setConnectionAttempt(value=>value+1);}}>Check connection</button>}
 <p className="privacy-note">{config?.mode==='live'?'Creating a map sends your description and our small sound list to OpenAI. Use an invented or non-sensitive scene.':'Three recordings: rain, room tone and sweeping.'} Audio playback and movement stay on this device.</p><p className="prototype-note">Explore a scene through sound. This prototype starts with a small café collection: rain, room tone and sweeping. Other sounds stay as notes.</p><SavedScenes onOpen={setScene} disabled={busy}/></section></main>;
}
