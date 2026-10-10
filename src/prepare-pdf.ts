import {chooseTitle} from './book-title.js';
async function bounded<T>(promise:Promise<T>,label:string,ms=30000):Promise<T>{let timer:any;try{return await Promise.race([promise,new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(Error(label+'超时，请重试或换一本 PDF')),ms);})]);}finally{clearTimeout(timer);}}
export async function preparePdf(file:File,report:(message:string)=>void=()=>{}){
 report('读取 PDF 文件');
 if(new TextDecoder().decode(await bounded(file.slice(0,5).arrayBuffer(),'读取文件'))!=='%PDF-')throw Error('不是有效的 PDF 文件');
 report('加载 PDF 解析器');
 const pdfjs=await bounded(import('/pdfjs/pdf.mjs'),'加载解析器');pdfjs.GlobalWorkerOptions.workerSrc='/pdfjs/pdf.worker.mjs';
 let rangeError:(error:any)=>void=()=>{};
 const failure=new Promise<never>((_,reject)=>{rangeError=reject;});
 class FileRanges extends pdfjs.PDFDataRangeTransport{
  requestDataRange(begin:number,end:number){file.slice(begin,end).arrayBuffer().then(b=>this.onDataRange(begin,new Uint8Array(b))).catch(rangeError);}
 }
 // Ordinary books use a complete buffer; very large files stay range-based.
 const source=file.size<=64*1024*1024?{data:new Uint8Array(await bounded(file.arrayBuffer(),'读取文件'))}:{range:new FileRanges(file.size,new Uint8Array(await bounded(file.slice(0,262144).arrayBuffer(),'读取文件')),true)};
 const task=pdfjs.getDocument({...source,disableAutoFetch:true,disableStream:true,rangeChunkSize:262144,isEvalSupported:false,wasmUrl:'/pdfjs/wasm/',cMapUrl:'/assets/cmaps/',cMapPacked:true,standardFontDataUrl:'/assets/standard_fonts/'});
 try{
  report('解析 PDF 页数');const doc:any=await bounded(Promise.race([task.promise,failure]),'解析 PDF',45000);
  const page=await bounded(doc.getPage(1),'读取首页');let metadata:any={},items:any[]=[];
  report('识别书名');
  try{metadata=await bounded(doc.getMetadata(),'读取书名',8000);}catch{}
  try{items=(await bounded<any>(page.getTextContent(),'识别首页文字',10000)).items;}catch{}
  const naming=chooseTitle(metadata.info?.Title||metadata.metadata?.get('dc:title'),items,file.name);
  report('生成封面');
  const v=page.getViewport({scale:1}),viewport=page.getViewport({scale:Math.min(1,450/v.width,650/v.height)}),canvas=document.createElement('canvas');canvas.width=viewport.width;canvas.height=viewport.height;
  const render=page.render({canvasContext:canvas.getContext('2d'),viewport,canvas});
  try{await bounded(render.promise,'生成封面',20000);}catch{render.cancel();const ctx=canvas.getContext('2d')!;ctx.fillStyle='#eee9dc';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#365547';ctx.font='20px sans-serif';ctx.fillText(naming.title.slice(0,18),20,60);}
  const cover=await bounded(new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('封面生成失败')),'image/jpeg',.8)),'保存封面');
  return {...naming,pages:doc.numPages,cover};
 }catch(e:any){if(e.name==='PasswordException')throw Error('PDF 有密码，请先解密再上传');throw e;}finally{void task.destroy().catch(()=>{});}
}
