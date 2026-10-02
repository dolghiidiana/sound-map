import test from 'node:test';
import assert from 'node:assert/strict';
import {semanticPosition,distanceRadii,validateDistanceInterpretation} from '../shared/distance-contract.js';
import {soundParameters} from '../shared/mapping.js';
import {buildDistanceRequest} from '../server/distance-ai.mjs';
import {buildInterpretationRequest} from '../server/ai.mjs';
test('all nine placements have exact category radius, correct side, monotonic gain',()=>{
 for(const side of ['left','centre','right']){
  let previous=Infinity;
  for(const distance of ['near','mid','far']){
   const p=semanticPosition(distance,side);
   assert.ok(Math.abs(Math.hypot(p.x,p.y)-distanceRadii[distance])<1e-12);
   assert.equal(Math.sign(p.x),{left:-1,centre:0,right:1}[side]);
   const gain=soundParameters(p,6).presence;assert.ok(gain<previous);previous=gain;
  }
 }
 assert.throws(()=>semanticPosition('distant','left'));
});
test('semantic sources validate provenance and retain unsupported notes; raw coordinates rejected',()=>{
 const source={label:'Bell',origin:'described',evidence:'distant bell',soundId:null,distance:'far',side:'centre'};
 const make=s=>({interpretation:'A distant bell.',sources:[s]});
 const out=validateDistanceInterpretation(make(source),'A distant bell.');
 assert.equal(out.sources[0].soundId,null);assert.equal(out.sources[0].y,.85);
 for(const patch of [{x:0},{distance:'unknown'},{evidence:'invented'},{soundId:'bell'}])assert.throws(()=>validateDistanceInterpretation(make({...source,...patch}),'A distant bell.'));
});
test('only placement instruction and schema change from frozen baseline contract',()=>{
 const before=buildInterpretationRequest('Rain','gpt-6-luna'),after=buildDistanceRequest('Rain','gpt-6-luna');
 const a={...before},b={...after};delete a.instructions;delete b.instructions;delete a.text;delete b.text;assert.deepEqual(a,b);
 assert.equal(before.instructions.split('\n').filter((s,i)=>s!==after.instructions.split('\n')[i]).length,1);
});
