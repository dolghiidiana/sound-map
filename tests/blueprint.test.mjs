import test from 'node:test';
import assert from 'node:assert/strict';
import {makeBlueprint,restoreBlueprint,saveBlueprint,listBlueprints,storageKey} from '../src/lib/blueprintStore.js';
import {initialSceneState,sceneReducer} from '../src/sceneReducer.js';
const scene={id:'test-scene',description:'Rain and a church bell.',interpretation:'A proposed arrangement.',sounds:[
 {id:'rain',soundId:'cafe_rain',label:'Rain',origin:'described',evidence:'Rain',initialPosition:{x:0,y:.2},position:{x:0,y:.2},removed:false},
 {id:'bell',soundId:null,label:'Bell',origin:'described',evidence:'church bell',initialPosition:{x:.4,y:.4},position:{x:.4,y:.4},removed:false},
]};
function memoryStorage(){const map=new Map();return {getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};}
test('save/open retains choices and review flag; editing same ID updates rather than duplicates',()=>{
 const storage=memoryStorage();let state=initialSceneState(scene);
 state=sceneReducer(state,{type:'reflection',text:'My exact words.  '});
 state=sceneReducer(state,{type:'move',id:'rain',position:{x:-.7,y:.3}});
 state=sceneReducer(state,{type:'remove',id:'bell',removed:true});
 assert.equal(state.reflection.needsReview,true);
 let b=saveBlueprint(makeBlueprint(scene,state),storage);
 const opened=restoreBlueprint(listBlueprints(storage).scenes[0]);
 assert.deepEqual(opened.reflection,state.reflection);assert.deepEqual(opened.sounds[0].position,{x:-.7,y:.3});assert.equal(opened.sounds[1].removed,true);assert.equal(opened.sounds[1].file,undefined);
 assert.equal(opened.sounds[0].file,'/audio/rain-effib.ogg');
 const reopened=sceneReducer(initialSceneState(opened),{type:'reflection',text:''});
 b=saveBlueprint(makeBlueprint(opened,reopened),storage);
 assert.equal(listBlueprints(storage).scenes.length,1);assert.equal(b.reflection.text,'');assert.equal(b.reflection.needsReview,false);
});
test('save failure retains prior stored content and does not mutate current state',()=>{
 const storage=memoryStorage(),state=initialSceneState(scene),b=makeBlueprint(scene,state);
 saveBlueprint(b,storage);const before=storage.getItem(storageKey),snapshot=JSON.stringify(state);
 storage.setItem=()=>{throw Error('quota');};
 assert.throws(()=>saveBlueprint({...b,title:'new title'},storage));assert.equal(storage.getItem(storageKey),before);assert.equal(JSON.stringify(state),snapshot);
});
test('damaged collection is never erased, readable entries remain, unknown assets are silent notes',()=>{
 const storage=memoryStorage(),b=makeBlueprint(scene,initialSceneState(scene));
 const unknown=structuredClone(b);unknown.sources[0].soundId='missing-recording';
 assert.equal(restoreBlueprint(unknown).sounds[0].file,undefined);
 storage.setItem(storageKey,JSON.stringify([b,{broken:true}]));assert.equal(listBlueprints(storage).scenes.length,1);assert.ok(listBlueprints(storage).error);
 saveBlueprint(b,storage);assert.ok(JSON.parse(storage.getItem(storageKey)).some(e=>e.broken));
 storage.setItem(storageKey,'broken json');assert.throws(()=>saveBlueprint(b,storage));assert.equal(storage.getItem(storageKey),'broken json');
});
test('review is non-blocking; removal/restore preserve position and text; saved does not approve stale reflection',()=>{
 let state=initialSceneState(scene);state=sceneReducer(state,{type:'reflection',text:'Keep these words'});
 state=sceneReducer(state,{type:'remove',id:'rain',removed:true});state=sceneReducer(state,{type:'remove',id:'rain',removed:false});
 assert.deepEqual(state.sounds[0].position,scene.sounds[0].position);assert.equal(state.reflection.text,'Keep these words');
 state=sceneReducer(state,{type:'saved'});assert.equal(state.dirty,false);assert.equal(state.reflection.needsReview,true);
 state=sceneReducer(state,{type:'reflection',text:state.reflection.text});assert.equal(state.reflection.needsReview,false);
});

test('blocked browser storage reports an error without breaking the entry screen',()=>{
 const original=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
 Object.defineProperty(globalThis,'localStorage',{configurable:true,get(){throw Error('blocked');}});
 try{assert.deepEqual(listBlueprints().scenes,[]);assert.ok(listBlueprints().error);}finally{if(original)Object.defineProperty(globalThis,'localStorage',original);else delete globalThis.localStorage;}
});
test('reopened removed recording is silent in the audio engine until explicitly restored',async()=>{
 const {AudioEngine}=await import('../src/audio/audioEngine.js');
 const state=sceneReducer(initialSceneState(scene),{type:'remove',id:'rain',removed:true});
 const restored=restoreBlueprint(makeBlueprint(scene,state));
 const engine=new AudioEngine(()=>{},()=>{},restored.sounds.filter(s=>s.file));
 assert.equal(engine.layers.get('rain').removed,true);assert.equal(engine.context,null);
 assert.deepEqual(engine.layers.get('rain').position,scene.sounds[0].position);
});
