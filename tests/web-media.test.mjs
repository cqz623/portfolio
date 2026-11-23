import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { mediaReplacements, publicMediaPath } from '../src/lib/data/media-delivery.js';
import { pruneOriginalBuildCopies } from '../scripts/web-media.mjs';
import { projectImageLayout } from '../src/lib/utils/project-gallery.js';

test('web media replaces logical slots without changing numerical order or cover selection', () => {
 const directory='/images/projects/floating-purifier/';
 const project={title:'Floating Purifier',imageDirectory:directory,images:[]};
 const files=['cover.png','cover1.png','cover02.pdf','01.png'].map(name=>directory+name);
 const layout=projectImageLayout(project,files,{[directory+'cover1.png']:{width:4500,height:8000}});
 assert.equal(layout.cover.src,directory+'cover.png');
 assert.deepEqual(layout.large.map(media=>media.src),[publicMediaPath(directory+'cover1.png'),directory+'cover02.pdf']);
 assert.equal(layout.large[0].height,8000);
 assert.deepEqual(layout.gallery.map(media=>media.src),[directory+'01.png']);
});

test('only generated original copies are pruned and a missing replacement fails safely',()=>{
 const root=mkdtempSync(join(tmpdir(),'portfolio-web-media-'));
 try {
  for(const [original,replacement] of Object.entries(mediaReplacements))for(const src of [original,replacement]){
   const target=join(root,src);mkdirSync(dirname(target),{recursive:true});writeFileSync(target,'fixture');
  }
  pruneOriginalBuildCopies(root);
  for(const [original,replacement] of Object.entries(mediaReplacements)){
   assert.equal(existsSync(join(root,original)),false);assert.equal(existsSync(join(root,replacement)),true);
  }
  assert.throws(()=>pruneOriginalBuildCopies(join(root,'missing')),/Missing web replacement/);
  assert.throws(()=>pruneOriginalBuildCopies('static'),/Refusing/);
 }finally{rmSync(root,{recursive:true,force:true});}
});

test('discovery retains all logical media slots when local originals are absent in a clean checkout', async()=>{
 const {readdirSync,symlinkSync}=await import('node:fs');
 const {resolve}=await import('node:path');
 const {execFileSync}=await import('node:child_process');
 const {projectGalleryFiles}=await import('../scripts/project-gallery-files.mjs');
 const expected=projectGalleryFiles().load('\0virtual:project-gallery-files');
 const root=mkdtempSync(join(tmpdir(),'portfolio-clean-media-'));
 const source=resolve('static');
 function linkTree(directory){
  for(const entry of readdirSync(join(source,directory),{withFileTypes:true})){
   const relative=join(directory,entry.name),target=join(root,'static',relative);
   if(entry.isDirectory()){mkdirSync(target,{recursive:true});linkTree(relative);}
   else if(!Object.hasOwn(mediaReplacements,'/'+relative))symlinkSync(join(source,relative),target);
  }
 }
 try{
  mkdirSync(join(root,'static'),{recursive:true});linkTree('');
  const module= new URL('../scripts/project-gallery-files.mjs',import.meta.url).href;
  const script=`import {projectGalleryFiles} from ${JSON.stringify(module)};process.chdir(${JSON.stringify(root)});process.stdout.write(projectGalleryFiles().load('\\0virtual:project-gallery-files'));`;
  const actual=execFileSync(process.execPath,['--input-type=module','-e',script],{encoding:'utf8',maxBuffer:1024*1024});
  assert.equal(actual,expected);
 }finally{rmSync(root,{recursive:true,force:true});}
});
