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
 <section class="reader compact-reader">
 <header *ngIf="!focusMode" class="compact-bar"><button (click)="closeReader()" aria-label="返回书架">← 书架</button><button (click)="goPage(currentPage-1)" [disabled]="currentPage<=1" aria-label="上一页">‹</button><label class="compact-page"><input type="number" aria-label="跳转页码" [min]="1" [max]="maxPages" [value]="currentPage" (change)="goPage($any($event.target).value)"><span>/ {{maxPages}}</span></label><button (click)="goPage(currentPage+1)" [disabled]="currentPage>=maxPages" aria-label="下一页">›</button><button (click)="settingsOpen=!settingsOpen" [attr.aria-expanded]="settingsOpen">设置</button><button (click)="enterFocus()">专注</button></header>
 <div *ngIf="settingsOpen&&!focusMode" class="compact-settings"><strong [title]="book.title">{{book.title}}</strong><div><button (click)="toggleTheme()">明暗</button><button (click)="toggleSpreadMode()">单双页</button><label>缩放<select aria-label="阅读缩放" [value]="zoomSetting" (change)="zoomSetting=$any($event.target).value"><option value="auto">自动</option><option value="page-width">适合宽度</option><option value="page-fit">整页</option><option value="100%">100%</option><option value="150%">150%</option></select></label><button (click)="advancedTools=!advancedTools">{{advancedTools?'收起高级工具':'高级工具'}}</button><button (click)="fullscreen()">全屏</button></div></div>
 <button *ngIf="focusMode" class="restore-reader-bar" (click)="focusMode=false" aria-label="显示阅读工具栏">☰ 工具</button>
 <p *ngIf="loadMessage" class="compact-status" role="status">{{loadMessage}} <a [href]="book.pdfUrl||('/api/books/'+book.id+'/pdf')" target="_blank" rel="noopener">直接打开 PDF</a></p>
 <div class="compact-pdf"><ngx-extended-pdf-viewer [src]="book.pdfUrl||('/api/books/'+book.id+'/pdf')" (pageRendered)="pageReady()" (pdfLoadingFailed)="loadFailed()" [height]="'100%'" [showToolbar]="advancedTools&&!focusMode" [(page)]="currentPage" (pageChange)="saveProgress()" [theme]="theme" [(zoom)]="zoomSetting" [scrollMode]="scrollMode" [spread]="spreadMode" [showOpenFileButton]="false" [showDownloadButton]="false" [showPrintButton]="false" [showPresentationModeButton]="true" [language]="'zh-CN'"></ngx-extended-pdf-viewer></div>
 </section>`})
export class PdfReaderComponent{
 focusMode=false;settingsOpen=false;advancedTools=false;
 enterFocus(){this.settingsOpen=false;this.advancedTools=false;this.focusMode=true;}
 goPage(value:any){const n=Number(value);if(Number.isInteger(n))this.currentPage=Math.max(1,Math.min(this.maxPages,n));}
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
