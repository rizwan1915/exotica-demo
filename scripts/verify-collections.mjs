import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const browser=await chromium.connectOverCDP(process.env.EXOTICA_CDP);
const results=[];
for(const width of [320,390,430,768,1024,1440,1920]) {
 for(const route of ['','perfumes.html','body-sprays.html','oud.html']) {
  const ctx=await browser.newContext({viewport:{width,height:900}});
  const page=await ctx.newPage(); const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
  await page.goto('http://localhost:8080/'+route);
  await page.addStyleTag({content:'html {scroll-behavior:auto!important}'});
  assert.equal(await page.locator('h1').count(),1);
  for(const img of await page.locator('img').all()) { await img.scrollIntoViewIfNeeded(); await img.evaluate(i=>i.decode()); }
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${route}/${width}`);
  if(route) {
   assert.equal(await page.locator('.catalog-card').count(),4);
   for(const link of await page.locator('.catalog-card [data-interest]').all()) {
    const name=await link.getAttribute('data-interest'); await link.click();
    assert.equal(await page.locator('#interest').inputValue(),name);
   }
   await page.locator('#email').fill('test@example.com');
   await page.getByRole('button',{name:'Preview Enquiry'}).click();
   assert.match(await page.locator('#enquiryStatus').innerText(),/no enquiry has been sent/);
   for(const link of await page.locator('.collection-tabs a').all()) assert.equal((await page.request.get(new URL(await link.getAttribute('href'), page.url()).href)).status(),200);
  }
  const links=await page.locator('a[href]').evaluateAll(els=>els.map(e=>e.href));
  for(const href of new Set(links)) {
   const url=new URL(href); if(url.origin!=='http://localhost:8080')continue;
   const response=await page.request.get(url.origin+url.pathname);
   assert.equal(response.status(),200,href);
   if(url.hash) assert.ok((await response.text()).includes(`id="${url.hash.slice(1)}"`),href);
  }
  if([390,768,1024,1440].includes(width)) {
   await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
   await page.screenshot({path:`reports/collection-${route||'home'}-${width}.png`,fullPage:true});
  }
  if(await page.locator('#campaign').count()) {
   await page.locator('#campaign').scrollIntoViewIfNeeded();
   await page.waitForFunction(()=>document.querySelector('#campaign').classList.contains('is-moving'));
   await page.locator('.campaign-toggle').click();
   assert.equal(await page.locator('#campaign').evaluate(e=>e.classList.contains('is-moving')),false);
   await page.emulateMedia({reducedMotion:'reduce'});
   assert.equal(await page.locator('.campaign-motion').evaluate(e=>getComputedStyle(e).animationName),'none');
  }
  if(width===390) {
   await page.getByRole('button',{name:'Open menu',exact:true}).click();
   await page.locator('#navLinks a[href="oud.html"]').click();
   await page.waitForURL('**/oud.html');
   assert.equal(await page.locator('#burger').getAttribute('aria-expanded'),'false');
  }
  assert.deepEqual(errors,[]); results.push({width,route:route||'/',passed:true}); await ctx.close();
 }
}
const ctx=await browser.newContext({viewport:{width:1440,height:900}}); const page=await ctx.newPage();
await page.goto('http://localhost:8080/perfumes.html');
await page.getByRole('button',{name:'Explore in 3D'}).click();
await page.waitForSelector('.model-ready'); await page.getByRole('button',{name:'Pause motion',exact:true}).click();
assert.equal(await page.getByRole('button',{name:'Resume motion'}).getAttribute('aria-pressed'),'true');
await ctx.close();
await fs.writeFile('reports/collection-verification.json',JSON.stringify(results,null,2));
console.log(results); await browser.close();
