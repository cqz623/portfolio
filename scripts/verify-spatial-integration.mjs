import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { Server } from '../.svelte-kit/output/server/index.js';
import { manifest, base, pagePath } from './built-site.mjs';
import { projects } from './project-catalog.mjs';

const origin = 'http://portfolio.test';
const server = new Server(manifest);
await server.init({ env: process.env });
const route = path => new URL(`${base}${pagePath(path)}`, origin);
const request = url => server.respond(new Request(url), { getClientAddress: () => '127.0.0.1' });

for (const path of ['/', '/research', '/about', '/photography', '/bio', ...projects.map(p => `/projects/${p.slug}`)]) {
  const url = route(path);
  const response = await request(url);
  assert.equal(response.status, 200, url.pathname);
  const html = await response.text();
  for (const match of html.matchAll(/(?:href|src)="([^"<>]+)"/g)) {
    if (/^(data:|https?:|mailto:)/.test(match[1])) continue;
    const target = new URL(match[1], url);
    if (base) assert.ok(target.pathname === base || target.pathname.startsWith(`${base}/`), `Escaped base: ${target}`);
    if (target.pathname.includes('/images/projects/')) {
      await stat(`static${decodeURI(target.pathname.slice(base.length))}`);
    }
  }
  if (path === '/') {
    assert.ok([...html.matchAll(/href="([^"]+)"/g)].some(m => new URL(m[1], url).pathname === `${base}/projects/spatial-barrier-game`));
  }
  if (path === '/research') {
    assert.equal((html.match(/class="research-entry/g) ?? []).length, 3, 'Research should show three research entries');
    assert.ok(html.includes('From Representation to Decision:') && html.includes('Advisor: Françoise Bollack'));
    assert.ok(html.includes('COLLABORATIVE RESEARCH · COLUMBIA GSAPP · SPRING 2026'));
    assert.ok(html.includes('Should We Preserve the Scars of Water?') && html.includes('Status: accepted'));
    assert.ok([...html.matchAll(/href="([^"]+)"/g)].some(m => new URL(m[1], url).pathname.replace(/\/$/, '') === `${base}/projects/aptne-presentation`));
    assert.ok([...html.matchAll(/href="([^"]+)"/g)].some(m => new URL(m[1], url).pathname.replace(/\/$/, '') === `${base}/projects/decarbonization`));
  }
  if (path === '/projects/spatial-barrier-game') {
    const expected = `${base}/interactive/spatial-barrier-game/index.html`;
    const iframe = html.match(/<iframe[^>]*src="([^"]+)"/);
    assert.ok(iframe, 'Missing iframe');
    assert.equal(new URL(iframe[1], url).pathname, expected);
    assert.ok(html.includes('Open Fullscreen') && html.includes('View Source on GitHub'));
    assert.ok([...html.matchAll(/href="([^"]+)"/g)].some(m => new URL(m[1], url).pathname === expected), 'Fullscreen URL differs from iframe');
  }
}
const redirect = await request(route('/projects/cloud'));
assert.equal(redirect.status, 308);
assert.equal(new URL(redirect.headers.get('location'), route('/projects/cloud')).pathname, `${base}/projects/cloud-pavilion`);
assert.equal((await request(route('/projects/not-a-project'))).status, 404);

const hashes = {
  'index.html': '1954c55c669a9a4d70c175f05bc044c415ffc424',
  'style.css': '5a4d6f5546e2e5325355adad2f67b8d6d0f8c218',
  'app.js': '1ac498a6111bea54f2eaed67a31c67aa641b9130',
  'atlas.js': '3036a8d883eaedb434e61f446a53eddead3ea875',
  'core.js': 'bfa8aff87a9bbbd64ab19581e13ee27ca125494d'
};
for (const [name, hash] of Object.entries(hashes)) {
  const file = await readFile(`static/interactive/spatial-barrier-game/${name}`);
  assert.equal(createHash('sha1').update(`blob ${file.length}\0`).update(file).digest('hex'), hash, `Upstream mismatch: ${name}`);
  const text = file.toString();
  // Follow each runtime CSS, script, and module dependency from its own URL.
  const url = route(`/interactive/spatial-barrier-game/${name}`);
  const pattern = name.endsWith('.html') ? /(?:href|src)="(\.\/[^"]+)"/g : /from\s*['"](\.\/[^'"]+)['"]/g;
  for (const match of text.matchAll(pattern)) {
    const target = new URL(match[1], url);
    assert.ok(target.pathname.startsWith(`${base}/interactive/spatial-barrier-game/`));
    await stat(`static${target.pathname.slice(base.length)}`);
  }
}
console.log(`Passed: ${projects.length + 5} portfolio pages, iframe/fullscreen URLs, navigation, image paths, game imports, upstream hashes, redirect and 404 (base: ${base || '/'}).`);
