export interface Category {
  id:number; slug:string; name_es:string; name_en:string; description_es:string; description_en:string;
  sort_order:number; is_active:number; deleted_at:string|null; created_at:string; updated_at:string; import_key?:string|null;
}
export interface Video {
  id:number; category_id:number; title_es:string; title_en:string; description_es:string; description_en:string;
  video_path:string; thumbnail_path:string|null; original_filename:string; mime_type:string; file_size:number;
  sort_order:number; is_published:number; deleted_at:string|null; created_at:string; updated_at:string; import_key?:string|null;
}
export interface Content {schema_version:1;revision:number;categories:Category[];videos:Video[];}
export const contentPath='src/data/portfolio.json';
export const reservedSlugs=new Set(['home','main','niches','work','photos','brands','testimonials','about','equipment','contact','image-dialog']);
export function validSlug(slug:string){return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)&&slug.length<=80&&!reservedSlugs.has(slug)&&!slug.startsWith('title-')&&!slug.endsWith('-title');}
export function validMediaPath(path:string){return /^cms-media\/(videos|thumbnails)\/[a-zA-Z0-9-]+\.(mp4|webm|webp|jpg|png)$/.test(path);}
function check(value:unknown,message:string):asserts value {if(!value)throw new Error(message);}
function string(value:unknown,max:number,required=false){check(typeof value==='string'&&value.length<=max&&(!required||value.trim().length>0),'Texto no válido o demasiado largo');}
function integer(value:unknown,positive=false){check(Number.isSafeInteger(value)&&(!positive||Number(value)>0),'Número no válido');}
export function validateContent(value:unknown):asserts value is Content{
  check(value&&typeof value==='object','JSON de contenido no válido');const doc=value as Content;
  check(doc.schema_version===1,'Versión de contenido no compatible');integer(doc.revision);check(doc.revision>=0,'Revisión no válida');
  check(Array.isArray(doc.categories)&&Array.isArray(doc.videos)&&doc.categories.length<=200&&doc.videos.length<=2000,'Demasiados registros o listas no válidas');
  const ids=new Set<number>(),slugs=new Set<string>(),videoIds=new Set<number>();
  for(const c of doc.categories){
    integer(c.id,true);check(!ids.has(c.id),'Categoría duplicada');ids.add(c.id);
    check(typeof c.slug==='string'&&validSlug(c.slug)&&!slugs.has(c.slug),'Slug repetido, reservado o no válido');slugs.add(c.slug);
    for(const lang of ['es','en'] as const){string(c[`name_${lang}`],120,true);string(c[`description_${lang}`],5000);}
    integer(c.sort_order);check(c.is_active===0||c.is_active===1,'Estado de categoría no válido');
    check(c.deleted_at===null||typeof c.deleted_at==='string','Fecha no válida');string(c.created_at,40,true);string(c.updated_at,40,true);
  }
  for(const v of doc.videos){
    integer(v.id,true);check(!videoIds.has(v.id),'Vídeo duplicado');videoIds.add(v.id);check(ids.has(v.category_id),'Categoría del vídeo no encontrada');
    for(const lang of ['es','en'] as const){string(v[`title_${lang}`],200,true);string(v[`description_${lang}`],5000);}
    check(typeof v.video_path==='string'&&validMediaPath(v.video_path)&&v.video_path.startsWith('cms-media/videos/')&&/\.(mp4|webm)$/.test(v.video_path),'Ruta de vídeo no válida');
    check(v.thumbnail_path===null||(typeof v.thumbnail_path==='string'&&validMediaPath(v.thumbnail_path)&&v.thumbnail_path.startsWith('cms-media/thumbnails/')&&/\.(jpg|png|webp)$/.test(v.thumbnail_path)),'Ruta de portada no válida');
    check(['video/mp4','video/webm'].includes(v.mime_type)&&v.video_path.endsWith(v.mime_type==='video/mp4'?'.mp4':'.webm'),'Tipo de vídeo no válido');
    string(v.original_filename,255,true);integer(v.file_size,true);integer(v.sort_order);check(v.is_published===0||v.is_published===1,'Estado de vídeo no válido');
    check(v.deleted_at===null||typeof v.deleted_at==='string','Fecha no válida');string(v.created_at,40,true);string(v.updated_at,40,true);
  }
  check(new TextEncoder().encode(JSON.stringify(doc,null,2)).length<900_000,'El JSON de contenido supera el tamaño permitido');
}
export function sorted<T extends {sort_order:number;id:number}>(items:T[]){return [...items].sort((a,b)=>a.sort_order-b.sort_order||a.id-b.id);}
export function visibleVideos(doc:Content){const active=new Set(doc.categories.filter(c=>c.is_active&&!c.deleted_at).map(c=>c.id));return sorted(doc.videos.filter(v=>v.is_published&&!v.deleted_at&&active.has(v.category_id)));}
export const publicAsset=(path:string)=>{if(!validMediaPath(path))throw new Error('Ruta de recurso no válida');return 'media/cms/'+path.slice('cms-media/'.length);};
export function portfolio(doc:Content,lang:'es'|'en'){
  const published=visibleVideos(doc);
  return sorted(doc.categories).filter(c=>c.is_active&&!c.deleted_at).map(c=>({id:c.slug,name:c[`name_${lang}`],formats:c[`description_${lang}`],projects:published.filter(v=>v.category_id===c.id).map(v=>({id:v.id,title:v[`title_${lang}`],format:v[`description_${lang}`],src:publicAsset(v.video_path),poster:v.thumbnail_path?publicAsset(v.thumbnail_path):undefined,mime:v.mime_type}))}));
}
