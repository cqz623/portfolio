import assert from 'node:assert/strict';
import { stat } from 'node:fs/promises';
import { Server } from '../.svelte-kit/output/server/index.js';
import { manifest, base, pagePath } from './built-site.mjs';
import { projects, files, dimensions } from './project-catalog.mjs';
import { projectImageLayout } from '../src/lib/utils/project-gallery.js';

const server = new Server(manifest);
await server.init({ env: process.env });
async function page(path) {
  const url = new URL(`http://portfolio.test${base}${pagePath(path)}`);
  const response = await server.respond(new Request(url), { getClientAddress: () => '127.0.0.1' });
  assert.equal(response.status, 200, path);
  return { url, html: (await response.text()).match(/<main[\s\S]*?<\/main>/)[0] };
}
function images(html, url) {
  return [...html.matchAll(/(?:<(?:img|video)[^>]*src|data-pdf-src)="([^"]+)"/g)].map(match => decodeURI(new URL(match[1], url).pathname).slice(base.length));
}
const home = await page('/');
for (const project of projects) {
  const layout = projectImageLayout(project, files, dimensions);
  const { html, url } = await page(`/projects/${project.slug}`);
  const largeSection = html.match(/<section[^>]*class="large-images[^>]*>[\s\S]*?<\/section>/)?.[0] ?? '';
  const track = html.match(/<div[^>]*class="track[^>]*>[\s\S]*?<\/div>/)?.[0] ?? '';
  assert.deepEqual(images(largeSection, url), layout.large.map(i => i.src), `${project.slug}: large images`);
  assert.deepEqual(images(track, url), layout.gallery.map(i => i.src), `${project.slug}: gallery images`);
  assert.ok(images(html, url).every(src => !/\/cover\.(png|jpe?g|webp|mp4|pdf)$/i.test(src)), `${project.slug}: homepage cover leaked into detail`);
  assert.ok(!html.includes('Project images forthcoming'), `${project.slug}: detail placeholder`);
  if (!layout.large.length) assert.equal(largeSection, '');
  if (!layout.gallery.length) assert.ok(!html.includes('<section class="project-gallery'));
  if (!project.interactive) {
    const overview = html.indexOf('class="project-copy');
    assert.ok(overview > html.indexOf('project-heading'));
    if (largeSection) assert.ok(html.indexOf(largeSection) + largeSection.length < overview, `${project.slug}: large images split by Overview`);
    if (track) assert.ok(overview < html.indexOf(track), `${project.slug}: gallery before Overview`);
    assert.ok(html.includes(project.description ?? 'Project introduction forthcoming.'));
  } else assert.ok(html.includes('<iframe'), `${project.slug}: missing original simulation`);
  const card = home.html.match(new RegExp(`<a[^>]*id="${project.slug}"[\\s\\S]*?<\\/a>`))[0];
  assert.deepEqual(images(card, home.url), layout.cover ? [layout.cover.src] : [], `${project.slug}: homepage thumbnail changed`);
  for (const image of [layout.cover, ...layout.large, ...layout.gallery].filter(Boolean)) await stat(`static${image.src}`);
  if (['deep-eye', 'cloud-pavilion', 'layered-walkway'].includes(project.slug)) console.log(`${project.slug}: large=${layout.large.map(i => i.src.split('/').at(-1)).join(', ') || 'hidden'}; gallery=${layout.gallery.map(i => i.src.split('/').at(-1)).join(', ') || 'hidden'}`);
}
console.log(`Passed final image standard for all ${projects.length} projects: homepage-only covers, consecutive large images, Overview/gallery ordering, empty-section hiding and image paths (${base || '/'}).`);
