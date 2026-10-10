// AbortSignal.timeout is absent in older iPad Safari; use the widely supported controller.
export async function fetchTimed(url:string,options:RequestInit={},ms=45000){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),ms);try{return await fetch(url,{...options,signal:controller.signal});}finally{clearTimeout(timer);}}
