import {contentPath,validateContent,validMediaPath,type Content} from './content.ts';
export class GitHubError extends Error {status:number;constructor(message:string,status=400){super(message);this.status=status;}}
export interface Asset {path:string;file:Blob;}
export function utf8Base64(value:string){return bytesBase64(new TextEncoder().encode(value));}
export function bytesBase64(bytes:Uint8Array){let result='';for(let index=0;index<bytes.length;index+=32768)result+=String.fromCharCode(...bytes.subarray(index,index+32768));return btoa(result);}
export function decodeBase64(value:string){const raw=atob(value.replace(/\s/g,''));return new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(raw,c=>c.charCodeAt(0)));}
const refPath=(branch:string)=>branch.split('/').map(encodeURIComponent).join('/');
function failure(status:number){
  const messages:Record<number,string>={401:'Token incorrecto o caducado. Vuelve a entrar.',403:'GitHub ha rechazado el acceso. Comprueba los permisos Contents: Read and write y el límite de peticiones.',404:'No se encuentra el repositorio, la rama o el archivo. Comprueba el acceso del token.',409:'Hay cambios nuevos en GitHub. Recarga el contenido antes de guardar.',422:'La rama ha cambiado o está protegida. Revisa GitHub y vuelve a cargar el contenido.',429:'GitHub ha limitado las peticiones. Espera antes de volver a intentarlo.'};
  return new GitHubError(messages[status]||'GitHub no ha podido completar la operación. No se ha confirmado el guardado.',status);
}
export class GitHubCms {
  #token:string;
  #repository:string;
  #branch:string;
  #fetch:typeof fetch;
  sha='';
  constructor(repository:string,branch:string,token:string,fetcher:typeof fetch=fetch){
    if(!/^[a-zA-Z0-9][a-zA-Z0-9-]{0,38}\/[\w.-]{1,100}$/.test(repository)||['.','..'].includes(repository.split('/')[1])||!branch||/[\s~^:?*[\\]|\.\.|@\{/.test(branch)||branch.length>200)throw new GitHubError('Repositorio o rama no válidos');
    if(!token.trim()||token.length>512)throw new GitHubError('Introduce un token válido');
    this.#token=token.trim();this.#repository=repository;this.#branch=branch;this.#fetch=fetcher;
  }
  close(){this.#token='';this.sha='';}
  async #api(path:string,options:RequestInit={}){
    if(!this.#token)throw new GitHubError('La sesión está cerrada',401);
    const response=await this.#fetch.call(globalThis,`https://api.github.com/repos/${this.#repository}${path}`,{...options,cache:'no-store',credentials:'omit',redirect:'error',headers:{Accept:'application/vnd.github+json',Authorization:`Bearer ${this.#token}`,'X-GitHub-Api-Version':'2022-11-28',...(options.body?{'Content-Type':'application/json'}:{}),...options.headers}});
    if(!response.ok)throw failure(response.status);
    return response;
  }
  async #json(path:string,options:RequestInit={}){return (await this.#api(path,options)).json();}
  async #document(ref=this.#branch){
    const file=await this.#json(`/contents/${contentPath}?ref=${encodeURIComponent(ref)}`);
    if(file.type!=='file'||file.encoding!=='base64'||typeof file.content!=='string')throw new GitHubError('El JSON no se puede leer. Comprueba su tamaño y formato.');
    let document:unknown;try{document=JSON.parse(decodeBase64(file.content));}catch{throw new GitHubError('El JSON de GitHub no es válido. Restaura una versión correcta.');}
    validateContent(document);return {document,sha:file.sha as string};
  }
  async load(){const {document,sha}=await this.#document();this.sha=sha;return document;}
  async asset(path:string):Promise<Blob>{
    if(!validMediaPath(path))throw new GitHubError('Ruta de archivo no válida');
    const file=await this.#json(`/contents/${path}?ref=${encodeURIComponent(this.#branch)}`);
    // Never follow download_url: only the fixed GitHub API origin receives the token.
    if(file.type!=='file'||!/^([a-f0-9]{40}|[a-f0-9]{64})$/.test(file.sha))throw new GitHubError('Archivo no disponible');
    return (await this.#api(`/git/blobs/${file.sha}`,{headers:{Accept:'application/vnd.github.raw+json'}})).blob();
  }
  async #blob(content:string){return this.#json('/git/blobs',{method:'POST',body:JSON.stringify({content,encoding:'base64'})});}
  async #uploadBlob(content:string,onProgress:(fraction:number)=>void):Promise<{sha:string}>{
    if(typeof XMLHttpRequest==='undefined'||this.#fetch!==globalThis.fetch)return this.#blob(content);
    // Send large files straight to GitHub, avoiding hosting function upload limits.
    return new Promise((resolve,reject)=>{
      const request=new XMLHttpRequest();
      request.open('POST',`https://api.github.com/repos/${this.#repository}/git/blobs`);
      request.withCredentials=false;request.timeout=300_000;
      request.setRequestHeader('Authorization',`Bearer ${this.#token}`);
      request.setRequestHeader('Accept','application/vnd.github+json');
      request.setRequestHeader('X-GitHub-Api-Version','2022-11-28');request.setRequestHeader('Content-Type','application/json');
      request.upload.onprogress=event=>{if(event.lengthComputable)onProgress(event.loaded/event.total);};
      request.onerror=()=>reject(new GitHubError('Se perdió la conexión durante la subida. El formulario conserva tus datos.'));
      request.ontimeout=()=>reject(new GitHubError('La subida ha tardado demasiado. Comprueba la conexión e inténtalo de nuevo.'));
      request.onabort=()=>reject(new GitHubError('La subida se ha cancelado.'));
      request.onload=()=>{if(request.status<200||request.status>=300){reject(failure(request.status));return;}try{const result=JSON.parse(request.responseText);if(typeof result.sha!=='string')throw new Error();resolve(result);}catch{reject(new GitHubError('GitHub devolvió una respuesta de subida no válida.'));}};
      request.send(JSON.stringify({content,encoding:'base64'}));
    });
  }
  async save(document:Content,assets:Asset[]=[],progress:(percent:number,message:string)=>void=()=>{}){
    validateContent(document);
    if(!this.sha)throw new GitHubError('Carga el contenido antes de guardar');
    for(const asset of assets)if(!validMediaPath(asset.path))throw new GitHubError('Ruta de archivo no válida');
    const ref=await this.#json(`/git/ref/heads/${refPath(this.#branch)}`),parent=ref.object.sha;
    const latest=await this.#document(parent);
    if(latest.sha!==this.sha)throw new GitHubError('Otra persona ha cambiado el contenido. Tus cambios siguen en el formulario; recarga los datos antes de volver a editar.',409);
    const commit=await this.#json(`/git/commits/${parent}`);
    const tree:{path:string;mode:'100644';type:'blob';sha:string}[]=[];
    let uploaded=0;const total=assets.reduce((n,a)=>n+a.file.size,0);
    for(const asset of assets){
      progress(total?uploaded/total*80:0,'Subiendo archivos a GitHub…');
      const encoded=bytesBase64(new Uint8Array(await asset.file.arrayBuffer()));
      const blob=await this.#uploadBlob(encoded,fraction=>progress((uploaded+asset.file.size*fraction)/total*80,'Subiendo archivos a GitHub…'));uploaded+=asset.file.size;
      tree.push({path:asset.path,mode:'100644',type:'blob',sha:blob.sha});
      progress(total?uploaded/total*80:80,'Archivo subido; preparando el guardado…');
    }
    const saved=structuredClone(document);saved.revision=latest.document.revision+1;
    const json=await this.#blob(utf8Base64(JSON.stringify(saved,null,2)+'\n'));
    tree.push({path:contentPath,mode:'100644',type:'blob',sha:json.sha});
    progress(85,'Guardando categorías y vídeos…');
    const nextTree=await this.#json('/git/trees',{method:'POST',body:JSON.stringify({base_tree:commit.tree.sha,tree})});
    const next=await this.#json('/git/commits',{method:'POST',body:JSON.stringify({message:'cms: actualizar portfolio',tree:nextTree.sha,parents:[parent]})});
    // A single fast-forward publishes metadata and assets together. Never overwrite another commit.
    await this.#json(`/git/refs/heads/${refPath(this.#branch)}`,{method:'PATCH',body:JSON.stringify({sha:next.sha,force:false})});
    this.sha=json.sha;progress(100,'Guardado en GitHub. La web se actualizará cuando termine la publicación.');
    return {document:saved,commit:next.sha as string};
  }
}
