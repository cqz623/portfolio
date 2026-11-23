import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createServer, preview } from 'vite';
const { chromium } = await import(process.env.LAYOUT_BROWSER_DRIVER ?? 'playwright-core');
const path = 'src/lib/data/work-layout.json';
const original = await readFile(path,'utf8');
const server = await createServer({configFile:'vite.config.js',server:{host:'127.0.0.1',port:5196,strictPort:true}});
let browser, production, lastSaved;
const origin = 'http://127.0.0.1:5196';
try {
  await server.listen();
  browser = await chromium.launch({executablePath:process.env.PDF_CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
  const page = await browser.newPage({viewport:{width:1440,height:2000}});
  page.setDefaultTimeout(12000);
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  let acceptDialogs = true;
  const dialogs = [];
  page.on('dialog',dialog=>{dialogs.push(dialog.message());return acceptDialogs ? dialog.accept() : dialog.dismiss();});
  await page.goto(origin,{waitUntil:'networkidle'});
  const nativeContainer = page.locator('.image-grid').count();
  const native = await nativeContainer ? await page.locator('.image-grid').evaluate(node=>{
    const map=new Map();for(const card of node.children){const x=Math.round(card.getBoundingClientRect().left);map.set(x,[...(map.get(x)??[]),card.id]);}
    return [...map.entries()].sort((a,b)=>a[0]-b[0]).map(entry=>entry[1]);
  }) : await page.locator('.saved-column').evaluateAll(columns=>columns.map(column=>[...column.querySelectorAll('.thumbnail')].map(card=>card.id)));
  const defaults = await page.locator('.default-probe').evaluate(node=>{
    const map=new Map();for(const card of node.children){const x=Math.round(card.getBoundingClientRect().left);map.set(x,[...(map.get(x)??[]),card.dataset.projectSlug]);}
    return [...map.entries()].sort((a,b)=>a[0]-b[0]).map(entry=>entry[1]);
  });
  const expectedSlugs=native.flat().sort();
  const snapshot=()=>page.locator('.drop-zone').evaluateAll(zones=>zones.map(zone=>[...zone.children].map(card=>card.dataset.projectSlug)));
  await page.getByRole('button',{name:'Edit Layout',exact:true}).click();
  await page.locator('.drop-zone').first().waitFor();
  assert.deepEqual(await snapshot(),native,'Opening editor must preserve actual column placement');
  assert.equal(await page.locator('.edit-card a[href]').count(),0);
  await page.locator('.edit-card').first().click();assert.equal(page.url(),origin+'/');
  const video=page.locator('.edit-card video');
  assert.equal(await video.count(),1);assert.equal(await video.evaluate(node=>node.muted && node.autoplay && node.loop && node.playsInline),true);
  async function drag(sourceSlug,column,index,after=false) {
    const source=page.locator(`.edit-card[data-project-slug="${sourceSlug}"]`);
    const target=page.locator('.drop-zone').nth(column).locator('.edit-card').nth(index);
    const a=await source.boundingBox(),b=await target.boundingBox();
    await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();
    await page.mouse.move(a.x+a.width/2+8,a.y+a.height/2+8,{steps:3});
    await page.waitForTimeout(180);
    await page.mouse.move(b.x+b.width/2,b.y+b.height*(after?.8:.2),{steps:16});
    await page.waitForTimeout(300);
    const insertion=page.locator('.insertion');
    assert.ok(await insertion.count()>0);
    assert.equal(await insertion.first().evaluate(node=>getComputedStyle(node).visibility),'visible');
    const preview=await page.locator('#dnd-action-dragged-el').boundingBox();
    assert.ok(Math.abs(preview.width/preview.height-a.width/a.height)<.02,'Drag preview keeps source ratio');
    await page.mouse.up();
    await page.locator('#dnd-action-dragged-el').waitFor({state:'detached'});
    await page.waitForTimeout(200);
  }
  await drag(native[0][0],0,1,true);
  assert.notDeepEqual(await snapshot(),native,'Same-column mouse drag');
  const beforeCross=await snapshot();
  await drag(beforeCross[0][0],1,0);
  const moved=await snapshot();
  assert.ok(moved[1].includes(beforeCross[0][0]),'Cross-column mouse drag');
  assert.deepEqual(moved.flat().sort(),expectedSlugs);
  lastSaved=JSON.stringify({version:1,columns:moved},null,2)+'\n';
  await page.getByRole('button',{name:'Save Layout',exact:true}).click();
  await page.getByText('Layout saved locally.',{exact:false}).waitFor();
  assert.equal(await readFile(path,'utf8'),lastSaved);
  assert.deepEqual(JSON.parse(lastSaved).columns,moved);
  await page.reload({waitUntil:'networkidle'});
  await page.waitForFunction(()=>document.querySelectorAll('.saved-column').length===3);
  const persisted=await page.locator('.saved-column').evaluateAll(columns=>columns.map(column=>[...column.querySelectorAll('a.thumbnail')].map(card=>card.id)));
  assert.deepEqual(persisted,moved,'Refresh preserves exact columns');
  await page.getByRole('button',{name:'Edit Layout',exact:true}).click();await page.locator('.drop-zone').first().waitFor();
  const keyboard=page.locator('.drop-zone').first().locator('.edit-card').first();
  await keyboard.focus();await page.keyboard.press('Space');await page.keyboard.press('ArrowDown');await page.keyboard.press('Space');
  assert.notDeepEqual(await snapshot(),moved,'Keyboard reorder');
  const beforeKeyboardCross=await snapshot();
  const keyboardSlug=beforeKeyboardCross[0][0];
  await page.locator('.drop-zone').first().locator('.edit-card').first().focus();
  await page.keyboard.press('Space');await page.keyboard.press('Tab');await page.keyboard.press('Space');
  assert.ok((await snapshot())[1].includes(keyboardSlug),'Keyboard cross-column transfer');
  acceptDialogs=false;
  await page.getByRole('link',{name:'Research',exact:true}).click();
  assert.equal(page.url(),origin+'/');
  assert.equal(await page.locator('.editor-grid').count(),1,'Unsaved navigation warning can keep editor open');
  acceptDialogs=true;
  await page.getByRole('button',{name:'Cancel',exact:true}).click();
  assert.deepEqual(await page.locator('.saved-column').evaluateAll(columns=>columns.map(column=>[...column.querySelectorAll('a.thumbnail')].map(card=>card.id))),moved,'Cancel restores saved layout');
  await page.getByRole('button',{name:'Edit Layout',exact:true}).click();await page.locator('.drop-zone').first().waitFor();
  await page.getByRole('button',{name:'Reset to Default',exact:true}).click();
  assert.deepEqual(await snapshot(),defaults,'Reset reproduces original native placement');
  assert.equal(await readFile(path,'utf8'),lastSaved,'Reset must not write before Save');
  await page.getByRole('button',{name:'Cancel',exact:true}).click();
  await page.setViewportSize({width:800,height:1200});
  await page.waitForFunction(()=>document.querySelectorAll('.saved-column').length===2);
  assert.deepEqual((await page.locator('.saved-column .thumbnail').evaluateAll(cards=>cards.map(card=>card.id))).sort(),expectedSlugs);
  await page.setViewportSize({width:390,height:844});
  await page.waitForFunction(()=>document.querySelectorAll('.saved-column').length===1);
  assert.deepEqual(await page.locator('.saved-column .thumbnail').evaluateAll(cards=>cards.map(card=>card.id)),moved.flat());
  const endpoint=origin+'/__work-layout';
  const revision=(await (await page.request.get(endpoint)).json()).revision;
  assert.equal((await page.request.post(endpoint,{headers:{Origin:'http://evil.example'},data:{layout:{version:1,columns:moved},revision}})).status(),403);
  assert.equal((await page.request.post(endpoint,{headers:{Origin:origin},data:{layout:{version:1,columns:[['invalid'],[],[]]},revision}})).status(),400);
  assert.equal((await page.request.post(endpoint,{headers:{Origin:origin},data:{layout:{version:1,columns:moved},revision:'stale'}})).status(),409);
  // Real touch events, not synthetic DND library events.
  const touchPage=await browser.newPage({viewport:{width:900,height:1400},hasTouch:true,isMobile:true});
  touchPage.on('dialog',dialog=>dialog.accept());
  await touchPage.goto(origin,{waitUntil:'networkidle'});
  await touchPage.getByRole('button',{name:'Edit Layout',exact:true}).tap();await touchPage.locator('.drop-zone').first().waitFor();
  const beforeTouch=await touchPage.locator('.drop-zone').evaluateAll(zones=>zones.map(zone=>[...zone.children].map(card=>card.dataset.projectSlug)));
  const touchCards=touchPage.locator('.drop-zone').first().locator('.edit-card');
  const a=await touchCards.nth(0).boundingBox(),b=await touchCards.nth(1).boundingBox();
  const cdp=await touchPage.context().newCDPSession(touchPage);
  const point=(x,y)=>({x,y,id:0,radiusX:2,radiusY:2,force:1});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point(a.x+a.width/2,a.y+a.height/2)]});
  await touchPage.waitForTimeout(240);
  for(let step=1;step<=12;step++) {
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[point(a.x+a.width/2+(b.x-a.x)*step/12,a.y+a.height/2+(b.y+b.height*.8-a.y-a.height/2)*step/12)]});
    await touchPage.waitForTimeout(25);
  }
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await touchPage.waitForTimeout(400);
  const afterTouch=await touchPage.locator('.drop-zone').evaluateAll(zones=>zones.map(zone=>[...zone.children].map(card=>card.dataset.projectSlug)));
  assert.notDeepEqual(afterTouch,beforeTouch,'Touch reorder');
  assert.deepEqual(afterTouch.flat().sort(),expectedSlugs);
  await touchPage.getByRole('button',{name:'Cancel',exact:true}).tap();await touchPage.close();
  assert.ok(dialogs.some(message=>message.includes('Discard unsaved layout changes')));
  assert.deepEqual(errors,[]);
  production=await preview({configFile:'vite.config.js',preview:{host:'127.0.0.1',port:5195,strictPort:true}});
  const {base}=await import('./built-site.mjs');
  const visitor=await browser.newPage();await visitor.goto(`http://127.0.0.1:5195${base}/`);
  assert.equal(await visitor.getByRole('button',{name:'Edit Layout',exact:true}).count(),0);
  for(const method of ['GET','POST'])assert.equal((await visitor.request.fetch(`http://127.0.0.1:5195${base}/__work-layout`,{method,headers:{Origin:'http://127.0.0.1:5195'}})).status(),404);
  console.log('Passed: initial placement, same/cross-column mouse drag, keyboard and touch reorder, save/refresh, cancel/reset, responsive order, video covers, validation/CSRF/revision checks and production editing disabled.');
} catch(error) { console.error(error);throw error; }
finally {
  await browser?.close();await server.close();production?.httpServer.close();
  if(lastSaved && await readFile(path,'utf8')===lastSaved) await writeFile(path,original);
}
