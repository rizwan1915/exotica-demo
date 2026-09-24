import { chromium } from 'playwright-core';
import fs from 'node:fs/promises';
const browser = await chromium.connectOverCDP(process.env.EXOTICA_CDP || 'http://127.0.0.1:64177');
const renderContext=await browser.newContext({viewport:{width:700,height:800},deviceScaleFactor:1});
const renderPage=await renderContext.newPage();
await renderPage.goto('http://localhost:8080');
await renderPage.setContent('<html><body style="margin:0;background:transparent"><div id="bottle" style="width:700px;height:800px"></div></body></html>');
for(const variant of ['noir','oud','rose','amber']) {
  await renderPage.evaluate(async variant=>{
    window.dispose?.();
    const host=document.getElementById('bottle');host.dataset.bottle=variant;
    const {mount}=await import('/js/bottle-scene.min.js');
    window.dispose=mount(host,{poster:true});
  },variant);
  await renderPage.locator('canvas').screenshot({path:`assets/bottle-${variant}.png`,omitBackground:true});
}
await renderContext.close();
await browser.close();
