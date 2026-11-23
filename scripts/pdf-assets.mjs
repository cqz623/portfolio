import { readdirSync, readFileSync } from 'node:fs';
import { resolve, basename } from 'node:path';
import { createRequire } from 'node:module';

/** Ship PDF.js fonts, CMaps and decoders locally, with deployment-base-safe URLs. */
export function pdfAssets() {
  const root = resolve(createRequire(import.meta.url).resolve('pdfjs-dist/package.json'), '..');
  const assets = new Map();
  for (const folder of ['cmaps', 'standard_fonts', 'wasm', 'iccs']) {
    for (const entry of readdirSync(resolve(root, folder), { withFileTypes: true })) {
      if (entry.isFile()) assets.set(`pdfjs/${folder}/${entry.name}`, resolve(root, folder, entry.name));
    }
  }
  let building = false;
  return {
    configResolved(config) { building = config.command === 'build'; },
    name: 'local-pdfjs-assets',
    buildStart() {
      if (!building) return;
      for (const [fileName, path] of assets) this.emitFile({ type: 'asset', fileName, source: readFileSync(path) });
    },
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const path = new URL(request.url, 'http://localhost').pathname;
        const index = path.indexOf('/pdfjs/');
        const source = index >= 0 ? assets.get(path.slice(index + 1)) : undefined;
        if (!source) return next();
        response.setHeader('Content-Type', basename(source).endsWith('.wasm') ? 'application/wasm' : 'application/octet-stream');
        response.end(readFileSync(source));
      });
    }
  };
}
