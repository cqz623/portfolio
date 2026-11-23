import { existsSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';
import { mediaReplacements } from '../src/lib/data/media-delivery.js';

/** Remove only generated copies of replaced originals, never source files. */
export function pruneOriginalBuildCopies(output = 'build') {
  const root = resolve(output);
  if (root === resolve('static')) throw new Error('Refusing to prune source media');
  for (const [original, replacement] of Object.entries(mediaReplacements)) {
    if (!existsSync(resolve(root, replacement.slice(1)))) throw new Error(`Missing web replacement: ${replacement}`);
    const generated = resolve(root, original.slice(1));
    if (existsSync(generated)) unlinkSync(generated);
  }
}
