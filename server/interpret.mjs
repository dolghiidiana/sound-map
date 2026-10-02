import { mkdirSync, rmdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { buildDistanceRequest, parseDistanceResponse } from './distance-ai.mjs';
import { reserve, settle } from './budget.mjs';
export class RequestError extends Error { constructor(code,message,status=503){super(message);this.code=code;this.status=status;} }
export async function interpretLive(description, config, fetcher=fetch) {
  if (!config.key) throw new RequestError('KEY_MISSING','The local AI connection needs an API key. Your description is still here.');
  if (!['gpt-6-luna','gpt-6.1-sol'].includes(config.model) || config.budget!==10) throw new RequestError('CONFIG','The local AI settings need review. Your description is still here.');
  const body=JSON.stringify({...buildDistanceRequest(description,config.model),service_tier:'default'});
  if(Buffer.byteLength(body)>24000)throw new RequestError('TOO_LARGE','Please shorten the scene description.',400);
  // At <=24K input bytes plus framing allowance and 2K output tokens, CAD0.25
  // covers either approved model using conservative FX and overhead allowances.
  try { mkdirSync(config.lock); } catch { throw new RequestError('BUSY','An AI request is already running or needs review. Try again later.',409); }
  try {
    const id=randomUUID();
    try { reserve(config.ledger,id,.25,config.model,'interactive scene interpretation'); }
    catch { throw new RequestError('BUDGET','The AI budget record needs review before another request. Your description is still here.'); }
    const start=performance.now();
    let response,data;
    try {
      response=await fetcher('https://api.openai.com/v1/responses',{method:'POST',redirect:'error',signal:AbortSignal.timeout(30000),headers:{Authorization:'Bearer '+config.key,'Content-Type':'application/json'},body});
      data=await response.json();
    } catch { throw new RequestError('UNAVAILABLE','We couldn’t reach the AI service. Your description is still here. The request’s budget allowance is held for review.'); }
    if (data.model===config.model && data.service_tier==='default' && data.usage) {
      try { settle(config.ledger,id,data.usage,{responseModel:data.model,serviceTier:data.service_tier,httpStatus:response.status,elapsedMs:Math.round(performance.now()-start),requestId:response.headers.get('x-request-id')}); }
      catch { throw new RequestError('ACCOUNTING','The AI usage record needs review. Your description is still here.'); }
    } else {
      throw new RequestError('UNAVAILABLE','The AI request could not be completed or its usage confirmed. Your description is still here; the budget allowance is held for review.');
    }
    if(!response.ok)throw new RequestError('UNAVAILABLE','We couldn’t create a sound map for this scene right now. Your description is still here — you can try again or revise it.');
    try { return parseDistanceResponse(data,description); }
    catch { throw new RequestError('INVALID','The AI returned a sound map we couldn’t safely use. Your description is still here — you can try again or revise it.'); }
  } finally { rmdirSync(config.lock); }
}
