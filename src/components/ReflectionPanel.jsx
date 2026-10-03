import {useEffect,useRef,useState} from 'react';
import {reflectionChanges,validateSuggestion} from '../../shared/reflection.js';

export default function ReflectionPanel({state,onChange}) {
  const [busy,setBusy]=useState(false),[proposal,setProposal]=useState(null),[message,setMessage]=useState('');
  const latest=useRef(state.editRevision),active=useRef(null),requestId=useRef(0);
  latest.current=state.editRevision;
  useEffect(()=>{setProposal(null);},[state.editRevision]);
  useEffect(()=>()=>{requestId.current++;active.current?.abort();},[]);
  const changes=reflectionChanges(state.sounds);
  async function suggest() {
    const version=state.editRevision,id=++requestId.current,controller=new AbortController();
    active.current=controller;setBusy(true);setMessage('');setProposal(null);
    const timer=setTimeout(()=>controller.abort(),35000);
    try {
      const response=await fetch('/api/reflect',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(changes),signal:controller.signal});
      const data=await response.json();
      if(!response.ok)throw Error();
      const valid=validateSuggestion({suggestion:data.suggestion});
      if(requestId.current!==id)return;
      if(latest.current!==version){setMessage('Your scene or reflection changed while the suggestion was being written. Your own words are unchanged.');return;}
      setProposal({...valid,version,mode:data.mode});
    } catch {if(requestId.current===id)setMessage('Reflection suggestion wasn’t available. You can add your own or save without one.');}
    finally {clearTimeout(timer);if(requestId.current===id)setBusy(false);}
  }
  return <section className="reflection-panel" aria-labelledby="reflection-title">
    <h2 id="reflection-title">What changed for you?</h2>
    <p>A thought to return to while writing. Your words, or leave it blank.</p>
    <label className="reflection-label" htmlFor="reflection">Your reflection · optional</label>
    <textarea id="reflection" value={state.reflection.text} maxLength={3000} rows={3} onChange={e=>onChange(e.target.value)} placeholder="What do you want to remember about these choices?"/>
    {state.reflection.needsReview&&<p className="review-note">You changed the sound map after writing this reflection. Review it before saving, if you wish.</p>}
    <div className="reflection-actions">
      <button className="text-action" disabled={busy||!changes.changes.length} onClick={suggest}>{busy?'Considering your changes…':'Suggest reflection'}</button>
      {state.reflection.needsReview&&<button className="text-action" onClick={()=>onChange(state.reflection.text)}>Keep as-is</button>}
      {state.reflection.text&&<button className="text-action" onClick={()=>onChange('')}>Clear reflection</button>}
    </div>
    <p className="reflection-privacy">{changes.changes.length?'A suggestion sends only changed sound labels, before/after relationships and removals to AI. Your scene description and reflection stay here.':'Move or remove a sound to request a suggestion. You can write your own reflection anytime.'}</p>
    {proposal&&proposal.version===state.editRevision&&<div className="reflection-proposal"><span>{proposal.mode==='mock'?'Prepared test suggestion':'One possible interpretation'}</span><p>{proposal.suggestion}</p><button className="text-action" onClick={()=>{onChange(proposal.suggestion);setProposal(null);}}>Use suggestion</button><button className="text-action" onClick={()=>setProposal(null)}>Dismiss</button></div>}
    {message&&<p role="status" className="review-note">{message}</p>}
  </section>;
}
