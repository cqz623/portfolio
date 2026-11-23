import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { resolve, join, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.geojson':'application/geo+json','.csv':'text/csv','.pdf':'application/pdf','.mp4':'video/mp4','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.wasm':'application/wasm','.woff2':'font/woff2','.ttf':'font/ttf'};
/** Plain static hosting: no Svelte SSR and no SPA rewrite for missing project paths. */
export function createPagesServer(root, base) {
  root=resolve(root);
  return createServer((request,response)=>{
    const send=status=>{response.writeHead(status);response.end();};
    if(!['GET','HEAD'].includes(request.method))return send(405);
    let url,path;
    try{
      url=new URL(request.url,'http://localhost');
      if(base && !url.pathname.startsWith(base+'/'))return send(404);
      path=resolve(root,'.'+decodeURIComponent(url.pathname.slice(base.length)));
    }catch{return send(400);}
    if(path!==root&&!path.startsWith(root+sep))return send(403);
    if(!existsSync(path))return send(404);
    if(statSync(path).isDirectory()){
      if(!url.pathname.endsWith('/')){response.writeHead(301,{Location:url.pathname+'/'+url.search});response.end();return;}
      path=join(path,'index.html');
    }
    if(!existsSync(path))return send(404);
    const size=statSync(path).size,headers={'Content-Type':mime[extname(path).toLowerCase()]??'application/octet-stream','Accept-Ranges':'bytes','Cache-Control':'no-store'};
    let start=0,end=size-1,status=200;
    if(request.headers.range){
      const range=/^bytes=(\d*)-(\d*)$/.exec(request.headers.range);
      if(!range||(!range[1]&&!range[2])){response.writeHead(416,{'Content-Range':`bytes */${size}`});response.end();return;}
      start=range[1]?Number(range[1]):Math.max(0,size-Number(range[2]));
      end=range[1]&&range[2]?Math.min(size-1,Number(range[2])):size-1;
      if(start>end||start>=size){response.writeHead(416,{'Content-Range':`bytes */${size}`});response.end();return;}
      status=206;headers['Content-Range']=`bytes ${start}-${end}/${size}`;
    }
    headers['Content-Length']=String(Math.max(0,end-start+1));response.writeHead(status,headers);
    if(request.method==='HEAD'||!size)response.end();
    else createReadStream(path,{start,end}).on('error',()=>response.destroy()).pipe(response);
  });
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const {base}=await import('./built-site.mjs');
  const port=Number(process.env.PORT??5180),server=createPagesServer('build',base);
  server.listen(port,'127.0.0.1',()=>console.log(`Static build preview: http://127.0.0.1:${port}${base}/`));
}
