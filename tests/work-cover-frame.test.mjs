import test from 'node:test';
import assert from 'node:assert/strict';
import { workCoverFrame } from '../src/lib/utils/work-cover-frame.js';
const ratios = new Map([['3 / 2', 1.5], ['5 / 4', 1.25], ['1 / 1', 1], ['3 / 4', .75], ['2 / 3', 2 / 3]]);

test('landscape, medium, square, portrait and tall sources choose the nearest frame', () => {
  for (const [width, height, ratio] of [
    [1418, 798, '3 / 2'], [6443, 5152, '5 / 4'], [1000, 1000, '1 / 1'],
    [1314, 1573, '3 / 4'], [856, 1180, '3 / 4'], [872, 1234, '2 / 3'], [300, 2000, '2 / 3']
  ]) assert.equal(workCoverFrame({ width, height }, { ratio: '3 / 2' }).ratio, ratio);
});

test('log-ratio choice minimizes cropping and is independent of resolution', () => {
  for (let width = 100; width <= 4000; width += 17) {
    const height = 1500;
    const source = width / height;
    const selected = ratios.get(workCoverFrame({ width, height }).ratio);
    const retainedArea = Math.min(source / selected, selected / source);
    for (const candidate of ratios.values()) {
      assert.ok(retainedArea + 1e-12 >= Math.min(source / candidate, candidate / source));
    }
    assert.equal(workCoverFrame({ width, height }).ratio, workCoverFrame({ width: width * 3, height: height * 3 }).ratio);
  }
});

test('proportional boundaries are geometric means, rather than arithmetic thresholds', () => {
  for (const [a, b] of [[1.5, 1.25], [1.25, 1], [1, .75], [.75, 2 / 3]]) {
    const boundary = Math.sqrt(a * b);
    assert.equal(ratios.get(workCoverFrame({ width: boundary * 1.00001, height: 1 }).ratio), a);
    assert.equal(ratios.get(workCoverFrame({ width: boundary * .99999, height: 1 }).ratio), b);
  }
});

test('default centering, explicit focal positions and safe unknown-dimension fallbacks', () => {
  assert.equal(workCoverFrame({ width: 872, height: 1234 }).position, '50% 50%');
  assert.equal(workCoverFrame({ width: 872, height: 1234 }, { position: '50% 65%' }).position, '50% 65%');
  for (const width of [0, -1, NaN, Infinity]) assert.equal(workCoverFrame({ width, height: 100 }).ratio, '5 / 4');
  assert.deepEqual(workCoverFrame(null, { ratio: '5 / 4' }), { ratio: '5 / 4', position: '50% 50%' });
  assert.equal(workCoverFrame(null, { ratio: '4 / 5' }).ratio, '5 / 4');
});
