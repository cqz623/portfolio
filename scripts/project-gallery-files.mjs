import { videoDimensions } from './video-dimensions.mjs';
import { imageDimensions } from './image-dimensions.mjs';
import { mediaReplacements, publicMediaPath } from '../src/lib/data/media-delivery.js';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve, relative, sep } from 'node:path';

/** Build-time discovery keeps filesystem access out of browser and deployment code. */
export function projectGalleryFiles() {
  const id = 'virtual:project-gallery-files';
  const resolvedId = `\0${id}`;
  const folderId = 'virtual:project-folders';
  const resolvedFolderId = `\0${folderId}`;
  const root = resolve('static/images/projects');
  function files(folder = root) {
    return readdirSync(folder, { withFileTypes: true }).flatMap(entry => {
      const path = resolve(folder, entry.name);
      return entry.isDirectory() ? files(path) : /\.(jpe?g|png|webp|mp4|pdf)$/i.test(entry.name)
        ? [`/images/projects/${relative(root, path).split(sep).join('/')}`] : [];
    });
  }
  const pdfCache = new Map();
  function catalog() {
    const targets = new Set(Object.values(mediaReplacements));
    const replacements = Object.keys(mediaReplacements).filter(src => existsSync(resolve('static', publicMediaPath(src).slice(1))));
    const paths = [...new Set([...files().filter(src => !targets.has(src)), ...replacements])].sort();
    for (const src of Object.keys(mediaReplacements)) {
      if (paths.includes(src) && !replacements.includes(src)) throw new Error(`Missing optimized replacement for ${src}`);
    }
    const pdfs = paths.filter(src => /\.pdf$/i.test(src)).map(src => resolve('static', publicMediaPath(src).slice(1)));
    const stale = pdfs.filter(path => pdfCache.get(path)?.stamp !== `${statSync(path).mtimeMs}:${statSync(path).size}`);
    if (stale.length) {
      const metadata = JSON.parse(execFileSync(process.execPath, [fileURLToPath(new URL('./pdf-dimensions.mjs', import.meta.url))], { input: JSON.stringify(stale), encoding: 'utf8', maxBuffer: 1024 * 1024 }));
      for (const path of stale) pdfCache.set(path, { stamp: `${statSync(path).mtimeMs}:${statSync(path).size}`, dimensions: metadata[path] });
    }
    const dimensions = Object.fromEntries(paths.map(src => [src, /\.pdf$/i.test(src) ? pdfCache.get(resolve('static', publicMediaPath(src).slice(1)))?.dimensions : src.toLowerCase().endsWith('.mp4') ? videoDimensions(resolve('static', publicMediaPath(src).slice(1))) : imageDimensions(readFileSync(resolve('static', publicMediaPath(src).slice(1))))]));
    return `export default ${JSON.stringify(paths)}; export const dimensions = ${JSON.stringify(dimensions)};`;
  }
  return {
    name: 'project-gallery-files',
    resolveId(source) { if (source === id) return resolvedId; if (source === folderId) return resolvedFolderId; },
    load(source) {
      if (source === resolvedId) return catalog();
      if (source === resolvedFolderId) return `export default ${JSON.stringify(readdirSync(root, { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => entry.name).sort())};`;
    },
    configureServer(server) {
      const changed = path => {
        if (!path.startsWith(root + sep) && !path.startsWith(resolve('static/optimized') + sep)) return;
        if (path.slice(root.length + 1).includes(sep) && !/\.(jpe?g|png|webp|mp4|pdf)$/i.test(path)) return;
        const module = server.moduleGraph.getModuleById(resolvedId);
        if (module) server.moduleGraph.invalidateModule(module);
        const folderModule = server.moduleGraph.getModuleById(resolvedFolderId);
        if (folderModule) server.moduleGraph.invalidateModule(folderModule);
        server.ws.send({ type: 'full-reload' });
      };
      server.watcher.add([root, resolve('static/optimized')]);
      server.watcher.on('add', changed).on('unlink', changed).on('change', changed).on('addDir', changed).on('unlinkDir', changed);
      server.httpServer?.once('close', () => {
        server.watcher.off('add', changed).off('unlink', changed).off('change', changed).off('addDir', changed).off('unlinkDir', changed);
      });
    }
  };
}
