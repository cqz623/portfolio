import { publicMediaPath } from '../src/lib/data/media-delivery.js';
import assert from 'node:assert/strict';
import test from 'node:test';
import { projectImageLayout } from '../src/lib/utils/project-gallery.js';
import { videoDimensions } from '../scripts/video-dimensions.mjs';

test('MP4 covers follow cover naming; numbered galleries support images and videos', () => {
  const directory = '/images/projects/material- experimentation/';
  const project = { title: 'Material Experimentation', imageDirectory: directory, images: [] };
  const files = ['cover.mp4', 'cover02.mp4', 'cover01.mp4', '01.png', '02.mp4'].map(name => directory + name);
  const layout = projectImageLayout(project, files);
  assert.equal(layout.cover.src, directory + 'cover.mp4');
  assert.deepEqual(layout.large.map(item => item.src), ['cover01.mp4', 'cover02.mp4'].map(name => publicMediaPath(directory + name)));
  assert.deepEqual(layout.gallery.map(item => item.src), [directory + '01.png', directory + '02.mp4']);
  assert.deepEqual(layout.unrecognized, []);
});

test('original videos expose valid natural dimensions without loading their payloads', () => {
  for (const name of ['cover.mp4', 'cover01.mp4']) {
    const dimensions = videoDimensions(`static${publicMediaPath('/images/projects/material- experimentation/' + name)}`);
    assert.ok(dimensions.width > 0 && dimensions.height > 0);
    console.log(name, dimensions);
  }
});
