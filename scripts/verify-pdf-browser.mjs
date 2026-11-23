// Optional browser integration check. Uses virtual aliases; original media is never changed.
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { pdfFixture } from './pdf-viewer-fixtures.mjs';
import { projectGalleryFiles } from './project-gallery-files.mjs';

const { chromium } = await import(process.env.PDF_BROWSER_DRIVER ?? 'playwright-core');
const catalog = projectGalleryFiles().load('\0virtual:project-gallery-files').match(/^export default (.*); export const dimensions = (.*);$/);
const files = JSON.parse(catalog[1]), dimensions = JSON.parse(catalog[2]);
const folder = '/images/projects/decarbonization/';
const pdf = folder + 'cover01.pdf';
const documents = new Map([['MULTIPAGE_FIXTURE', pdfFixture([[792, 612], [400, 700], [900, 300]])], ['SINGLE_PAGE_FIXTURE', pdfFixture([[600, 900]])]]);
const aliases = new Map([
  [pdf, 'MULTIPAGE_FIXTURE'],
  [folder + 'cover.pdf', pdf], [folder + '01.pdf', pdf],
  [folder + '02.png', '/images/projects/deep-eye/01.png'],
  [folder + '03.mp4', '/images/projects/material- experimentation/cover.mp4'],
  [folder + '04.pdf', 'INVALID_PDF_FIXTURE'],
  [folder + '05.pdf', 'SINGLE_PAGE_FIXTURE'],
  [folder + 'cover02.jpg', '/images/projects/cloud/cover.jpg']
]);
const fixtureFiles = [...new Set(files.filter(src => src !== folder + 'cover.jpg').concat([...aliases.keys()]))];
for (const [path, target] of aliases) dimensions[path] = target === 'SINGLE_PAGE_FIXTURE' ? {width:600,height:900} : dimensions[target] ?? dimensions[pdf];
const server = await createServer({
  configFile: 'vite.config.js',
  server: { host: '127.0.0.1', port: 5197, strictPort: true },
  plugins: [{
    name: 'temporary-pdf-test-aliases', enforce: 'pre',
    load(id) {
      if (id === '\0virtual:project-gallery-files') return `export default ${JSON.stringify(fixtureFiles)}; export const dimensions = ${JSON.stringify(dimensions)};`;
    },
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const path = decodeURI(new URL(request.url, 'http://localhost').pathname);
        const target = aliases.get(path);
        if (!target) return next();
        if (documents.has(target)) { response.setHeader('Content-Type', 'application/pdf'); response.end(documents.get(target)); return; }
        if (target === 'INVALID_PDF_FIXTURE') { response.setHeader('Content-Type', 'application/pdf'); response.end('Invalid PDF test fixture'); return; }
        response.writeHead(302, { Location: encodeURI(target) }); response.end();
      });
    }
  }]
});
let browser;
try {
  await server.listen();
  browser = await chromium.launch({ executablePath: process.env.PDF_CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 });
  page.setDefaultTimeout(15000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:5197/', { waitUntil: 'networkidle' });
  const card = page.locator('#decarbonization');
  await card.scrollIntoViewIfNeeded();
  await card.locator('canvas.ready').waitFor({ timeout: 30000 });
  assert.equal(await card.locator('canvas').evaluate(node => getComputedStyle(node).objectFit), 'cover');
  assert.equal(await card.locator('canvas').getAttribute('data-page'), '1');
  assert.equal(await card.locator('.page-controls').count(), 0);
  await page.getByRole('button',{name:'Edit Layout',exact:true}).click();
  const editablePdf = page.locator('.edit-card[data-project-slug="decarbonization"]');
  await editablePdf.scrollIntoViewIfNeeded();
  await editablePdf.locator('canvas.ready').waitFor({timeout:30000});
  assert.equal(await editablePdf.locator('.page-controls').count(),0);
  const index = await editablePdf.evaluate(node => [...node.parentElement.children].indexOf(node));
  await editablePdf.focus();await page.keyboard.press('Space');
  await page.keyboard.press(index > 0 ? 'ArrowUp' : 'ArrowDown');await page.keyboard.press('Space');
  await editablePdf.locator('canvas.ready').waitFor({timeout:30000});
  page.once('dialog',dialog=>dialog.accept());
  await page.getByRole('button',{name:'Cancel',exact:true}).click();
  await card.scrollIntoViewIfNeeded();await card.locator('canvas.ready').waitFor({timeout:30000});
  await card.click();
  await page.waitForURL('**/projects/decarbonization');
  const large = page.locator('.large-images .pdf-preview');
  await large.scrollIntoViewIfNeeded();
  await large.locator('canvas.ready').waitFor({ timeout: 30000 });
  assert.equal(await page.locator('.large-images figure').count(), 2);
  assert.ok(await large.evaluate(node => node.getBoundingClientRect().top < document.querySelector('.project-copy').getBoundingClientRect().top));
  const inline = page.locator('.large-images .pdf-viewer');
  const waitPage = (viewer, number) => viewer.locator(`canvas.ready[data-page="${number}"]`).waitFor({timeout:15000});
  assert.equal(await inline.locator('.page-indicator').textContent(), '1 / 3');
  assert.equal(await inline.getByRole('button', {name:'Previous PDF page'}).isDisabled(), true);
  await inline.getByRole('button', {name:'Next PDF page'}).click();
  await waitPage(inline, 2);
  const portrait = await large.boundingBox();
  assert.ok(Math.abs(portrait.width / portrait.height - 400 / 700) < .001);
  await inline.focus(); await page.keyboard.press('ArrowRight'); await waitPage(inline, 3);
  assert.equal(await inline.getByRole('button', {name:'Next PDF page'}).isDisabled(), true);
  await page.keyboard.press('ArrowRight');
  assert.equal(await inline.locator('.page-indicator').textContent(), '3 / 3');
  await page.keyboard.press('ArrowLeft'); await waitPage(inline, 2);
  await inline.evaluate(node => {
    node.querySelector('[aria-label="Previous PDF page"]').click();
    node.querySelector('[aria-label="Next PDF page"]').click();
    node.querySelector('[aria-label="Next PDF page"]').click();
    node.querySelector('[aria-label="Previous PDF page"]').click();
  });
  await waitPage(inline, 2);
  assert.equal(await inline.locator('.page-indicator').textContent(), '2 / 3');
  await page.setViewportSize({width:390,height:844});
  await inline.scrollIntoViewIfNeeded(); await waitPage(inline, 2);
  assert.ok((await large.boundingBox()).width < 390);
  await page.setViewportSize({width:1440,height:1000});
  const gallery = page.locator('.project-gallery');
  await gallery.scrollIntoViewIfNeeded();
  await gallery.locator('.track .pdf-preview canvas.ready').first().waitFor({ timeout: 30000 });
  assert.equal(await gallery.locator('.track .page-controls').count(), 0);
  assert.equal(await gallery.locator('.track video').count(), 1);
  assert.equal(await gallery.locator('.track img').count(), 1);
  assert.equal(await gallery.locator('.track figure').count(), 5);
  await gallery.locator('.track .image-button').first().click();
  await page.locator('dialog[open] .pdf-preview canvas.ready').waitFor({ timeout: 30000 });
  const viewer = page.locator('dialog[open] .pdf-viewer');
  assert.equal(await viewer.locator('.page-indicator').textContent(), '1 / 3');
  await page.keyboard.press('ArrowRight'); await waitPage(viewer, 2);
  assert.equal(await page.locator('dialog[open] .lightbox-controls span').textContent(), '1 / 4');
  await viewer.getByRole('button', {name:'Next PDF page'}).click(); await waitPage(viewer, 3);
  assert.equal(await viewer.getByRole('button', {name:'Next PDF page'}).isDisabled(), true);
  const link = viewer.getByRole('link', { name: 'Open original PDF' });
  assert.ok((await link.getAttribute('href')).endsWith('01.pdf'));
  assert.equal(await link.getAttribute('target'), '_blank');
  const popupPromise = page.waitForEvent('popup'); await link.click();
  const popup = await popupPromise; await popup.waitForLoadState('domcontentloaded');
  assert.ok(popup.url().endsWith('cover01.pdf') || popup.url().endsWith('01.pdf')); await popup.close();
  await page.getByRole('button', { name: 'Next fullscreen image' }).click();
  assert.equal(await page.locator('dialog[open] .enlarged img').count(), 1);
  await page.getByRole('button', { name: 'Close fullscreen image' }).click();
  const single = gallery.locator('.track .image-button').last();
  await single.scrollIntoViewIfNeeded(); await single.click();
  await page.locator('dialog[open] .pdf-preview canvas.ready').waitFor({ timeout: 30000 });
  assert.equal(await page.locator('dialog[open] .page-controls').count(), 0);
  assert.equal(await page.locator('dialog[open]').getByRole('link', {name:'Open original PDF'}).count(), 1);
  await page.getByRole('button', {name:'Close fullscreen image'}).click();
  await gallery.locator('.track').evaluate(node => node.scrollLeft = 0);
  const right = gallery.getByRole('button', { name: 'Next gallery images' });
  await right.click();
  await page.waitForFunction(() => document.querySelector('.track').scrollLeft > 0);
  const invalid = gallery.locator('.track [data-pdf-src$="04.pdf"]');
  await invalid.scrollIntoViewIfNeeded();
  await invalid.getByText('PDF preview unavailable').waitFor();
  await page.setViewportSize({ width: 390, height: 844 });
  await gallery.scrollIntoViewIfNeeded();
  assert.equal(Math.round(await gallery.locator('.track .pdf-preview').first().evaluate(node => node.getBoundingClientRect().height)), 200);
  await page.goto('http://127.0.0.1:5197/projects/deep-eye');
  assert.equal(await page.locator('.track img').count(), 5);
  assert.equal(await page.locator('.pdf-preview').count(), 0);
  assert.deepEqual(errors, []);
  console.log('Passed browser checks: passive PDF cover, inline/lightbox page buttons and keyboard, first/last bounds, rapid navigation, mixed page dimensions, single-page control hiding, original link, mixed PNG/MP4/PDF gallery, image lightbox, mobile sizing, errors and unchanged image-only project.');
} catch (error) {
  const page = browser?.contexts()[0]?.pages()[0];
  if (page) {
    console.error('PDF failure state', await page.evaluate(() => ({ scrollY, focus: document.activeElement?.outerHTML.slice(0,300), viewers: [...document.querySelectorAll('.pdf-viewer')].map(node => ({box:node.getBoundingClientRect().toJSON(), page:node.querySelector('.page-indicator')?.textContent, canvas:node.querySelector('canvas')?.outerHTML, status:node.querySelector('.status')?.textContent})) })));
    await page.screenshot({path:'/tmp/pdf-pages-failure.png'});
  }
  throw error;
} finally { await browser?.close(); await server.close(); }
