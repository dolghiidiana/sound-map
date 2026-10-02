import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { createServer as createVite } from 'vite';
import { createHelper } from '../server/index.mjs';
if(existsSync('.env'))loadEnvFile('.env');
const config={key:process.env.OPENAI_API_KEY,model:process.env.OPENAI_MODEL||'gpt-6-luna',mode:process.env.AI_MODE||'mock',budget:Number(process.env.AI_BUDGET_CAD||10),ledger:'.local/ai-usage.jsonl',lock:'.local/ai-request.lock'};
const helper=createHelper(config);let vite;
try{
 await new Promise((resolve,reject)=>{helper.once('error',reject);helper.listen(3001,'127.0.0.1',resolve);});
 vite=await createVite();await vite.listen();vite.printUrls();console.log('Scene interpretation mode: '+config.mode+'; model: '+config.model);
}catch{helper.close();if(vite)await vite.close();console.error('Could not start on fixed ports 3001/5173. Stop the previous Sound Map server and try again.');process.exitCode=1;}
async function close(){helper.close();helper.closeAllConnections();if(vite)await vite.close();}
process.once('SIGINT',()=>void close());process.once('SIGTERM',()=>void close());
