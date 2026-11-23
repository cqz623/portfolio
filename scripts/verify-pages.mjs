import { mediaReplacements, publicMediaPath } from '../src/lib/data/media-delivery.js';
import assert from 'node:assert/strict';
import { readFileSync, statSync, existsSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { files, projects } from './project-catalog.mjs';
import { base } from './built-site.mjs';

const root=resolve('build');
const paths=['/','/research/','/about/','/bio/','/photography/',...projects.map(project=>`/projects/${project.slug}/`)];
let checked=0;
for(const path of paths){
  const file=join(root,path,'index.html');
  assert.ok(existsSync(file),`Missing prerendered direct-visit page: ${path}`);
  const html=readFileSync(file,'utf8');
  const url=new URL(`https://cqz623.github.io${base}${path}`);
  assert.ok(!html.includes('Edit Layout')&&!html.includes('Save Layout'),`Editing controls leaked: ${path}`);
  for(const match of html.matchAll(/(?:href|src|data-pdf-src)="([^"<>]+)"/g)){
    const value=match[1].replaceAll('&amp;','&');
    if(/^(https?:|data:|mailto:|tel:|javascript:)/.test(value))continue;
    const target=new URL(value,url);
    assert.ok(!base || target.pathname===base || target.pathname.startsWith(base+'/'),`Escaped Pages base: ${target}`);
    const local=decodeURIComponent(target.pathname.slice(base.length));
    const asset=join(root,local);
    assert.ok(existsSync(asset),`Broken ${path} URL: ${value} → ${local}`);
    if(statSync(asset).isDirectory())assert.ok(existsSync(join(asset,'index.html')),`Missing directory index: ${local}`);
    checked++;
  }
}
assert.ok(existsSync(join(root,'projects/cloud/index.html')),'Missing legacy Cloud redirect');
assert.ok(readFileSync(join(root,'projects/cloud/index.html'),'utf8').includes('cloud-pavilion'));
assert.ok(existsSync(join(root,'404.html')));assert.ok(existsSync(join(root,'.nojekyll')));
assert.ok(!existsSync(join(root,'__work-layout'))&&!existsSync(join(root,'__work-layout.html')));
const walk=folder=>readdirSync(folder,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(join(folder,entry.name)):[join(folder,entry.name)]);
const bundled=walk(join(root,'_app'));
const scripts=bundled.filter(file=>/\.m?js$/.test(file));
assert.ok(bundled.some(file=>file.includes('pdf.worker')),'Missing bundled PDF.js worker');
for(const file of scripts)assert.ok(!/Save Layout|Edit Layout|dnd-action-dragged-el/.test(readFileSync(file,'utf8')),`Development editor bundled in ${file}`);
for(const folder of ['cmaps','standard_fonts','wasm','iccs'])assert.ok(readdirSync(join(root,'pdfjs',folder)).length>0,`Missing PDF.js ${folder}`);
for(const app of ['spatial-barrier-game','population-flood-sandbox'])assert.ok(existsSync(join(root,'interactive',app,'index.html')));
for (const src of files) {
  const file=join(root,publicMediaPath(src));
  if (statSync(file).size < 1024) assert.ok(!readFileSync(file,'utf8').startsWith('version https://git-lfs.github.com/spec/v1'),`Git LFS pointer published instead of media: ${src}`);
}
for(const [original,replacement] of Object.entries(mediaReplacements)){
  assert.ok(!existsSync(join(root,original)),`Original published: ${original}`);
  assert.ok(statSync(join(root,replacement)).size < 100*1024*1024,`Oversized delivery copy: ${replacement}`);
}
console.log(`Verified ${paths.length} prerendered pages, legacy redirect, ${checked} local URLs, worker/support assets, simulations, 404 and production editor exclusion (base: ${base || '/'}).`);
