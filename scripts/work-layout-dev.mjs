import { readFile, writeFile, rename, unlink } from 'node:fs/promises';
import { readdirSync } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { projects as existing } from '../src/lib/data/projects.js';
import { retainedProjects } from '../src/lib/utils/retained-projects.js';
import { validateWorkLayout } from '../src/lib/utils/work-layout.js';

const loopbackHosts = new Set(['localhost', '127.0.0.1', '[::1]']);
const loopbackAddresses = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1']);
export function localLayoutRequest(request, write = false) {
  try {
    const host = new URL(`http://${request.headers.host}`);
    if (host.username || host.password || host.pathname !== '/' || !loopbackHosts.has(host.hostname) || !loopbackAddresses.has(request.socket.remoteAddress)) return false;
    if (write) {
      const origin = new URL(request.headers.origin);
      if (!['http:', 'https:'].includes(origin.protocol) || origin.host !== host.host) return false;
      if (request.headers['sec-fetch-site'] && request.headers['sec-fetch-site'] !== 'same-origin') return false;
    }
    return true;
  } catch { return false; }
}
const revision = text => createHash('sha256').update(text).digest('hex');

/** Vite serves this handler only in development; no production route is created. */
export function workLayoutDev() {
  const file = resolve('src/lib/data/work-layout.json');
  let writing = false;
  let localEditor = false;
  function slugs() {
    const root = resolve('static/images/projects');
    const folders = readdirSync(root, {withFileTypes:true}).filter(entry => entry.isDirectory()).map(entry => entry.name);
    const files = folders.flatMap(folder => readdirSync(resolve(root,folder), {withFileTypes:true}).filter(entry => entry.isFile() && /\.(jpe?g|png|webp|mp4|pdf)$/i.test(entry.name)).map(entry => `/images/projects/${folder}/${entry.name}`));
    return retainedProjects(existing, files, folders).map(project => project.slug);
  }
  return {
    name: 'development-work-layout-writer',
    // The editor applies its save response directly. Avoid a delayed JSON HMR reload
    // destroying a newly opened draft; refresh reads this file through the GET handler.
    hotUpdate(context) { if (context.file === file) return []; },
    configResolved(config) { localEditor = config.command === 'serve' && !config.isPreview; },
    resolveId(id) { if (id === 'virtual:work-layout-editor') return '\0virtual:work-layout-editor'; },
    load(id) {
      if (id === '\0virtual:work-layout-editor') return localEditor ? `export { default } from ${JSON.stringify(resolve('src/lib/components/WorkLayoutEditor.svelte'))};` : 'export default undefined;';
    },
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const path = new URL(request.url, 'http://localhost').pathname;
        const base = server.config.base.replace(/\/$/, '');
        if (path !== `${base}/__work-layout`) return next();
        const send = (status, value) => { response.writeHead(status, {'Content-Type':'application/json', 'Cache-Control':'no-store'}); response.end(JSON.stringify(value)); };
        if (!localLayoutRequest(request, request.method === 'POST')) return send(403, {error:'Layout editing is available only from a same-origin local browser.'});
        if (!['GET','POST'].includes(request.method)) return send(405, {error:'Method not allowed.'});
        if (request.method === 'POST' && !request.headers['content-type']?.startsWith('application/json')) return send(415, {error:'Expected JSON.'});
        let temporary;
        let ownsLock = false;
        try {
          if (request.method === 'GET') {
            const text = await readFile(file,'utf8');
            return send(200, {layout:JSON.parse(text), revision:revision(text)});
          }
          if (writing) return send(409, {error:'Another save is in progress. Please retry.'});
          writing = true; ownsLock = true;
          let body = '';
          for await (const chunk of request) { body += chunk; if (Buffer.byteLength(body) > 16384) return send(413, {error:'Layout request too large.'}); }
          let input;
          try {
            input = JSON.parse(body);
            if (!input || Object.keys(input).sort().join(',') !== 'layout,revision') throw new Error('Invalid save request.');
            validateWorkLayout(input.layout, slugs());
          } catch (error) { return send(400, {error:error.message}); }
          const current = await readFile(file,'utf8');
          if (input.revision !== revision(current)) return send(409, {error:'The saved layout changed elsewhere. Cancel and reopen the editor before saving.'});
          const text = JSON.stringify(input.layout,null,2) + '\n';
          temporary = `${file}.${randomUUID()}.tmp`;
          await writeFile(temporary,text,{flag:'wx'});
          await rename(temporary,file); temporary = undefined;
          for (const environment of Object.values(server.environments)) {
            for (const module of environment.moduleGraph.getModulesByFile(file) ?? []) environment.moduleGraph.invalidateModule(module);
          }
          send(200,{layout:input.layout,revision:revision(text)});
        } catch (error) {
          console.error('Work layout save failed:',error);
          send(500,{error:'Could not save the local layout. Check the development server.'});
        } finally {
          if (temporary) await unlink(temporary).catch(() => {});
          if (ownsLock) writing = false;
        }
      });
    }
  };
}
