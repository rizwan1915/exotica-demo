import { chromium } from 'playwright-core';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';

// Start the local server, then pass the CDP endpoint of a local test browser.
const browser = await chromium.connectOverCDP(process.env.EXOTICA_CDP || 'http://127.0.0.1:64177');
const origin = process.env.EXOTICA_URL || 'http://localhost:8080';
await fs.mkdir('reports', {recursive:true});
const results = { layouts: [], errors: [], measurements: [] };
const performanceOnly = process.argv.includes('--performance-only');
for (const width of performanceOnly ? [] : [320,390,430,768,1024,1440,1920]) {
  const context = await browser.newContext({viewport:{width,height:900},deviceScaleFactor:1});
  const page = await context.newPage();
  page.on('pageerror', error => results.errors.push(error.message));
  page.on('response', response => { if(response.status()>=400) results.errors.push(`${response.status()} ${response.url()}`); });
  await page.goto(origin);
  await page.waitForTimeout(1100);
  assert.equal(await page.title(), 'House of Vivian Exotica — An Essence. An Inheritance.');
  const audit = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > innerWidth,
    brokenImages: [...document.images].filter(i=>i.complete && !i.naturalWidth).map(i=>i.src),
    brokenAnchors: [...document.querySelectorAll('a[href^="#"]')].filter(a=>!document.getElementById(a.hash.slice(1))).map(a=>a.hash),
    canvases: document.querySelectorAll('canvas').length,
    h1: document.querySelectorAll('h1').length,
  }));
  assert.equal(audit.overflow,false,`Overflow at ${width}`);
  assert.deepEqual(audit.brokenImages,[]);
  assert.deepEqual(audit.brokenAnchors,[]);
  assert.equal(audit.h1,1);
  assert.equal(audit.canvases,0);
  assert.equal(await page.evaluate(()=>performance.getEntriesByType('resource').some(r=>r.name.includes('bottle-scene'))),false);
  if(width===390 || width===1440) {
    for(const image of await page.locator('.bottle-image').all()) { await image.scrollIntoViewIfNeeded(); await image.evaluate(i=>i.decode()); }
    await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
    await page.screenshot({path:`reports/after-${width}.png`,fullPage:true});
  }
  if(width<761) {
    await page.getByRole('button',{name:'Open menu',exact:true}).click();
    await page.locator('#navLinks a[href="#collections"]').click();
    assert.equal(await page.locator('#burger').getAttribute('aria-expanded'),'false');
  }
  for (const name of ['Noir Sultana','Oud Royale','Rose Sultana','Amber d’Or']) {
    await page.locator(`[data-interest="${name}"]`).click();
    assert.equal(await page.locator('#interest').inputValue(),name);
  }
  await page.locator('#email').fill('');
  await page.getByRole('button',{name:'Preview Enquiry'}).click();
  assert.equal(await page.locator('#email').evaluate(e=>e.validity.valueMissing),true);
  await page.locator('#email').fill('test@example.com');
  await page.getByRole('button',{name:'Preview Enquiry'}).click();
  assert.match(await page.locator('#enquiryStatus').innerText(),/Amber d’Or.*no enquiry has been sent/);
  await page.locator('#interest').selectOption('Discovery Set');
  await page.getByRole('button',{name:'Preview Enquiry'}).click();
  assert.match(await page.locator('#enquiryStatus').innerText(),/Discovery Set/);
  await page.getByRole('link',{name:'Delivery & returns'}).click();
  assert.equal(await page.locator('#delivery').getAttribute('open'),'');
  if(width===1440) {
    await page.locator('#heroBottle').scrollIntoViewIfNeeded();
    await page.getByRole('button',{name:'Explore in 3D',exact:true}).click();
    await page.waitForSelector('.model-ready');
    await page.getByRole('button',{name:'Pause motion',exact:true}).click();
    assert.equal(await page.getByRole('button',{name:'Resume motion'}).getAttribute('aria-pressed'),'true');
    await page.locator('#heroBottle canvas').focus();
    await page.keyboard.press('ArrowRight'); await page.keyboard.press('Home');
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.waitForTimeout(100);
    assert.equal(await page.locator('canvas').count(),0);
  }
  results.layouts.push({width,...audit,interactionChecks:'passed'});
  await context.close();
}
for (const policy of performanceOnly ? [] : ['reduced','saveData','slowNetwork','noWebGL']) {
  const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:policy==='reduced'?'reduce':'no-preference'});
  const page=await context.newPage();
  if(policy==='saveData') await page.addInitScript(()=>Object.defineProperty(navigator,'connection',{value:{saveData:true}}));
  if(policy==='slowNetwork') await page.addInitScript(()=>Object.defineProperty(navigator,'connection',{value:{effectiveType:'3g'}}));
  if(policy==='noWebGL') await page.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type.startsWith('webgl')?null:get.call(this,type,...args)}});
  await page.goto(origin); await page.waitForTimeout(1000);
  if(policy==='noWebGL') { await page.getByRole('button',{name:'Explore in 3D',exact:true}).click(); await page.waitForTimeout(500); }
  assert.equal(await page.locator('canvas').count(),0,policy);
  assert.equal(await page.locator('#heroBottle img').evaluate(i=>getComputedStyle(i).visibility),'visible');
  if(policy!=='noWebGL') assert.equal(await page.evaluate(()=>performance.getEntriesByType('resource').some(r=>r.name.includes('bottle-scene'))),false);
  console.log(`Fallback passed: ${policy}`);
  await context.close();
}
for(let run=0;run<3;run++) {
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1});
  const page=await context.newPage();
  const cdp=await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
  await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:100,downloadThroughput:200000,uploadThroughput:100000});
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  await page.addInitScript(()=>{
    window.measurements={lcp:0,cls:0,longTasks:0};
    new PerformanceObserver(l=>l.getEntries().forEach(e=>window.measurements.lcp=e.startTime)).observe({type:'largest-contentful-paint',buffered:true});
    new PerformanceObserver(l=>l.getEntries().forEach(e=>{if(!e.hadRecentInput)window.measurements.cls+=e.value})).observe({type:'layout-shift',buffered:true});
    new PerformanceObserver(l=>l.getEntries().forEach(e=>window.measurements.longTasks+=e.duration)).observe({type:'longtask',buffered:true});
  });
  await page.goto(origin); await page.waitForTimeout(12000);
  results.measurements.push(await page.evaluate(()=>({...window.measurements,bytes:performance.getEntriesByType('resource').reduce((a,r)=>a+r.transferSize,0),fcp:performance.getEntriesByName('first-contentful-paint')[0]?.startTime,canvasCount:document.querySelectorAll('canvas').length})));
  await context.close();
}
assert.deepEqual(results.errors,[]);
await fs.writeFile(performanceOnly ? 'reports/performance-final.json' : 'reports/verification.json',JSON.stringify(results,null,2));
console.log(JSON.stringify(results,null,2));
await browser.close();
