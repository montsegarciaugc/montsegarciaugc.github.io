import {createHash} from 'node:crypto';
import type {Content} from '../../src/lib/content.ts';
export function fakeGitHub(document:Content,initialAssets:Record<string,Uint8Array>={}){
  const blobs=new Map<string,Uint8Array>(),trees=new Map<string,Record<string,string>>(),commits=new Map<string,{tree:string;parents:string[]}>();
  let counter=0,head='';const calls:{method:string;path:string;body:any;headers:Headers}[]=[];
  function blob(data:Uint8Array){const sha=createHash('sha1').update(data).digest('hex');blobs.set(sha,data);return sha;}
  function id(){return (++counter).toString(16).padStart(40,'0');}
  function makeCommit(files:Record<string,string>,parent=head){const tree=id();trees.set(tree,{...files});const sha=id();commits.set(sha,{tree,parents:parent?[parent]:[]});return sha;}
  const initial:Record<string,string>={'src/data/portfolio.json':blob(Buffer.from(JSON.stringify(document)))};
  for(const[path,data]of Object.entries(initialAssets))initial[path]=blob(data);head=makeCommit(initial);
  const files=()=>trees.get(commits.get(head)!.tree)!;
  const current=()=>JSON.parse(Buffer.from(blobs.get(files()['src/data/portfolio.json'])!).toString('utf8')) as Content;
  const change=(fn:(doc:Content)=>void)=>{const doc=current();fn(doc);head=makeCommit({...files(),'src/data/portfolio.json':blob(Buffer.from(JSON.stringify(doc)))});};
  const result={calls,blobs,files,current,change,refUpdates:0,failPatch:false,race:false,invalidToken:false,readOnly:false,fetch:undefined as unknown as typeof fetch};
  result.fetch=async(input:RequestInfo|URL,options:RequestInit={})=>{
    const url=new URL(String(input)),method=options.method||'GET',headers=new Headers(options.headers);
    if(url.origin!=='https://api.github.com')throw new Error('Untrusted API origin');
    const path=url.pathname.replace('/repos/test/portfolio',''),body=typeof options.body==='string'?JSON.parse(options.body):null;
    calls.push({method,path,body,headers});
    const json=(data:unknown,status=200)=>Response.json(data,{status});
    if(result.invalidToken||headers.get('authorization')!=='Bearer test-token')return json({},401);
    if(result.readOnly&&method!=='GET')return json({},403);
    if(method==='GET'&&path.startsWith('/contents/')){
      const ref=url.searchParams.get('ref'),commit=ref==='main'?head:ref||head;
      const file=decodeURIComponent(path.slice('/contents/'.length)),tree=trees.get(commits.get(commit)?.tree||'');const sha=tree?.[file];if(!sha)return json({},404);
      return json({type:'file',sha,encoding:'base64',content:Buffer.from(blobs.get(sha)!).toString('base64'),download_url:'https://untrusted.invalid/never-follow'});
    }
    if(method==='GET'&&path==='/git/ref/heads/main')return json({object:{sha:head}});
    if(method==='GET'&&path.startsWith('/git/commits/')){const commit=commits.get(path.split('/').at(-1)!);return commit?json({tree:{sha:commit.tree}}):json({},404);}
    if(method==='GET'&&path.startsWith('/git/blobs/')){const data=blobs.get(path.split('/').at(-1)!);return data?new Response(data as BodyInit):json({},404);}
    if(method==='POST'&&path==='/git/blobs')return json({sha:blob(Buffer.from(body.content,'base64'))},201);
    if(method==='POST'&&path==='/git/trees'){const next={...trees.get(body.base_tree)};for(const entry of body.tree)next[entry.path]=entry.sha;const sha=id();trees.set(sha,next);return json({sha},201);}
    if(method==='POST'&&path==='/git/commits'){const sha=id();commits.set(sha,{tree:body.tree,parents:body.parents});return json({sha},201);}
    if(method==='PATCH'&&path==='/git/refs/heads/main'){
      if(result.race){result.race=false;change(doc=>doc.revision++);}
      if(result.failPatch||body.force!==false||commits.get(body.sha)?.parents[0]!==head)return json({},422);
      head=body.sha;result.refUpdates++;return json({object:{sha:head}});
    }
    return json({},404);
  };
  return result;
}
