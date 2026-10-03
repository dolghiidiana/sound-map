// Opt-in real-browser regression. Uses an existing Playwright installation;
// no dependency install, API key, local helper or external request is required.
// PLAYWRIGHT_MODULE may point to the installed package's index.js.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {createServer} from 'vite';
import react from '@vitejs/plugin-react';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root=fileURLToPath(new URL('../',import.meta.url));
const description='Rain. Sweeping. Room hum.';
const fixture={mode:'mock',interpretation:'Prepared regression scene.',sources:[
 {label:'Rain',origin:'described',evidence:'Rain',soundId:'cafe_rain',initialDistance:'mid',initialSide:'left'},
 {label:'Sweeping',origin:'described',evidence:'Sweeping',soundId:'cafe_cleaning',initialDistance:'far',initialSide:'right'},
 {label:'Room hum',origin:'described',evidence:'Room hum',soundId:'cafe_room',initialDistance:'mid',initialSide:'centre'},
]};
const vite=await createServer({root,configFile:false,envDir:false,plugins:[react(),{
 name:'deny-unmocked-api',configureServer(server){server.middlewares.use('/api',(_req,res)=>{res.statusCode=503;res.end('Regression tests must mock all API requests');});},
}],server:{host:'127.0.0.1',port:0,strictPort:false},logLevel:'error'});
let browser;
try{
 await vite.listen();
 const origin='http://127.0.0.1:'+vite.httpServer.address().port;
 browser=await chromium.launch({channel:process.env.TEST_BROWSER_CHANNEL || 'msedge',headless:true});
 async function runCase({name,delay=0,clear='button',during=null,doubleClick=false}){
  const context=await browser.newContext({viewport:{width:1280,height:720},serviceWorkers:'block'});
  const page=await context.newPage();
  const errors=[],blocked=[],events=[];let calls=0,release;
  const barrier=new Promise(resolve=>{release=resolve;});
  page.on('pageerror',e=>errors.push(e.message));
  await context.route('**/*',async route=>{
   const url=new URL(route.request().url());
   if(url.origin!==origin){blocked.push(url.origin);return route.abort();}
   const json=body=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
   if(url.pathname==='/api/status')return json({mode:'mock',example:description});
   if(url.pathname==='/api/interpret')return json(fixture);
   if(url.pathname==='/api/reflect'){
    const request=route.request().postDataJSON();
    assert.deepEqual(Object.keys(request),['changes']);
    assert.equal(request.changes.length,1);
    assert.equal(request.changes[0].label,'Sweeping');
    const number=++calls;
    if(number===2&&during)await barrier;
    if(delay)await new Promise(r=>setTimeout(r,delay));
    return json({suggestion:`Mock proposal ${number}: the sweeping may feel less prominent.`,mode:'mock'});
   }
   if(url.pathname.startsWith('/api/'))throw Error('Unexpected API route '+url.pathname);
   return route.continue();
  });
  // Record actual DOM click targets; no reflection text or scene content logged.
  await page.exposeFunction('recordReflectionClick',label=>events.push(label));
  await page.addInitScript(()=>document.addEventListener('click',event=>{
   const button=event.target.closest('button');
   if(button?.closest('.reflection-panel'))window.recordReflectionClick(button.textContent);
  },true));
  try{
   await page.goto(origin);
   await page.getByRole('button',{name:'Use prepared example'}).click();
   await page.getByRole('button',{name:'Create sound map',exact:true}).click();
   const marker=page.locator('[data-sound-id="cafe_cleaning"]');
   await marker.press('ArrowLeft');
   const field=page.getByLabel('Your reflection · optional'),suggest=page.getByRole('button',{name:'Suggest reflection',exact:true});
   const use=page.getByRole('button',{name:'Use suggestion',exact:true});
   const proposal=page.locator('.reflection-proposal');
   await suggest.click();await use.waitFor({state:'visible'});
   assert.equal(await field.inputValue(),'');
   assert.match(await proposal.innerText(),/Mock proposal 1:/);
   await use.click();assert.match(await field.inputValue(),/^Mock proposal 1:/);
   if(clear==='button')await page.getByRole('button',{name:'Clear reflection',exact:true}).click();else await field.fill('');
   assert.equal(await field.inputValue(),'');assert.equal(await proposal.count(),0);
   if(doubleClick)await suggest.dblclick();else await suggest.click();
   assert.equal(await field.inputValue(),'');
   if(during){
    await page.waitForFunction(()=>document.querySelector('.reflection-actions button')?.disabled);
    if(during==='writing')await field.fill('These are my own words.');else await marker.press('ArrowRight');
    release();
    await page.getByText('Your scene or reflection changed while the suggestion was being written. Your own words are unchanged.').waitFor();
    assert.equal(await field.inputValue(),during==='writing'?'These are my own words.':'');
    assert.equal(await proposal.count(),0);
   }else{
    await use.waitFor({state:'visible'});
    assert.match(await proposal.innerText(),/Mock proposal 2:/);
    assert.equal(await field.inputValue(),'','Second response must NOT adopt itself');
    assert.equal(await page.getByRole('button',{name:'Dismiss',exact:true}).isVisible(),true);
    // Saving an unaccepted proposal must preserve a blank owned reflection.
    await page.getByRole('button',{name:'Save blueprint',exact:true}).click();
    const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('sound-map.blueprints.v1')));
    assert.equal(saved.length,1);assert.equal(saved[0].reflection.text,'');
    await page.getByRole('button',{name:'Dismiss',exact:true}).click();
    assert.equal(await field.inputValue(),'');assert.equal(await proposal.count(),0);
   }
   assert.equal(calls,2);assert.equal(events.filter(e=>e==='Use suggestion').length,1);
   assert.deepEqual(errors,[]);assert.deepEqual(blocked,[]);
   console.log('PASS '+name+' | two mock responses; only first explicitly adopted');
  }finally{release();await context.close();}
 }
 for(const testCase of [
  {name:'Clear button / immediate response'},
  {name:'Clear button / delayed response',delay:350},
  {name:'Manual deletion / delayed response',clear:'manual',delay:150},
  {name:'Double mouse click cannot adopt the second response',doubleClick:true,delay:350},
  {name:'Writing during second request rejects stale proposal',during:'writing'},
  {name:'Moving map during second request rejects stale proposal',during:'map'},
 ])await runCase(testCase);
 console.log('6 browser regression cases passed. No live helper or paid AI requests.');
}finally{await browser?.close();await vite.close();}
