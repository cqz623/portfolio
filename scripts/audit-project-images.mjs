import { readdirSync } from 'node:fs';
import { projects } from '../src/lib/data/projects.js';
import { projectImageLayout } from '../src/lib/utils/project-gallery.js';
const root = 'static/images/projects';
const supported = /\.(jpe?g|png|webp)$/i;
const folders = readdirSync(root, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name).sort();
const name = src => src?.split('/').at(-1) ?? '—';
console.log('# Project image naming audit\n');
console.log('Rules: exact `cover` is homepage-only and never shown on detail pages; `coverNN` supplies consecutive large detail images before Overview; exact positive numeric stems supply the horizontal gallery. Extensions and case are preserved. Empty projects and unmatched folders do not create pages.\n');
console.log('| Folder | Existing project | Cover | Detail large images | Horizontal gallery | Unrecognized / unsupported |');
console.log('|---|---|---|---|---|---|');
let conflicts = [];
for (const folder of folders) {
  const entries = readdirSync(`${root}/${folder}`, { withFileTypes: true }).filter(d => d.isFile() && !d.name.startsWith('.')).map(d => d.name);
  if (!entries.length) continue;
  const directory = `/images/projects/${folder}/`;
  const paths = entries.filter(n => supported.test(n)).map(n => directory + n);
  const existing = projects.find(p => p.imageDirectory === directory);
  const project = existing ?? { title: folder, imageDirectory: directory, images: [] };
  const layout = projectImageLayout(project, paths);
  conflicts.push(...layout.conflicts.map(c => `${folder}: ${c.slot} → ${c.paths.map(name).join(', ')}`));
  const unexpected = [...layout.unrecognized.map(name), ...entries.filter(n => !supported.test(n))];
  console.log(`| \`${folder}\` | ${existing?.slug ?? '**Unmapped; no page created**'} | ${name(layout.cover?.src)} | ${layout.large.map(i => name(i.src)).join(', ') || '—'} | ${layout.gallery.map(i => name(i.src)).join(', ') || '—'} | ${unexpected.join(', ') || '—'} |`);
}
console.log('\n## Conflicts\n');
console.log(conflicts.length ? conflicts.map(c => `- ${c}`).join('\n') : 'No duplicate cover or numbered slots found.');
console.log('\nDuplicate slots keep an already configured source where possible; otherwise a deterministic filename order selects one. Conflicts are always reported here.');
console.log('\n## Existing-state notes\n');
console.log('- `cloud` is the existing image-directory alias for Cloud Pavilion.');
console.log('- Deep Eye and Reviving Spaces select their actual PNG covers instead of stale JPG paths.');
console.log('- Mercury Store now has a cover and numbered images; it is an existing project, not a newly created page.');
console.log('- The Work layout, aspect ratios, gaps and interactions are unchanged. Only exact cover files supply thumbnails; additional or numbered images never substitute for a missing cover.');
console.log('- Named files such as `01-overall-view.jpg` and `05-axonometric.png` remain untouched but are not displayed under the new exact-number rule.');
console.log('- Detail pages without `coverNN` files have no large-image section. Pages without exact numbered files have no horizontal gallery. No detail placeholders or cover fallbacks are created.');
console.log('\n## Missing detail image groups\n');
for (const project of projects) {
  const paths = readdirSync(`${root}/${project.imageDirectory.split('/').filter(Boolean).at(-1)}`, { withFileTypes: true }).filter(d => d.isFile() && supported.test(d.name)).map(d => project.imageDirectory + d.name);
  const layout = projectImageLayout(project, paths);
  if (!layout.large.length || !layout.gallery.length) console.log(`- ${project.slug}: ${!layout.large.length ? 'no coverNN files; large section hidden' : 'large files present'}; ${!layout.gallery.length ? 'no exact numbered images; gallery hidden' : 'gallery files present'}.`);
}
