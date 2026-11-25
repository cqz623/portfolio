import test from 'node:test';
import assert from 'node:assert/strict';
import { retainedProjects } from '../src/lib/utils/retained-projects.js';
import { projects, folders } from '../scripts/project-catalog.mjs';

test('catalog is restricted to the seventeen media-backed projects plus one registered presentation', () => {
  assert.equal(projects.length, 18);
  assert.equal(new Set(projects.map(project => project.slug)).size, 18);
  const theory = projects.find(project => project.slug === 'theory-in-practice');
  assert.equal(theory.title, 'Theory in Practice');
  assert.equal(theory.imageDirectory, '/images/projects/theory-in-practice/');
  for (const [slug,title] of [['xu-tiantian','Architecture as Ecology'],['funeral-home','Funerary Heritage'],['decarbonization','Building Reuse & Carbon']]) {
    const project = projects.find(project => project.slug === slug);
    assert.equal(project.title,title);
    assert.equal(project.imageDirectory,`/images/projects/${slug}/`);
  }
  for (const project of projects) assert.ok(project.allowWithoutMedia || folders.some(folder => project.imageDirectory === `/images/projects/${folder}/`));
  for (const slug of ['yuanmingyuan', 'venice-arsenale']) assert.ok(!projects.some(project => project.slug === slug));
  for (const slug of ['spatial-barrier-game', 'population-flood-sandbox']) assert.ok(projects.find(project => project.slug === slug).interactive);
});

test('retain original metadata, order, empty allowed folders and whitespace aliases', () => {
  const existing = [
    { slug: 'material-experimentation', imageDirectory: '/images/projects/material- experimentation/', title: 'Original' },
    { slug: 'obsolete', imageDirectory: '/images/projects/obsolete/' },
    { slug: 'cloud-pavilion', imageDirectory: '/images/projects/cloud/', title: 'Cloud Pavilion' },
    { slug: 'missing', imageDirectory: '/images/projects/theatre/' }
  ];
  const result = retainedProjects(existing, [], ['cloud', 'material- experimentation', 'obsolete']);
  assert.deepEqual(result, [existing[0], existing[2]]);
  assert.equal(result[0], existing[0]);
});


test('only an explicit permitted registration survives before a media folder exists', () => {
  const aptne = projects.find(project => project.slug === 'aptne-presentation');
  assert.equal(aptne.allowWithoutMedia,true);
  assert.equal(aptne.imageDirectory,'/images/projects/APTNE/');
  assert.deepEqual(retainedProjects([aptne],[],[]),[aptne]);
  assert.deepEqual(retainedProjects([{...aptne,allowWithoutMedia:false}],[],[]),[]);
  assert.deepEqual(retainedProjects([{...aptne,slug:'unregistered',imageDirectory:'/images/projects/unregistered/'}],[],[]),[]);
});
