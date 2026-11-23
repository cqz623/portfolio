import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {inventory} from '../scripts/audit-deployment.mjs';

test('deployment inventory retains original media and ignores dependencies and caches',async()=>{
 const root=await mkdtemp(join(tmpdir(),'pages-inventory-'));
 try{
  for(const folder of ['static/images/projects/test','node_modules/package','build/cache'])await mkdir(join(root,folder),{recursive:true});
  for(const file of ['static/images/projects/test/cover.jpg','node_modules/package/index.js','build/cache/output.js','.env.local'])await writeFile(join(root,file),'fixture');
  assert.deepEqual(inventory(root,true).map(file=>file.path.slice(root.length+1)),['static/images/projects/test/cover.jpg']);
 }finally{await rm(root,{recursive:true,force:true});}
});
