import { existsSync, mkdirSync, readFileSync, writeFileSync, rmdirSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { buildInterpretationRequest, parseInterpretationResponse } from '../server/ai.mjs';
import { reserve, settle, readLedger } from '../server/budget.mjs';
import { comparisonScenes } from '../tests/fixtures/comparison-scenes.js';
const directory = '.local/connection-check';
mkdirSync(directory, { recursive: true });
const request = { ...buildInterpretationRequest(comparisonScenes[0].description, 'gpt-6.1-sol'), service_tier: 'default' };
const body = JSON.stringify(request);
// Under 12K UTF8 bytes plus generous schema/framing allowance; at even one
// token per byte, max input/output cost with FX/overhead is below CAD0.25.
if (Buffer.byteLength(body) > 12000) throw new Error('Request exceeds connection-test size limit');
writeFileSync(directory + '/request.json', JSON.stringify(request, null, 2));
if (process.argv[2] !== '--live-once') {
  console.log(JSON.stringify({ prepared: true, requestBytes: Buffer.byteLength(body), reservationCad: 0.25, networkRequests: 0 }));
} else {
  loadEnvFile('.env');
  if (!process.env.OPENAI_API_KEY?.trim()) throw new Error('Key not configured');
  if (Number(process.env.AI_BUDGET_CAD) !== 10) throw new Error('Expected approved CAD10 budget');
  if (existsSync(directory + '/attempt.json')) throw new Error('Connection attempt already recorded; no automatic repeat');
  const lock = '.local/ai-request.lock';
  mkdirSync(lock); // exclusive across processes; stale lock requires inspection
  try {
    const ledger = '.local/ai-usage.jsonl';
    readLedger(ledger); // missing/corrupt accounting fails closed
    const id = 'connection-' + Date.now();
    reserve(ledger, id, 0.25);
    writeFileSync(directory + '/attempt.json', JSON.stringify({ id, at: new Date().toISOString() }), { flag: 'wx', flush: true });
    const start = performance.now();
    try {
      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST', redirect: 'error', signal: AbortSignal.timeout(30000),
        headers: { Authorization: 'Bearer ' + process.env.OPENAI_API_KEY, 'Content-Type': 'application/json' }, body,
      });
      const data = await response.json();
      const elapsedMs = Math.round(performance.now() - start);
      // Never persist credentials or headers; response and invented scene are local.
      writeFileSync(directory + '/response.json', JSON.stringify(data, null, 2));
      const metadata = { elapsedMs, httpStatus: response.status, requestId: response.headers.get('x-request-id'), responseModel: data.model, serviceTier: data.service_tier };
      let cost = null;
      if (data.usage && data.model?.startsWith('gpt-6.1-sol') && (!data.service_tier || data.service_tier === 'default')) cost = settle(ledger, id, data.usage, metadata);
      if (!response.ok) {
        writeFileSync(directory + '/result.json', JSON.stringify({ success: false, ...metadata, cost, errorCode: data.error?.code, errorType: data.error?.type }, null, 2));
        console.log(JSON.stringify({ success: false, ...metadata, cost, errorCode: data.error?.code, errorType: data.error?.type }));
      } else {
        const interpretation = parseInterpretationResponse(data, comparisonScenes[0].description);
        const result = { success: true, ...metadata, cost, interpretation, ledger: readLedger(ledger) };
        writeFileSync(directory + '/result.json', JSON.stringify(result, null, 2));
        console.log(JSON.stringify(result, null, 2));
      }
    } catch (error) {
      const result = { success: false, failure: 'Network or response validation failure; inspect local evidence. No automatic retry.', networkCode: error.cause?.code ?? null, errorName: error.name, ledger: readLedger(ledger) };
      writeFileSync(directory + '/result.json', JSON.stringify(result, null, 2));
      console.log(JSON.stringify(result));
      process.exitCode = 1;
    }
  } finally { rmdirSync(lock); }
}
