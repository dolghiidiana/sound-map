import {mkdirSync,existsSync,writeFileSync,readFileSync} from 'node:fs';
import {loadEnvFile} from 'node:process';
import {createHash} from 'node:crypto';
import {buildReflectionRequest} from '../server/reflection-ai.mjs';
import {reflectLive} from '../server/interpret.mjs';
import {readLedger} from '../server/budget.mjs';
import {soundParameters} from '../shared/mapping.js';
const relationship=(r,extra=0)=>({pan:0,presence:soundParameters({x:0,y:r},extra).presence});
const cases=[
 {name:'cleaning-recedes',changes:[{label:'Sweeping',before:relationship(.2,6),after:relationship(.85,6),removed:false}]},
 {name:'removed-room-tone',changes:[{label:'Room hum',before:relationship(.55),after:relationship(.55),removed:true}]},
];
const jobs=cases.flatMap((c,i)=>(i?['gpt-6-luna','gpt-6.1-sol']:['gpt-6.1-sol','gpt-6-luna']).map(model=>({name:c.name,model,input:{changes:c.changes},request:buildReflectionRequest({changes:c.changes},model)})));
const folder='.local/reflection-comparison-v1';
if(process.argv[2]!=='--live-once'){console.log(JSON.stringify({requests:jobs.length,maximumReservationsCad:1,jobs},null,2));process.exit(0);}
if(existsSync(folder))throw Error('Reflection comparison already exists; no automatic repeat');
loadEnvFile('.env');
const config={key:process.env.OPENAI_API_KEY,model:process.env.OPENAI_MODEL,budget:Number(process.env.AI_BUDGET_CAD),ledger:'.local/ai-usage.jsonl',lock:'.local/ai-request.lock'};
const before=readLedger(config.ledger);
if(before.pending.length||before.totalCad+1>=8||!config.key||config.budget!==10)throw Error('Budget/config review required');
mkdirSync(folder);
const digest=()=>createHash('sha256').update(readFileSync('server/reflection-ai.mjs')).update(readFileSync('shared/reflection.js')).digest('hex');
const hash=digest();writeFileSync(folder+'/manifest.json',JSON.stringify({hash,before,jobs},null,2));
const results=[];
for(const job of jobs){
 if(digest()!==hash)throw Error('Contract changed mid-comparison');
 const start=performance.now();
 try{
  const result=await reflectLive(job.input,{...config,reflectionModel:job.model});
  const ledgerRows=readFileSync(config.ledger,'utf8').trim().split('\n').map(JSON.parse);
  const usage=ledgerRows.at(-1);
  results.push({name:job.name,model:job.model,...result,elapsedMs:Math.round(performance.now()-start),usage});
  writeFileSync(folder+'/results.json',JSON.stringify(results,null,2));
  console.log(JSON.stringify(results.at(-1)));
 }catch(error){writeFileSync(folder+'/failure.json',JSON.stringify({name:job.name,model:job.model,error:error.message,ledger:readLedger(config.ledger)}));throw error;}
}
console.log(JSON.stringify({completed:results.length,ledger:readLedger(config.ledger)}));
