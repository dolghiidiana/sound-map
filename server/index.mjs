import { createServer } from 'node:http';
import { validateDescriptionRequest } from '../shared/contracts.js';
import { validateDistanceInterpretation } from '../shared/distance-contract.js';
import { interpretLive,reflectLive,RequestError } from './interpret.mjs';
import {validateChanges} from '../shared/reflection.js';
export const preparedDescription='Rain against the windows on my left. Someone is sweeping far away on the right. A quiet indoor hum remains.';
export function preparedInterpretation(description){
 if(description!==preparedDescription)throw new RequestError('MOCK_SCENE','Prepared test mode uses only the supplied example. Live AI is not enabled.',400);
 return validateDistanceInterpretation({interpretation:'Prepared test: rain to the left, sweeping far to the right and room tone at mid distance.',sources:[
 {label:'Rain',origin:'described',evidence:'Rain against the windows on my left.',soundId:'cafe_rain',distance:'mid',side:'left'},
 {label:'Sweeping',origin:'described',evidence:'Someone is sweeping far away on the right.',soundId:'cafe_cleaning',distance:'far',side:'right'},
 {label:'Room hum',origin:'described',evidence:'A quiet indoor hum remains.',soundId:'cafe_room',distance:'mid',side:'centre'},
 ]},description);
}
export function createHelper(config,{interpret=interpretLive,reflect=reflectLive}={}) {
 const send=(res,status,value)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(value));};
 const server=createServer(async(req,res)=>{
  try {
   if(!['127.0.0.1:3001','127.0.0.1:5173'].includes(req.headers.host))throw new RequestError('HOST','Local access only.',403);
   if(req.headers.origin && req.headers.origin!=='http://127.0.0.1:5173')throw new RequestError('ORIGIN','Local access only.',403);
   if(req.method==='GET' && req.url==='/api/status')return send(res,200,{mode:config.mode,model:config.model,reflectionModel:config.reflectionModel??null,example:config.mode==='mock'?preparedDescription:undefined});
   if(req.method!=='POST'||!['/api/interpret','/api/reflect'].includes(req.url))throw new RequestError('NOT_FOUND','Route not available.',404);
   if(req.headers.origin!=='http://127.0.0.1:5173')throw new RequestError('ORIGIN','Local access only.',403);
   if(!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type']??''))throw new RequestError('TYPE','JSON required.',415);
   let size=0;const chunks=[];
   for await(const chunk of req){size+=chunk.length;if(size<=32768)chunks.push(chunk);}
   if(size>32768)throw new RequestError('SIZE','Please shorten the scene description.',413);
   let input;const reflection=req.url==='/api/reflect';
   try {input=(reflection?validateChanges:validateDescriptionRequest)(JSON.parse(Buffer.concat(chunks).toString('utf8')));}catch{throw new RequestError('INPUT',reflection?'Reflection needs a valid list of sound changes.':'Enter a scene description of up to 3,000 characters.',400);}
   if(reflection){
    if(config.mode==='mock')return send(res,200,{suggestion:'Prepared test suggestion: these changes may shift the focus of the scene. You can give them your own meaning.',mode:'mock'});
    if(config.mode!=='live')throw new RequestError('CONFIG','The local AI mode needs review.');
    return send(res,200,{...await reflect(input,config),mode:'live'});
   }
   let result;
   if(config.mode==='mock')result=preparedInterpretation(input.description);
   else if(config.mode==='live')result=await interpret(input.description,config);
   else throw new RequestError('CONFIG','The local AI mode needs review.');
   send(res,200,{...result,mode:config.mode,model:config.mode==='live'?config.model:null});
  }catch(error){if(!res.destroyed)send(res,error instanceof RequestError?error.status:503,{error:{code:error instanceof RequestError?error.code:'UNAVAILABLE',message:error instanceof RequestError?error.message:'The local helper couldn’t create an interpretation. Your description is still here.'}});}
 });
 server.requestTimeout=10000;server.headersTimeout=10000;
 return server;
}
