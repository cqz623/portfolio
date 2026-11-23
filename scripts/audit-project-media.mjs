import { readdirSync } from 'node:fs';
import { projects as existing } from '../src/lib/data/projects.js';
import { projects, files } from './project-catalog.mjs';
import { projectImageLayout } from '../src/lib/utils/project-gallery.js';
const name = src => src?.split('/').at(-1) ?? '—';
console.log('# Project media audit\n');
console.log('Exact cover is Work-only; MP4 takes priority and PDF is used only when no image/video occupies the slot. CoverNN media precedes Overview; numeric media follows Overview in the horizontal gallery. Missing groups are hidden. Original names, extensions and files remain unchanged.\n');
console.log('| Project / route slug | Folder | Work cover | Large media | Gallery media | Unrecognized media |');
console.log('|---|---|---|---|---|---|');
for (const project of projects) {
 const layout = projectImageLayout(project, files);
 console.log(`| ${project.title} (\`${project.slug}\`) | \`${project.imageDirectory.slice('/images/projects/'.length, -1)}\` | ${name(layout.cover?.src)} | ${layout.large.map(item => name(item.src)).join(', ') || '—'} | ${layout.gallery.map(item => name(item.src)).join(', ') || '—'} | ${layout.unrecognized.map(name).join(', ') || '—'} |`);
 for (const conflict of layout.conflicts) console.error(`${project.slug}: duplicate ${conflict.slot}: ${conflict.paths.map(name).join(', ')}`);
}
console.log('\n## Missing information and assets\n');
console.log('— marks a missing media group, not a broken asset. No fallback detail covers or empty galleries are generated.');
console.log('New entries use only folder-name titles; year, category, description and credits are unspecified: ' + projects.filter(project => !existing.includes(project)).map(project => project.slug).join(', ') + '.');
console.log('Naming exceptions above are preserved but not displayed. Hidden .DS_Store and .gitkeep files are ignored.');
const root = 'static/images/projects';
for (const folder of readdirSync(root, { withFileTypes: true }).filter(entry => entry.isDirectory())) {
 const directory = `/images/projects/${folder.name}/`;
 const unsupported = readdirSync(`${root}/${folder.name}`).filter(name => !name.startsWith('.') && !/\.(png|jpe?g|webp|mp4|pdf)$/i.test(name));
 if (unsupported.length) console.log(`Unsupported files in ${JSON.stringify(folder.name)}: ${unsupported.join(', ')}.`);
 if (!projects.some(project => project.imageDirectory === directory)) console.log(`Folder without a matching project: ${JSON.stringify(folder.name)} (excluded by the current project catalog policy).`);
}
