import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, appendFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { reserve, settle, readLedger, priceUsage } from '../server/budget.mjs';
test('budget persists unknown request reservation, blocks concurrent/repeated charge, then settles', () => {
 const dir = mkdtempSync(join(tmpdir(),'sound-map-budget-')); const path=join(dir,'usage.jsonl');
 try {
  assert.throws(()=>readLedger(path));
  writeFileSync(path, JSON.stringify({type:'init',budgetCad:10})+'\n');
  reserve(path,'one',.25);
  assert.equal(readLedger(path).totalCad,.25);
  assert.throws(()=>reserve(path,'two',.25));
  assert.throws(()=>settle(path,'one',{},{}));
  const cost=settle(path,'one',{input_tokens:1000,output_tokens:100,input_tokens_details:{cached_tokens:0}},{});
  assert.equal(cost.baseUsd,.003); assert.ok(Math.abs(cost.cad-.007)<1e-10);
  assert.equal(readLedger(path).pending.length,0);
  assert.throws(()=>reserve(path,'three',10));
  assert.throws(()=>reserve(path,'three',8));
  appendFileSync(path,'broken'); assert.throws(()=>readLedger(path));
 } finally { rmSync(dir,{recursive:true,force:true}); }
});
test('cost does not double count reasoning and handles cache conservatively',()=>{
 const a=priceUsage({input_tokens:100,output_tokens:100,output_tokens_details:{reasoning_tokens:80}});
 assert.equal(a.baseUsd,.0012);
 assert.throws(()=>priceUsage({input_tokens:1,output_tokens:-1}));
});

test('Luna pricing includes reported cache writes without charging Sol rates',()=>{
 const cost=priceUsage({input_tokens:1000,output_tokens:100,input_tokens_details:{cached_tokens:100,cache_write_tokens:200}},'gpt-6-luna');
 assert.ok(Math.abs(cost.baseUsd-.000146)<1e-12);
 assert.throws(()=>priceUsage({input_tokens:100,output_tokens:10,input_tokens_details:{cache_write_tokens:101}}));
});
