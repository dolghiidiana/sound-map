export function initialSceneState(scene) {
  return {sounds:scene.sounds.map(s=>({...s,position:{...s.position},initialPosition:{...s.initialPosition},removed:!!s.removed})),reflection:scene.reflection ?? {text:'',needsReview:false,reviewedMapRevision:0},mapRevision:scene.mapRevision ?? 0,editRevision:0,dirty:!scene.savedAt};
}
export function sceneReducer(state, action) {
  if(action.type === 'saved') return {...state,dirty:false};
  if(action.type === 'reflection') return {...state,reflection:{text:action.text,needsReview:false,reviewedMapRevision:state.mapRevision},editRevision:state.editRevision+1,dirty:true};
  if(action.type === 'move' || action.type === 'remove') {
    const s=state.sounds.find(s=>s.id===action.id);
    if(!s || (action.type==='move' ? s.position.x===action.position.x && s.position.y===action.position.y : s.removed===action.removed)) return state;
    return {...state,sounds:state.sounds.map(s=>s.id!==action.id?s:action.type==='move'?{...s,position:action.position}:{...s,removed:action.removed}),mapRevision:state.mapRevision+1,editRevision:state.editRevision+1,dirty:true,reflection:{...state.reflection,needsReview:!!state.reflection.text.trim()}};
  }
  return state;
}
