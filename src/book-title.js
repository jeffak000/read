export function chooseTitle(metadataTitle,items,filename){
 const clean=s=>String(s||'').replace(/[\x00-\x1f]/g,' ').replace(/\s+/g,' ').trim().slice(0,150);
 const valid=s=>s.length>=2&&!/^(untitled|document\d*|scan\d*|扫描文档|无标题|microsoft\s+(word|powerpoint).*|.*\.docx?)$/i.test(s);
 const title=clean(metadataTitle);if(valid(title))return {title,source:'PDF 元数据'};
 const text=items.filter(x=>x.str?.trim()&&x.transform);const heights=text.map(x=>Math.abs(x.transform[3])).filter(Boolean).sort((a,b)=>a-b);
 const median=heights[Math.floor(heights.length/2)]||0,maxY=Math.max(0,...text.map(x=>x.transform[5]));
 const candidates=text.filter(x=>Math.abs(x.transform[3])>median*1.3&&x.transform[5]>maxY*.45).sort((a,b)=>Math.abs(b.transform[3])-Math.abs(a.transform[3]));
 if(candidates.length){const top=candidates[0],line=text.filter(x=>Math.abs(x.transform[5]-top.transform[5])<Math.abs(top.transform[3])*.35&&Math.abs(x.transform[3])>=Math.abs(top.transform[3])*.8).sort((a,b)=>a.transform[4]-b.transform[4]);const title=clean(line.map(x=>x.str).join(' '));if(valid(title)&&title.length<=80&&!/^\d+$/.test(title))return {title,source:'PDF 首页文字（请核对）'};}
 return {title:clean(filename.replace(/\.pdf$/i,''))||'未命名图书',source:'文件名'};
}
