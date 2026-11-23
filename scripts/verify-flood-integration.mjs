import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import { Server } from '../.svelte-kit/output/server/index.js';
import { manifest, base, pagePath } from './built-site.mjs';
import { projects } from './project-catalog.mjs';

const root = 'static/interactive/population-flood-sandbox/';
const source = JSON.parse(await readFile(`${root}UPSTREAM.json`, 'utf8'));
for (const file of source.files) {
  const bytes = await readFile(`${root}${file.path}`);
  assert.equal(bytes.length, file.size, file.path);
  assert.equal(createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex'), file.sha, file.path);
  if (/\.(geojson|json)$/.test(file.path)) JSON.parse(bytes.toString());
}
const position = projects.findIndex(p => p.slug === 'spatial-barrier-game');
assert.equal(projects[position + 1].slug, 'population-flood-sandbox');
const server = new Server(manifest);
await server.init({ env: process.env });
const origin = 'http://portfolio.test';
for (const path of ['/', '/research', '/projects/population-flood-sandbox']) {
  const url = new URL(`${base}${pagePath(path)}`, origin);
  const response = await server.respond(new Request(url), { getClientAddress: () => '127.0.0.1' });
  assert.equal(response.status, 200);
  const html = await response.text();
  if (path !== '/projects/population-flood-sandbox') {
    const urls = [...html.matchAll(/href="([^"]+)"/g)].map(m => new URL(m[1], url).pathname);
    const first = urls.indexOf(`${base}/projects/spatial-barrier-game`);
    assert.equal(urls[first + 1], `${base}/projects/population-flood-sandbox`);
  } else {
    const src = html.match(/<iframe[^>]+src="([^"]+)"/)?.[1];
    assert.ok(src);
    assert.equal(new URL(src, url).pathname, `${base}/interactive/population-flood-sandbox/index.html`);
    assert.ok(html.includes('Open Fullscreen') && html.includes('View Source on GitHub'));
    assert.ok(html.includes('2020, 2030, 2040, and 2050'));
    assert.ok(html.includes('not validated causal predictions'));
  }
}

// Run the original inline application with real local data and small DOM/Leaflet
// adapters. This verifies initialization, calculations and year events, not pixels
// or the external Leaflet renderer (those require a real browser).
const html = await readFile(`${root}index.html`, 'utf8');
assert.ok(html.includes('leaflet@1.9.4') && html.includes('OpenStreetMap'));
const script = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].at(-1)[1];
const buttons = [], elements = new Map(), fetched = new Set();
const element = () => ({ textContent: '', dataset: {}, style: {}, attributes: {}, classList: { add() {} }, setAttribute(k,v) { this.attributes[k] = v; }, addEventListener(k,fn) { this[k] = fn; }, append(node) { buttons.push(node); } });
const get = id => { if (!elements.has(id)) elements.set(id, element()); return elements.get(id); };
const map = { createPane() {}, getPane: () => ({ style: {} }), removeLayer() {}, fitBounds() {}, invalidateSize() {} };
const layer = () => ({ addTo() { return this; } });
const appUrl = new URL(`${base}/interactive/population-flood-sandbox/index.html`, origin);
const context = vm.createContext({
  console: { info() {}, error(error) { throw error; } }, Intl, Error, ResizeObserver: class { observe() {} },
  requestAnimationFrame: fn => { fn(); return 1; }, window: { addEventListener() {} },
  document: { getElementById: get, createElement: element, querySelector: () => ({}), querySelectorAll: selector => selector === '.year-button' ? buttons : Array.from({ length: 5 }, element) },
  fetch: async path => {
    const url = new URL(path, appUrl);
    assert.ok(url.pathname.startsWith(`${base}/interactive/population-flood-sandbox/sandbox/`));
    const local = `static${url.pathname.slice(base.length)}`;
    const text = await readFile(local, 'utf8'); fetched.add(url.pathname);
    return { ok: true, json: async () => JSON.parse(text), text: async () => text };
  },
  L: { map: () => map, canvas: layer, svg: layer, tileLayer: layer, geoJSON: layer, latLngBounds: () => ({ extend() {}, pad() { return this; } }) }
});
await vm.runInContext(script.replace(/initialize\(\);\s*$/, 'globalThis.ready = initialize();'), context);
await context.ready;
assert.equal(buttons.length, 4);
for (const year of [2020, 2030, 2040, 2050]) {
  await buttons.find(b => b.dataset.year === String(year)).click();
  assert.equal(get('metrics-year').textContent, String(year));
  assert.ok(get('map-status').textContent.startsWith(`${year} ·`));
  assert.equal(buttons.find(b => b.dataset.year === String(year)).attributes['aria-pressed'], 'true');
  assert.notEqual(get('exposed-population').textContent, '');
}
assert.equal(fetched.size, 11, 'Expected all initial datasets and four boundary layers');
assert.equal(get('error-message').textContent, '');
console.log(`Passed: ${source.files.length} unchanged source/data files, project ordering, detail iframe, all four original scenario events and data fetches (base: ${base || '/'}). Browser rendering is not covered.`);
