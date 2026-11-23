import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';
import { projectGallery, projectImageLayout, projectWithDiscoveredCover } from '../src/lib/utils/project-gallery.js';

test('exact naming, numeric sorting, extension preservation and caption retention', () => {
  const project = { title: 'Test', imageDirectory: '/images/projects/test/', images: [
    { src: '/images/projects/test/cover.png', alt: 'Hero' },
    { src: '/images/projects/test/02.png', alt: 'Section', caption: 'Original caption' }
  ] };
  const files = ['cover.png', 'cover10.webp', 'cover02.jpeg', 'cover01.jpg', '10.webp', '02.png', '01.jpg', '01-view.jpg'].map(name => project.imageDirectory + name);
  const result = projectImageLayout(project, files);
  assert.equal(result.cover.src, project.imageDirectory + 'cover.png');
  assert.deepEqual(result.large.map(i => i.src.split('/').at(-1)), ['cover01.jpg', 'cover02.jpeg', 'cover10.webp']);
  assert.ok(!result.large.some(i => /\/cover\./i.test(i.src)));
  assert.deepEqual(result.gallery.map(i => i.src.split('/').at(-1)), ['01.jpg', '02.png', '10.webp']);
  assert.equal(result.gallery[1].caption, 'Original caption');
  assert.deepEqual(result.unrecognized, [project.imageDirectory + '01-view.jpg']);
  assert.ok(!projectGallery({ ...project, galleryImages: [project.images[0]] }, files).some(i => i.src.endsWith('cover.png')));
});

test('cover-only and empty projects stay free of extra images and empty galleries', () => {
  const project = { title: 'Test', imageDirectory: '/images/projects/test/', images: [], cover: null };
  const onlyCover = projectImageLayout(project, ['/images/projects/test/cover.JPG']);
  assert.equal(onlyCover.cover.src, '/images/projects/test/cover.JPG');
  assert.deepEqual(onlyCover.large, []); assert.deepEqual(onlyCover.gallery, []);
  assert.equal(projectWithDiscoveredCover(project, []), project);
  assert.equal(projectImageLayout(project, []).hasImages, false);
  assert.equal(projectWithDiscoveredCover(project, ['/images/projects/test/cover01.png']).cover, null);
});

test('ambiguous duplicate slots are reported and previously configured cover wins', () => {
  const project = { title: 'Test', imageDirectory: '/images/projects/test/', images: [], cover: { src: '/images/projects/test/cover.webp', alt: 'Existing' } };
  const result = projectImageLayout(project, ['cover.png','cover.webp','01.jpg','1.png'].map(n => project.imageDirectory + n));
  assert.equal(result.cover.src, project.cover.src);
  assert.equal(result.conflicts.length, 2);
  assert.equal(result.gallery.length, 1);
});

async function controls(reduced = false, media) {
  let script = (await readFile('src/lib/components/ProjectGallery.svelte', 'utf8')).match(/<script lang="ts">([\s\S]*?)<\/script>/)[1];
  script = script.replace(/^\s*import .*;$/gm, '').replace('let track = $state<HTMLDivElement>();', 'let track = testTrack;').replace('let dialog = $state<HTMLDialogElement>();', 'let dialog = testDialog;').replace('let closeControl = $state<HTMLButtonElement>();', 'let closeControl = testClose;');
  const calls = [], listeners = new Map();
  const track = { scrollLeft: 100, scrollWidth: 1500, clientWidth: 500, children: [], scrollBy: options => calls.push(options), scrollTo: options => calls.push(options) };
  const props = () => ({ images: media ?? [1, 2, 3].map(i => ({ src: `${i}.jpg`, alt: String(i) })), title: 'Test' });
  props.id = () => 'gallery-test';
  const sandbox = { $props: props, $state: value => value, $derived: value => value, $effect: () => {}, onMount: () => {}, tick: async () => {}, matchMedia: () => ({ matches: reduced }), testTrack: track, testDialog: { showModal: () => calls.push('opened') }, testClose: { focus: () => calls.push('focused') } };
  const context = vm.createContext(sandbox);
  vm.runInContext(ts.transpile(script, { target: ts.ScriptTarget.ES2022 }) + '\nglobalThis.handlers = { scroll, keys, wheelScrolling, enlarge, change, lightboxKeys, setPdfViewer(viewer) { pdfViewer = viewer; }, get active() { return active; } };', context);
  const wheelNode = { ...track, addEventListener: (name, handler) => listeners.set(name, handler), removeEventListener: name => listeners.delete(name) };
  return { handlers: context.handlers, calls, track, wheelNode, listeners };
}

test('arrow and keyboard scrolling, reduced motion, wheel boundaries and listener cleanup', async () => {
  const { handlers, calls, wheelNode, listeners } = await controls();
  handlers.scroll(1); assert.equal(calls[0].left, 400); assert.equal(calls[0].behavior, 'smooth');
  handlers.scroll(-1); assert.equal(calls[1].left, -400);
  let prevented = false;
  handlers.keys({ key: 'End', preventDefault() { prevented = true; } });
  assert.ok(prevented); assert.equal(calls[2].left, 1500);
  const action = handlers.wheelScrolling(wheelNode);
  prevented = false;
  listeners.get('wheel')({ deltaY: 60, deltaX: 0, deltaMode: 0, ctrlKey: false, preventDefault() { prevented = true; } });
  assert.ok(prevented); assert.equal(wheelNode.scrollLeft, 160);
  wheelNode.scrollLeft = 1000; prevented = false;
  listeners.get('wheel')({ deltaY: 60, deltaX: 0, deltaMode: 0, ctrlKey: false, preventDefault() { prevented = true; } });
  assert.equal(prevented, false);
  action.destroy(); assert.equal(listeners.size, 0);
  const calm = await controls(true); calm.handlers.scroll(1); assert.equal(calm.calls[0].behavior, 'instant');
});

test('image enlargement opens the modal, focuses Close and cycles through complete images', async () => {
  const { handlers, calls } = await controls();
  await handlers.enlarge(1); assert.equal(handlers.active, 1);
  assert.deepEqual(calls, ['opened', 'focused']);
  handlers.change(1); assert.equal(handlers.active, 2);
  handlers.change(1); assert.equal(handlers.active, 0);
  handlers.lightboxKeys({ key: 'ArrowLeft', preventDefault() {}, stopPropagation() {} });
  assert.equal(handlers.active, 2);
});


test('mixed galleries enlarge only images and keep video keyboard controls native', async () => {
  const { handlers, calls } = await controls(false, [
    { src: '01.mp4', alt: 'Video' }, { src: '02.png', alt: 'Drawing' }, { src: '03.mp4', alt: 'Video' }, { src: '04.jpg', alt: 'Photo' }
  ]);
  await handlers.enlarge(3); assert.equal(handlers.active, 1);
  handlers.change(1); assert.equal(handlers.active, 0);
  handlers.change(-1); assert.equal(handlers.active, 1);
  const count = calls.length;
  handlers.keys({ target: { tagName: 'VIDEO' }, key: 'ArrowRight', preventDefault() { throw new Error('Video key intercepted'); } });
  assert.equal(calls.length, count);
});


test('lightbox arrow keys turn PDF pages without switching gallery items', async () => {
  const { handlers } = await controls(false, [{src:'01.pdf',alt:'Document'}, {src:'02.png',alt:'Drawing'}]);
  const turns = [];
  handlers.setPdfViewer({ turnPage(direction) { turns.push(direction); } });
  for (const key of ['ArrowRight', 'ArrowLeft']) handlers.lightboxKeys({key,preventDefault(){},stopPropagation(){}});
  assert.deepEqual(turns, [1, -1]);
  assert.equal(handlers.active, 0);
});
