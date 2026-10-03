import {useState} from 'react';
import {listBlueprints,restoreBlueprint} from '../lib/blueprintStore.js';
export default function SavedScenes({onOpen,disabled=false}) {
  const [listing]=useState(()=>listBlueprints());
  const [error,setError]=useState('');
  return <details className="saved-scenes"><summary>Saved scenes{listing.scenes.length?` (${listing.scenes.length})`:''}</summary>
    <p>Saved in this browser on this device. Clearing site data removes saved scenes.</p>
    {listing.error&&<p role="status">{listing.error}</p>}
    {!listing.scenes.length&&!listing.error&&<p>Your saved blueprints will appear here.</p>}
    <ul>{listing.scenes.map(b=><li key={b.id}><div><strong>{b.title}</strong><time dateTime={b.savedAt}>Saved {new Date(b.savedAt).toLocaleString()}</time></div><button className="text-action" disabled={disabled} onClick={()=>{try{onOpen(restoreBlueprint(b));}catch{setError('This blueprint could not be opened. Its stored data is unchanged.');}}}>Open<span className="sr-only"> {b.title}</span></button></li>)}</ul>
    {error&&<p role="alert">{error}</p>}
  </details>;
}
