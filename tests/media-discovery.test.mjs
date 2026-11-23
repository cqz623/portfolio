import test from 'node:test';
import assert from 'node:assert/strict';
import { discoverProjects } from '../src/lib/utils/discovered-projects.js';
import { projectImageLayout } from '../src/lib/utils/project-gallery.js';
import { visibleVideo } from '../src/lib/utils/visible-video.js';

test('append recognized folders without duplicating aliases or inventing metadata', () => {
  const existing = [{ slug: 'cloud-pavilion', imageDirectory: '/images/projects/cloud/' }];
  const result = discoverProjects(existing, ['/images/projects/cloud/cover.jpg', '/images/projects/ new-project/01.mp4', '/images/projects/unrelated/readme.png']);
  assert.equal(result[0], existing[0]);
  assert.equal(result.length, 2);
  assert.equal(result[1].slug, 'new-project');
  assert.equal(result[1].title, 'new-project');
  assert.equal(result[1].description, null);
  assert.equal(result[1].year, null);
  assert.equal(result[1].category, '');
  assert.equal(result[1].imageDirectory, '/images/projects/ new-project/');
});

test('video cover wins over existing static cover without affecting numeric media sorting', () => {
  const directory = '/images/projects/test/';
  const project = { title: 'Test', imageDirectory: directory, cover: { src: directory + 'cover.png', alt: 'Original' }, images: [] };
  const layout = projectImageLayout(project, ['cover.png', 'cover.mp4', 'cover10.mp4', 'cover02.jpg', '10.mp4', '02.jpeg', '01.webp'].map(name => directory + name));
  assert.equal(layout.cover.src, directory + 'cover.mp4');
  assert.deepEqual(layout.large.map(item => item.src.split('/').at(-1)), ['cover02.jpg', 'cover10.mp4']);
  assert.deepEqual(layout.gallery.map(item => item.src.split('/').at(-1)), ['01.webp', '02.jpeg', '10.mp4']);
});

test('cover videos pause offscreen/hidden, resume on return, and clean up observers', async () => {
  let callback, disconnected = false, plays = 0, pauses = 0;
  const listeners = new Map(), videoListeners = new Map();
  globalThis.document = { hidden: false, addEventListener: (name, fn) => listeners.set(name, fn), removeEventListener: name => listeners.delete(name) };
  globalThis.IntersectionObserver = class { constructor(fn) { callback = fn; } observe() {} disconnect() { disconnected = true; } };
  const node = { muted: false, pause() { pauses++; }, play() { plays++; return Promise.resolve(); }, addEventListener: (name, fn) => videoListeners.set(name, fn), removeEventListener: name => videoListeners.delete(name) };
  try {
    const action = visibleVideo(node);
    callback([{ isIntersecting: true }]); await Promise.resolve();
    assert.equal(plays, 1); assert.equal(node.muted, true);
    callback([{ isIntersecting: false }]); assert.ok(pauses >= 2);
    const before = pauses; videoListeners.get('play')(); assert.equal(pauses, before + 1);
    document.hidden = true; listeners.get('visibilitychange')();
    document.hidden = false; callback([{ isIntersecting: true }]); await Promise.resolve();
    assert.equal(plays, 2);
    action.destroy(); assert.ok(disconnected); assert.equal(listeners.size, 0); assert.equal(videoListeners.size, 0);
  } finally { delete globalThis.document; delete globalThis.IntersectionObserver; }
});
