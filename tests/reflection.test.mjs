import test from 'node:test';import assert from 'node:assert/strict';
import {reflectionChanges,validateChanges} from '../shared/reflection.js';
import {buildReflectionRequest,parseReflectionResponse} from '../server/reflection-ai.mjs';
import {soundParameters} from '../shared/mapping.js';
test('reflection sends changed labels and calibrated relationships only, excludes unchanged layers and private text',()=>{
 const sounds=[{label:'Sweeping',soundId:'cafe_cleaning',initialPosition:{x:0,y:.2},position:{x:0,y:.85},removed:false,description:'PRIVATE',reflection:'PRIVATE',evidence:'PRIVATE'},
 {label:'Rain',soundId:'cafe_rain',initialPosition:{x:0,y:.2},position:{x:0,y:.2},removed:false}];
 const changes=reflectionChanges(sounds),request=buildReflectionRequest(changes,'gpt-6-luna');
 assert.equal(changes.changes.length,1);assert.equal(changes.changes[0].after.presence,soundParameters({x:0,y:.85},6).presence);
 assert.deepEqual(JSON.parse(request.input),changes);assert.equal(JSON.stringify(request).includes('PRIVATE'),false);assert.equal(request.store,false);assert.equal(request.max_output_tokens,800);
 assert.throws(()=>validateChanges({...changes,description:'secret'}));assert.throws(()=>validateChanges({changes:[{...changes.changes[0],id:'not-allowed'}]}));assert.throws(()=>validateChanges({changes:[]}));
});
test('reflection rejects refusal, incomplete, extra fields and oversized suggestions',()=>{
 const response=value=>({status:'completed',output:[{type:'message',content:[{type:'output_text',text:JSON.stringify(value)}]}]});
 assert.deepEqual(parseReflectionResponse(response({suggestion:'This might feel quieter.'})),{suggestion:'This might feel quieter.'});
 assert.throws(()=>parseReflectionResponse({...response({suggestion:'x'}),status:'incomplete'}));
 assert.throws(()=>parseReflectionResponse(response({suggestion:'x',extra:true})));
 assert.throws(()=>parseReflectionResponse(response({suggestion:'x'.repeat(601)})));
 assert.throws(()=>parseReflectionResponse({status:'completed',output:[{type:'message',content:[{type:'refusal'}]}]}));
});
