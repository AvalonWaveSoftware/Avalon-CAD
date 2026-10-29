// TEST ONLY: Node 18 exposes DecompressionStream but lacks deflate-raw.
// Production always uses the browser's platform inflater. No Node code ships.
import {inflateRawSync} from 'node:zlib';
export let rawStreamShim=false;
try{new DecompressionStream('deflate-raw');}catch{
 rawStreamShim=true;
 const Native=globalThis.DecompressionStream;
 globalThis.DecompressionStream=class{
  constructor(format){
   if(format!=='deflate-raw')return new Native(format);
   const chunks=[];let size=0;
   return new TransformStream({transform(chunk){size+=chunk.length;if(size>50*1024*1024)throw Error('compressed input cap');chunks.push(Buffer.from(chunk));},flush(controller){const input=Buffer.concat(chunks),out=inflateRawSync(input,{maxOutputLength:256*1024*1024,info:true});if(out.engine.bytesWritten!==input.length)throw Error('trailing deflate bytes');controller.enqueue(out.buffer);}});
  }
 };
}
