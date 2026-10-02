import { request as httpRequest } from 'node:http';
function localFetch(url,options={}){return new Promise((resolve,reject)=>{const req=httpRequest(url,{method:options.method||'GET',headers:options.headers},res=>{const chunks=[];res.on('data',c=>chunks.push(c));res.on('end',()=>resolve({status:res.statusCode,json:async()=>JSON.parse(Buffer.concat(chunks).toString())}));});req.on('error',reject);req.end(options.body);});}
import test from 'node:test';import assert from 'node:assert/strict';
import {createHelper,preparedDescription,preparedInterpretation} from '../server/index.mjs';
import {interpretLive} from '../server/interpret.mjs';
import {mkdtempSync,writeFileSync,readFileSync,rmSync}from'node:fs';import{tmpdir}from'node:os';import{join,resolve}from'node:path';
import{readLedger}from'../server/budget.mjs';
test('loopback route rejects origins, client models, wrong types and oversize bodies; returns prepared data honestly',async()=>{
 const server=createHelper({mode:'mock',model:'gpt-6-luna'});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const url='http://127.0.0.1:'+server.address().port;
 const headers={Host:'127.0.0.1:3001',Origin:'http://127.0.0.1:5173','Content-Type':'application/json'};
 try{
  const post=(value,extra={})=>localFetch(url+'/api/interpret',{method:'POST',headers:{...headers,...extra},body:JSON.stringify(value)});
  assert.equal((await post({description:preparedDescription},{Origin:'https://other.example'})).status,403);
  assert.equal((await post({description:preparedDescription},{Host:'evil.example'})).status,403);
  assert.equal((await post({description:preparedDescription},{'Content-Type':'text/plain'})).status,415);
  assert.equal((await post({description:preparedDescription,model:'gpt-6.1-sol'})).status,400);
  assert.equal((await post({description:'x'.repeat(40000)})).status,413);
  assert.equal((await post({description:' ' })).status,400);
  const result=await(await post({description:preparedDescription})).json();assert.equal(result.mode,'mock');assert.equal(result.sources.length,3);
  const status=await(await localFetch(url+'/api/status',{headers:{Host:'127.0.0.1:3001'}})).json();assert.equal('key' in status,false);
 }finally{await new Promise(r=>server.close(r));}
});
test('live transport settles usage, keeps scene text out of ledger and holds uncertain cost across restart',async()=>{
 const base=resolve(tmpdir()),dir=mkdtempSync(join(base,'sound-map-live-'));
 const config={key:'test-only-placeholder',mode:'live',model:'gpt-6-luna',budget:10,ledger:join(dir,'ledger'),lock:join(dir,'lock')};
 writeFileSync(config.ledger,JSON.stringify({type:'init',budgetCad:10})+'\n');
 const proposal={interpretation:'Rain nearby',sources:[{label:'Rain',origin:'described',evidence:'Rain',soundId:'cafe_rain',distance:'near',side:'left'}]};
 let calls=0;
 try{
  const fake=async(url,options)=>{calls++;const request=JSON.parse(options.body);assert.equal(request.model,'gpt-6-luna');assert.deepEqual(Object.keys(JSON.parse(request.input)).sort(),['catalogue','description']);return new Response(JSON.stringify({model:'gpt-6-luna',service_tier:'default',status:'completed',usage:{input_tokens:200,output_tokens:100},output:[{type:'message',content:[{type:'output_text',text:JSON.stringify(proposal)}]}]}),{status:200});};
  const out=await interpretLive('Rain',config,fake);assert.equal(out.sources[0].initialDistance,'near');assert.equal(readLedger(config.ledger).pending.length,0);assert.equal(readFileSync(config.ledger,'utf8').includes('Rain'),false);
  await assert.rejects(()=>interpretLive('Rain',config,async()=>{calls++;throw Error('offline');}));assert.equal(readLedger(config.ledger).pending.length,1);
  await assert.rejects(()=>interpretLive('Rain',config,fake));assert.equal(calls,2);
 }finally{assert.ok(dir.startsWith(base+requireSeparator()));rmSync(dir,{recursive:true,force:true});}
});
function requireSeparator(){return process.platform==='win32'?'\\':'/';}
