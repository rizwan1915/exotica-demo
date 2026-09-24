import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
const browser=await chromium.connectOverCDP(process.env.EXOTICA_CDP || 'http://127.0.0.1:64177');
for(const width of [320,390,430,768,1024,1440,1920]) {
 const context=await browser.newContext({viewport:{width,height:900}});
 const page=await context.newPage();
 await page.addInitScript(()=>{window.frameCount=0;const raf=window.requestAnimationFrame;window.requestAnimationFrame=callback=>raf.call(window,t=>{window.frameCount++;callback(t)});});
 await page.goto('http://localhost:8080');
 await page.waitForTimeout(700);
 if(width===390) {
  await page.getByRole('button',{name:'Explore in 3D',exact:true}).click();
  await page.waitForSelector('.model-ready');
  await page.locator('canvas').dispatchEvent('webglcontextlost');
  assert.equal(await page.locator('canvas').count(),0);
  assert.equal(await page.locator('#heroBottle img').evaluate(i=>getComputedStyle(i).visibility),'visible');
 }
 if(width===1440) {
  await page.getByRole('button',{name:'Explore in 3D',exact:true}).click();
  await page.waitForSelector('.model-ready');
  await page.getByRole('button',{name:'Pause motion'}).click();
  const count=await page.evaluate(()=>window.frameCount);
  await page.waitForTimeout(300);
  assert.equal(await page.evaluate(()=>window.frameCount),count);
  await page.getByRole('button',{name:'Resume motion'}).click();
  await page.evaluate(()=>window.scrollTo({top:3000,behavior:'instant'}));
  await page.waitForTimeout(300);
  const offscreen=await page.evaluate(()=>window.frameCount);
  await page.waitForTimeout(300);
  assert.equal(await page.evaluate(()=>window.frameCount),offscreen);
 }
 for(const image of await page.locator('.bottle-image').all()) {await image.scrollIntoViewIfNeeded();await image.evaluate(i=>i.decode());}
 const bounds=await page.locator('.bottle-image').evaluateAll(images=>images.every(image=>{const r=image.getBoundingClientRect(),p=image.parentElement.getBoundingClientRect();return r.top>=p.top-1&&r.left>=p.left-1&&r.bottom<=p.bottom+1&&r.right<=p.right+1}));
 assert.equal(bounds,true,`Bottle image containment at ${width}`);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
 await page.screenshot({path:`reports/final-${width}.png`,fullPage:true});
 await page.screenshot({path:`reports/hero-${width}.png`});
 console.log(`Final images loaded and visual captured at ${width}px`);
 await context.close();
}
await browser.close();
