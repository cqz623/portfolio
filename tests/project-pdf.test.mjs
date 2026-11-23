import test from 'node:test';
import assert from 'node:assert/strict';
import { projectImageLayout } from '../src/lib/utils/project-gallery.js';
import { discoverProjects } from '../src/lib/utils/discovered-projects.js';
import { dimensions, files } from '../scripts/project-catalog.mjs';

const directory = '/images/projects/test/';
const project = { title: 'Test', imageDirectory: directory, cover: { src: directory + 'cover.pdf', alt: 'Cover' }, images: [{ src: directory + '01.pdf', alt: 'First', caption: 'Original caption' }] };
const paths = names => names.map(name => directory + name);

test('PDF slots retain strict cover/large/gallery separation and numeric ordering', () => {
 const layout = projectImageLayout(project, paths(['cover.PDF', 'cover10.pdf', 'cover02.pdf', 'cover01.pdf', '10.pdf', '02.PDF', '01.pdf', '01-other.pdf']));
 assert.equal(layout.cover.src, directory + 'cover.PDF');
 assert.deepEqual(layout.large.map(item => item.src), paths(['cover01.pdf', 'cover02.pdf', 'cover10.pdf']));
 assert.deepEqual(layout.gallery.map(item => item.src), paths(['01.pdf', '02.PDF', '10.pdf']));
 assert.equal(layout.gallery[0].caption, 'Original caption');
 assert.deepEqual(layout.unrecognized, paths(['01-other.pdf']));
});

test('PDF never overrides a competing image or video, including a configured PDF', () => {
 const layout = projectImageLayout(project, paths(['cover.pdf', 'cover.jpg', 'cover.mp4', 'cover01.pdf', 'cover01.png', '01.pdf', '01.jpeg', '02.mp4', '02.pdf']));
 assert.equal(layout.cover.src, directory + 'cover.mp4');
 assert.deepEqual(layout.large.map(item => item.src), paths(['cover01.png']));
 assert.deepEqual(layout.gallery.map(item => item.src), paths(['01.jpeg', '02.mp4']));
});

test('PDF-only folders are discoverable; first-page metadata is available before rendering', () => {
 const entries = discoverProjects([], paths(['cover.pdf', '01.pdf']));
 assert.equal(entries.length, 1);
 const src = '/images/projects/decarbonization/cover01.pdf';
 assert.ok(files.includes(src));
 assert.deepEqual(dimensions[src], { width: 792, height: 612 });
});
