import { readFile, mkdir, copyFile, rm } from 'node:fs/promises';
import { resolve, dirname, sep } from 'node:path';
import { validateContent,visibleVideos,publicAsset,contentPath } from '../src/lib/content.ts';
const doc:unknown=JSON.parse(await readFile(contentPath,'utf8'));validateContent(doc);
const root=resolve('public/media/cms');
if(!root.startsWith(resolve('public/media')+sep))throw new Error('Destino de recursos no válido');
// This directory is generated; source assets and originals are never deleted.
await rm(root,{recursive:true,force:true});await mkdir(root,{recursive:true});
const paths=new Set(visibleVideos(doc).flatMap(v=>[v.video_path,...(v.thumbnail_path?[v.thumbnail_path]:[])]));
for(const path of paths){const target=resolve('public',publicAsset(path));if(!target.startsWith(root+sep))throw new Error('Ruta fuera del directorio generado');await mkdir(dirname(target),{recursive:true});await copyFile(resolve(path),target);}
console.log(`Preparados ${paths.size} archivos públicos. Los borradores y la papelera no se copian.`);
