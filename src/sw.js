const CACHE='read-static-__CACHE_VERSION__';
const PRECACHE=__PRECACHE__;
const staticPath=p=>['/','/index.html','/start.js','/compiler.js','/app.js','/style.css'].includes(p)||p.startsWith('/chunks/')||p.startsWith('/assets/')||p.startsWith('/pdfjs/');
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE);await cache.addAll(PRECACHE);await self.skipWaiting();})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const name of await caches.keys())if(name.startsWith('read-static-')&&name!==CACHE)await caches.delete(name);await self.clients.claim();})()));
async function store(cache,request,response){if(response.status!==200||response.headers.has('Set-Cookie'))return;await cache.put(request,response.clone());const keys=await cache.keys();const extras=keys.filter(k=>!PRECACHE.includes(new URL(k.url).pathname));while(extras.length>60)await cache.delete(extras.shift());}
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url);
 // Never cache credentials, API results, PDFs or authenticated requests.
 if(req.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/')||req.headers.has('Authorization')||!staticPath(url.pathname))return;
 if(req.mode==='navigate'){
  event.respondWith((async()=>{const cache=await caches.open(CACHE),controller=new AbortController(),timer=setTimeout(()=>controller.abort(),3000);try{const response=await fetch(req,{signal:controller.signal});if(!response.ok)throw Error('Navigation failed');await store(cache,'/',response);return response;}catch{const saved=await cache.match('/');return saved||Response.error();}finally{clearTimeout(timer);}})());return;
 }
 event.respondWith((async()=>{const cache=await caches.open(CACHE),saved=await cache.match(req);if(saved)return saved;const response=await fetch(req);event.waitUntil(store(cache,req,response));return response;})());
});
