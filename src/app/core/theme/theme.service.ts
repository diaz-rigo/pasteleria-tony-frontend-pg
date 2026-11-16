import { DOCUMENT } from '@angular/common';
import { effect, inject, Injectable, signal } from '@angular/core';

@Injectable({ providedIn:'root' })
export class ThemeService {
  private readonly document=inject(DOCUMENT);
  readonly accent=signal('rose');
  constructor(){
    this.document.documentElement.dataset['mode']='light';
    effect(()=>{ this.document.documentElement.dataset['accent']=this.accent(); });
  }
  setAccent(accent:string):void {
    if(/^#[\da-f]{6}$/i.test(accent)){
      this.document.documentElement.style.setProperty('--accent',accent);
      this.document.documentElement.style.setProperty('--accent-hover',this.darken(accent));
      this.document.documentElement.style.setProperty('--accent-soft',`color-mix(in srgb, ${accent} 12%, var(--surface))`);
      this.accent.set(accent);
    } else if(['rose','berry','honey'].includes(accent)) this.accent.set(accent);
  }
  private darken(hex:string):string { const n=parseInt(hex.slice(1),16); return `#${[16,8,0].map(s=>Math.round(((n>>s)&255)*.78).toString(16).padStart(2,'0')).join('')}`; }
}
