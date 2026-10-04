'use strict';
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const {safePath,sha256}=require('./core.js');
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.gif':'image/gif','.webp':'image/webp','.woff':'font/woff','.woff2':'font/woff2','.ttf':'font/ttf','.wasm':'application/wasm','.pdf':'application/pdf'};
function createBoundHandler(root,snapshot,requests=[]) {
  const files=new Map(snapshot.files.map(f=>[f.path,f]));
  return (req,res)=>{
    let relative;
    try {
      if (!['GET','HEAD'].includes(req.method)) throw new Error('Read-only evidence server');
      relative=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\//,'') || 'index.html';
      const entry=files.get(relative);
      if (!entry) throw new Error('Unbound source requested');
      const file=safePath(root,relative),stat=fs.lstatSync(file);
      if (!stat.isFile() || stat.isSymbolicLink()) throw new Error('Non-regular source requested');
      const bytes=fs.readFileSync(file),actualHash=sha256(bytes);
      if (actualHash!==entry.sha256 || bytes.length!==entry.bytes) throw new Error('Bound source changed during run');
      requests.push({path:relative,sha256:actualHash,bytes:bytes.length,status:200,at:new Date().toISOString()});
      res.writeHead(200,{'Content-Type':MIME[path.extname(relative)] || 'application/octet-stream','Cache-Control':'no-store','X-Q0-Source-SHA256':actualHash});
      res.end(req.method==='HEAD' ? undefined : bytes);
    } catch(error) {
      requests.push({path:relative || req.url,status:409,error:error.message,at:new Date().toISOString()});
      res.writeHead(409,{'Content-Type':'text/plain','Cache-Control':'no-store'});res.end(error.message);
    }
  };
}
async function startBoundServer(root,snapshot) {
  const requests=[];
  const server=http.createServer(createBoundHandler(root,snapshot,requests));
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  return {origin:`http://127.0.0.1:${server.address().port}`,requests,close:()=>new Promise((resolve,reject)=>server.close(error=>error ? reject(error):resolve()))};
}
module.exports={startBoundServer,createBoundHandler};
