import { mkdirSync,readFileSync,writeFileSync,existsSync,rmdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { loadEnvFile } from 'node:process';
import assert from 'node:assert/strict';
import { buildInterpretationRequest,parseInterpretationResponse } from '../server/ai.mjs';
import { reserve,settle,readLedger } from '../server/budget.mjs';
import { comparisonScenes } from '../tests/fixtures/comparison-scenes.js';
const directory='.local/model-comparison-v1', ledger='.local/ai-usage.jsonl';
const hash=s=>createHash('sha256').update(s).digest('hex');
const paths=['server/ai.mjs','shared/contracts.js','shared/catalogue.js','tests/fixtures/comparison-scenes.js'];
const hashes=()=>Object.fromEntries(paths.map(p=>[p,hash(readFileSync(p))]));
const requests=comparisonScenes.flatMap((scene,i)=> (i%2 ? ['gpt-6-luna','gpt-6.1-sol']:['gpt-6.1-sol','gpt-6-luna']).map(model=>({scene:scene.id,description:scene.description,request:{...buildInterpretationRequest(scene.description,model),service_tier:'default'}})));
assert.deepEqual(requests[0].request,JSON.parse(readFileSync('.local/connection-check/request.json','utf8')));
for(let i=0;i<10;i+=2){const a={...requests[i].request},b={...requests[i+1].request};delete a.model;delete b.model;assert.deepEqual(a,b);}
const manifest={hashes:hashes(),baselineHash:hash(readFileSync('.local/connection-check/response.json')),requests};
if(process.argv[2]!=='--live-once'){
 mkdirSync(directory,{recursive:true});writeFileSync(directory+'/manifest.json',JSON.stringify(manifest,null,2),{flag:'wx'});
 console.log('Frozen ten requests; identical paired payloads except model. Baseline preserved. No calls.');
}else{
 assert.deepEqual(manifest,JSON.parse(readFileSync(directory+'/manifest.json','utf8')));
 if(existsSync(directory+'/started.json'))throw new Error('Batch already started; never repeat automatically');
 loadEnvFile('.env');if(!process.env.OPENAI_API_KEY || Number(process.env.AI_BUDGET_CAD)!==10)throw new Error('Configuration missing');
 if(readLedger(ledger).totalCad+2.5>=8)throw new Error('Batch budget review needed');
 mkdirSync('.local/ai-request.lock');
 try{
 writeFileSync(directory+'/started.json',JSON.stringify({at:new Date().toISOString()}),{flag:'wx',flush:true});
 for(let index=0;index<requests.length;index++){
  assert.deepEqual(hashes(),manifest.hashes);
  const item=requests[index],model=item.request.model,id='comparison-v1-'+index, prefix=directory+'/'+index;
  const body=JSON.stringify(item.request);if(Buffer.byteLength(body)>12000)throw new Error('Request too large');
  reserve(ledger,id,.25,model,'fixed interpretation comparison: '+item.scene);
  const start=performance.now();
  try{
   const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',redirect:'error',signal:AbortSignal.timeout(30000),headers:{Authorization:'Bearer '+process.env.OPENAI_API_KEY,'Content-Type':'application/json'},body});
   const data=await response.json();const elapsedMs=Math.round(performance.now()-start);
   writeFileSync(prefix+'-response.json',JSON.stringify(data,null,2));
   const metadata={responseModel:data.model,serviceTier:data.service_tier,httpStatus:response.status,elapsedMs,requestId:response.headers.get('x-request-id'),scene:item.scene};
   if(data.model!==model||data.service_tier!=='default'||!data.usage)throw new Error('Unknown usage/model/tier: reservation retained');
   const cost=settle(ledger,id,data.usage,metadata);
   let validated=null,validationError=null;
   try{validated=parseInterpretationResponse(data,item.description);}catch{validationError='Response failed unchanged validation';}
   const result={model,scene:item.scene,...metadata,cost,usage:data.usage,validated,validationError};
   writeFileSync(prefix+'-result.json',JSON.stringify(result,null,2));
   console.log(JSON.stringify({index,scene:item.scene,model,elapsedMs,usd:cost.baseUsd,validationError}));
  }catch(error){writeFileSync(prefix+'-failure.json',JSON.stringify({error:error.message,code:error.cause?.code,ledger:readLedger(ledger)}));throw new Error('Comparison stopped; inspect local failure. No retry.');}
 }
 writeFileSync(directory+'/completed.json',JSON.stringify({at:new Date().toISOString(),ledger:readLedger(ledger)}));
 }finally{rmdirSync('.local/ai-request.lock');}
}
