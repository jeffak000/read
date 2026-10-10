// Adapted from Kavita UI/Web/src/app/pdf-reader/_components/pdf-reader/pdf-reader.component.ts
// Copyright Kavita contributors; GPL-3.0-only. See COPYING and UPSTREAM.md.
import {Component,Input,Output,EventEmitter,inject,ChangeDetectorRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NgxExtendedPdfViewerModule,ScrollModeType,pdfDefaultOptions} from 'ngx-extended-pdf-viewer';
pdfDefaultOptions.enableScripting=false;
pdfDefaultOptions.isEvalSupported=false;
pdfDefaultOptions.assetsFolder='assets';
pdfDefaultOptions.cMapUrl=()=>'/assets/cmaps/';
pdfDefaultOptions.standardFontDataUrl=()=>'/assets/standard_fonts/';
pdfDefaultOptions.wasmUrl=()=>'/assets/wasm/';
pdfDefaultOptions.imageResourcesPath='/assets/images/';
pdfDefaultOptions.disableRange=false;
pdfDefaultOptions.disableStream=true;
pdfDefaultOptions.disableAutoFetch=true;
pdfDefaultOptions.rangeChunkSize=262144;
const isTablet=typeof navigator!=='undefined'&&(/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1));
if(isTablet){pdfDefaultOptions.needsES5=true;pdfDefaultOptions.maxCanvasPixels=5242880;pdfDefaultOptions.defaultCacheSize=3;}
@Component({selector:'app-pdf-reader',standalone:true,imports:[CommonModule,NgxExtendedPdfViewerModule],template:`
 <section class="reader"><header><button (click)="closeReader()">← 返回书架</button><strong>{{book.title}}</strong><button (click)="toggleTheme()">明暗</button><button (click)="toggleSpreadMode()">单双页</button><button (click)="fullscreen()">全屏</button></header>
 <p *ngIf="loadMessage" role="status" style="position:absolute;top:100px;left:20px;right:20px;z-index:10;background:#fff;padding:16px;border-radius:10px">{{loadMessage}} <a [href]="book.pdfUrl||('/api/books/'+book.id+'/pdf')" target="_blank" rel="noopener">直接打开 PDF</a></p>
 <ngx-extended-pdf-viewer [src]="book.pdfUrl||('/api/books/'+book.id+'/pdf')" (pageRendered)="pageReady()" (pdfLoadingFailed)="loadFailed()" [height]="'calc(100dvh - 60px - env(safe-area-inset-top) - env(safe-area-inset-bottom))'" [(page)]="currentPage" (pageChange)="saveProgress()" [theme]="theme" [(zoom)]="zoomSetting" [scrollMode]="scrollMode" [spread]="spreadMode" [showOpenFileButton]="false" [showDownloadButton]="false" [showPrintButton]="false" [showPresentationModeButton]="true" [language]="'zh-CN'"></ngx-extended-pdf-viewer>
 </section>`})
export class PdfReaderComponent{
 private cd=inject(ChangeDetectorRef);loadMessage='正在按需加载图书首页…';private loadTimer:any;
 @Input() book:any; @Output() closed=new EventEmitter<void>();
 currentPage=1; maxPages=1; zoomSetting:string|number='auto';theme:'dark'|'light'='light';scrollMode=ScrollModeType.vertical;spreadMode:any='off';incognitoMode=false;
 ngOnInit(){this.currentPage=this.book.page||1;this.maxPages=this.book.pages;this.loadTimer=setTimeout(()=>{this.loadMessage='图书加载较慢，可返回书架后重试。';this.cd.markForCheck();},60000);}
 pageReady(){clearTimeout(this.loadTimer);this.loadMessage='';this.cd.markForCheck();}
 loadFailed(){clearTimeout(this.loadTimer);this.loadMessage='图书加载失败，请返回后重试，或尝试直接打开文件。';this.cd.markForCheck();}
 ngOnDestroy(){clearTimeout(this.loadTimer);}
 // Retained Kavita PDF theme and spread control logic.
 toggleTheme(){if(this.theme==='dark'){this.theme='light';}else{this.theme='dark';}}
 toggleSpreadMode(){const options=['off','odd','even'];let index=options.indexOf(this.spreadMode)+1;if(index>=options.length)index=0;this.spreadMode=options[index];}
 async saveProgress(){if(this.incognitoMode)return;this.book.page=this.currentPage;if(this.book.guest){try{localStorage.setItem('read-progress:'+this.book.id,JSON.stringify({page:this.currentPage,updated:Date.now()}));}catch{window.dispatchEvent(new CustomEvent('read-error',{detail:'浏览器未允许保存阅读进度'}));}return;}try{const r=await fetch('/api/books/'+this.book.id+'/progress',{method:'POST',headers:{'Content-Type':'application/json',...(this.book.authToken?{Authorization:'Bearer '+this.book.authToken}:{})},body:JSON.stringify({page:this.currentPage})});if(!r.ok)throw Error();}catch{window.dispatchEvent(new CustomEvent('read-error',{detail:'进度未保存，请检查网络'}));}}
 closeReader(){this.closed.emit();this.book.onClose?.();}
 async fullscreen(){try{if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else{this.loadMessage='此设备不支持网页全屏，可在 Safari 分享菜单中添加到主屏幕。';this.cd.markForCheck();}}catch{this.loadMessage='此设备暂不支持全屏。';this.cd.markForCheck();}}
}
