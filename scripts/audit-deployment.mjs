import { mediaReplacements } from '../src/lib/data/media-delivery.js';
import { readdirSync, statSync, existsSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ignored = new Set(['.git','node_modules','.svelte-kit','build','dist','.output','.vercel','.netlify','.wrangler','.aws','.ssh','.codex','.agents','.cache','coverage','test-results','playwright-report']);
export function inventory(root, excludeGenerated = false) {
  if (!existsSync(root)) return [];
  return readdirSync(root,{withFileTypes:true}).flatMap(entry => {
    if (excludeGenerated && (ignored.has(entry.name) || /^\.env(?:\.|$)/.test(entry.name))) return [];
    const path = resolve(root,entry.name);
    return entry.isDirectory() ? inventory(path,excludeGenerated) : entry.isFile() ? [{path,bytes:statSync(path).size}] : [];
  });
}
export function deploymentAudit(root = process.cwd()) {
  const archivedPaths = new Set(Object.keys(mediaReplacements).map(src => resolve(root,'static',src.slice(1))));
  const allSource = inventory(root,true);
  const archivedOriginals = allSource.filter(file => archivedPaths.has(file.path));
  const source = allSource.filter(file => !archivedPaths.has(file.path));
  const output = inventory(resolve(root,'build'));
  return {
    archivedOriginals,
    oversized: source.filter(file => file.bytes > 100 * 1024 * 1024),
    staticBytes: inventory(resolve(root,'static')).filter(file => !archivedPaths.has(file.path)).reduce((sum,file)=>sum+file.bytes,0),
    oversizedOutput: output.filter(file => file.bytes > 100 * 1024 * 1024),
    outputBytes: output.reduce((sum,file)=>sum+file.bytes,0),
    outputFiles: output.length,
    sensitiveOutput: output.filter(file => /(?:^|[\/])(?:\.env(?:\..*)?|\.npmrc|\.netrc|credentials\.json|service-account[^\/]*\.json)$|\.(?:pem|key|p12|pfx)$/i.test(file.path))
  };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const audit = deploymentAudit();
  console.log(`Static assets: ${audit.staticBytes.toLocaleString('en-US')} bytes`);
  console.log(`Generated build/: ${audit.outputBytes.toLocaleString('en-US')} bytes in ${audit.outputFiles} files`);
  for (const file of audit.oversized) console.log(`Git >100 MiB: ${(file.bytes/1024/1024).toFixed(2)} MiB (${file.bytes} bytes) — ${relative(process.cwd(),file.path)}`);
  for (const file of audit.archivedOriginals) console.log(`Preserved local original (excluded): ${relative(process.cwd(),file.path)}`);
  for (const file of audit.oversizedOutput) console.log(`BLOCKER: oversized generated file: ${relative(process.cwd(),file.path)}`);
  if (audit.staticBytes > 1_000_000_000 || audit.outputBytes > 1_000_000_000) console.log('BLOCKER: the site exceeds GitHub Pages’ 1 GB published-site limit.');
  if (audit.oversized.length) console.log('BLOCKER: regular GitHub pushes reject files over 100 MiB. Check publishable source files.');
  for (const file of audit.sensitiveOutput) console.log(`BLOCKER: private configuration/key file in generated output: ${relative(process.cwd(),file.path)}`);
  if (process.argv.includes('--strict') && (audit.sensitiveOutput.length || audit.oversized.length || audit.oversizedOutput.length || audit.staticBytes > 1_000_000_000 || audit.outputBytes > 1_000_000_000 || !audit.outputFiles)) process.exitCode = 1;
}
