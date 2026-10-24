// One-time migration of existing local CMS data. The deployed website never imports SQLite.
import { DatabaseSync } from 'node:sqlite';
import { writeFile, mkdir, copyFile, access } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { validateContent,contentPath,type Content } from '../src/lib/content.ts';
const destination=resolve(contentPath);
try{await access(destination);console.log('El JSON ya existe; no se sobrescribe.');process.exit(0);}catch{}
const database=new DatabaseSync(resolve(process.env.DATABASE_PATH||'private/portfolio.sqlite'),{readOnly:true});
const doc={schema_version:1,revision:1,categories:database.prepare('SELECT * FROM categories ORDER BY sort_order,id').all(),videos:database.prepare('SELECT * FROM videos ORDER BY sort_order,id').all()} as unknown as Content;
database.close();
for(const v of doc.videos){
  for(const field of ['video_path','thumbnail_path'] as const){
    const previous=v[field];if(!previous)continue;
    if(!/^(videos|thumbnails)\/[a-zA-Z0-9-]+\.(mp4|webm|webp|jpg|png)$/.test(previous))throw new Error('Ruta de migración no válida');
    const path='cms-media/'+previous;
    await mkdir(dirname(resolve(path)),{recursive:true});await copyFile(resolve(process.env.UPLOADS_DIR||'uploads',previous),resolve(path));v[field]=path;
  }
}
validateContent(doc);await mkdir(dirname(destination),{recursive:true});await writeFile(destination,JSON.stringify(doc,null,2)+'\n');
console.log(`Migradas ${doc.categories.length} categorías y ${doc.videos.length} vídeos a JSON. Se conservan los datos originales.`);
