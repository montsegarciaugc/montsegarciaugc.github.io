import {GitHubCms,type Asset} from '../lib/github.ts';
import {sorted,validateContent,validSlug,type Content,type Category,type Video} from '../lib/content.ts';
import {validateUpload,maxVideoBytes,maxThumbnailBytes} from '../lib/uploads.ts';

const root=document.querySelector<HTMLElement>('#cms')!;
const viewElement=document.querySelector<HTMLElement>('#cms-view')!;
const banner=document.querySelector<HTMLElement>('#cms-message')!;
const nav=document.querySelector<HTMLElement>('#cms-nav')!;
const base=root.dataset.base!;
let repository=root.dataset.repository!,branch=root.dataset.branch!;
let api:GitHubCms|null=null,content:Content|null=null,busy=false,dirty=false;
let view='dashboard',editing=0,trash=false;
const urls=new Set<string>();
const escape=(value:unknown)=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const checked=(value:unknown)=>value?' checked':'';
const url=(page:string)=>`${base}admin/${page}`;
const field=(name:string,label:string,value:unknown='',options='')=>`<label>${label}<input name="${name}" value="${escape(value)}" ${options}/></label>`;
const area=(name:string,label:string,value:unknown='')=>`<label>${label}<textarea name="${name}" maxlength="5000">${escape(value)}</textarea></label>`;
const text=(form:FormData,name:string)=>String(form.get(name)||'').trim();
const number=(form:FormData,name:string)=>{const value=text(form,name);if(!/^-?\d+$/.test(value)||!Number.isSafeInteger(Number(value)))throw new Error('Revisa el número de orden');return Number(value);};
function notify(message:string,error=false){banner.textContent=message;banner.className=error?'error':'notice';banner.setAttribute('role',error?'alert':'status');if(error)banner.focus();}
function cleanUrls(){urls.forEach(value=>URL.revokeObjectURL(value));urls.clear();}
function objectUrl(blob:Blob){const value=URL.createObjectURL(blob);urls.add(value);return value;}
function locationView(){const path=location.pathname.slice((base+'admin/').length).replace(/\/$/,'');view=path==='categories'?'categories':path==='videos/new'?'video-form':path==='videos'?'videos':path==='access'||path==='password'?'access':'dashboard';editing=Number(new URLSearchParams(location.search).get('edit')||0);if(editing&&view==='videos')view='video-form';trash=new URLSearchParams(location.search).has('trash');}
function navigate(next:string,id=0,deleted=false){
  if(busy)return;if(dirty&&!confirm('Hay cambios sin guardar. ¿Quieres descartarlos?'))return;
  dirty=false;view=next;editing=id;trash=deleted;
  const path=next==='dashboard'?'':next==='video-form'?(id?`videos/?edit=${id}`:'videos/new/'):next==='videos'?(deleted?'videos/?trash=1':'videos/'):next+'/';
  history.pushState({},'',url(path));render();banner.textContent='';banner.className='';
}
function categoryForm(c?:Category){return `<form data-form="category" class="form-grid"><input type="hidden" name="id" value="${c?.id||0}"/>${field('name_es','Nombre ES',c?.name_es,'required maxlength="120"')}${field('name_en','Nombre EN',c?.name_en,'required maxlength="120"')}${area('description_es','Descripción ES',c?.description_es)}${area('description_en','Descripción EN',c?.description_en)}${field('slug','Slug del enlace',c?.slug,'required maxlength="80" pattern="[a-z0-9]+(-[a-z0-9]+)*"')}${field('sort_order','Orden',c?.sort_order||0,'type="number" required')}<label><input type="checkbox" name="is_active"${checked(c?c.is_active:true)}/>Activa</label><div class="wide"><button>Guardar categoría</button></div></form>`;}
function videoForm(v?:Video){
  const categories=sorted(content!.categories).filter(c=>!c.deleted_at);
  return `<h1>${v?'Editar vídeo':'Subir vídeo'}</h1><form data-form="video" class="panel"><input type="hidden" name="id" value="${v?.id||0}"/><div class="form-grid">${field('title_es','Título ES',v?.title_es,'required maxlength="200"')}${field('title_en','Título EN',v?.title_en,'required maxlength="200"')}${area('description_es','Descripción ES',v?.description_es)}${area('description_en','Descripción EN',v?.description_en)}<label>Categoría<select name="category_id" required><option value="">Selecciona una categoría</option>${categories.map(c=>`<option value="${c.id}"${c.id===v?.category_id?' selected':''}>${escape(c.name_es)}${c.is_active?'':' (inactiva)'}</option>`).join('')}</select></label>${field('sort_order','Orden',v?.sort_order||0,'type="number" required')}<label>${v?'Sustituir vídeo (opcional)':'Archivo de vídeo'}<input type="file" name="video" accept="video/mp4,video/webm" ${v?'':'required'}/><small>MP4/WebM. Máximo ${maxVideoBytes/1024/1024} MB. Se recomienda comprimir los vídeos antes de subirlos.</small></label><label>Portada opcional<input type="file" name="thumbnail" accept="image/jpeg,image/png,image/webp"/><small>JPG/PNG/WebP. Máximo ${maxThumbnailBytes/1024/1024} MB.</small></label><label><input type="checkbox" name="is_published"${checked(v?.is_published)}/>Publicado</label>${v?.thumbnail_path?'<label><input type="checkbox" name="remove_thumbnail"/>Quitar portada actual</label>':''}</div>${v?`<div class="actions"><button type="button" class="quiet" data-action="preview" data-id="${v.id}">Ver vídeo guardado</button></div><div id="preview-area"></div>`:''}<div class="actions"><button ${categories.length?'':'disabled'}>Guardar vídeo</button><a data-view="videos" href="${url('videos/')}">Volver</a></div>${categories.length?'':'<p>Crea una categoría antes de subir un vídeo.</p>'}<progress id="upload-progress" value="0" max="100" hidden aria-label="Progreso de subida"></progress><p id="upload-status" role="status" aria-live="polite"></p></form>`;
}
function render(){
  cleanUrls();nav.hidden=!api;viewElement.setAttribute('aria-busy','false');
  if(!api||!content){
    viewElement.innerHTML=`<h1>Acceso al estudio</h1><div class="panel login"><p>Usa un token de GitHub con acceso únicamente a este repositorio y permiso <strong>Contents: Read and write</strong>.</p><form data-form="login">${field('repository','Repositorio',repository,'required autocomplete="off" placeholder="usuario/repositorio"')}${field('branch','Rama de publicación',branch,'required autocomplete="off"')}<label>Token de GitHub<input name="token" type="password" required autocomplete="off" spellcheck="false" maxlength="512"/></label><p class="muted">El token permanece solo en esta pestaña mientras esté abierta. No se guarda en el navegador. Al recargar tendrás que volver a entrar.</p><button>Entrar</button></form><p><a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener noreferrer">Crear un token de acceso ↗</a></p><p class="muted">No compartas el token ni lo incluyas en los archivos del proyecto.</p></div>`;return;
  }
  const doc=content,categories=sorted(doc.categories),videos=sorted(doc.videos),alive=videos.filter(v=>!v.deleted_at);
  if(view==='categories'){
    viewElement.innerHTML=`<h1>Categorías</h1><details class="panel"><summary>Crear categoría</summary>${categoryForm()}</details>${categories.filter(c=>!c.deleted_at).map(c=>`<section class="panel"><h2>${escape(c.name_es)} <span class="badge">${c.is_active?'Activa':'Inactiva'} · Orden ${c.sort_order}</span></h2><details><summary>Editar nombres, traducciones y orden</summary>${categoryForm(c)}</details><p class="muted">${videos.filter(v=>v.category_id===c.id).length} vídeos, incluida la papelera.</p><button class="quiet" data-action="category-delete" data-id="${c.id}">Enviar a la papelera</button></section>`).join('')||'<p>No hay categorías.</p>'}<section class="panel"><h2>Papelera de categorías</h2>${categories.filter(c=>c.deleted_at).map(c=>`<div class="actions"><span>${escape(c.name_es)}</span><button class="quiet" data-action="category-restore" data-id="${c.id}">Restaurar</button></div>`).join('')||'<p>La papelera está vacía.</p>'}</section>`;
  }else if(view==='videos'){
    const shown=videos.filter(v=>trash?!!v.deleted_at:!v.deleted_at);
    viewElement.innerHTML=`<h1>${trash?'Papelera de vídeos':'Vídeos'}</h1><div class="actions"><a class="button" data-view="video-form" href="${url('videos/new/')}">Subir vídeo</a><a data-view="videos" href="${url('videos/')}">Todos</a><a data-view="trash" href="${url('videos/?trash=1')}">Papelera (${videos.length-alive.length})</a></div><section class="panel table-wrap">${shown.length?`<table><thead><tr><th>Portada</th><th>Título / orden</th><th>Categoría</th><th>Estado</th><th>Creación</th><th>Acciones</th></tr></thead><tbody>${shown.map(v=>{const c=categories.find(c=>c.id===v.category_id);return `<tr><td>${v.thumbnail_path?`<span class="thumbnail-placeholder" data-thumbnail="${v.id}">Cargando portada…</span>`:'Sin portada'}</td><td>${escape(v.title_es)}<br/><small>Orden ${v.sort_order}</small></td><td>${escape(c?.name_es)}</td><td><span class="badge">${v.deleted_at?'Papelera':v.is_published?'Publicado':'Borrador'}</span>${v.is_published&&(!c?.is_active||c?.deleted_at)?'<small> · Categoría oculta</small>':''}</td><td>${escape(v.created_at.slice(0,10))}</td><td>${trash?'':`<a href="${url(`videos/?edit=${v.id}`)}" data-action="edit" data-id="${v.id}">Editar</a>`}<button class="quiet" data-action="video-${trash?'restore':'delete'}" data-id="${v.id}">${trash?'Restaurar':'A la papelera'}</button></td></tr>`;}).join('')}</tbody></table>`:'<p>No hay vídeos en esta vista.</p>'}</section>`;
    void loadThumbnails();
  }else if(view==='video-form'){
    const video=editing?doc.videos.find(v=>v.id===editing&&!v.deleted_at):undefined;
    viewElement.innerHTML=editing&&!video?'<h1>Vídeo no disponible</h1><p>Comprueba la papelera.</p>':videoForm(video);
  }else if(view==='access'){
    viewElement.innerHTML=`<h1>Acceso y publicación</h1><section class="panel"><p>Estás editando <strong>${escape(repository)}</strong>, rama <strong>${escape(branch)}</strong>.</p><p>GitHub autoriza cada cambio. El CMS no guarda contraseñas ni tokens en el repositorio.</p><p>Para cambiar o revocar el acceso, administra el token en GitHub. Una vez revocado ya no podrá guardar cambios.</p><p><a href="https://github.com/settings/personal-access-tokens" target="_blank" rel="noopener noreferrer">Administrar tokens en GitHub ↗</a></p><p>Guardar actualiza los JSON y los archivos en un único commit. La web pública conserva su versión anterior hasta que termine la publicación automática.</p><p><a href="https://github.com/${escape(repository)}/actions" target="_blank" rel="noopener noreferrer">Ver publicaciones ↗</a></p><button class="quiet" data-action="reload">Recargar el contenido de GitHub</button></section>`;
  }else{
    const stats=[['Total de vídeos',videos.length],['Publicados',alive.filter(v=>v.is_published).length],['Borradores',alive.filter(v=>!v.is_published).length],['Categorías activas',categories.filter(c=>c.is_active&&!c.deleted_at).length],['En papelera',videos.length-alive.length]];
    const recent=[...alive].sort((a,b)=>b.created_at.localeCompare(a.created_at)||b.id-a.id).slice(0,6);
    viewElement.innerHTML=`<h1>Tu estudio, al día</h1><div class="stats">${stats.map(([label,count])=>`<article class="stat"><span>${label}</span><strong>${count}</strong></article>`).join('')}</div><div class="actions"><a class="button" data-view="video-form" href="${url('videos/new/')}">Subir vídeo</a><a data-view="categories" href="${url('categories/')}">Gestionar categorías</a><button class="quiet" data-action="reload">Recargar datos</button></div><section class="panel"><h2>Últimos vídeos incorporados</h2>${recent.length?`<ul>${recent.map(v=>`<li><a data-action="edit" data-id="${v.id}" href="${url(`videos/?edit=${v.id}`)}">${escape(v.title_es)}</a> · ${v.is_published?'Publicado':'Borrador'}</li>`).join('')}</ul>`:'<p>Sube tu primera pieza.</p>'}<p class="muted">Un vídeo publicado solo aparece si su categoría está activa. Los cambios aparecerán en la web al terminar la publicación.</p></section>`;
  }
  document.title=`${view==='categories'?'Categorías':view==='videos'?'Vídeos':'Estudio'} · Montse CMS`;
}
async function loadThumbnails(){
  const client=api;if(!client)return;
  const elements=[...viewElement.querySelectorAll<HTMLElement>('[data-thumbnail]')];
  let index=0;
  await Promise.all(Array.from({length:Math.min(3,elements.length)},async()=>{
    for(;;){const element=elements[index++];if(!element)break;const video=content?.videos.find(v=>v.id===Number(element.dataset.thumbnail));
      try{const blob=await client.asset(video!.thumbnail_path!);if(!element.isConnected||api!==client)continue;const image=document.createElement('img');image.src=objectUrl(blob);image.alt='';image.loading='lazy';element.replaceWith(image);}
      catch{if(element.isConnected)element.textContent='Portada no disponible';}
    }
  }));
}
async function run(task:()=>Promise<void>){
  if(busy)return;busy=true;root.setAttribute('aria-busy','true');root.querySelectorAll<HTMLButtonElement>('button').forEach(b=>b.disabled=true);
  try{await task();}catch(error){notify(error instanceof Error?error.message:'No se pudo completar el guardado',true);}
  finally{busy=false;root.setAttribute('aria-busy','false');root.querySelectorAll<HTMLButtonElement>('button').forEach(b=>b.disabled=false);}
}
async function save(next:Content,assets:Asset[]=[]){
  validateContent(next);const progress=viewElement.querySelector<HTMLProgressElement>('progress');if(progress)progress.hidden=false;
  const result=await api!.save(next,assets,(percent,message)=>{if(progress)progress.value=percent;const status=viewElement.querySelector<HTMLElement>('#upload-status');if(status)status.textContent=message;});
  content=result.document;dirty=false;render();notify('Guardado en GitHub. La web se actualizará cuando termine la publicación automática.');
}
root.addEventListener('input',event=>{if(api&&(event.target as Element).closest('form'))dirty=true;});
root.addEventListener('submit',event=>{
  const form=event.target as HTMLFormElement;if(!form.matches('[data-form]'))return;event.preventDefault();
  if(busy)return;const data=new FormData(form),kind=form.dataset.form;
  void run(async()=>{
    if(kind==='login'){
      const client=new GitHubCms(text(data,'repository'),text(data,'branch'),text(data,'token'));
      try{const loaded=await client.load();api=client;content=loaded;repository=text(data,'repository');branch=text(data,'branch');(form.elements.namedItem('token') as HTMLInputElement).value='';dirty=false;history.replaceState({},'',url(''));view='dashboard';render();notify('Acceso autorizado. Los cambios que guardes actualizarán el repositorio.');}catch(error){client.close();throw error;}
      return;
    }
    const next=structuredClone(content!),now=new Date().toISOString(),id=number(data,'id');
    if(kind==='category'){
      const slug=text(data,'slug');if(!validSlug(slug))throw new Error('El slug está reservado o no es válido');if(next.categories.some(c=>c.id!==id&&c.slug===slug))throw new Error('Ya existe una categoría con ese slug');
      const previous=id?next.categories.find(c=>c.id===id&&!c.deleted_at):undefined;if(id&&!previous)throw new Error('Categoría no disponible');
      const category:Category={id:id||Math.max(0,...next.categories.map(c=>c.id))+1,slug,name_es:text(data,'name_es'),name_en:text(data,'name_en'),description_es:text(data,'description_es'),description_en:text(data,'description_en'),sort_order:number(data,'sort_order'),is_active:data.has('is_active')?1:0,deleted_at:null,created_at:previous?.created_at||now,updated_at:now,...(previous?.import_key?{import_key:previous.import_key}:{})};
      if(previous)Object.assign(previous,category);else next.categories.push(category);await save(next);return;
    }
    if(kind==='video'){
      const previous=id?next.videos.find(v=>v.id===id&&!v.deleted_at):undefined;if(id&&!previous)throw new Error('Vídeo no disponible');
      const category=number(data,'category_id');if(!next.categories.some(c=>c.id===category&&!c.deleted_at))throw new Error('Selecciona una categoría válida');
      const file=data.get('video'),thumbnail=data.get('thumbnail'),assets:Asset[]=[];
      let videoPath=previous?.video_path,mime=previous?.mime_type,size=previous?.file_size,original=previous?.original_filename,thumbnailPath=data.has('remove_thumbnail')?null:previous?.thumbnail_path||null;
      if(file instanceof File&&file.size){const type=await validateUpload(file,'video');videoPath=`cms-media/videos/${crypto.randomUUID()}.${type.extension}`;mime=type.mime;size=file.size;original=file.name.replace(/.*[\\/]/,'').slice(0,255);assets.push({path:videoPath,file});}
      if(!videoPath||!mime||!size||!original)throw new Error('Selecciona un archivo de vídeo');
      if(thumbnail instanceof File&&thumbnail.size){const type=await validateUpload(thumbnail,'thumbnail');thumbnailPath=`cms-media/thumbnails/${crypto.randomUUID()}.${type.extension}`;assets.push({path:thumbnailPath,file:thumbnail});}
      const video:Video={id:id||Math.max(0,...next.videos.map(v=>v.id))+1,category_id:category,title_es:text(data,'title_es'),title_en:text(data,'title_en'),description_es:text(data,'description_es'),description_en:text(data,'description_en'),video_path:videoPath,thumbnail_path:thumbnailPath,original_filename:original,mime_type:mime,file_size:size,sort_order:number(data,'sort_order'),is_published:data.has('is_published')?1:0,deleted_at:null,created_at:previous?.created_at||now,updated_at:now,...(previous?.import_key?{import_key:previous.import_key}:{})};
      if(previous)Object.assign(previous,video);else next.videos.push(video);validateContent(next);
      const result=await api!.save(next,assets,(percent,message)=>{const progress=viewElement.querySelector<HTMLProgressElement>('progress')!;progress.hidden=false;progress.value=percent;viewElement.querySelector<HTMLElement>('#upload-status')!.textContent=message;});
      content=result.document;dirty=false;view='videos';history.replaceState({},'',url('videos/'));render();notify('Vídeo guardado en GitHub. La web se actualizará al terminar la publicación.');
    }
  });
});
root.addEventListener('click',event=>{
  const button=(event.target as Element).closest<HTMLElement>('[data-view],[data-action]');if(!button)return;
  if(busy){event.preventDefault();return;}
  if(button.dataset.view){event.preventDefault();const next=button.dataset.view;navigate(next==='trash'?'videos':next,0,next==='trash');return;}
  const action=button.dataset.action,id=Number(button.dataset.id);event.preventDefault();
  if(action==='logout'){if(dirty&&!confirm('Hay cambios sin guardar. ¿Quieres salir?'))return;api?.close();api=null;content=null;dirty=false;cleanUrls();history.replaceState({},'',url('login/'));render();notify('Has cerrado el acceso al CMS.');return;}
  if(!api||!content)return;
  if(action==='edit'){navigate('video-form',id);return;}
  if(action==='reload'){if(dirty&&!confirm('Se descartarán los cambios del formulario. ¿Continuar?'))return;void run(async()=>{content=await api!.load();dirty=false;render();notify('Contenido actualizado desde GitHub.');});return;}
  if(action==='preview'){
    const video=content.videos.find(v=>v.id===id);if(!video)return;
    void run(async()=>{const client=api!,blob=await client.asset(video.video_path);if(api!==client)return;const preview=document.createElement('video');preview.className='preview';preview.controls=true;preview.preload='metadata';preview.src=objectUrl(new Blob([blob],{type:video.mime_type}));viewElement.querySelector('#preview-area')?.replaceChildren(preview);});return;
  }
  if(['category-delete','category-restore','video-delete','video-restore'].includes(action||'')){
    const category=action!.startsWith('category'),restore=action!.endsWith('restore');
    const record=category?content.categories.find(c=>c.id===id):content.videos.find(v=>v.id===id);if(!record)return;
    const count=category?content.videos.filter(v=>v.category_id===id).length:0;
    if(!restore&&!confirm(category?`Esta categoría contiene ${count} vídeos. Se ocultarán junto con ella, sin borrar archivos. ¿Enviar a la papelera?`:'El vídeo dejará de mostrarse al publicarse la web. Sus archivos se conservarán. ¿Enviar a la papelera?'))return;
    if(dirty&&!confirm('Los cambios sin guardar del formulario se descartarán. ¿Continuar?'))return;
    void run(async()=>{const next=structuredClone(content!);const target=category?next.categories.find(c=>c.id===id)!:next.videos.find(v=>v.id===id)!;target.deleted_at=restore?null:new Date().toISOString();target.updated_at=new Date().toISOString();await save(next);});
  }
});
addEventListener('beforeunload',event=>{if(busy||dirty)event.preventDefault();});
addEventListener('pagehide',()=>{api?.close();api=null;content=null;cleanUrls();});
addEventListener('pageshow',event=>{if(event.persisted){api=null;content=null;dirty=false;render();}});
addEventListener('popstate',()=>{locationView();dirty=false;render();});
locationView();render();
