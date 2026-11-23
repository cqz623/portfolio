import { readFileSync } from 'node:fs';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

// Isolated Node-only metadata reader; PDF.js never executes during Svelte SSR.
const paths = JSON.parse(readFileSync(0, 'utf8'));
const result = {};
for (const path of paths) {
  let task;
  try {
    task = getDocument({ data: new Uint8Array(readFileSync(path)), verbosity: 0 });
    const pdf = await task.promise;
    const page = await pdf.getPage(1);
    const { width, height } = page.getViewport({ scale: 1 });
    result[path] = { width, height };
  } catch (error) {
    console.error(`PDF dimensions unavailable: ${path}: ${error.message}`);
  } finally { await task?.destroy().catch(() => {}); }
}
process.stdout.write(JSON.stringify(result));
