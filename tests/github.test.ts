import{test}from'node:test';
import assert from'node:assert/strict';
import{readFile}from'node:fs/promises';
import{GitHubCms,utf8Base64,decodeBase64}from'../src/lib/github.ts';
import type{Content}from'../src/lib/content.ts';
import{fakeGitHub}from'./helpers/github.ts';
const original:Content=JSON.parse(await readFile('tests/fixtures/portfolio.json','utf8'));
test('UTF-8 y lectura autenticada sin filtrar el token a URLs externas',async()=>{
  const value='Vídeos · Alimentación ✨';assert.equal(decodeBase64(utf8Base64(value)),value);
  const fake=fakeGitHub(original,{'cms-media/thumbnails/sample.webp':new Uint8Array([1,2,3])});
  const client=new GitHubCms('test/portfolio','main','test-token',fake.fetch);
  assert.deepEqual(await client.load(),original);assert.equal((await client.asset('cms-media/thumbnails/sample.webp')).size,3);
  assert.ok(fake.calls.every(c=>c.headers.get('authorization')==='Bearer test-token'));
  client.close();await assert.rejects(()=>client.load(),/cerrada/);
});
test('guarda JSON y archivos en un único commit, sin forzar la rama',async()=>{
  const fake=fakeGitHub(original),client=new GitHubCms('test/portfolio','main','test-token',fake.fetch),doc=await client.load();
  doc.categories[0].name_es='Belleza actualizada';const progress:number[]=[];
  const asset={path:'cms-media/thumbnails/new-cover.webp',file:new Blob(['image bytes'])};
  const result=await client.save(doc,[asset],percent=>progress.push(percent));
  assert.equal(result.document.revision,original.revision+1);assert.equal(fake.current().categories[0].name_es,'Belleza actualizada');assert.ok(fake.files()[asset.path]);assert.equal(fake.refUpdates,1);
  const patch=fake.calls.find(c=>c.method==='PATCH')!;assert.equal(patch.body.force,false);assert.equal(progress.at(-1),100);
});
test('los cambios concurrentes se rechazan sin sobrescribir la edición ajena',async()=>{
  const fake=fakeGitHub(original),a=new GitHubCms('test/portfolio','main','test-token',fake.fetch),b=new GitHubCms('test/portfolio','main','test-token',fake.fetch);
  const docA=await a.load(),docB=await b.load();docA.categories[0].name_es='Primera edición';await a.save(docA);
  docB.categories[0].name_es='Segunda edición';await assert.rejects(()=>b.save(docB),/Otra persona/);assert.equal(fake.current().categories[0].name_es,'Primera edición');assert.equal(fake.refUpdates,1);
});
test('un fallo al actualizar la referencia no publica archivos ni JSON a medias',async()=>{
  const fake=fakeGitHub(original),client=new GitHubCms('test/portfolio','main','test-token',fake.fetch),doc=await client.load();
  fake.failPatch=true;doc.categories[0].name_es='No debe aparecer';
  await assert.rejects(()=>client.save(doc,[{path:'cms-media/videos/new.mp4',file:new Blob(['video'])}]));assert.deepEqual(fake.current(),original);assert.ok(!fake.files()['cms-media/videos/new.mp4']);assert.equal(fake.refUpdates,0);
});
test('detecta una carrera posterior a la comprobación inicial',async()=>{
  const fake=fakeGitHub(original),client=new GitHubCms('test/portfolio','main','test-token',fake.fetch),doc=await client.load();fake.race=true;
  doc.categories[0].name_es='No sobrescribir';await assert.rejects(()=>client.save(doc),/rama ha cambiado/);assert.equal(fake.current().categories[0].name_es,original.categories[0].name_es);
});
test('permisos insuficientes y token inválido no alteran el contenido',async()=>{
  const fake=fakeGitHub(original),client=new GitHubCms('test/portfolio','main','test-token',fake.fetch);
  fake.invalidToken=true;await assert.rejects(()=>client.load(),/Token incorrecto/);fake.invalidToken=false;
  const doc=await client.load();fake.readOnly=true;await assert.rejects(()=>client.save(doc),/Contents/);assert.equal(fake.refUpdates,0);
});
