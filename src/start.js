import './compiler.js';
// IP HTTP deployment uses normal browser caching, not offline service workers.
import('./app.js').catch(()=>{document.querySelector('app-root').textContent='书架加载失败，请检查网络后刷新页面。';});
