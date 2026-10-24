import assert from 'node:assert/strict';
import {readFile,readdir,mkdtemp,mkdir,writeFile,copyFile,rm,access,stat} from 'node:fs/promises';
import {resolve,dirname,sep,extname} from 'node:path';
import {createServer} from 'node:http';
import {createReadStream} from 'node:fs';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {validateContent,visibleVideos,publicAsset} from '../src/lib/content.ts';
const doc=JSON.parse(await readFile('src/data/portfolio.json','utf8'));validateContent(doc);
const html=await readFile('dist/index.html','utf8'),en=await readFile('dist/en/index.html','utf8'),admin=await readFile('dist/admin/index.html','utf8');
const base=admin.match(/data-base="([^"]+)"/)[1];
assert.equal((html.match(/data-video-card/g)||[]).length,visibleVideos(doc).length);
const escaped=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
for(const video of visibleVideos(doc)){assert.ok(html.includes(escaped(video.title_es)));assert.ok(en.includes(escaped(video.title_en)));}
if(visibleVideos(doc).length)assert.ok(html.includes('preload="none"'));
for(const path of ['admin/login','admin/categories','admin/videos','admin/videos/new','admin/access'])await access('dist/'+path+'/index.html');
assert.ok(!admin.includes('cms_session'));assert.ok(admin.includes('https://api.github.com'));assert.ok(admin.includes('type="module"'));
await assert.rejects(()=>access('dist/server/entry.mjs'));await assert.rejects(()=>access('dist/private/admin.json'));
console.log('✓ Sitio completamente estático, CMS, idiomas y reproducción diferida');
const root=resolve('dist');
const server=createServer(async(req,res)=>{
 try{
  const path=new URL(req.url,'http://localhost').pathname;
  if(!path.startsWith(base)){res.writeHead(404).end();return;}
  const relative=decodeURIComponent(path.slice(base.length));let file=resolve(root,relative||'.');
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(404).end();return;}
  let info=await stat(file);if(info.isDirectory()){file=resolve(file,'index.html');info=await stat(file);}
  const range=req.headers.range;let start=0,end=info.size-1;
  const headers={'Content-Length':info.size,'Content-Type':({'html':'text/html','js':'application/javascript','css':'text/css','mp4':'video/mp4','webp':'image/webp'})[extname(file).slice(1)]||'application/octet-stream','Accept-Ranges':'bytes'};
  if(range){const match=/^bytes=(\d+)-(\d*)$/.exec(range);if(!match){res.writeHead(416).end();return;}start=Number(match[1]);end=match[2]?Math.min(Number(match[2]),info.size-1):info.size-1;if(start>end){res.writeHead(416).end();return;}headers['Content-Length']=end-start+1;headers['Content-Range']='bytes '+start+'-'+end+'/'+info.size;}
  res.writeHead(range?206:200,headers);if(req.method==='HEAD')res.end();else createReadStream(file,{start,end}).pipe(res);
 }catch{res.writeHead(404).end();}
});
server.listen(0,'127.0.0.1');await once(server,'listening');const origin='http://127.0.0.1:'+server.address().port;
try{
 for(const path of ['','en/','admin/','admin/login/','admin/videos/new/']){const response=await fetch(origin+base+path);assert.equal(response.status,200);await response.arrayBuffer();}
 for(const entry of [...html.matchAll(/(?:src|href)="([^"]*\/_astro\/[^"]+)"/g)]){const response=await fetch(origin+entry[1]);assert.equal(response.status,200,entry[1]);await response.arrayBuffer();}
 if(visibleVideos(doc).length){const v=visibleVideos(doc)[0],source=await readFile(v.video_path),response=await fetch(origin+base+publicAsset(v.video_path),{headers:{Range:'bytes=0-31'}});
 assert.equal(response.status,206);assert.deepEqual(Buffer.from(await response.arrayBuffer()),source.subarray(0,32));}
 for(const path of ['private/admin.json','src/data/portfolio.json','cms-media/videos/file.mp4']){const r=await fetch(origin+base+path);assert.equal(r.status,404);await r.arrayBuffer();}
 console.log('✓ Servido sin backend: navegación, recursos, vídeo por HTTP Range y archivos privados ausentes');
}finally{server.closeAllConnections();await new Promise(done=>server.close(done));}
const fixture=await mkdtemp(resolve('.astro/cms-static-test-'));
function runPrepare(){return new Promise((done,reject)=>{const child=spawn(process.execPath,[resolve('scripts/prepare-media.ts')],{cwd:fixture,windowsHide:true,stdio:['ignore','pipe','pipe']});let output='';child.stdout.on('data',data=>output+=data);child.stderr.on('data',data=>output+=data);child.on('error',reject);child.on('exit',code=>code===0?done(output):reject(Error(output)));});}
try{
 const testDoc=JSON.parse(await readFile('tests/fixtures/portfolio.json','utf8'));testDoc.videos[0].is_published=0;testDoc.videos[1].deleted_at=new Date().toISOString();testDoc.categories.find(c=>c.id===testDoc.videos[2].category_id).is_active=0;
 await mkdir(resolve(fixture,'src/data'),{recursive:true});await writeFile(resolve(fixture,'src/data/portfolio.json'),JSON.stringify(testDoc));
 await mkdir(resolve(fixture,'public/media/cms/videos'),{recursive:true});await writeFile(resolve(fixture,'public/media/cms/videos/stale.mp4'),'stale');
 await runPrepare();assert.deepEqual(await readdir(resolve(fixture,'public/media/cms')),[]);
 testDoc.videos[0].is_published=1;const v=testDoc.videos[0];for(const path of [v.video_path,v.thumbnail_path].filter(Boolean)){await mkdir(dirname(resolve(fixture,path)),{recursive:true});await copyFile(path,resolve(fixture,path));}
 await writeFile(resolve(fixture,'src/data/portfolio.json'),JSON.stringify(testDoc));await runPrepare();await access(resolve(fixture,'public',publicAsset(v.video_path)));
 assert.equal((await readdir(resolve(fixture,'public/media/cms/videos'))).length,1);
 await writeFile(resolve(fixture,'src/data/portfolio.json'),'{broken');await assert.rejects(runPrepare);
 console.log('✓ Solo se exportan piezas publicadas de categorías activas; se eliminan copias generadas antiguas y se rechaza JSON inválido');
}finally{assert.ok(fixture.startsWith(resolve('.astro')+sep));await rm(fixture,{recursive:true,force:true});}
console.log('Todas las comprobaciones de integración estática han pasado.');
