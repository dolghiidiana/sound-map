import { readFileSync, appendFileSync } from 'node:fs';

// Standard Sol rates checked October 1, 2026. CAD figures are conservative
// budget estimates (1.60 CAD/USD plus 25% allowance), not card statements.
export const rates = { input: 2, cached: 0.1, cacheWrite: 2.5, output: 10, cadPerUsd: 1.6, overhead: 1.25 };
export function readLedger(path) {
  const rows = readFileSync(path, 'utf8').trim().split('\n').map(line => JSON.parse(line));
  if (rows[0]?.type !== 'init' || rows[0].budgetCad !== 10) throw new Error('Budget ledger missing or invalid');
  const entries = new Map();
  for (const row of rows.slice(1)) {
    if (row.type === 'reserve') {
      if (entries.has(row.id) || !Number.isFinite(row.cad) || row.cad <= 0) throw new Error('Invalid reservation');
      entries.set(row.id, row);
    } else if (row.type === 'settle') {
      const prior = entries.get(row.id);
      if (!prior || prior.type !== 'reserve' || !Number.isFinite(row.cad) || row.cad < 0) throw new Error('Invalid settlement');
      entries.set(row.id, row);
    } else throw new Error('Unknown ledger event');
  }
  return { totalCad: [...entries.values()].reduce((sum, row) => sum + row.cad, 0), pending: [...entries.values()].filter(row => row.type === 'reserve') };
}
export function reserve(path, id, cad, model = 'gpt-6.1-sol', purpose = 'single connection check') {
  const state = readLedger(path);
  if (!Number.isFinite(cad) || cad <= 0 || state.pending.length || state.totalCad + cad > 10) throw new Error('Budget gate blocked: reconcile ledger before another request');
  if (state.totalCad + cad >= 8) throw new Error('CAD8 warning threshold reached; review before continuing');
  appendFileSync(path, JSON.stringify({ type: 'reserve', id, cad, model, purpose, at: new Date().toISOString() }) + '\n', { flush: true });
}
export function priceUsage(usage, model = 'gpt-6.1-sol') {
  if (!['gpt-6.1-sol','gpt-6-luna'].includes(model)) throw new Error('Unknown pricing');
  const pricing = model === 'gpt-6-luna' ? { ...rates, input: .1, cached: .01, cacheWrite: .125, output: .5 } : rates;
  const input = usage?.input_tokens, output = usage?.output_tokens;
  const cached = usage?.input_tokens_details?.cached_tokens ?? 0;
  if (![input, output, cached].every(n => Number.isInteger(n) && n >= 0) || cached > input) throw new Error('Unknown usage; keep reservation');
  const writes = usage?.input_tokens_details?.cache_write_tokens ?? 0;
  if (!Number.isInteger(writes) || writes < 0 || writes + cached > input) throw new Error('Invalid cache usage');
  const baseUsd = ((input - cached - writes) * pricing.input + writes * pricing.cacheWrite + cached * pricing.cached + output * pricing.output) / 1e6;
  // Cache-write breakdown may be absent. Charge every non-cached input token at
  // cache-write pricing for the budget estimate, avoiding an understated ledger.
  const conservativeUsd = ((input - cached) * pricing.cacheWrite + cached * pricing.cached + output * pricing.output) / 1e6;
  return { baseUsd, conservativeUsd, cad: conservativeUsd * pricing.cadPerUsd * pricing.overhead, rates: pricing };
}
export function settle(path, id, usage, metadata) {
  const state = readLedger(path);
  if (!state.pending.some(row => row.id === id)) throw new Error('No matching reservation');
  const cost = priceUsage(usage, metadata.responseModel ?? 'gpt-6.1-sol');
  appendFileSync(path, JSON.stringify({ type: 'settle', id, ...metadata, usage, ...cost, at: new Date().toISOString() }) + '\n', { flush: true });
  return cost;
}
