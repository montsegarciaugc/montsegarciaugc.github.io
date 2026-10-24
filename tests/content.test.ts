import{test}from'node:test';
import assert from'node:assert/strict';
import{readFile}from'node:fs/promises';
import{validateContent,portfolio,visibleVideos,validMediaPath,type Content}from'../src/lib/content.ts';
import{detectFile,validateUpload,maxVideoBytes}from'../src/lib/uploads.ts';
const original:Content=JSON.parse(await readFile('tests/fixtures/portfolio.json','utf8'));
test('JSON migrado, traducciones, orden y categorías vacías',()=>{
  validateContent(original);assert.equal(original.categories.length,10);assert.equal(original.videos.length,3);
  const es=portfolio(original,'es'),en=portfolio(original,'en');assert.equal(es[0].id,'belleza');assert.equal(en[0].name,'Beauty');
  assert.equal(es.find(c=>c.id==='alimentacion')!.projects[0].title,'Probando comida');assert.equal(en.find(c=>c.id==='alimentacion')!.projects[0].title,'Food tasting');
  assert.equal(es.find(c=>c.id==='salud')!.projects.length,0);
});
test('publicación, eliminación lógica, restauración y orden',()=>{
  const doc=structuredClone(original),video=doc.videos[0],category=doc.categories.find(c=>c.id===video.category_id)!;
  assert.equal(visibleVideos(doc).length,3);video.is_published=0;assert.equal(visibleVideos(doc).length,2);video.is_published=1;
  video.deleted_at=new Date().toISOString();assert.equal(visibleVideos(doc).length,2);video.deleted_at=null;
  category.is_active=0;assert.equal(visibleVideos(doc).length,2);category.is_active=1;category.deleted_at='2026-10-24';assert.equal(visibleVideos(doc).length,2);category.deleted_at=null;
  category.sort_order=999;assert.equal(portfolio(doc,'es').at(-1)!.id,category.slug);assert.equal(visibleVideos(doc).length,3);
});
test('rechaza relaciones rotas, identificadores duplicados y rutas arbitrarias',()=>{
  const broken=structuredClone(original);broken.videos[0].category_id=999999;assert.throws(()=>validateContent(broken));
  const duplicate=structuredClone(original);duplicate.categories.push(duplicate.categories[0]);assert.throws(()=>validateContent(duplicate));
  for(const path of ['../private/admin.json','cms-media/videos/../secret.mp4','https://evil.invalid/a.mp4','cms-media/videos/a.svg','cms-media/videos/%2e%2e.mp4'])assert.equal(validMediaPath(path),false);
  for(const slug of ['home','photos-title','title-belleza','INVALID','../../path']){const doc=structuredClone(original);doc.categories[0].slug=slug;assert.throws(()=>validateContent(doc));}
});
test('validación real de firmas, extensiones y límites',async()=>{
  assert.equal(detectFile(new TextEncoder().encode('fake mp4')),null);
  const sample=await readFile(original.videos[0].video_path);
  assert.equal(detectFile(sample.subarray(0,4096))?.mime,'video/mp4');
  const spoofed=new File(['not a video'],'fake.mp4',{type:'video/mp4'});await assert.rejects(()=>validateUpload(spoofed,'video'));
  const oversized={size:maxVideoBytes+1} as File;await assert.rejects(()=>validateUpload(oversized,'video'),/90 MB/);
  const result=await validateUpload(new File([sample],'renamed.txt',{type:'text/plain'}),'video');assert.equal(result.mime,'video/mp4');
});
