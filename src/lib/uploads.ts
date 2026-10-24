export const maxVideoBytes=90*1024*1024;
export const maxThumbnailBytes=10*1024*1024;
export function detectFile(bytes:Uint8Array):{mime:string;extension:string}|null{
  const ascii=(start:number,end:number)=>String.fromCharCode(...bytes.subarray(start,end));
  if(bytes.length>=16&&ascii(4,8)==='ftyp'){
    const box=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength).getUint32(0);
    if(box>=16&&['isom','iso2','mp41','mp42','avc1','dash','M4V ','MSNV'].some(brand=>ascii(8,Math.min(bytes.length,128)).includes(brand)))return {mime:'video/mp4',extension:'mp4'};
  }
  if(bytes.length>=16&&bytes[0]===0x1a&&bytes[1]===0x45&&bytes[2]===0xdf&&bytes[3]===0xa3&&ascii(4,Math.min(bytes.length,4096)).includes('webm'))return {mime:'video/webm',extension:'webm'};
  if(bytes.length>=12&&ascii(0,4)==='RIFF'&&ascii(8,12)==='WEBP')return {mime:'image/webp',extension:'webp'};
  if(bytes.length>=8&&[137,80,78,71,13,10,26,10].every((value,index)=>bytes[index]===value))return {mime:'image/png',extension:'png'};
  if(bytes.length>=3&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return {mime:'image/jpeg',extension:'jpg'};
  return null;
}
export async function validateUpload(file:File,kind:'video'|'thumbnail'){
  const max=kind==='video'?maxVideoBytes:maxThumbnailBytes;
  if(!file.size||file.size>max)throw new Error(`El ${kind==='video'?'vídeo':'archivo de portada'} debe tener entre 1 byte y ${max/1024/1024} MB`);
  const type=detectFile(new Uint8Array(await file.slice(0,4096).arrayBuffer()));
  const allowed=kind==='video'?['video/mp4','video/webm']:['image/jpeg','image/png','image/webp'];
  if(!type||!allowed.includes(type.mime))throw new Error('El contenido real del archivo no es MP4/WebM o una portada JPG/PNG/WebP válida');
  if(kind==='thumbnail'&&typeof createImageBitmap==='function'){const image=await createImageBitmap(file);if(!image.width||!image.height)throw new Error('La portada no se puede leer');image.close();}
  return type;
}
